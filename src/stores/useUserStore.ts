import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LearningStatus = 'not_started' | 'learning' | 'mastered';

export interface QuestionProgress {
  status: LearningStatus;
  lastVisit: string;
  visitCount: number;
  timeSpent: number; // 秒
}

export interface UserProgress {
  [questionId: string]: QuestionProgress;
}

export interface UserStats {
  totalQuestions: number;
  completedQuestions: number;
  masteredQuestions: number;
  totalTimeSpent: number;
  streak: number; // 连续学习天数
  lastStudyDate: string;
}

interface UserState {
  // 学习进度
  progress: UserProgress;
  
  // 收藏夹
  favorites: string[];
  
  // 错题本
  wrongQuestions: string[];
  
  // 主题
  theme: 'dark' | 'light';
  
  // 统计数据
  stats: UserStats;
  
  // 操作
  updateProgress: (questionId: string, status: LearningStatus) => void;
  toggleFavorite: (questionId: string) => void;
  addToWrongQuestions: (questionId: string) => void;
  removeFromWrongQuestions: (questionId: string) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  recordVisit: (questionId: string) => void;
  recordTimeSpent: (questionId: string, seconds: number) => void;
  getProgress: (questionId: string) => LearningStatus;
  getProgressStats: () => { mastered: number; learning: number; total: number };
  isFavorite: (questionId: string) => boolean;
  isWrongQuestion: (questionId: string) => boolean;
  resetProgress: () => void;
}

const initialStats: UserStats = {
  totalQuestions: 0,
  completedQuestions: 0,
  masteredQuestions: 0,
  totalTimeSpent: 0,
  streak: 0,
  lastStudyDate: '',
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      progress: {},
      favorites: [],
      wrongQuestions: [],
      theme: 'dark',
      stats: initialStats,
      
      updateProgress: (questionId, status) => {
        set((state) => {
          const newProgress = {
            ...state.progress,
            [questionId]: {
              ...state.progress[questionId],
              status,
              lastVisit: new Date().toISOString(),
            },
          };
          
          const stats = calculateStats(newProgress);
          
          return { progress: newProgress, stats };
        });
      },
      
      toggleFavorite: (questionId) => {
        set((state) => {
          const isFav = state.favorites.includes(questionId);
          return {
            favorites: isFav
              ? state.favorites.filter((id) => id !== questionId)
              : [...state.favorites, questionId],
          };
        });
      },
      
      addToWrongQuestions: (questionId) => {
        set((state) => {
          if (state.wrongQuestions.includes(questionId)) {
            return state;
          }
          return {
            wrongQuestions: [...state.wrongQuestions, questionId],
          };
        });
      },
      
      removeFromWrongQuestions: (questionId) => {
        set((state) => ({
          wrongQuestions: state.wrongQuestions.filter((id) => id !== questionId),
        }));
      },
      
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        }));
      },
      
      setTheme: (theme) => {
        set({ theme });
      },
      
      recordVisit: (questionId) => {
        set((state) => {
          const current = state.progress[questionId];
          const newProgress = {
            ...state.progress,
            [questionId]: {
              status: current?.status || 'learning',
              lastVisit: new Date().toISOString(),
              visitCount: (current?.visitCount || 0) + 1,
              timeSpent: current?.timeSpent || 0,
            },
          };
          
          const stats = calculateStats(newProgress);
          
          return { progress: newProgress, stats };
        });
      },
      
      recordTimeSpent: (questionId, seconds) => {
        set((state) => {
          const current = state.progress[questionId];
          if (!current) return state;
          
          const newProgress = {
            ...state.progress,
            [questionId]: {
              ...current,
              timeSpent: current.timeSpent + seconds,
            },
          };
          
          const stats = calculateStats(newProgress);
          
          return { progress: newProgress, stats };
        });
      },
      
      getProgress: (questionId) => {
        return get().progress[questionId]?.status || 'not_started';
      },
      
      getProgressStats: () => {
        const progress = get().progress;
        const entries = Object.values(progress);
        const mastered = entries.filter(p => p.status === 'mastered').length;
        const learning = entries.filter(p => p.status === 'learning').length;
        const total = entries.length;
        return { mastered, learning, total };
      },
      
      isFavorite: (questionId) => {
        return get().favorites.includes(questionId);
      },
      
      isWrongQuestion: (questionId) => {
        return get().wrongQuestions.includes(questionId);
      },
      
      resetProgress: () => {
        set({
          progress: {},
          favorites: [],
          wrongQuestions: [],
          stats: initialStats,
        });
      },
    }),
    {
      name: 'interview-review-user-data',
    }
  )
);

// 辅助函数：计算统计数据
function calculateStats(progress: UserProgress): UserStats {
  const entries = Object.values(progress);
  const totalQuestions = entries.length;
  const completedQuestions = entries.filter(
    (p) => p.status === 'learning' || p.status === 'mastered'
  ).length;
  const masteredQuestions = entries.filter((p) => p.status === 'mastered').length;
  const totalTimeSpent = entries.reduce((sum, p) => sum + p.timeSpent, 0);
  
  // 计算连续学习天数
  const dates = entries
    .map((p) => new Date(p.lastVisit).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (dates[0] === today || dates[0] === yesterday) {
    streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const current = new Date(dates[i - 1]);
      const previous = new Date(dates[i]);
      const diffDays = Math.floor(
        (current.getTime() - previous.getTime()) / 86400000
      );
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
  }
  
  return {
    totalQuestions,
    completedQuestions,
    masteredQuestions,
    totalTimeSpent,
    streak,
    lastStudyDate: dates[0] || '',
  };
}
