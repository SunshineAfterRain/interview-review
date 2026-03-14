import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  InterviewConfig, 
  InterviewAnswer, 
  InterviewSession, 
  InterviewReport,
  CategoryStat,
  DifficultyStat 
} from '../types/interview';
import { interviewRepo } from '../db/repositories/interviewRepo';
import { allQuestions } from '../data';
import type { Question, Difficulty, Category } from '../types/question';

interface InterviewState {
  // 当前会话
  currentSession: InterviewSession | null;
  
  // 当前题目索引
  currentIndex: number;
  
  // 当前题目开始时间
  questionStartTime: number;
  
  // 面试历史
  history: InterviewSession[];
  
  // 加载状态
  isLoading: boolean;
  
  // 错误信息
  error: string | null;
  
  // Actions
  setupInterview: (config: InterviewConfig) => Promise<InterviewSession>;
  startInterview: (sessionId: string) => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  skipQuestion: () => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  finishInterview: () => Promise<InterviewReport>;
  abandonInterview: () => Promise<void>;
  loadHistory: () => Promise<void>;
  clearError: () => void;
  
  // Getters
  getCurrentQuestion: () => Question | null;
  getProgress: () => { current: number; total: number; percentage: number };
  getReport: () => InterviewReport | null;
}

/**
 * 根据配置筛选题目
 */
function selectQuestions(config: InterviewConfig): Question[] {
  let filtered = [...allQuestions];
  
  // 按分类筛选
  if (config.categories.length > 0) {
    filtered = filtered.filter(q => config.categories.includes(q.category));
  }
  
  // 按难度筛选
  if (config.difficulty !== 'mixed') {
    filtered = filtered.filter(q => q.difficulty === config.difficulty);
  }
  
  // 随机打乱
  filtered = shuffleArray(filtered);
  
  // 取指定数量
  return filtered.slice(0, config.questionCount);
}

/**
 * 打乱数组
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 生成面试报告
 */
function generateReport(session: InterviewSession): InterviewReport {
  const questions = session.questionIds.map(id => 
    allQuestions.find(q => q.id === id)
  ).filter(Boolean) as Question[];
  
  const totalQuestions = questions.length;
  const answeredQuestions = session.answers.filter(a => !a.skipped && a.answer.trim()).length;
  const skippedQuestions = session.answers.filter(a => a.skipped).length;
  const totalTime = session.answers.reduce((sum, a) => sum + a.timeSpent, 0);
  const averageTimePerQuestion = answeredQuestions > 0 ? totalTime / answeredQuestions : 0;
  
  // 分类统计
  const categoryMap = new Map<Category, { total: number; answered: number; skipped: number; time: number }>();
  questions.forEach((q, index) => {
    const answer = session.answers[index];
    const stat = categoryMap.get(q.category) || { total: 0, answered: 0, skipped: 0, time: 0 };
    stat.total++;
    if (answer) {
      if (answer.skipped) {
        stat.skipped++;
      } else if (answer.answer.trim()) {
        stat.answered++;
        stat.time += answer.timeSpent;
      }
    }
    categoryMap.set(q.category, stat);
  });
  
  const categoryStats: CategoryStat[] = Array.from(categoryMap.entries()).map(([category, stat]) => ({
    category,
    total: stat.total,
    answered: stat.answered,
    skipped: stat.skipped,
    averageTime: stat.answered > 0 ? stat.time / stat.answered : 0,
  }));
  
  // 难度统计
  const difficultyMap = new Map<Difficulty, { total: number; answered: number; skipped: number; time: number }>();
  questions.forEach((q, index) => {
    const answer = session.answers[index];
    const stat = difficultyMap.get(q.difficulty) || { total: 0, answered: 0, skipped: 0, time: 0 };
    stat.total++;
    if (answer) {
      if (answer.skipped) {
        stat.skipped++;
      } else if (answer.answer.trim()) {
        stat.answered++;
        stat.time += answer.timeSpent;
      }
    }
    difficultyMap.set(q.difficulty, stat);
  });
  
  const difficultyStats: DifficultyStat[] = Array.from(difficultyMap.entries()).map(([difficulty, stat]) => ({
    difficulty,
    total: stat.total,
    answered: stat.answered,
    skipped: stat.skipped,
    averageTime: stat.answered > 0 ? stat.time / stat.answered : 0,
  }));
  
  return {
    sessionId: session.id,
    totalQuestions,
    answeredQuestions,
    skippedQuestions,
    totalTime,
    averageTimePerQuestion,
    categoryStats,
    difficultyStats,
    completedAt: session.endTime || new Date().toISOString(),
  };
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      currentIndex: 0,
      questionStartTime: Date.now(),
      history: [],
      isLoading: false,
      error: null,
      
      setupInterview: async (config: InterviewConfig) => {
        set({ isLoading: true, error: null });
        
        try {
          // 筛选题目
          const selectedQuestions = selectQuestions(config);
          
          if (selectedQuestions.length === 0) {
            throw new Error('没有找到符合条件的题目，请调整筛选条件');
          }
          
          // 创建会话
          const session = await interviewRepo.create({
            config,
            questionIds: selectedQuestions.map(q => q.id),
          });
          
          set({
            currentSession: session,
            currentIndex: 0,
            questionStartTime: Date.now(),
            isLoading: false,
          });
          
          return session;
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
      
      startInterview: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const session = await interviewRepo.getById(sessionId);
          if (!session) {
            throw new Error('面试会话不存在');
          }
          
          set({
            currentSession: session,
            currentIndex: 0,
            questionStartTime: Date.now(),
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
      
      submitAnswer: async (answer: string) => {
        const { currentSession, currentIndex, questionStartTime } = get();
        
        if (!currentSession) {
          throw new Error('没有进行中的面试');
        }
        
        const questionId = currentSession.questionIds[currentIndex];
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        
        const interviewAnswer: InterviewAnswer = {
          questionId,
          answer,
          submittedAt: new Date().toISOString(),
          timeSpent,
          skipped: false,
        };
        
        try {
          const updatedSession = await interviewRepo.submitAnswer(currentSession.id, interviewAnswer);
          
          set({
            currentSession: updatedSession,
            questionStartTime: Date.now(),
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },
      
      skipQuestion: async () => {
        const { currentSession, currentIndex, questionStartTime } = get();
        
        if (!currentSession) {
          throw new Error('没有进行中的面试');
        }
        
        const questionId = currentSession.questionIds[currentIndex];
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        
        const interviewAnswer: InterviewAnswer = {
          questionId,
          answer: '',
          submittedAt: new Date().toISOString(),
          timeSpent,
          skipped: true,
        };
        
        try {
          const updatedSession = await interviewRepo.submitAnswer(currentSession.id, interviewAnswer);
          
          set({
            currentSession: updatedSession,
            questionStartTime: Date.now(),
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },
      
      nextQuestion: () => {
        const { currentSession, currentIndex } = get();
        
        if (!currentSession) return;
        
        const nextIndex = Math.min(currentIndex + 1, currentSession.questionIds.length - 1);
        
        set({
          currentIndex: nextIndex,
          questionStartTime: Date.now(),
        });
      },
      
      previousQuestion: () => {
        const { currentIndex } = get();
        
        const prevIndex = Math.max(currentIndex - 1, 0);
        
        set({
          currentIndex: prevIndex,
          questionStartTime: Date.now(),
        });
      },
      
      finishInterview: async () => {
        const { currentSession } = get();
        
        if (!currentSession) {
          throw new Error('没有进行中的面试');
        }
        
        try {
          const completedSession = await interviewRepo.complete(currentSession.id);
          const report = generateReport(completedSession);
          
          set({
            currentSession: null,
            currentIndex: 0,
            history: [completedSession, ...get().history],
          });
          
          return report;
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },
      
      abandonInterview: async () => {
        const { currentSession } = get();
        
        if (!currentSession) return;
        
        try {
          await interviewRepo.abandon(currentSession.id);
          
          set({
            currentSession: null,
            currentIndex: 0,
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },
      
      loadHistory: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const history = await interviewRepo.getHistory(50);
          set({ history, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      getCurrentQuestion: () => {
        const { currentSession, currentIndex } = get();
        
        if (!currentSession) return null;
        
        const questionId = currentSession.questionIds[currentIndex];
        return allQuestions.find(q => q.id === questionId) || null;
      },
      
      getProgress: () => {
        const { currentSession, currentIndex } = get();
        
        if (!currentSession) {
          return { current: 0, total: 0, percentage: 0 };
        }
        
        const total = currentSession.questionIds.length;
        const current = currentIndex + 1;
        const percentage = Math.round((current / total) * 100);
        
        return { current, total, percentage };
      },
      
      getReport: () => {
        const { currentSession } = get();
        
        if (!currentSession || currentSession.status !== 'completed') {
          return null;
        }
        
        return generateReport(currentSession);
      },
    }),
    {
      name: 'interview-session-storage',
      partialize: (state) => ({
        history: state.history,
      }),
    }
  )
);
