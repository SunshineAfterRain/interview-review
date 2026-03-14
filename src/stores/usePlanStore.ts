import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { 
  DailyGoal, 
  StudyPlan, 
  Achievement,
  StudyStats,
  AchievementType
} from '../types/plan';
import { planRepo } from '../db/repositories/planRepo';
import { achievementRepo } from '../db/repositories/achievementRepo';
import { useUserStore } from './useUserStore';

interface PlanState {
  // 每日目标
  dailyGoal: DailyGoal;
  
  // 学习计划列表
  plans: StudyPlan[];
  
  // 成就列表
  achievements: Achievement[];
  
  // 新解锁的成就（用于动画）
  newAchievements: Achievement[];
  
  // 学习统计
  stats: StudyStats;
  
  // 加载状态
  isLoading: boolean;
  
  // 错误信息
  error: string | null;
  
  // Actions
  setDailyTarget: (count: number) => void;
  recordProgress: (count: number) => Promise<Achievement[]>;
  checkDailyGoal: () => Promise<Achievement | null>;
  
  createPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<StudyPlan>;
  updatePlan: (id: string, data: Partial<StudyPlan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  completePlanItem: (planId: string, questionId: string) => Promise<void>;
  
  loadAchievements: () => Promise<void>;
  checkAndUnlockAchievements: (type: AchievementType, value: number) => Promise<Achievement[]>;
  clearNewAchievements: () => void;
  
  loadPlans: () => Promise<void>;
  loadStats: () => Promise<void>;
  
  clearError: () => void;
}

// 获取今天的日期字符串
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

const initialDailyGoal: DailyGoal = {
  targetCount: 5,
  completedCount: 0,
  date: getTodayString(),
};

const initialStats: StudyStats = {
  streak: 0,
  totalStudyDays: 0,
  totalQuestions: 0,
  masteredQuestions: 0,
  totalTimeSpent: 0,
  todayCompleted: 0,
  todayTarget: 5,
  weeklyProgress: 0,
};

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      dailyGoal: initialDailyGoal,
      plans: [],
      achievements: [],
      newAchievements: [],
      stats: initialStats,
      isLoading: false,
      error: null,
      
      setDailyTarget: (count: number) => {
        const today = getTodayString();
        set((state) => ({
          dailyGoal: {
            ...state.dailyGoal,
            targetCount: count,
            date: today,
          },
          stats: {
            ...state.stats,
            todayTarget: count,
          },
        }));
      },
      
      recordProgress: async (count: number) => {
        const today = getTodayString();
        const newAchievements: Achievement[] = [];
        
        set((state) => {
          let newGoal = { ...state.dailyGoal };
          
          // 检查是否是新的一天
          if (state.dailyGoal.date !== today) {
            newGoal = {
              targetCount: state.dailyGoal.targetCount,
              completedCount: count,
              date: today,
            };
          } else {
            newGoal.completedCount += count;
          }
          
          return {
            dailyGoal: newGoal,
            stats: {
              ...state.stats,
              todayCompleted: newGoal.completedCount,
            },
          };
        });
        
        // 检查成就
        const streakAchievements = await get().checkAndUnlockAchievements('streak', get().stats.streak);
        const questionAchievements = await get().checkAndUnlockAchievements('questions', get().stats.masteredQuestions);
        
        newAchievements.push(...streakAchievements, ...questionAchievements);
        
        // 检查每日目标
        const goalAchievement = await get().checkDailyGoal();
        if (goalAchievement) {
          newAchievements.push(goalAchievement);
        }
        
        if (newAchievements.length > 0) {
          set({ newAchievements });
        }
        
        return newAchievements;
      },
      
      checkDailyGoal: async () => {
        const { dailyGoal } = get();
        const completed = dailyGoal.completedCount >= dailyGoal.targetCount;
        
        if (completed) {
          // 检查是否已获得"目标达成"成就
          const achievements = await achievementRepo.getAll();
          const hasGoalAchievement = achievements.some(a => a.key === 'special-first-goal');
          
          if (!hasGoalAchievement) {
            const earned = await achievementRepo.earn('special-first-goal');
            if (earned) {
              const achievement: Achievement = {
                id: earned.id,
                key: earned.key,
                type: earned.type,
                name: earned.name,
                description: earned.description,
                icon: earned.icon,
                earnedAt: earned.earnedAt,
                isNew: true,
              };
              
              set((state) => ({
                achievements: [...state.achievements, achievement],
              }));
              
              return achievement;
            }
          }
        }
        
        return null;
      },
      
      createPlan: async (planData) => {
        set({ isLoading: true, error: null });
        
        try {
          const now = new Date().toISOString();
          const plan: StudyPlan = {
            ...planData,
            id: uuidv4(),
            createdAt: now,
            updatedAt: now,
          };
          
          await planRepo.create({
            type: plan.type,
            title: plan.title,
            dailyGoal: plan.dailyGoal,
            startDate: plan.startDate,
            endDate: plan.endDate,
            items: plan.items,
          });
          
          set((state) => ({
            plans: [...state.plans, plan],
            isLoading: false,
          }));
          
          return plan;
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
      
      updatePlan: async (id, data) => {
        set({ isLoading: true, error: null });
        
        try {
          await planRepo.update(id, data);
          
          set((state) => ({
            plans: state.plans.map(p => 
              p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
      
      deletePlan: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          await planRepo.delete(id);
          
          set((state) => ({
            plans: state.plans.filter(p => p.id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
      
      completePlanItem: async (planId, questionId) => {
        try {
          await planRepo.completeItem(planId, questionId);
          
          set((state) => ({
            plans: state.plans.map(p => {
              if (p.id !== planId) return p;
              
              return {
                ...p,
                items: p.items.map(item =>
                  item.questionId === questionId
                    ? { ...item, completed: true, completedAt: new Date().toISOString() }
                    : item
                ),
                updatedAt: new Date().toISOString(),
              };
            }),
          }));
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },
      
      loadAchievements: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const records = await achievementRepo.getAll();
          const achievements: Achievement[] = records.map(r => ({
            id: r.id,
            key: r.key,
            type: r.type,
            name: r.name,
            description: r.description,
            icon: r.icon,
            earnedAt: r.earnedAt,
          }));
          
          set({ achievements, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
        }
      },
      
      checkAndUnlockAchievements: async (type: AchievementType, value: number) => {
        const newlyEarned: Achievement[] = [];
        
        try {
          const earnedRecords = await achievementRepo.checkAndUnlock(type, value);
          
          for (const record of earnedRecords) {
            const achievement: Achievement = {
              id: record.id,
              key: record.key,
              type: record.type,
              name: record.name,
              description: record.description,
              icon: record.icon,
              earnedAt: record.earnedAt,
              isNew: true,
            };
            
            newlyEarned.push(achievement);
          }
          
          if (newlyEarned.length > 0) {
            set((state) => ({
              achievements: [...state.achievements, ...newlyEarned],
            }));
          }
        } catch (error) {
          console.error('Failed to check achievements:', error);
        }
        
        return newlyEarned;
      },
      
      clearNewAchievements: () => {
        set({ newAchievements: [] });
      },
      
      loadPlans: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const records = await planRepo.getAll();
          const plans: StudyPlan[] = records.map(r => ({
            id: r.id,
            type: r.type,
            title: r.title,
            description: '',
            dailyGoal: r.dailyGoal,
            startDate: r.startDate,
            endDate: r.endDate,
            status: r.status,
            items: r.items,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          }));
          
          set({ plans, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
        }
      },
      
      loadStats: async () => {
        const userStats = useUserStore.getState().stats;
        const { dailyGoal } = get();
        
        set({
          stats: {
            streak: userStats.streak,
            totalStudyDays: userStats.totalStudyDays,
            totalQuestions: userStats.totalQuestions,
            masteredQuestions: userStats.masteredQuestions,
            totalTimeSpent: userStats.totalTimeSpent,
            todayCompleted: dailyGoal.completedCount,
            todayTarget: dailyGoal.targetCount,
            weeklyProgress: 0, // TODO: 计算周进度
          },
        });
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'plan-storage',
      partialize: (state) => ({
        dailyGoal: state.dailyGoal,
      }),
    }
  )
);
