import { create } from 'zustand';
import { reviewRepo, calculateNextReview } from '../db/repositories/reviewRepo';
import type { ReviewItem, ReviewState } from '../types';

interface ReviewStore extends ReviewState {
  // Actions
  loadReviewQueue: () => Promise<void>;
  markAsReviewed: (questionId: string, quality?: 0 | 1 | 2 | 3 | 4 | 5) => Promise<void>;
  addToReviewQueue: (questionId: string) => Promise<void>;
  removeFromQueue: (questionId: string) => Promise<void>;
  getUpcomingReviews: (days: number) => Promise<Map<string, ReviewItem[]>>;
  shouldNotify: () => boolean;
  updateLastNotified: () => void;
  getReviewStats: () => Promise<{
    total: number;
    overdue: number;
    dueToday: number;
    upcoming: number;
  }>;
  resetReview: (questionId: string) => Promise<void>;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviewQueue: [],
  isLoading: false,
  lastNotified: '',

  loadReviewQueue: async () => {
    set({ isLoading: true });
    try {
      const queue = await reviewRepo.getTodayReviewQueue();
      set({ 
        reviewQueue: queue.map(r => ({
          questionId: r.questionId,
          reviewCount: r.reviewCount,
          nextReviewAt: r.nextReviewAt,
          lastReviewAt: r.lastReviewAt,
          interval: r.interval,
          easeFactor: r.easeFactor,
        })),
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to load review queue:', error);
      set({ isLoading: false });
    }
  },

  markAsReviewed: async (questionId, quality = 3) => {
    try {
      await reviewRepo.recordReview(questionId, quality);
      
      // 从队列中移除
      set((state) => ({
        reviewQueue: state.reviewQueue.filter(item => item.questionId !== questionId),
      }));
    } catch (error) {
      console.error('Failed to mark as reviewed:', error);
    }
  },

  addToReviewQueue: async (questionId) => {
    try {
      const record = await reviewRepo.create(questionId);
      set((state) => ({
        reviewQueue: [...state.reviewQueue, {
          questionId: record.questionId,
          reviewCount: record.reviewCount,
          nextReviewAt: record.nextReviewAt,
          lastReviewAt: record.lastReviewAt,
          interval: record.interval,
          easeFactor: record.easeFactor,
        }],
      }));
    } catch (error) {
      console.error('Failed to add to review queue:', error);
    }
  },

  removeFromQueue: async (questionId) => {
    try {
      await reviewRepo.delete(questionId);
      set((state) => ({
        reviewQueue: state.reviewQueue.filter(item => item.questionId !== questionId),
      }));
    } catch (error) {
      console.error('Failed to remove from queue:', error);
    }
  },

  getUpcomingReviews: async (days) => {
    return reviewRepo.getUpcomingReviews(days);
  },

  shouldNotify: () => {
    const { reviewQueue, lastNotified } = get();
    
    if (reviewQueue.length === 0) return false;
    
    // 如果今天还没通知过
    const today = new Date().toDateString();
    if (lastNotified !== today) {
      return true;
    }
    
    return false;
  },

  updateLastNotified: () => {
    set({ lastNotified: new Date().toDateString() });
  },

  getReviewStats: async () => {
    const stats = await reviewRepo.getStats();
    const upcoming = await reviewRepo.getUpcomingReviews(7);
    
    return {
      ...stats,
      upcoming: Array.from(upcoming.values()).flat().length,
    };
  },

  resetReview: async (questionId) => {
    try {
      await reviewRepo.reset(questionId);
      await get().loadReviewQueue();
    } catch (error) {
      console.error('Failed to reset review:', error);
    }
  },
}));

// 导出计算函数供外部使用
export { calculateNextReview };
