export type Category = 'javascript' | 'react' | 'css' | 'performance' | 'engineering' | 'coding' | 'typescript' | 'algorithm' | 'system-design' | 'toolchain';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'theory' | 'coding';

export interface CodeExample {
  language: string;
  code: string;
  description?: string;
  interactiveDemo?: string; // 交互式演示的key
}

// 编程题测试用例
export interface TestCase {
  input: any;
  expectedOutput: any;
  description?: string;
}

// 编程题配置
export interface CodingConfig {
  language: string;
  starterCode: string;
  testCases: TestCase[];
  timeLimit?: number; // 毫秒
  memoryLimit?: number; // MB
}

// 评分维度
export interface ScoreDimension {
  name: string;
  maxScore: number;
  weight: number;
  description: string;
}

// 评分结果
export interface ScoreResult {
  totalScore: number;
  maxScore: number;
  dimensions: {
    name: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  passedTests: number;
  totalTests: number;
  suggestions: string[];
}

// 用户答案
export interface UserAnswer {
  questionId: string;
  answer: string;
  code?: string;
  submittedAt: string;
  score?: ScoreResult;
}

export interface Question {
  id: string;
  category: Category;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  question: string;
  questionType: QuestionType;
  answer: string;
  codeExamples?: CodeExample[];
  references?: string[];
  createdAt: string;
  // 编程题特有字段
  codingConfig?: CodingConfig;
  // 评分维度配置
  scoreDimensions?: ScoreDimension[];
}

export interface CategoryInfo {
  key: Category;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'javascript', label: 'JavaScript', icon: '🟨', color: '#f7df1e' },
  { key: 'react', label: 'React', icon: '⚛️', color: '#61dafb' },
  { key: 'css', label: 'CSS', icon: '🎨', color: '#264de4' },
  { key: 'typescript', label: 'TypeScript', icon: '📘', color: '#3178c6' },
  { key: 'algorithm', label: '算法', icon: '🧮', color: '#e91e63' },
  { key: 'system-design', label: '系统设计', icon: '🏗️', color: '#9c27b0' },
  { key: 'toolchain', label: '工具链', icon: '⚙️', color: '#607d8b' },
  { key: 'performance', label: '性能优化', icon: '⚡', color: '#ff6b6b' },
  { key: 'engineering', label: '工程化', icon: '🔧', color: '#4ecdc4' },
  { key: 'coding', label: '编程题', icon: '💻', color: '#00ff88' },
];

export const DIFFICULTY_LABELS: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: '简单', color: '#52c41a' },
  medium: { label: '中等', color: '#faad14' },
  hard: { label: '困难', color: '#f5222d' },
};
