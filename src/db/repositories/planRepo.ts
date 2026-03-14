import { getDB } from '../index';
import { v4 as uuidv4 } from 'uuid';
import type { PlanRecord, PlanType, PlanItem } from '../index';

/**
 * 学习计划数据仓库
 */
export const planRepo = {
  /**
   * 根据 ID 获取计划
   */
  async getById(id: string): Promise<PlanRecord | undefined> {
    const db = await getDB();
    return db.get('plans', id);
  },

  /**
   * 获取所有计划
   */
  async getAll(): Promise<PlanRecord[]> {
    const db = await getDB();
    return db.getAll('plans');
  },

  /**
   * 获取活跃的计划
   */
  async getActive(): Promise<PlanRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('plans', 'by-status', 'active');
  },

  /**
   * 根据类型获取计划
   */
  async getByType(type: PlanType): Promise<PlanRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('plans', 'by-type', type);
  },

  /**
   * 获取当前活跃的每日计划
   */
  async getCurrentDailyPlan(): Promise<PlanRecord | undefined> {
    const db = await getDB();
    const dailyPlans = await db.getAllFromIndex('plans', 'by-type', 'daily');
    const today = new Date().toISOString().split('T')[0];
    
    return dailyPlans.find(p => 
      p.status === 'active' && p.startDate.startsWith(today)
    );
  },

  /**
   * 创建计划
   */
  async create(data: {
    type: PlanType;
    title: string;
    dailyGoal: number;
    startDate: string;
    endDate?: string;
    items?: PlanItem[];
  }): Promise<PlanRecord> {
    const db = await getDB();
    const now = new Date().toISOString();
    
    const plan: PlanRecord = {
      id: uuidv4(),
      type: data.type,
      title: data.title,
      dailyGoal: data.dailyGoal,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'active',
      items: data.items || [],
      createdAt: now,
      updatedAt: now,
    };
    
    await db.add('plans', plan);
    return plan;
  },

  /**
   * 更新计划
   */
  async update(id: string, data: Partial<{
    title: string;
    dailyGoal: number;
    endDate: string;
    status: 'active' | 'completed' | 'archived';
    items: PlanItem[];
  }>): Promise<PlanRecord> {
    const db = await getDB();
    const existing = await db.get('plans', id);
    
    if (!existing) {
      throw new Error(`Plan with id ${id} not found`);
    }
    
    const updated: PlanRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    await db.put('plans', updated);
    return updated;
  },

  /**
   * 添加计划项
   */
  async addItem(id: string, item: PlanItem): Promise<PlanRecord> {
    const db = await getDB();
    const existing = await db.get('plans', id);
    
    if (!existing) {
      throw new Error(`Plan with id ${id} not found`);
    }
    
    const updated: PlanRecord = {
      ...existing,
      items: [...existing.items, item],
      updatedAt: new Date().toISOString(),
    };
    
    await db.put('plans', updated);
    return updated;
  },

  /**
   * 完成计划项
   */
  async completeItem(id: string, questionId: string): Promise<PlanRecord> {
    const db = await getDB();
    const existing = await db.get('plans', id);
    
    if (!existing) {
      throw new Error(`Plan with id ${id} not found`);
    }
    
    const updated: PlanRecord = {
      ...existing,
      items: existing.items.map(item =>
        item.questionId === questionId
          ? { ...item, completed: true, completedAt: new Date().toISOString() }
          : item
      ),
      updatedAt: new Date().toISOString(),
    };
    
    await db.put('plans', updated);
    return updated;
  },

  /**
   * 删除计划
   */
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('plans', id);
  },

  /**
   * 归档计划
   */
  async archive(id: string): Promise<PlanRecord> {
    return this.update(id, { status: 'archived' });
  },

  /**
   * 完成计划
   */
  async complete(id: string): Promise<PlanRecord> {
    return this.update(id, { status: 'completed' });
  },

  /**
   * 获取计划进度
   */
  async getProgress(id: string): Promise<{
    total: number;
    completed: number;
    percentage: number;
  }> {
    const plan = await this.getById(id);
    if (!plan) {
      return { total: 0, completed: 0, percentage: 0 };
    }
    
    const total = plan.items.length;
    const completed = plan.items.filter(item => item.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  },

  /**
   * 获取统计数据
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    archived: number;
  }> {
    const db = await getDB();
    const all = await db.getAll('plans');
    
    return {
      total: all.length,
      active: all.filter(p => p.status === 'active').length,
      completed: all.filter(p => p.status === 'completed').length,
      archived: all.filter(p => p.status === 'archived').length,
    };
  },

  /**
   * 清空所有计划
   */
  async clearAll(): Promise<void> {
    const db = await getDB();
    await db.clear('plans');
  },
};
