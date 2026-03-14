import { getDB } from '../db';
import type { ExportData } from './exportUtils';
import type { ProgressRecord, NoteRecord, FolderRecord, FavoriteRecord, InterviewRecord, PlanRecord, AchievementRecord, ReviewRecord, SettingRecord } from '../db';

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean;
  message: string;
  details: {
    progress: number;
    notes: number;
    folders: number;
    favorites: number;
    interviews: number;
    plans: number;
    achievements: number;
    reviews: number;
    settings: number;
  };
}

/**
 * 验证导入数据格式
 */
function validateImportData(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  // 检查必要字段
  if (typeof obj.version !== 'number') return false;
  if (typeof obj.exportedAt !== 'string') return false;
  
  // 检查数据字段是否为数组
  const arrayFields = ['progress', 'notes', 'folders', 'favorites', 'interviews', 'plans', 'achievements', 'reviews', 'settings'];
  for (const field of arrayFields) {
    if (!Array.isArray(obj[field])) return false;
  }
  
  return true;
}

/**
 * 从 JSON 文件导入数据
 */
export async function importFromJson(file: File): Promise<ImportResult> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!validateImportData(data)) {
      return {
        success: false,
        message: '无效的备份文件格式',
        details: {
          progress: 0,
          notes: 0,
          folders: 0,
          favorites: 0,
          interviews: 0,
          plans: 0,
          achievements: 0,
          reviews: 0,
          settings: 0,
        },
      };
    }
    
    return await importData(data);
  } catch (error: any) {
    return {
      success: false,
      message: `导入失败：${error.message}`,
      details: {
        progress: 0,
        notes: 0,
        folders: 0,
        favorites: 0,
        interviews: 0,
        plans: 0,
        achievements: 0,
        reviews: 0,
        settings: 0,
      },
    };
  }
}

/**
 * 导入数据到数据库
 */
export async function importData(data: ExportData): Promise<ImportResult> {
  const db = await getDB();
  
  const result: ImportResult = {
    success: true,
    message: '数据导入成功',
    details: {
      progress: 0,
      notes: 0,
      folders: 0,
      favorites: 0,
      interviews: 0,
      plans: 0,
      achievements: 0,
      reviews: 0,
      settings: 0,
    },
  };
  
  try {
    // 使用事务批量导入
    const storeNames = ['progress', 'notes', 'folders', 'favorites', 'interviews', 'plans', 'achievements', 'reviews', 'settings'] as const;
    
    for (const storeName of storeNames) {
      const items = data[storeName];
      if (items && items.length > 0) {
        const tx = db.transaction(storeName, 'readwrite');
        
        for (const item of items) {
          await tx.store.put(item as any);
        }
        
        await tx.done;
        result.details[storeName] = items.length;
      }
    }
    
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: `导入失败：${error.message}`,
      details: result.details,
    };
  }
}

/**
 * 从 ZIP 文件导入
 */
export async function importFromZip(file: File): Promise<ImportResult> {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(file);
    
    // 查找 data.json
    const dataFile = zip.file('data.json');
    if (!dataFile) {
      return {
        success: false,
        message: 'ZIP 文件中未找到 data.json',
        details: {
          progress: 0,
          notes: 0,
          folders: 0,
          favorites: 0,
          interviews: 0,
          plans: 0,
          achievements: 0,
          reviews: 0,
          settings: 0,
        },
      };
    }
    
    const text = await dataFile.async('text');
    const data = JSON.parse(text);
    
    if (!validateImportData(data)) {
      return {
        success: false,
        message: '无效的备份文件格式',
        details: {
          progress: 0,
          notes: 0,
          folders: 0,
          favorites: 0,
          interviews: 0,
          plans: 0,
          achievements: 0,
          reviews: 0,
          settings: 0,
        },
      };
    }
    
    return await importData(data);
  } catch (error: any) {
    return {
      success: false,
      message: `导入失败：${error.message}`,
      details: {
        progress: 0,
        notes: 0,
        folders: 0,
        favorites: 0,
        interviews: 0,
        plans: 0,
        achievements: 0,
        reviews: 0,
        settings: 0,
      },
    };
  }
}

/**
 * 导入特定类型的数据
 */
export async function importByType(
  type: 'progress' | 'notes' | 'folders' | 'favorites' | 'interviews' | 'plans' | 'achievements' | 'reviews' | 'settings',
  file: File
): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!Array.isArray(data)) {
      return { success: false, message: '数据格式无效，应为数组', count: 0 };
    }
    
    const db = await getDB();
    const tx = db.transaction(type, 'readwrite');
    
    for (const item of data) {
      await tx.store.put(item);
    }
    
    await tx.done;
    
    return { success: true, message: `成功导入 ${data.length} 条记录`, count: data.length };
  } catch (error: any) {
    return { success: false, message: `导入失败：${error.message}`, count: 0 };
  }
}

/**
 * 合并导入（不覆盖已有数据）
 */
export async function mergeImport(file: File): Promise<ImportResult> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!validateImportData(data)) {
      return {
        success: false,
        message: '无效的备份文件格式',
        details: {
          progress: 0,
          notes: 0,
          folders: 0,
          favorites: 0,
          interviews: 0,
          plans: 0,
          achievements: 0,
          reviews: 0,
          settings: 0,
        },
      };
    }
    
    const db = await getDB();
    
    const result: ImportResult = {
      success: true,
      message: '数据合并成功',
      details: {
        progress: 0,
        notes: 0,
        folders: 0,
        favorites: 0,
        interviews: 0,
        plans: 0,
        achievements: 0,
        reviews: 0,
        settings: 0,
      },
    };
    
    // 合并学习进度
    for (const item of data.progress as ProgressRecord[]) {
      const existing = await db.get('progress', item.questionId);
      if (!existing) {
        await db.put('progress', item);
        result.details.progress++;
      }
    }
    
    // 合并笔记
    for (const item of data.notes as NoteRecord[]) {
      const existing = await db.get('notes', item.id);
      if (!existing) {
        await db.put('notes', item);
        result.details.notes++;
      }
    }
    
    // 合并收藏夹
    for (const item of data.folders as FolderRecord[]) {
      const existing = await db.get('folders', item.id);
      if (!existing) {
        await db.put('folders', item);
        result.details.folders++;
      }
    }
    
    // 合并收藏
    for (const item of data.favorites as FavoriteRecord[]) {
      const existing = await db.get('favorites', item.id);
      if (!existing) {
        await db.put('favorites', item);
        result.details.favorites++;
      }
    }
    
    // 合并面试记录
    for (const item of data.interviews as InterviewRecord[]) {
      const existing = await db.get('interviews', item.id);
      if (!existing) {
        await db.put('interviews', item);
        result.details.interviews++;
      }
    }
    
    // 合并学习计划
    for (const item of data.plans as PlanRecord[]) {
      const existing = await db.get('plans', item.id);
      if (!existing) {
        await db.put('plans', item);
        result.details.plans++;
      }
    }
    
    // 合并成就
    for (const item of data.achievements as AchievementRecord[]) {
      const existing = await db.get('achievements', item.id);
      if (!existing) {
        await db.put('achievements', item);
        result.details.achievements++;
      }
    }
    
    // 合并复习记录
    for (const item of data.reviews as ReviewRecord[]) {
      const existing = await db.get('reviews', item.questionId);
      if (!existing) {
        await db.put('reviews', item);
        result.details.reviews++;
      }
    }
    
    // 合并设置
    for (const item of data.settings as SettingRecord[]) {
      const existing = await db.get('settings', item.key);
      if (!existing) {
        await db.put('settings', item);
        result.details.settings++;
      }
    }
    
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: `合并失败：${error.message}`,
      details: {
        progress: 0,
        notes: 0,
        folders: 0,
        favorites: 0,
        interviews: 0,
        plans: 0,
        achievements: 0,
        reviews: 0,
        settings: 0,
      },
    };
  }
}

/**
 * 自动检测文件类型并导入
 */
export async function autoImport(file: File): Promise<ImportResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'zip') {
    return importFromZip(file);
  }
  
  if (extension === 'json') {
    return importFromJson(file);
  }
  
  return {
    success: false,
    message: '不支持的文件格式，请使用 .json 或 .zip 文件',
    details: {
      progress: 0,
      notes: 0,
      folders: 0,
      favorites: 0,
      interviews: 0,
      plans: 0,
      achievements: 0,
      reviews: 0,
      settings: 0,
    },
  };
}
