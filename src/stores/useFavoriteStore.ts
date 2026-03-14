import { create } from 'zustand';
import { folderRepo, favoriteRepo } from '../db/repositories/favoriteRepo';
import type { FavoriteFolder, FavoriteItem, FavoriteState } from '../types';

interface FavoriteStore extends FavoriteState {
  // Actions
  loadFolders: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  
  // Folder actions
  createFolder: (name: string, color: string, icon: string) => Promise<FavoriteFolder>;
  updateFolder: (id: string, data: Partial<{ name: string; color: string; icon: string }>) => Promise<FavoriteFolder>;
  deleteFolder: (id: string) => Promise<void>;
  reorderFolders: (folderIds: string[]) => Promise<void>;
  getDefaultFolder: () => Promise<FavoriteFolder>;
  
  // Favorite actions
  addToFolder: (folderId: string | null, questionId: string) => Promise<FavoriteItem>;
  removeFromFolder: (folderId: string | null, questionId: string) => Promise<void>;
  moveBetweenFolders: (questionId: string, fromFolderId: string | null, toFolderId: string | null) => Promise<FavoriteItem>;
  
  // Query actions
  isFavorite: (questionId: string) => boolean;
  isFavoriteInFolder: (questionId: string, folderId: string | null) => boolean;
  getQuestionFolders: (questionId: string) => FavoriteFolder[];
  getFolderQuestions: (folderId: string | null) => string[];
  getFavoriteCount: (folderId?: string | null) => Promise<number>;
  
  // Migration
  migrateFromUserStore: (questionIds: string[]) => Promise<void>;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  folders: [],
  favorites: [],
  isLoading: false,
  error: null,

  loadFolders: async () => {
    set({ isLoading: true });
    try {
      const folders = await folderRepo.getAll();
      set({ folders, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadFavorites: async () => {
    try {
      const favorites = await favoriteRepo.getAll();
      set({ favorites });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createFolder: async (name: string, color: string, icon: string) => {
    try {
      const folder = await folderRepo.create({ name, color, icon });
      set((state) => ({
        folders: [...state.folders, folder].sort((a, b) => a.sortOrder - b.sortOrder),
      }));
      return folder;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateFolder: async (id: string, data: Partial<{ name: string; color: string; icon: string }>) => {
    try {
      const folder = await folderRepo.update(id, data);
      set((state) => ({
        folders: state.folders.map(f => f.id === id ? folder : f),
      }));
      return folder;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteFolder: async (id: string) => {
    try {
      await folderRepo.delete(id);
      set((state) => ({
        folders: state.folders.filter(f => f.id !== id),
        favorites: state.favorites.filter(f => f.folderId !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  reorderFolders: async (folderIds: string[]) => {
    try {
      await folderRepo.reorder(folderIds);
      set((state) => ({
        folders: state.folders
          .map(f => ({ ...f, sortOrder: folderIds.indexOf(f.id) }))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  getDefaultFolder: async () => {
    return folderRepo.getOrCreateDefault();
  },

  addToFolder: async (folderId: string | null, questionId: string) => {
    try {
      const favorite = await favoriteRepo.add({ questionId, folderId });
      set((state) => ({
        favorites: [...state.favorites, favorite],
      }));
      return favorite;
    } catch (error: any) {
      // 如果已存在，忽略错误
      if (error.message.includes('Already favorited')) {
        return get().favorites.find(f => 
          f.questionId === questionId && f.folderId === folderId
        )!;
      }
      set({ error: error.message });
      throw error;
    }
  },

  removeFromFolder: async (folderId: string | null, questionId: string) => {
    try {
      await favoriteRepo.remove(questionId, folderId);
      set((state) => ({
        favorites: state.favorites.filter(f => 
          !(f.questionId === questionId && f.folderId === folderId)
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  moveBetweenFolders: async (questionId: string, fromFolderId: string | null, toFolderId: string | null) => {
    try {
      const favorite = await favoriteRepo.move(questionId, fromFolderId, toFolderId);
      set((state) => ({
        favorites: state.favorites.map(f => 
          f.id === favorite.id ? favorite : f
        ),
      }));
      return favorite;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  isFavorite: (questionId: string) => {
    return get().favorites.some(f => f.questionId === questionId);
  },

  isFavoriteInFolder: (questionId: string, folderId: string | null) => {
    return get().favorites.some(f => 
      f.questionId === questionId && f.folderId === folderId
    );
  },

  getQuestionFolders: (questionId: string) => {
    const { favorites, folders } = get();
    const questionFavorites = favorites.filter(f => f.questionId === questionId);
    return folders.filter(f => 
      questionFavorites.some(qf => qf.folderId === f.id)
    );
  },

  getFolderQuestions: (folderId: string | null) => {
    return get()
      .favorites.filter(f => f.folderId === folderId)
      .map(f => f.questionId);
  },

  getFavoriteCount: async (folderId?: string | null) => {
    return favoriteRepo.count(folderId);
  },

  migrateFromUserStore: async (questionIds: string[]) => {
    try {
      // 确保默认收藏夹存在
      const defaultFolder = await folderRepo.getOrCreateDefault();
      
      // 迁移所有收藏到默认收藏夹
      for (const questionId of questionIds) {
        try {
          await favoriteRepo.add({ questionId, folderId: defaultFolder.id });
        } catch {
          // 忽略已存在的错误
        }
      }
      
      // 重新加载数据
      await get().loadFavorites();
      await get().loadFolders();
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
