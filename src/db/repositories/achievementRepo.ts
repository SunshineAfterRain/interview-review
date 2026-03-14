import { getDB } from '../index';
import { v4 as uuidv4 } from 'uuid';
import type { AchievementRecord, AchievementType } from '../index';

/**
 * 成就定义
 */
export interface AchievementDefinition {
  key: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  condition: (value: number) => boolean;
}

/**
 * 预定义成就列表
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // 连续学习成就
  {
    key: 'streak-1',
    type: 'streak',
    name: '初露锋芒',
    description: '连续学习 1 天',
    icon: '🌱',
    condition: (v) => v >= 1,
  },
  {
    key: 'streak-7',
    type: 'streak',
    name: '坚持一周',
    description: '连续学习 7 天',
    icon: '🔥',
    condition: (v) => v >= 7,
  },
  {
    key: 'streak-30',
    type: 'streak',
    name: '月度达人',
    description: '连续学习 30 天',
    icon: '🏆',
    condition: (v) => v >= 30,
  },
  {
    key: 'streak-100',
    type: 'streak',
    name: '百日坚持',
    description: '连续学习 100 天',
    icon: '💎',
    condition: (v) => v >= 100,
  },
  
  // 题目数量成就
  {
    key: 'questions-10',
    type: 'questions',
    name: '小有所成',
    description: '掌握 10 道题目',
    icon: '📚',
    condition: (v) => v >= 10,
  },
  {
    key: 'questions-50',
    type: 'questions',
    name: '学富五车',
    description: '掌握 50 道题目',
    icon: '🎓',
    condition: (v) => v >= 50,
  },
  {
    key: 'questions-100',
    type: 'questions',
    name: '博学多才',
    description: '掌握 100 道题目',
    icon: '🌟',
    condition: (v) => v >= 100,
  },
  {
    key: 'questions-500',
    type: 'questions',
    name: '知识大师',
    description: '掌握 500 道题目',
    icon: '👑',
    condition: (v) => v >= 500,
  },
  
  // 学习时间成就
  {
    key: 'time-1h',
    type: 'time',
    name: '初学乍练',
    description: '累计学习 1 小时',
    icon: '⏰',
    condition: (v) => v >= 3600,
  },
  {
    key: 'time-10h',
    type: 'time',
    name: '勤学苦练',
    description: '累计学习 10 小时',
    icon: '⌛',
    condition: (v) => v >= 36000,
  },
  {
    key: 'time-100h',
    type: 'time',
    name: '孜孜不倦',
    description: '累计学习 100 小时',
    icon: '⭐',
    condition: (v) => v >= 360000,
  },
  
  // 分类成就
  {
    key: 'category-js-master',
    type: 'category',
    name: 'JS 大师',
    description: '掌握所有 JavaScript 题目',
    icon: '🟨',
    condition: (v) => v >= 100,
  },
  {
    key: 'category-react-master',
    type: 'category',
    name: 'React 专家',
    description: '掌握所有 React 题目',
    icon: '⚛️',
    condition: (v) => v >= 100,
  },
  
  // 特殊成就
  {
    key: 'special-first-interview',
    type: 'special',
    name: '初次面试',
    description: '完成第一次模拟面试',
    icon: '🎯',
    condition: (v) => v >= 1,
  },
  {
    key: 'special-first-note',
    type: 'special',
    name: '笔记达人',
    description: '创建第一条笔记',
    icon: '📝',
    condition: (v) => v >= 1,
  },
  {
    key: 'special-first-favorite',
    type: 'special',
    name: '收藏爱好者',
    description: '收藏第一道题目',
    icon: '❤️',
    condition: (v) => v >= 1,
  },
];

/**
 * 成就数据仓库
 */
export const achievementRepo = {
  /**
   * 获取所有已获得的成就
   */
  async getAll(): Promise<AchievementRecord[]> {
    const db = await getDB();
    return db.getAll('achievements');
  },

  /**
   * 根据类型获取成就
   */
  async getByType(type: AchievementType): Promise<AchievementRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('achievements', 'by-type', type);
  },

  /**
   * 检查成就是否已获得
   */
  async isEarned(key: string): Promise<boolean> {
    const db = await getDB();
    const all = await db.getAll('achievements');
    return all.some(a => a.key === key);
  },

  /**
   * 获得成就
   */
  async earn(key: string): Promise<AchievementRecord | null> {
    // 检查是否已获得
    if (await this.isEarned(key)) {
      return null;
    }
    
    // 查找成就定义
    const definition = ACHIEVEMENT_DEFINITIONS.find(d => d.key === key);
    if (!definition) {
      throw new Error(`Achievement definition not found: ${key}`);
    }
    
    const db = await getDB();
    const now = new Date().toISOString();
    
    const record: AchievementRecord = {
      id: uuidv4(),
      type: definition.type,
      key: definition.key,
      name: definition.name,
      description: definition.description,
      icon: definition.icon,
      earnedAt: now,
      createdAt: now,
    };
    
    await db.add('achievements', record);
    return record;
  },

  /**
   * 检查并解锁成就
   */
  async checkAndUnlock(type: AchievementType, value: number): Promise<AchievementRecord[]> {
    const newlyEarned: AchievementRecord[] = [];
    
    const definitions = ACHIEVEMENT_DEFINITIONS.filter(d => d.type === type);
    
    for (const def of definitions) {
      if (def.condition(value)) {
        const earned = await this.earn(def.key);
        if (earned) {
          newlyEarned.push(earned);
        }
      }
    }
    
    return newlyEarned;
  },

  /**
   * 获取未获得的成就
   */
  async getUnearned(): Promise<AchievementDefinition[]> {
    const earned = await this.getAll();
    const earnedKeys = new Set(earned.map(a => a.key));
    
    return ACHIEVEMENT_DEFINITIONS.filter(d => !earnedKeys.has(d.key));
  },

  /**
   * 获取成就进度
   */
  async getProgress(type: AchievementType, currentValue: number): Promise<{
    definition: AchievementDefinition;
    earned: boolean;
    progress: number;
  }[]> {
    const earned = await this.getByType(type);
    const earnedKeys = new Set(earned.map(a => a.key));
    
    const definitions = ACHIEVEMENT_DEFINITIONS.filter(d => d.type === type);
    
    return definitions.map(def => {
      // 简单计算进度（实际应根据具体条件计算）
      const threshold = this.getThreshold(def.key);
      const progress = Math.min(100, Math.round((currentValue / threshold) * 100));
      
      return {
        definition: def,
        earned: earnedKeys.has(def.key),
        progress: earnedKeys.has(def.key) ? 100 : progress,
      };
    });
  },

  /**
   * 获取成就阈值
   */
  getThreshold(key: string): number {
    const thresholds: Record<string, number> = {
      'streak-1': 1,
      'streak-7': 7,
      'streak-30': 30,
      'streak-100': 100,
      'questions-10': 10,
      'questions-50': 50,
      'questions-100': 100,
      'questions-500': 500,
      'time-1h': 3600,
      'time-10h': 36000,
      'time-100h': 360000,
      'category-js-master': 100,
      'category-react-master': 100,
      'special-first-interview': 1,
      'special-first-note': 1,
      'special-first-favorite': 1,
    };
    
    return thresholds[key] || 1;
  },

  /**
   * 获取统计数据
   */
  async getStats(): Promise<{
    total: number;
    byType: Record<AchievementType, number>;
  }> {
    const all = await this.getAll();
    
    const byType: Record<AchievementType, number> = {
      streak: 0,
      questions: 0,
      time: 0,
      category: 0,
      special: 0,
    };
    
    for (const achievement of all) {
      byType[achievement.type]++;
    }
    
    return {
      total: all.length,
      byType,
    };
  },

  /**
   * 清空所有成就
   */
  async clearAll(): Promise<void> {
    const db = await getDB();
    await db.clear('achievements');
  },

  /**
   * 批量导入成就
   */
  async bulkImport(records: AchievementRecord[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('achievements', 'readwrite');
    
    await Promise.all(records.map(record => tx.store.put(record)));
    await tx.done;
  },
};
