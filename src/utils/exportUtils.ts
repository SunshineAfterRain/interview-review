import { getDB } from '../db';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

/**
 * 导出数据格式
 */
export interface ExportData {
  version: number;
  exportedAt: string;
  appVersion: string;
  progress: unknown[];
  notes: unknown[];
  folders: unknown[];
  favorites: unknown[];
  interviews: unknown[];
  plans: unknown[];
  achievements: unknown[];
  reviews: unknown[];
  settings: unknown[];
}

/**
 * 导出所有数据为 JSON
 */
export async function exportAllData(): Promise<string> {
  const db = await getDB();
  
  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    progress: await db.getAll('progress'),
    notes: await db.getAll('notes'),
    folders: await db.getAll('folders'),
    favorites: await db.getAll('favorites'),
    interviews: await db.getAll('interviews'),
    plans: await db.getAll('plans'),
    achievements: await db.getAll('achievements'),
    reviews: await db.getAll('reviews'),
    settings: await db.getAll('settings'),
  };
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const filename = `interview-review-backup-${new Date().toISOString().split('T')[0]}.json`;
  
  saveAs(blob, filename);
  return filename;
}

/**
 * 导出笔记为 Markdown
 */
export async function exportNotesAsMarkdown(): Promise<string> {
  const db = await getDB();
  const notes = await db.getAll('notes');
  
  if (notes.length === 0) {
    throw new Error('没有可导出的笔记');
  }
  
  let markdown = '# 学习笔记导出\n\n';
  markdown += `导出时间：${new Date().toLocaleString()}\n\n`;
  markdown += `共 ${notes.length} 条笔记\n\n---\n\n`;
  
  for (const note of notes) {
    markdown += `## 题目 ID: ${note.questionId}\n\n`;
    markdown += `> 创建时间：${new Date(note.createdAt).toLocaleString()}\n`;
    markdown += `> 更新时间：${new Date(note.updatedAt).toLocaleString()}\n\n`;
    
    if (note.tags && note.tags.length > 0) {
      markdown += `**标签：** ${note.tags.map(t => `\`${t}\``).join(' ')}\n\n`;
    }
    
    markdown += note.content + '\n\n---\n\n';
  }
  
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const filename = `notes-${new Date().toISOString().split('T')[0]}.md`;
  
  saveAs(blob, filename);
  return filename;
}

/**
 * 导出学习进度报告
 */
export async function exportProgressReport(): Promise<string> {
  const db = await getDB();
  const progress = await db.getAll('progress');
  
  let markdown = '# 学习进度报告\n\n';
  markdown += `生成时间：${new Date().toLocaleString()}\n\n`;
  
  // 统计
  const total = progress.length;
  const mastered = progress.filter(p => (p as any).status === 'mastered').length;
  const learning = progress.filter(p => (p as any).status === 'learning').length;
  const notStarted = progress.filter(p => (p as any).status === 'not_started').length;
  const totalTime = progress.reduce((sum, p) => sum + ((p as any).timeSpent || 0), 0);
  
  markdown += '## 统计概览\n\n';
  markdown += `- 总学习题目：${total}\n`;
  markdown += `- 已掌握：${mastered}\n`;
  markdown += `- 学习中：${learning}\n`;
  markdown += `- 未开始：${notStarted}\n`;
  markdown += `- 总学习时间：${formatTime(totalTime)}\n\n`;
  
  // 详细进度
  markdown += '## 详细进度\n\n';
  markdown += '| 题目 ID | 状态 | 访问次数 | 学习时间 | 最后访问 |\n';
  markdown += '|---------|------|----------|----------|----------|\n';
  
  for (const p of progress) {
    const record = p as any;
    const statusMap: Record<string, string> = {
      mastered: '已掌握',
      learning: '学习中',
      not_started: '未开始',
    };
    
    markdown += `| ${record.questionId} | ${statusMap[record.status] || record.status} | ${record.visitCount || 0} | ${formatTime(record.timeSpent || 0)} | ${record.lastVisit ? new Date(record.lastVisit).toLocaleDateString() : '-'} |\n`;
  }
  
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const filename = `progress-report-${new Date().toISOString().split('T')[0]}.md`;
  
  saveAs(blob, filename);
  return filename;
}

/**
 * 导出面试记录
 */
export async function exportInterviewHistory(): Promise<string> {
  const db = await getDB();
  const interviews = await db.getAll('interviews');
  const completed = interviews.filter(i => (i as any).status === 'completed');
  
  if (completed.length === 0) {
    throw new Error('没有可导出的面试记录');
  }
  
  let markdown = '# 面试记录导出\n\n';
  markdown += `导出时间：${new Date().toLocaleString()}\n\n`;
  markdown += `共 ${completed.length} 次面试记录\n\n---\n\n`;
  
  for (let i = 0; i < completed.length; i++) {
    const interview = completed[i] as any;
    markdown += `## 面试 #${i + 1}\n\n`;
    markdown += `- 开始时间：${new Date(interview.startTime).toLocaleString()}\n`;
    markdown += `- 结束时间：${interview.endTime ? new Date(interview.endTime).toLocaleString() : '-'}\n`;
    markdown += `- 题目数量：${interview.questionIds?.length || 0}\n`;
    markdown += `- 回答数量：${interview.answers?.length || 0}\n\n`;
    
    if (interview.config) {
      markdown += '### 配置\n\n';
      markdown += `- 题目数量：${interview.config.questionCount}\n`;
      markdown += `- 难度：${interview.config.difficulty}\n`;
      markdown += `- 时间限制：${interview.config.timeLimit} 分钟\n\n`;
    }
    
    if (interview.answers && interview.answers.length > 0) {
      markdown += '### 答题详情\n\n';
      for (let j = 0; j < interview.answers.length; j++) {
        const answer = interview.answers[j];
        markdown += `#### 第 ${j + 1} 题 (${answer.questionId})\n\n`;
        markdown += `> 用时：${answer.timeSpent || 0} 秒\n\n`;
        markdown += '```\n' + (answer.answer || '(未作答)') + '\n```\n\n';
      }
    }
    
    markdown += '---\n\n';
  }
  
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const filename = `interview-history-${new Date().toISOString().split('T')[0]}.md`;
  
  saveAs(blob, filename);
  return filename;
}

/**
 * 导出所有数据为 ZIP 压缩包
 */
export async function exportAllAsZip(): Promise<string> {
  const db = await getDB();
  const zip = new JSZip();
  
  // 添加 JSON 数据
  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    progress: await db.getAll('progress'),
    notes: await db.getAll('notes'),
    folders: await db.getAll('folders'),
    favorites: await db.getAll('favorites'),
    interviews: await db.getAll('interviews'),
    plans: await db.getAll('plans'),
    achievements: await db.getAll('achievements'),
    reviews: await db.getAll('reviews'),
    settings: await db.getAll('settings'),
  };
  
  zip.file('data.json', JSON.stringify(data, null, 2));
  
  // 添加笔记 Markdown
  const notes = await db.getAll('notes');
  if (notes.length > 0) {
    const notesFolder = zip.folder('notes');
    for (const note of notes) {
      const content = `# ${note.questionId}\n\n${note.content}`;
      notesFolder?.file(`${note.questionId}.md`, content);
    }
  }
  
  // 生成 ZIP 文件
  const blob = await zip.generateAsync({ type: 'blob' });
  const filename = `interview-review-full-backup-${new Date().toISOString().split('T')[0]}.zip`;
  
  saveAs(blob, filename);
  return filename;
}

/**
 * 导出特定类型的数据
 */
export async function exportByType(type: keyof Omit<ExportData, 'version' | 'exportedAt' | 'appVersion'>): Promise<string> {
  const db = await getDB();
  const data = await db.getAll(type as any);
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const filename = `${type}-${new Date().toISOString().split('T')[0]}.json`;
  
  saveAs(blob, filename);
  return filename;
}

/**
 * 格式化时间
 */
function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  
  return `${minutes}分钟${secs}秒`;
}
