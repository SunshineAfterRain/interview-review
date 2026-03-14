import { getDB, type ProgressRecord, type FavoriteRecord, type FolderRecord } from './index';
import { v4 as uuidv4 } from 'uuid';

/**
 * 数据迁移状态
 */
export interface MigrationStatus {
  completed: boolean;
  timestamp?: string;
  version: number;
}

const MIGRATION_KEY = 'migration-status';

/**
 * 获取迁移状态
 */
async function getMigrationStatus(): Promise<MigrationStatus> {
  const db = await getDB();
  const record = await db.get('settings', MIGRATION_KEY);
  return record?.value as MigrationStatus || { completed: false, version: 0 };
}

/**
 * 设置迁移状态
 */
async function setMigrationStatus(status: MigrationStatus): Promise<void> {
  const db = await getDB();
  await db.put('settings', {
    key: MIGRATION_KEY,
    value: status,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * 从 localStorage 迁移学习进度
 */
async function migrateProgress(): Promise<number> {
  const oldData = localStorage.getItem('interview-review-user-data');
  if (!oldData) return 0;
  
  try {
    const parsed = JSON.parse(oldData);
    const progressData = parsed?.state?.progress;
    
    if (!progressData || typeof progressData !== 'object') return 0;
    
    const db = await getDB();
    const tx = db.transaction('progress', 'readwrite');
    const now = new Date().toISOString();
    let count = 0;
    
    for (const [questionId, progress] of Object.entries(progressData) as [string, any][]) {
      const record: ProgressRecord = {
        questionId,
        status: progress.status || 'learning',
        lastVisit: progress.lastVisit || now,
        visitCount: progress.visitCount || 1,
        timeSpent: progress.timeSpent || 0,
        createdAt: now,
        updatedAt: now,
      };
      
      await tx.store.put(record);
      count++;
    }
    
    await tx.done;
    console.log(`[Migration] Migrated ${count} progress records`);
    return count;
  } catch (error) {
    console.error('[Migration] Failed to migrate progress:', error);
    return 0;
  }
}

/**
 * 从 localStorage 迁移收藏夹
 */
async function migrateFavorites(): Promise<number> {
  const oldData = localStorage.getItem('interview-review-user-data');
  if (!oldData) return 0;
  
  try {
    const parsed = JSON.parse(oldData);
    const favorites = parsed?.state?.favorites;
    
    if (!Array.isArray(favorites) || favorites.length === 0) return 0;
    
    const db = await getDB();
    const now = new Date().toISOString();
    
    // 创建默认收藏夹
    const defaultFolder: FolderRecord = {
      id: 'default',
      name: '默认收藏夹',
      color: '#f7df1e',
      icon: '⭐',
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.put('folders', defaultFolder);
    
    // 迁移收藏项
    const tx = db.transaction('favorites', 'readwrite');
    let count = 0;
    
    for (const questionId of favorites) {
      const record: FavoriteRecord = {
        id: uuidv4(),
        questionId,
        folderId: 'default',
        createdAt: now,
      };
      
      await tx.store.put(record);
      count++;
    }
    
    await tx.done;
    console.log(`[Migration] Migrated ${count} favorites`);
    return count;
  } catch (error) {
    console.error('[Migration] Failed to migrate favorites:', error);
    return 0;
  }
}

/**
 * 从 localStorage 迁移错题本
 */
async function migrateWrongQuestions(): Promise<number> {
  const oldData = localStorage.getItem('interview-review-user-data');
  if (!oldData) return 0;
  
  try {
    const parsed = JSON.parse(oldData);
    const wrongQuestions = parsed?.state?.wrongQuestions;
    
    if (!Array.isArray(wrongQuestions) || wrongQuestions.length === 0) return 0;
    
    const db = await getDB();
    const now = new Date().toISOString();
    const tx = db.transaction('progress', 'readwrite');
    let count = 0;
    
    for (const questionId of wrongQuestions) {
      // 更新进度状态为 learning（错题需要重新学习）
      const existing = await tx.store.get(questionId);
      
      if (existing) {
        await tx.store.put({
          ...existing,
          status: 'learning',
          updatedAt: now,
        });
      } else {
        await tx.store.put({
          questionId,
          status: 'learning',
          lastVisit: now,
          visitCount: 1,
          timeSpent: 0,
          createdAt: now,
          updatedAt: now,
        });
      }
      
      count++;
    }
    
    await tx.done;
    console.log(`[Migration] Migrated ${count} wrong questions`);
    return count;
  } catch (error) {
    console.error('[Migration] Failed to migrate wrong questions:', error);
    return 0;
  }
}

/**
 * 从 localStorage 迁移保存的代码
 */
async function migrateSavedCodes(): Promise<number> {
  const oldData = localStorage.getItem('interview-review-user-data');
  if (!oldData) return 0;
  
  try {
    const parsed = JSON.parse(oldData);
    const savedCodes = parsed?.state?.savedCodes;
    
    if (!savedCodes || typeof savedCodes !== 'object') return 0;
    
    // 保存的代码暂时保留在 localStorage，因为 IndexedDB 中没有专门的表
    // 可以考虑后续添加到笔记表中
    console.log('[Migration] Saved codes preserved in localStorage');
    return Object.keys(savedCodes).length;
  } catch (error) {
    console.error('[Migration] Failed to migrate saved codes:', error);
    return 0;
  }
}

/**
 * 迁移主题设置
 */
async function migrateTheme(): Promise<boolean> {
  const oldData = localStorage.getItem('interview-review-user-data');
  if (!oldData) return false;
  
  try {
    const parsed = JSON.parse(oldData);
    const theme = parsed?.state?.theme;
    
    if (!theme) return false;
    
    const db = await getDB();
    await db.put('settings', {
      key: 'theme',
      value: theme,
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`[Migration] Migrated theme: ${theme}`);
    return true;
  } catch (error) {
    console.error('[Migration] Failed to migrate theme:', error);
    return false;
  }
}

/**
 * 执行所有迁移
 */
export async function runMigrations(): Promise<{
  success: boolean;
  migrated: {
    progress: number;
    favorites: number;
    wrongQuestions: number;
    savedCodes: number;
    theme: boolean;
  };
}> {
  const status = await getMigrationStatus();
  
  // 如果已经迁移过，跳过
  if (status.completed) {
    console.log('[Migration] Already migrated, skipping');
    return {
      success: true,
      migrated: {
        progress: 0,
        favorites: 0,
        wrongQuestions: 0,
        savedCodes: 0,
        theme: false,
      },
    };
  }
  
  console.log('[Migration] Starting migration from localStorage to IndexedDB...');
  
  const result = {
    success: true,
    migrated: {
      progress: await migrateProgress(),
      favorites: await migrateFavorites(),
      wrongQuestions: await migrateWrongQuestions(),
      savedCodes: await migrateSavedCodes(),
      theme: await migrateTheme(),
    },
  };
  
  // 标记迁移完成
  await setMigrationStatus({
    completed: true,
    timestamp: new Date().toISOString(),
    version: 1,
  });
  
  console.log('[Migration] Migration completed:', result);
  return result;
}

/**
 * 重置迁移状态（用于测试）
 */
export async function resetMigrationStatus(): Promise<void> {
  const db = await getDB();
  await db.delete('settings', MIGRATION_KEY);
}

/**
 * 检查是否需要迁移
 */
export async function needsMigration(): Promise<boolean> {
  const status = await getMigrationStatus();
  
  if (status.completed) return false;
  
  // 检查 localStorage 中是否有数据
  const oldData = localStorage.getItem('interview-review-user-data');
  return !!oldData;
}

/**
 * 清理旧的 localStorage 数据
 */
export async function cleanupLocalStorage(): Promise<void> {
  const keysToRemove = [
    'interview-review-user-data',
  ];
  
  for (const key of keysToRemove) {
    if (localStorage.getItem(key)) {
      console.log(`[Migration] Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    }
  }
}
