import { getDB } from '../index';
import type { ProgressRecord } from '../index';
import { LearningStatus } from '../../stores/useUserStore';

/**
 * 学习进度数据仓库
 */
export const progressRepo = {
  /**
   * 根据题目 ID 获取进度
   */
  async getByQuestionId(questionId: string): Promise<ProgressRecord | undefined> {
    const db = await getDB();
    return db.get('progress', questionId);
  },

  /**
   * 获取所有进度
   */
  async getAll(): Promise<ProgressRecord[]> {
    const db = await getDB();
    return db.getAll('progress');
  },

  /**
   * 根据状态获取进度
   */
  async getByStatus(status: LearningStatus): Promise<ProgressRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('progress', 'by-status', status);
  },

  /**
   * 创建或更新进度
   */
  async upsert(data: {
    questionId: string;
    status?: LearningStatus;
    lastVisit?: string;
    visitCount?: number;
    timeSpent?: number;
  }): Promise<ProgressRecord> {
    const db = await getDB();
    const existing = await db.get('progress', data.questionId);
    const now = new Date().toISOString();
    
    let record: ProgressRecord;
    
    if (existing) {
      record = {
        ...existing,
        status: data.status ?? existing.status,
        lastVisit: data.lastVisit ?? now,
        visitCount: data.visitCount ?? existing.visitCount,
        timeSpent: data.timeSpent ?? existing.timeSpent,
        updatedAt: now,
      };
    } else {
      record = {
        questionId: data.questionId,
        status: data.status ?? 'learning',
        lastVisit: data.lastVisit ?? now,
        visitCount: data.visitCount ?? 1,
        timeSpent: data.timeSpent ?? 0,
        createdAt: now,
        updatedAt: now,
      };
    }
    
    await db.put('progress', record);
    return record;
  },

  /**
   * 记录访问
   */
  async recordVisit(questionId: string): Promise<ProgressRecord> {
    const db = await getDB();
    const existing = await db.get('progress', questionId);
    const now = new Date().toISOString();
    
    let record: ProgressRecord;
    
    if (existing) {
      record = {
        ...existing,
        lastVisit: now,
        visitCount: existing.visitCount + 1,
        updatedAt: now,
      };
    } else {
      record = {
        questionId,
        status: 'learning',
        lastVisit: now,
        visitCount: 1,
        timeSpent: 0,
        createdAt: now,
        updatedAt: now,
      };
    }
    
    await db.put('progress', record);
    return record;
  },

  /**
   * 记录学习时间
   */
  async recordTimeSpent(questionId: string, seconds: number): Promise<ProgressRecord> {
    const db = await getDB();
    const existing = await db.get('progress', questionId);
    
    if (!existing) {
      throw new Error(`Progress for question ${questionId} not found`);
    }
    
    const updated: ProgressRecord = {
      ...existing,
      timeSpent: existing.timeSpent + seconds,
      updatedAt: new Date().toISOString(),
    };
    
    await db.put('progress', updated);
    return updated;
  },

  /**
   * 更新状态
   */
  async updateStatus(questionId: string, status: LearningStatus): Promise<ProgressRecord> {
    return this.upsert({ questionId, status });
  },

  /**
   * 批量更新状态
   */
  async bulkUpdateStatus(updates: Array<{ questionId: string; status: LearningStatus }>): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('progress', 'readwrite');
    const now = new Date().toISOString();
    
    await Promise.all(
      updates.map(async ({ questionId, status }) => {
        const existing = await tx.store.get(questionId);
        
        if (existing) {
          await tx.store.put({
            ...existing,
            status,
            updatedAt: now,
          });
        } else {
          await tx.store.put({
            questionId,
            status,
            lastVisit: now,
            visitCount: 1,
            timeSpent: 0,
            createdAt: now,
            updatedAt: now,
          });
        }
      })
    );
    
    await tx.done;
  },

  /**
   * 删除进度
   */
  async delete(questionId: string): Promise<void> {
    const db = await getDB();
    await db.delete('progress', questionId);
  },

  /**
   * 获取统计数据
   */
  async getStats(): Promise<{
    total: number;
    notStarted: number;
    learning: number;
    mastered: number;
    totalTimeSpent: number;
  }> {
    const db = await getDB();
    const all = await db.getAll('progress');
    
    return {
      total: all.length,
      notStarted: all.filter(p => p.status === 'not_started').length,
      learning: all.filter(p => p.status === 'learning').length,
      mastered: all.filter(p => p.status === 'mastered').length,
      totalTimeSpent: all.reduce((sum, p) => sum + p.timeSpent, 0),
    };
  },

  /**
   * 获取最近学习的题目
   */
  async getRecent(limit = 10): Promise<ProgressRecord[]> {
    const db = await getDB();
    const all = await db.getAll('progress');
    
    return all
      .filter(p => p.status !== 'not_started')
      .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
      .slice(0, limit);
  },

  /**
   * 获取学习时间最长的题目
   */
  async getMostTimeSpent(limit = 10): Promise<ProgressRecord[]> {
    const db = await getDB();
    const all = await db.getAll('progress');
    
    return all
      .sort((a, b) => b.timeSpent - a.timeSpent)
      .slice(0, limit);
  },

  /**
   * 清空所有进度
   */
  async clearAll(): Promise<void> {
    const db = await getDB();
    await db.clear('progress');
  },

  /**
   * 批量导入进度
   */
  async bulkImport(records: ProgressRecord[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('progress', 'readwrite');
    
    await Promise.all(records.map(record => tx.store.put(record)));
    await tx.done;
  },
};
