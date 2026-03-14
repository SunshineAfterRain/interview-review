/**
 * 计划类型
 */
export type PlanType = 'daily' | 'weekly' | 'monthly';

/**
 * 计划状态
 */
export type PlanStatus = 'active' | 'completed' | 'archived';

/**
 * 每日目标
 */
export interface DailyGoal {
  targetCount: number;       // 每日目标题数
  completedCount: number;    // 已完成题数
  date: string;              // 日期 (YYYY-MM-DD)
}

/**
 * 计划项
 */
export interface PlanItem {
  questionId: string;
  completed: boolean;
  completedAt?: string;
  scheduledDate?: string; // 计划完成日期
}

/**
 * 学习计划
 */
export interface StudyPlan {
  id: string;
  type: PlanType;
  title: string;
  description?: string;
  dailyGoal: number;
  startDate: string;
  endDate?: string;
  status: PlanStatus;
  items: PlanItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 成就类型
 */
export type AchievementType = 'streak' | 'questions' | 'time' | 'category' | 'special';

/**
 * 成就定义
 */
export interface AchievementDefinition {
  key: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  threshold: number;
}

/**
 * 成就记录
 */
export interface Achievement {
  id: string;
  key: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  isNew?: boolean; // 用于动画标记
}

/**
 * 学习统计
 */
export interface StudyStats {
  streak: number;              // 连续学习天数
  totalStudyDays: number;      // 总学习天数
  totalQuestions: number;      // 总题目数
  masteredQuestions: number;   // 已掌握题目数
  totalTimeSpent: number;      // 总学习时间（秒）
  todayCompleted: number;      // 今日完成数
  todayTarget: number;         // 今日目标
  weeklyProgress: number;      // 周进度百分比
}

/**
 * 进度里程碑
 */
export interface Milestone {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: 'questions' | 'time' | 'streak';
  achieved: boolean;
  achievedAt?: string;
}

/**
 * 每日目标选项
 */
export const DAILY_GOAL_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 3, label: '3 题/天' },
  { value: 5, label: '5 题/天' },
  { value: 10, label: '10 题/天' },
  { value: 15, label: '15 题/天' },
  { value: 20, label: '20 题/天' },
];

/**
 * 预定义成就列表
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // 连续学习成就
  { key: 'streak-1', type: 'streak', name: '初露锋芒', description: '连续学习 1 天', icon: '🌱', threshold: 1 },
  { key: 'streak-3', type: 'streak', name: '渐入佳境', description: '连续学习 3 天', icon: '🌿', threshold: 3 },
  { key: 'streak-7', type: 'streak', name: '坚持一周', description: '连续学习 7 天', icon: '🔥', threshold: 7 },
  { key: 'streak-14', type: 'streak', name: '两周达人', description: '连续学习 14 天', icon: '💪', threshold: 14 },
  { key: 'streak-30', type: 'streak', name: '月度达人', description: '连续学习 30 天', icon: '🏆', threshold: 30 },
  { key: 'streak-100', type: 'streak', name: '百日坚持', description: '连续学习 100 天', icon: '💎', threshold: 100 },
  
  // 题目数量成就
  { key: 'questions-10', type: 'questions', name: '小有所成', description: '掌握 10 道题目', icon: '📚', threshold: 10 },
  { key: 'questions-25', type: 'questions', name: '稳步前进', description: '掌握 25 道题目', icon: '📖', threshold: 25 },
  { key: 'questions-50', type: 'questions', name: '学富五车', description: '掌握 50 道题目', icon: '🎓', threshold: 50 },
  { key: 'questions-100', type: 'questions', name: '博学多才', description: '掌握 100 道题目', icon: '🌟', threshold: 100 },
  { key: 'questions-200', type: 'questions', name: '知识渊博', description: '掌握 200 道题目', icon: '✨', threshold: 200 },
  
  // 学习时间成就
  { key: 'time-1h', type: 'time', name: '初学乍练', description: '累计学习 1 小时', icon: '⏰', threshold: 3600 },
  { key: 'time-5h', type: 'time', name: '渐有所得', description: '累计学习 5 小时', icon: '⌛', threshold: 18000 },
  { key: 'time-10h', type: 'time', name: '勤学苦练', description: '累计学习 10 小时', icon: '⏱️', threshold: 36000 },
  { key: 'time-50h', type: 'time', name: '孜孜不倦', description: '累计学习 50 小时', icon: '⭐', threshold: 180000 },
  { key: 'time-100h', type: 'time', name: '学海无涯', description: '累计学习 100 小时', icon: '🌟', threshold: 360000 },
  
  // 特殊成就
  { key: 'special-first-interview', type: 'special', name: '初次面试', description: '完成第一次模拟面试', icon: '🎯', threshold: 1 },
  { key: 'special-first-note', type: 'special', name: '笔记达人', description: '创建第一条笔记', icon: '📝', threshold: 1 },
  { key: 'special-first-favorite', type: 'special', name: '收藏爱好者', description: '收藏第一道题目', icon: '❤️', threshold: 1 },
  { key: 'special-first-goal', type: 'special', name: '目标达成', description: '完成第一个每日目标', icon: '🎯', threshold: 1 },
  { key: 'special-interview-10', type: 'special', name: '面试达人', description: '完成 10 次模拟面试', icon: '🎪', threshold: 10 },
];
