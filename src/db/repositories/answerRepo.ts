import { getDB } from '../index';
import type { AnswerRecord } from '../index';

/**
 * 答案数据仓库
 */
export const answerRepo = {
  /**
   * 保存答案（创建或更新）
   */
  async saveAnswer(questionId: string, answer: string): Promise<AnswerRecord> {
    const db = await getDB();
    const now = new Date().toISOString();
    
    // 检查是否已存在
    const existing = await db.get('answers', questionId);
    
    if (existing) {
      // 更新
      const updated: AnswerRecord = {
        ...existing,
        answer,
        updatedAt: now,
      };
      await db.put('answers', updated);
      return updated;
    } else {
      // 创建
      const newRecord: AnswerRecord = {
        questionId,
        answer,
        createdAt: now,
        updatedAt: now,
      };
      await db.add('answers', newRecord);
      return newRecord;
    }
  },

  /**
   * 获取答案
   */
  async getAnswer(questionId: string): Promise<AnswerRecord | undefined> {
    const db = await getDB();
    return db.get('answers', questionId);
  },

  /**
   * 删除答案
   */
  async deleteAnswer(questionId: string): Promise<void> {
    const db = await getDB();
    await db.delete('answers', questionId);
  },

  /**
   * 获取所有答案
   */
  async getAllAnswers(): Promise<AnswerRecord[]> {
    const db = await getDB();
    return db.getAll('answers');
  },

  /**
   * 批量保存答案
   */
  async bulkSaveAnswers(answers: Array<{ questionId: string; answer: string }>): Promise<AnswerRecord[]> {
    const db = await getDB();
    const now = new Date().toISOString();
    const records: AnswerRecord[] = [];

    const tx = db.transaction('answers', 'readwrite');
    
    for (const item of answers) {
      const existing = await tx.store.get(item.questionId);
      
      if (existing) {
        const updated: AnswerRecord = {
          ...existing,
          answer: item.answer,
          updatedAt: now,
        };
        await tx.store.put(updated);
        records.push(updated);
      } else {
        const newRecord: AnswerRecord = {
          questionId: item.questionId,
          answer: item.answer,
          createdAt: now,
          updatedAt: now,
        };
        await tx.store.add(newRecord);
        records.push(newRecord);
      }
    }
    
    await tx.done;
    return records;
  },

  /**
   * 获取答案数量
   */
  async count(): Promise<number> {
    const db = await getDB();
    return db.count('answers');
  },

  /**
   * 检查答案是否存在
   */
  async exists(questionId: string): Promise<boolean> {
    const db = await getDB();
    const answer = await db.get('answers', questionId);
    return !!answer;
  },
};
