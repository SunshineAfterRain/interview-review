import { getDB } from '../index';
import type { ReviewRecord } from '../index';

// 艾宾浩斯遗忘曲线间隔（天）
const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30];

/**
 * 计算下次复习时间
 */
export function calculateNextReview(
  lastReviewDate: Date,
  reviewCount: number,
  easeFactor: number = 2.5
): { nextReviewAt: Date; interval: number; newEaseFactor: number } {
  const intervalIndex = Math.min(reviewCount, REVIEW_INTERVALS.length - 1);
  let interval = REVIEW_INTERVALS[intervalIndex];
  
  // 根据难度因子调整间隔
  interval = Math.round(interval * easeFactor / 2.5);
  
  const nextReviewAt = new Date(lastReviewDate);
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);
  
  return { nextReviewAt, interval, newEaseFactor: easeFactor };
}

/**
 * 复习计划数据仓库
 */
export const reviewRepo = {
  /**
   * 根据题目 ID 获取复习记录
   */
  async getByQuestionId(questionId: string): Promise<ReviewRecord | undefined> {
    const db = await getDB();
    return db.get('reviews', questionId);
  },

  /**
   * 获取所有复习记录
   */
  async getAll(): Promise<ReviewRecord[]> {
    const db = await getDB();
    return db.getAll('reviews');
  },

  /**
   * 获取今日待复习的题目
   */
  async getTodayReviewQueue(): Promise<ReviewRecord[]> {
    const db = await getDB();
    const all = await db.getAll('reviews');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return all.filter(record => {
      const nextReview = new Date(record.nextReviewAt);
      nextReview.setHours(0, 0, 0, 0);
      return nextReview <= today;
    });
  },

  /**
   * 获取未来 N 天的复习计划
   */
  async getUpcomingReviews(days: number): Promise<Map<string, ReviewRecord[]>> {
    const db = await getDB();
    const all = await db.getAll('reviews');
    const result = new Map<string, ReviewRecord[]>();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);
    
    for (const record of all) {
      const nextReview = new Date(record.nextReviewAt);
      nextReview.setHours(0, 0, 0, 0);
      
      if (nextReview >= today && nextReview <= endDate) {
        const dateKey = nextReview.toISOString().split('T')[0];
        
        if (!result.has(dateKey)) {
          result.set(dateKey, []);
        }
        result.get(dateKey)!.push(record);
      }
    }
    
    return result;
  },

  /**
   * 创建复习记录
   */
  async create(questionId: string): Promise<ReviewRecord> {
    const db = await getDB();
    const now = new Date().toISOString();
    const { nextReviewAt, interval } = calculateNextReview(new Date(), 0);
    
    const record: ReviewRecord = {
      questionId,
      reviewCount: 0,
      nextReviewAt: nextReviewAt.toISOString(),
      interval,
      easeFactor: 2.5,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.add('reviews', record);
    return record;
  },

  /**
   * 记录复习（更新下次复习时间）
   */
  async recordReview(questionId: string, quality: 0 | 1 | 2 | 3 | 4 | 5 = 3): Promise<ReviewRecord> {
    const db = await getDB();
    const existing = await db.get('reviews', questionId);
    const now = new Date();
    
    let record: ReviewRecord;
    
    if (existing) {
      // SM-2 算法调整难度因子
      let newEaseFactor = existing.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      newEaseFactor = Math.max(1.3, newEaseFactor);
      
      const { nextReviewAt, interval } = calculateNextReview(
        now,
        existing.reviewCount + 1,
        newEaseFactor
      );
      
      record = {
        ...existing,
        reviewCount: existing.reviewCount + 1,
        nextReviewAt: nextReviewAt.toISOString(),
        lastReviewAt: now.toISOString(),
        interval,
        easeFactor: newEaseFactor,
        updatedAt: now.toISOString(),
      };
    } else {
      const { nextReviewAt, interval } = calculateNextReview(now, 0);
      
      record = {
        questionId,
        reviewCount: 1,
        nextReviewAt: nextReviewAt.toISOString(),
        lastReviewAt: now.toISOString(),
        interval,
        easeFactor: 2.5,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
    }
    
    await db.put('reviews', record);
    return record;
  },

  /**
   * 重置复习进度
   */
  async reset(questionId: string): Promise<ReviewRecord> {
    const db = await getDB();
    const existing = await db.get('reviews', questionId);
    const now = new Date();
    const { nextReviewAt, interval } = calculateNextReview(now, 0);
    
    const record: ReviewRecord = {
      questionId,
      reviewCount: 0,
      nextReviewAt: nextReviewAt.toISOString(),
      lastReviewAt: existing?.lastReviewAt,
      interval,
      easeFactor: 2.5,
      createdAt: existing?.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
    };
    
    await db.put('reviews', record);
    return record;
  },

  /**
   * 删除复习记录
   */
  async delete(questionId: string): Promise<void> {
    const db = await getDB();
    await db.delete('reviews', questionId);
  },

  /**
   * 获取统计数据
   */
  async getStats(): Promise<{
    total: number;
    overdue: number;
    dueToday: number;
  }> {
    const all = await this.getAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let total = 0;
    let overdue = 0;
    let dueToday = 0;
    
    for (const review of all) {
      total++;
      const nextReview = new Date(review.nextReviewAt);
      nextReview.setHours(0, 0, 0, 0);
      
      if (nextReview.getTime() < today.getTime()) {
        overdue++;
      } else if (nextReview.getTime() === today.getTime()) {
        dueToday++;
      }
    }
    
    return { total, overdue, dueToday };
  },

  /**
   * 清空所有复习记录
   */
  async clearAll(): Promise<void> {
    const db = await getDB();
    await db.clear('reviews');
  },

  /**
   * 批量导入复习记录
   */
  async bulkImport(records: ReviewRecord[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('reviews', 'readwrite');
    
    await Promise.all(records.map(record => tx.store.put(record)));
    await tx.done;
  },
};
