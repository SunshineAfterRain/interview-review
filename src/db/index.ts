import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { LearningStatus } from '../stores/useUserStore';
import type { Category, Difficulty } from '../types/question';

// ==================== 类型定义 ====================

/** 学习进度 */
export interface ProgressRecord {
  questionId: string;
  status: LearningStatus;
  lastVisit: string;
  visitCount: number;
  timeSpent: number;
  createdAt: string;
  updatedAt: string;
}

/** 笔记 */
export interface NoteRecord {
  id: string;
  questionId: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/** 收藏夹 */
export interface FolderRecord {
  id: string;
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** 收藏项 */
export interface FavoriteRecord {
  id: string;
  questionId: string;
  folderId: string | null;
  createdAt: string;
}

/** 面试配置 */
export interface InterviewConfig {
  questionCount: 5 | 10 | 15 | 20;
  difficulty: Difficulty | 'mixed';
  categories: Category[];
  timeLimit: number;
}

/** 面试答案 */
export interface InterviewAnswer {
  questionId: string;
  answer: string;
  submittedAt: string;
  timeSpent: number;
  skipped?: boolean;
}

/** 面试记录 */
export interface InterviewRecord {
  id: string;
  config: InterviewConfig;
  questionIds: string[];
  answers: InterviewAnswer[];
  startTime: string;
  endTime?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

/** 学习计划类型 */
export type PlanType = 'daily' | 'weekly' | 'monthly';

/** 学习计划项 */
export interface PlanItem {
  questionId: string;
  completed: boolean;
  completedAt?: string;
}

/** 学习计划 */
export interface PlanRecord {
  id: string;
  type: PlanType;
  title: string;
  dailyGoal: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'archived';
  items: PlanItem[];
  createdAt: string;
  updatedAt: string;
}

/** 成就类型 */
export type AchievementType = 'streak' | 'questions' | 'time' | 'category' | 'special';

/** 成就记录 */
export interface AchievementRecord {
  id: string;
  type: AchievementType;
  key: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  createdAt: string;
}

/** 复习记录 */
export interface ReviewRecord {
  questionId: string;
  reviewCount: number;
  nextReviewAt: string;
  lastReviewAt?: string;
  interval: number;
  easeFactor: number;
  createdAt: string;
  updatedAt: string;
}

/** 设置记录 */
export interface SettingRecord {
  key: string;
  value: unknown;
  updatedAt: string;
}

/** 数据库 Schema */
interface InterviewReviewDB extends DBSchema {
  progress: {
    key: string;
    value: ProgressRecord;
    indexes: { 'by-status': LearningStatus };
  };
  notes: {
    key: string;
    value: NoteRecord;
    indexes: { 'by-question': string };
  };
  folders: {
    key: string;
    value: FolderRecord;
  };
  favorites: {
    key: string;
    value: FavoriteRecord;
    indexes: { 'by-folder': string; 'by-question': string };
  };
  interviews: {
    key: string;
    value: InterviewRecord;
    indexes: { 'by-status': string; 'by-date': string };
  };
  plans: {
    key: string;
    value: PlanRecord;
    indexes: { 'by-status': string; 'by-type': string };
  };
  achievements: {
    key: string;
    value: AchievementRecord;
    indexes: { 'by-type': AchievementType };
  };
  reviews: {
    key: string;
    value: ReviewRecord;
    indexes: { 'by-next-review': string };
  };
  settings: {
    key: string;
    value: SettingRecord;
  };
}

// ==================== 数据库配置 ====================

const DB_NAME = 'interview-review-db';
const DB_VERSION = 1;

// ==================== 数据库初始化 ====================

/**
 * 初始化数据库
 */
export async function initDB(): Promise<IDBPDatabase<InterviewReviewDB>> {
  return openDB<InterviewReviewDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // 版本迁移逻辑
      if (oldVersion < 1) {
        // 学习进度存储
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'questionId' });
          progressStore.createIndex('by-status', 'status');
        }

        // 笔记存储
        if (!db.objectStoreNames.contains('notes')) {
          const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
          noteStore.createIndex('by-question', 'questionId');
        }

        // 收藏夹存储
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'id' });
        }

        // 收藏存储
        if (!db.objectStoreNames.contains('favorites')) {
          const favoriteStore = db.createObjectStore('favorites', { keyPath: 'id' });
          favoriteStore.createIndex('by-folder', 'folderId');
          favoriteStore.createIndex('by-question', 'questionId');
        }

        // 面试记录存储
        if (!db.objectStoreNames.contains('interviews')) {
          const interviewStore = db.createObjectStore('interviews', { keyPath: 'id' });
          interviewStore.createIndex('by-status', 'status');
          interviewStore.createIndex('by-date', 'startTime');
        }

        // 学习计划存储
        if (!db.objectStoreNames.contains('plans')) {
          const planStore = db.createObjectStore('plans', { keyPath: 'id' });
          planStore.createIndex('by-status', 'status');
          planStore.createIndex('by-type', 'type');
        }

        // 成就存储
        if (!db.objectStoreNames.contains('achievements')) {
          const achievementStore = db.createObjectStore('achievements', { keyPath: 'id' });
          achievementStore.createIndex('by-type', 'type');
        }

        // 复习计划存储
        if (!db.objectStoreNames.contains('reviews')) {
          const reviewStore = db.createObjectStore('reviews', { keyPath: 'questionId' });
          reviewStore.createIndex('by-next-review', 'nextReviewAt');
        }

        // 设置存储
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      }
    },
  });
}

// ==================== 数据库单例 ====================

let dbInstance: IDBPDatabase<InterviewReviewDB> | null = null;
let dbInitPromise: Promise<IDBPDatabase<InterviewReviewDB>> | null = null;

/**
 * 获取数据库实例（单例模式）
 */
export async function getDB(): Promise<IDBPDatabase<InterviewReviewDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!dbInitPromise) {
    dbInitPromise = initDB();
  }

  dbInstance = await dbInitPromise;
  return dbInstance;
}

/**
 * 关闭数据库连接
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    dbInitPromise = null;
  }
}

/**
 * 删除数据库
 */
export async function deleteDB(): Promise<void> {
  closeDB();
  await indexedDB.deleteDatabase(DB_NAME);
}

// ==================== 工具函数 ====================

/**
 * 清空所有数据
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    ['progress', 'notes', 'folders', 'favorites', 'interviews', 'plans', 'achievements', 'reviews', 'settings'],
    'readwrite'
  );

  await Promise.all([
    tx.objectStore('progress').clear(),
    tx.objectStore('notes').clear(),
    tx.objectStore('folders').clear(),
    tx.objectStore('favorites').clear(),
    tx.objectStore('interviews').clear(),
    tx.objectStore('plans').clear(),
    tx.objectStore('achievements').clear(),
    tx.objectStore('reviews').clear(),
    tx.objectStore('settings').clear(),
  ]);

  await tx.done;
}

/**
 * 获取数据库统计信息
 */
export async function getDBStats(): Promise<{
  progress: number;
  notes: number;
  folders: number;
  favorites: number;
  interviews: number;
  plans: number;
  achievements: number;
  reviews: number;
  settings: number;
}> {
  const db = await getDB();

  const [
    progress,
    notes,
    folders,
    favorites,
    interviews,
    plans,
    achievements,
    reviews,
    settings,
  ] = await Promise.all([
    db.count('progress'),
    db.count('notes'),
    db.count('folders'),
    db.count('favorites'),
    db.count('interviews'),
    db.count('plans'),
    db.count('achievements'),
    db.count('reviews'),
    db.count('settings'),
  ]);

  return {
    progress,
    notes,
    folders,
    favorites,
    interviews,
    plans,
    achievements,
    reviews,
    settings,
  };
}
