import { getDB } from '../index';
import { v4 as uuidv4 } from 'uuid';
import type { InterviewRecord, InterviewConfig, InterviewAnswer } from '../index';

/**
 * 面试记录数据仓库
 */
export const interviewRepo = {
  /**
   * 根据 ID 获取面试记录
   */
  async getById(id: string): Promise<InterviewRecord | undefined> {
    const db = await getDB();
    return db.get('interviews', id);
  },

  /**
   * 获取所有面试记录
   */
  async getAll(): Promise<InterviewRecord[]> {
    const db = await getDB();
    return db.getAll('interviews');
  },

  /**
   * 获取面试历史记录（已完成的）
   */
  async getHistory(limit = 20): Promise<InterviewRecord[]> {
    const db = await getDB();
    const all = await db.getAll('interviews');
    
    return all
      .filter(i => i.status === 'completed')
      .sort((a, b) => new Date(b.endTime || b.startTime).getTime() - new Date(a.endTime || a.startTime).getTime())
      .slice(0, limit);
  },

  /**
   * 获取进行中的面试
   */
  async getPending(): Promise<InterviewRecord | undefined> {
    const db = await getDB();
    const all = await db.getAllFromIndex('interviews', 'by-status', 'pending');
    return all[0];
  },

  /**
   * 创建面试记录
   */
  async create(data: {
    config: InterviewConfig;
    questionIds: string[];
  }): Promise<InterviewRecord> {
    const db = await getDB();
    const now = new Date().toISOString();
    
    const interview: InterviewRecord = {
      id: uuidv4(),
      config: data.config,
      questionIds: data.questionIds,
      answers: [],
      startTime: now,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    
    await db.add('interviews', interview);
    return interview;
  },

  /**
   * 提交答案
   */
  async submitAnswer(
    id: string,
    answer: InterviewAnswer
  ): Promise<InterviewRecord> {
    const db = await getDB();
    const existing = await db.get('interviews', id);
    
    if (!existing) {
      throw new Error(`Interview with id ${id} not found`);
    }
    
    const updated: InterviewRecord = {
      ...existing,
      answers: [...existing.answers, answer],
      updatedAt: new Date().toISOString(),
    };
    
    await db.put('interviews', updated);
    return updated;
  },

  /**
   * 完成面试
   */
  async complete(id: string): Promise<InterviewRecord> {
    const db = await getDB();
    const existing = await db.get('interviews', id);
    
    if (!existing) {
      throw new Error(`Interview with id ${id} not found`);
    }
    
    const updated: InterviewRecord = {
      ...existing,
      status: 'completed',
      endTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.put('interviews', updated);
    return updated;
  },

  /**
   * 放弃面试
   */
  async abandon(id: string): Promise<InterviewRecord> {
    const db = await getDB();
    const existing = await db.get('interviews', id);
    
    if (!existing) {
      throw new Error(`Interview with id ${id} not found`);
    }
    
    const updated: InterviewRecord = {
      ...existing,
      status: 'abandoned',
      endTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.put('interviews', updated);
    return updated;
  },

  /**
   * 删除面试记录
   */
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('interviews', id);
  },

  /**
   * 获取统计数据
   */
  async getStats(): Promise<{
    total: number;
    completed: number;
    abandoned: number;
    pending: number;
  }> {
    const db = await getDB();
    const all = await db.getAll('interviews');
    
    return {
      total: all.length,
      completed: all.filter(i => i.status === 'completed').length,
      abandoned: all.filter(i => i.status === 'abandoned').length,
      pending: all.filter(i => i.status === 'pending').length,
    };
  },

  /**
   * 获取最近 N 天的面试次数
   */
  async getRecentCount(days: number): Promise<number> {
    const db = await getDB();
    const all = await db.getAll('interviews');
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return all.filter(i => {
      const date = new Date(i.startTime);
      return date >= cutoff && i.status === 'completed';
    }).length;
  },

  /**
   * 清空所有面试记录
   */
  async clearAll(): Promise<void> {
    const db = await getDB();
    await db.clear('interviews');
  },
};
