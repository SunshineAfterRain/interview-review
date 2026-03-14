// ==================== 笔记类型 ====================

export interface Note {
  id: string;
  questionId: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteState {
  notes: Record<string, Note>;
  isLoading: boolean;
  error: string | null;
}

// ==================== 收藏夹类型 ====================

export interface FavoriteFolder {
  id: string;
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteItem {
  id: string;
  questionId: string;
  folderId: string | null;
  createdAt: string;
}

export interface FavoriteState {
  folders: FavoriteFolder[];
  favorites: FavoriteItem[];
  isLoading: boolean;
  error: string | null;
}

// ==================== 复习类型 ====================

export interface ReviewItem {
  questionId: string;
  reviewCount: number;
  nextReviewAt: string;
  lastReviewAt?: string;
  interval: number;
  easeFactor: number;
}

export interface ReviewState {
  reviewQueue: ReviewItem[];
  isLoading: boolean;
  lastNotified: string;
}

// ==================== 搜索类型 ====================

export interface SearchOptions {
  query: string;
  useRegex: boolean;
  caseSensitive: boolean;
  searchIn: ('title' | 'tags' | 'content' | 'notes')[];
  filters: {
    categories?: string[];
    difficulties?: string[];
    status?: ('not_started' | 'learning' | 'mastered')[];
  };
}

export interface SearchHistory {
  query: string;
  timestamp: string;
  resultCount: number;
}

// ==================== 计时器类型 ====================

export interface TimerState {
  questionId: string | null;
  seconds: number;
  isRunning: boolean;
  startTime: string | null;
}

export interface TimeRecord {
  questionId: string;
  seconds: number;
  date: string;
  startTime: string;
  endTime: string;
}
