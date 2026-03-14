import { create } from 'zustand';
import { answerRepo } from '../db/repositories/answerRepo';

/** 保存状态 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AnswerState {
  // State
  answers: Record<string, string>;
  saveStatus: Record<string, SaveStatus>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadAnswers: () => Promise<void>;
  getAnswer: (questionId: string) => string | undefined;
  saveAnswer: (questionId: string, answer: string) => Promise<void>;
  deleteAnswer: (questionId: string) => Promise<void>;
  getSaveStatus: (questionId: string) => SaveStatus;
  getAnswerCount: () => Promise<number>;
}

// 防抖保存的定时器
const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export const useAnswerStore = create<AnswerState>((set, get) => ({
  answers: {},
  saveStatus: {},
  isLoading: false,
  error: null,

  loadAnswers: async () => {
    set({ isLoading: true, error: null });
    try {
      const allAnswers = await answerRepo.getAllAnswers();
      const answersMap = allAnswers.reduce((acc, record) => {
        acc[record.questionId] = record.answer;
        return acc;
      }, {} as Record<string, string>);
      
      set({ answers: answersMap, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  getAnswer: (questionId: string) => {
    return get().answers[questionId];
  },

  saveAnswer: async (questionId: string, answer: string) => {
    // 立即更新本地状态
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
      saveStatus: { ...state.saveStatus, [questionId]: 'saving' },
    }));

    try {
      await answerRepo.saveAnswer(questionId, answer);
      set((state) => ({
        saveStatus: { ...state.saveStatus, [questionId]: 'saved' },
      }));

      // 3秒后将状态重置为 idle
      setTimeout(() => {
        set((state) => {
          if (state.saveStatus[questionId] === 'saved') {
            return {
              saveStatus: { ...state.saveStatus, [questionId]: 'idle' },
            };
          }
          return state;
        });
      }, 3000);
    } catch (error: any) {
      set((state) => ({
        saveStatus: { ...state.saveStatus, [questionId]: 'error' },
        error: error.message,
      }));
    }
  },

  deleteAnswer: async (questionId: string) => {
    try {
      await answerRepo.deleteAnswer(questionId);
      set((state) => {
        const { [questionId]: _, ...restAnswers } = state.answers;
        const { [questionId]: __, ...restStatus } = state.saveStatus;
        return {
          answers: restAnswers,
          saveStatus: restStatus,
        };
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  getSaveStatus: (questionId: string) => {
    return get().saveStatus[questionId] || 'idle';
  },

  getAnswerCount: async () => {
    return answerRepo.count();
  },
}));

/**
 * 防抖保存答案
 * @param questionId 题目 ID
 * @param answer 答案内容
 * @param delay 延迟时间（毫秒），默认 3000ms
 */
export const debouncedSaveAnswer = (questionId: string, answer: string, delay: number = 3000) => {
  // 清除之前的定时器
  if (debounceTimers[questionId]) {
    clearTimeout(debounceTimers[questionId]);
  }

  // 设置新的定时器
  debounceTimers[questionId] = setTimeout(() => {
    useAnswerStore.getState().saveAnswer(questionId, answer);
    delete debounceTimers[questionId];
  }, delay);
};

/**
 * 立即保存答案（取消防抖）
 * @param questionId 题目 ID
 */
export const flushSaveAnswer = (questionId: string) => {
  if (debounceTimers[questionId]) {
    clearTimeout(debounceTimers[questionId]);
    delete debounceTimers[questionId];
  }
};
