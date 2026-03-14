import { getDB } from '../index';
import { v4 as uuidv4 } from 'uuid';
import type { NoteRecord } from '../index';

/**
 * 笔记数据仓库
 */
export const noteRepo = {
  /**
   * 根据题目 ID 获取笔记
   */
  async getByQuestionId(questionId: string): Promise<NoteRecord | undefined> {
    const db = await getDB();
    return db.getFromIndex('notes', 'by-question', questionId);
  },

  /**
   * 获取所有笔记
   */
  async getAll(): Promise<NoteRecord[]> {
    const db = await getDB();
    return db.getAll('notes');
  },

  /**
   * 根据 ID 获取笔记
   */
  async getById(id: string): Promise<NoteRecord | undefined> {
    const db = await getDB();
    return db.get('notes', id);
  },

  /**
   * 创建笔记
   */
  async create(data: { questionId: string; content: string; tags?: string[] }): Promise<NoteRecord> {
    const db = await getDB();
    const now = new Date().toISOString();
    
    const note: NoteRecord = {
      id: uuidv4(),
      questionId: data.questionId,
      content: data.content,
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
    };
    
    await db.add('notes', note);
    return note;
  },

  /**
   * 更新笔记
   */
  async update(id: string, data: { content?: string; tags?: string[] }): Promise<NoteRecord> {
    const db = await getDB();
    const existing = await db.get('notes', id);
    
    if (!existing) {
      throw new Error(`Note with id ${id} not found`);
    }
    
    const updated: NoteRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    await db.put('notes', updated);
    return updated;
  },

  /**
   * 删除笔记
   */
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('notes', id);
  },

  /**
   * 根据题目 ID 删除笔记
   */
  async deleteByQuestionId(questionId: string): Promise<void> {
    const db = await getDB();
    const note = await db.getFromIndex('notes', 'by-question', questionId);
    if (note) {
      await db.delete('notes', note.id);
    }
  },

  /**
   * 搜索笔记
   */
  async search(keyword: string): Promise<NoteRecord[]> {
    const db = await getDB();
    const all = await db.getAll('notes');
    const lowerKeyword = keyword.toLowerCase();
    
    return all.filter(note =>
      note.content.toLowerCase().includes(lowerKeyword) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    );
  },

  /**
   * 根据标签获取笔记
   */
  async getByTag(tag: string): Promise<NoteRecord[]> {
    const db = await getDB();
    const all = await db.getAll('notes');
    return all.filter(note => note.tags.includes(tag));
  },

  /**
   * 批量创建笔记
   */
  async bulkCreate(notes: Array<{ questionId: string; content: string; tags?: string[] }>): Promise<NoteRecord[]> {
    const db = await getDB();
    const now = new Date().toISOString();
    const records: NoteRecord[] = notes.map(data => ({
      id: uuidv4(),
      questionId: data.questionId,
      content: data.content,
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
    }));
    
    const tx = db.transaction('notes', 'readwrite');
    await Promise.all(records.map(record => tx.store.add(record)));
    await tx.done;
    
    return records;
  },

  /**
   * 获取笔记数量
   */
  async count(): Promise<number> {
    const db = await getDB();
    return db.count('notes');
  },
};
