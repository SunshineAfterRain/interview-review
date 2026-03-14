import { getDB } from '../index';
import { v4 as uuidv4 } from 'uuid';
import type { FolderRecord, FavoriteRecord } from '../index';

/**
 * 收藏夹数据仓库
 */
export const folderRepo = {
  /**
   * 获取所有收藏夹
   */
  async getAll(): Promise<FolderRecord[]> {
    const db = await getDB();
    const folders = await db.getAll('folders');
    return folders.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  /**
   * 根据 ID 获取收藏夹
   */
  async getById(id: string): Promise<FolderRecord | undefined> {
    const db = await getDB();
    return db.get('folders', id);
  },

  /**
   * 创建收藏夹
   */
  async create(data: { name: string; color: string; icon: string }): Promise<FolderRecord> {
    const db = await getDB();
    const folders = await db.getAll('folders');
    const now = new Date().toISOString();
    
    const folder: FolderRecord = {
      id: uuidv4(),
      name: data.name,
      color: data.color,
      icon: data.icon,
      sortOrder: folders.length,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.add('folders', folder);
    return folder;
  },

  /**
   * 更新收藏夹
   */
  async update(id: string, data: Partial<{ name: string; color: string; icon: string }>): Promise<FolderRecord> {
    const db = await getDB();
    const existing = await db.get('folders', id);
    
    if (!existing) {
      throw new Error(`Folder with id ${id} not found`);
    }
    
    const updated: FolderRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    await db.put('folders', updated);
    return updated;
  },

  /**
   * 删除收藏夹（同时删除其中的收藏项）
   */
  async delete(id: string): Promise<void> {
    const db = await getDB();
    
    // 删除收藏夹中的所有收藏项
    const favorites = await db.getAllFromIndex('favorites', 'by-folder', id);
    const tx = db.transaction(['folders', 'favorites'], 'readwrite');
    
    await Promise.all(favorites.map(f => tx.objectStore('favorites').delete(f.id)));
    await tx.objectStore('folders').delete(id);
    await tx.done;
  },

  /**
   * 重新排序
   */
  async reorder(folderIds: string[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('folders', 'readwrite');
    
    await Promise.all(
      folderIds.map(async (id, index) => {
        const folder = await tx.store.get(id);
        if (folder) {
          folder.sortOrder = index;
          folder.updatedAt = new Date().toISOString();
          await tx.store.put(folder);
        }
      })
    );
    
    await tx.done;
  },

  /**
   * 获取默认收藏夹（如果没有则创建）
   */
  async getOrCreateDefault(): Promise<FolderRecord> {
    const db = await getDB();
    let folders = await db.getAll('folders');
    
    if (folders.length === 0) {
      const now = new Date().toISOString();
      const defaultFolder: FolderRecord = {
        id: 'default',
        name: '默认收藏夹',
        color: '#f7df1e',
        icon: '⭐',
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      };
      
      await db.add('folders', defaultFolder);
      return defaultFolder;
    }
    
    return folders.sort((a, b) => a.sortOrder - b.sortOrder)[0];
  },
};

/**
 * 收藏项数据仓库
 */
export const favoriteRepo = {
  /**
   * 获取所有收藏项
   */
  async getAll(): Promise<FavoriteRecord[]> {
    const db = await getDB();
    return db.getAll('favorites');
  },

  /**
   * 根据题目 ID 获取收藏项
   */
  async getByQuestionId(questionId: string): Promise<FavoriteRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('favorites', 'by-question', questionId);
  },

  /**
   * 根据收藏夹 ID 获取收藏项
   */
  async getByFolderId(folderId: string | null): Promise<FavoriteRecord[]> {
    const db = await getDB();
    
    if (folderId === null) {
      // 获取未分类的收藏项
      const all = await db.getAll('favorites');
      return all.filter(f => f.folderId === null);
    }
    
    return db.getAllFromIndex('favorites', 'by-folder', folderId);
  },

  /**
   * 检查题目是否已收藏
   */
  async isFavorite(questionId: string, folderId?: string): Promise<boolean> {
    const db = await getDB();
    const all = await db.getAllFromIndex('favorites', 'by-question', questionId);
    
    if (folderId === undefined) {
      return all.length > 0;
    }
    
    return all.some(f => f.folderId === folderId);
  },

  /**
   * 添加收藏
   */
  async add(data: { questionId: string; folderId?: string | null }): Promise<FavoriteRecord> {
    const db = await getDB();
    
    // 检查是否已存在
    const existing = await this.getByQuestionId(data.questionId);
    const targetFolderId = data.folderId ?? null;
    
    if (existing.some(f => f.folderId === targetFolderId)) {
      throw new Error('Already favorited in this folder');
    }
    
    const favorite: FavoriteRecord = {
      id: uuidv4(),
      questionId: data.questionId,
      folderId: targetFolderId,
      createdAt: new Date().toISOString(),
    };
    
    await db.add('favorites', favorite);
    return favorite;
  },

  /**
   * 移除收藏
   */
  async remove(questionId: string, folderId?: string | null): Promise<void> {
    const db = await getDB();
    const targetFolderId = folderId ?? null;
    const favorites = await db.getAllFromIndex('favorites', 'by-question', questionId);
    
    const toDelete = favorites.find(f => f.folderId === targetFolderId);
    if (toDelete) {
      await db.delete('favorites', toDelete.id);
    }
  },

  /**
   * 移动到其他收藏夹
   */
  async move(questionId: string, fromFolderId: string | null, toFolderId: string | null): Promise<FavoriteRecord> {
    const db = await getDB();
    const favorites = await db.getAllFromIndex('favorites', 'by-question', questionId);
    
    const existing = favorites.find(f => f.folderId === fromFolderId);
    if (!existing) {
      throw new Error('Favorite not found in source folder');
    }
    
    // 检查目标收藏夹是否已存在
    const inTarget = favorites.find(f => f.folderId === toFolderId);
    if (inTarget) {
      throw new Error('Already favorited in target folder');
    }
    
    const updated: FavoriteRecord = {
      ...existing,
      folderId: toFolderId,
    };
    
    await db.put('favorites', updated);
    return updated;
  },

  /**
   * 获取收藏数量
   */
  async count(folderId?: string | null): Promise<number> {
    const db = await getDB();
    
    if (folderId !== undefined) {
      const favorites = await this.getByFolderId(folderId);
      return favorites.length;
    }
    
    return db.count('favorites');
  },

  /**
   * 清空所有收藏
   */
  async clearAll(): Promise<void> {
    const db = await getDB();
    await db.clear('favorites');
  },

  /**
   * 批量导入收藏
   */
  async bulkImport(records: FavoriteRecord[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('favorites', 'readwrite');
    
    await Promise.all(records.map(record => tx.store.put(record)));
    await tx.done;
  },
};
