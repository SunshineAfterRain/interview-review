import { Difficulty, Category } from './question';

/**
 * 面试配置
 */
export interface InterviewConfig {
  questionCount: 5 | 10 | 15 | 20;
  difficulty: Difficulty | 'mixed';
  categories: Category[];
  timeLimit: number; // 分钟
}

/**
 * 面试答案
 */
export interface InterviewAnswer {
  questionId: string;
  answer: string;
  submittedAt: string;
  timeSpent: number; // 秒
  skipped?: boolean;
}

/**
 * 面试会话
 */
export interface InterviewSession {
  id: string;
  config: InterviewConfig;
  questionIds: string[]; // 题目 ID 列表
  answers: InterviewAnswer[];
  startTime: string;
  endTime?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 面试报告
 */
export interface InterviewReport {
  sessionId: string;
  totalQuestions: number;
  answeredQuestions: number;
  skippedQuestions: number;
  totalTime: number; // 秒
  averageTimePerQuestion: number;
  categoryStats: CategoryStat[];
  difficultyStats: DifficultyStat[];
  completedAt: string;
}

/**
 * 分类统计
 */
export interface CategoryStat {
  category: Category;
  total: number;
  answered: number;
  skipped: number;
  averageTime: number;
}

/**
 * 难度统计
 */
export interface DifficultyStat {
  difficulty: Difficulty;
  total: number;
  answered: number;
  skipped: number;
  averageTime: number;
}

/**
 * 面试历史记录
 */
export interface InterviewHistory {
  id: string;
  config: InterviewConfig;
  questionCount: number;
  answeredCount: number;
  totalTime: number;
  completedAt: string;
}

/**
 * 题目数量选项
 */
export const QUESTION_COUNT_OPTIONS: Array<{ value: InterviewConfig['questionCount']; label: string }> = [
  { value: 5, label: '5 题' },
  { value: 10, label: '10 题' },
  { value: 15, label: '15 题' },
  { value: 20, label: '20 题' },
];

/**
 * 难度选项
 */
export const DIFFICULTY_OPTIONS: Array<{ value: InterviewConfig['difficulty']; label: string }> = [
  { value: 'mixed', label: '混合难度' },
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
];

/**
 * 时间限制选项（每题分钟数）
 */
export const TIME_LIMIT_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 3, label: '3 分钟/题' },
  { value: 5, label: '5 分钟/题' },
  { value: 8, label: '8 分钟/题' },
  { value: 10, label: '10 分钟/题' },
];
