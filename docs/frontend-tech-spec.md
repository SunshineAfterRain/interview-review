# 前端技术方案文档 - 面试复盘系统优化

**版本**: v1.0.0  
**创建日期**: 2026-03-14  
**文档状态**: 技术方案设计

---

## 一、项目概述

### 1.1 项目背景

面试复盘系统是一个面向前端开发人员的面试准备工具，当前已上线基础功能包括题目浏览、学习进度、收藏夹、错题本、代码编辑器等。本次优化旨在提升系统的安全性、功能完整性和用户体验。

### 1.2 当前技术栈

| 技术项 | 版本 | 用途 |
|--------|------|------|
| React | 18.2.0 | 前端框架 |
| TypeScript | 5.2.2 | 类型系统 |
| Vite | 5.0.8 | 构建工具 |
| Zustand | 5.0.11 | 状态管理 |
| React Router DOM | 7.13.1 | 路由管理 |
| Monaco Editor | 4.6.0 | 代码编辑器 |
| highlight.js | 11.9.0 | 代码高亮 |

### 1.3 当前项目结构

```
interview-review/
├── src/
│   ├── components/          # 组件目录
│   │   ├── demos/          # 交互式演示组件
│   │   ├── layout/         # 布局组件
│   │   ├── AnswerPanel.tsx
│   │   ├── CategoryNav.tsx
│   │   ├── CodeRunner.tsx
│   │   ├── InteractiveDemo.tsx
│   │   ├── KeyboardHelp.tsx
│   │   ├── QuestionCard.tsx
│   │   └── ScorePanel.tsx
│   ├── data/               # 题目数据
│   │   └── questions/
│   ├── hooks/              # 自定义 Hooks
│   ├── pages/              # 页面组件
│   ├── stores/             # 状态管理
│   ├── styles/             # 样式文件
│   ├── types/              # 类型定义
│   ├── App.tsx
│   └── main.tsx
├── docs/                   # 文档目录
└── package.json
```

---

## 二、技术选型说明

### 2.1 框架与核心库（保持现有）

| 技术 | 选型 | 理由 |
|------|------|------|
| 前端框架 | React 18 | 现有技术栈，生态成熟，团队熟悉 |
| 构建工具 | Vite 5 | 快速的开发体验，优秀的构建性能 |
| 状态管理 | Zustand 5 | 轻量级，API 简洁，支持持久化 |
| 路由 | React Router 7 | 成熟稳定，支持懒加载 |
| 类型系统 | TypeScript 5 | 类型安全，提升代码质量 |

### 2.2 新增技术选型

| 技术 | 选型 | 用途 | 理由 |
|------|------|------|------|
| 数据存储 | IndexedDB (idb) | 本地数据持久化 | 容量大(数百MB)、支持复杂查询、异步操作 |
| 日期处理 | date-fns | 复习提醒、学习计划 | 轻量级，模块化，Tree-shaking 友好 |
| Markdown 渲染 | react-markdown + remark-gfm | 笔记系统 | 支持 GitHub 风格 Markdown，插件丰富 |
| Web Worker | 原生 API | 代码安全执行 | 无需额外依赖，浏览器原生支持 |
| 图表库 | recharts | 学习报告、统计图表 | React 友好，声明式 API |
| 动画库 | framer-motion | 成就动画、交互反馈 | 流畅的动画效果，API 简洁 |
| UUID | uuid | 唯一标识符生成 | 生成收藏夹、笔记等唯一 ID |
| 文件处理 | file-saver + jszip | 数据导出/导入 | 支持导出 JSON/Markdown 格式 |

### 2.3 UI 组件策略

**保持现有样式体系**，不引入第三方 UI 组件库，理由：
1. 现有样式已形成统一的设计语言
2. 避免引入过大的依赖包
3. 保持轻量级，提升加载性能
4. 自定义样式更灵活，符合产品调性

---

## 三、目录结构设计

### 3.1 扩展后的目录结构

```
interview-review/
├── src/
│   ├── components/              # 组件目录
│   │   ├── common/             # 通用组件（新增）
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   ├── demos/              # 交互式演示组件
│   │   ├── interview/          # 模拟面试组件（新增）
│   │   │   ├── InterviewMode.tsx
│   │   │   ├── InterviewTimer.tsx
│   │   │   ├── InterviewQuestion.tsx
│   │   │   └── InterviewReport.tsx
│   │   ├── layout/             # 布局组件
│   │   ├── notes/              # 笔记系统组件（新增）
│   │   │   ├── NoteEditor.tsx
│   │   │   ├── NoteList.tsx
│   │   │   └── NotePreview.tsx
│   │   ├── plan/               # 学习计划组件（新增）
│   │   │   ├── DailyGoal.tsx
│   │   │   ├── PlanProgress.tsx
│   │   │   └── Achievement.tsx
│   │   ├── review/             # 复习提醒组件（新增）
│   │   │   ├── ReviewQueue.tsx
│   │   │   └── ReviewReminder.tsx
│   │   ├── AnswerPanel.tsx
│   │   ├── CategoryNav.tsx
│   │   ├── CodeRunner.tsx
│   │   ├── FavoriteManager.tsx # 收藏夹管理（新增）
│   │   ├── InteractiveDemo.tsx
│   │   ├── KeyboardHelp.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── ScorePanel.tsx
│   │   ├── SearchEnhanced.tsx  # 增强搜索（新增）
│   │   └── StudyTimer.tsx      # 学习计时器（新增）
│   ├── data/                   # 题目数据
│   │   └── questions/
│   │       ├── coding.ts
│   │       ├── css.ts
│   │       ├── engineering.ts
│   │       ├── javascript.ts
│   │       ├── performance.ts
│   │       ├── react.ts
│   │       ├── resume-based.ts
│   │       ├── typescript.ts   # 新增
│   │       ├── algorithm.ts    # 新增
│   │       ├── system-design.ts # 新增
│   │       └── toolchain.ts    # 新增
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useTimer.ts         # 新增
│   │   ├── useReviewAlgorithm.ts # 新增
│   │   └── useSearch.ts        # 新增
│   ├── pages/                  # 页面组件
│   │   ├── Favorites.tsx
│   │   ├── Home.tsx
│   │   ├── Interview.tsx       # 新增：模拟面试页
│   │   ├── Plan.tsx            # 新增：学习计划页
│   │   ├── Progress.tsx
│   │   ├── QuestionDetail.tsx
│   │   ├── Review.tsx          # 新增：复习提醒页
│   │   └── WrongQuestions.tsx
│   ├── stores/                 # 状态管理
│   │   ├── useUserStore.ts
│   │   ├── useInterviewStore.ts # 新增
│   │   ├── usePlanStore.ts     # 新增
│   │   ├── useNoteStore.ts     # 新增
│   │   ├── useFavoriteStore.ts # 新增
│   │   └── useReviewStore.ts   # 新增
│   ├── styles/                 # 样式文件
│   │   ├── themes.css
│   │   ├── interview.css       # 新增
│   │   ├── notes.css           # 新增
│   │   └── plan.css            # 新增
│   ├── types/                  # 类型定义
│   │   ├── question.ts
│   │   ├── interview.ts        # 新增
│   │   ├── plan.ts             # 新增
│   │   ├── note.ts             # 新增
│   │   └── review.ts           # 新增
│   ├── utils/                  # 工具函数（新增目录）
│   │   ├── codeExecutor.ts     # 代码安全执行
│   │   ├── reviewAlgorithm.ts  # 复习算法
│   │   ├── searchUtils.ts      # 搜索工具
│   │   ├── storageUtils.ts     # 存储工具
│   │   ├── exportUtils.ts      # 数据导出工具（新增）
│   │   └── importUtils.ts      # 数据导入工具（新增）
│   ├── db/                    # IndexedDB 数据库（新增目录）
│   │   ├── index.ts            # 数据库初始化
│   │   ├── migrations.ts      # 数据迁移
│   │   └── repositories/      # 数据仓库
│   │       ├── questionRepo.ts
│   │       ├── noteRepo.ts
│   │       ├── planRepo.ts
│   │       └── interviewRepo.ts
│   ├── workers/                # Web Workers（新增目录）
│   │   └── codeExecutor.worker.ts
│   ├── App.tsx
│   └── main.tsx
├── docs/
└── package.json
```

---

## 四、各功能模块详细实现方案

### Phase 1: 安全与稳定性

#### 4.1.1 P0-001 代码执行安全优化

**问题分析**：
当前 [CodeRunner.tsx](file:///e:/Code/AiCode/interview-review/src/components/CodeRunner.tsx#L25-L54) 使用 `new Function()` 执行用户代码，存在以下安全风险：
- 可访问全局对象和 DOM
- 可能执行恶意代码
- 无执行时间限制（可能导致死循环）

**解决方案**：使用 Web Worker 沙箱隔离执行

**实现方案**：

```typescript
// src/workers/codeExecutor.worker.ts
interface ExecutionRequest {
  code: string;
  input: any;
  timeLimit: number;
}

interface ExecutionResult {
  result: any;
  error: string | null;
  time: number;
  timedOut: boolean;
}

self.onmessage = (e: MessageEvent<ExecutionRequest>) => {
  const { code, input, timeLimit = 5000 } = e.data;
  const startTime = performance.now();
  
  // 设置超时定时器
  const timeoutId = setTimeout(() => {
    self.postMessage({
      result: null,
      error: 'Execution timed out',
      time: timeLimit,
      timedOut: true,
    } as ExecutionResult);
    self.close();
  }, timeLimit);
  
  try {
    // 在 Worker 中执行代码，隔离全局环境
    const executeFunc = new Function('input', `
      try {
        ${code}
        if (typeof solution === 'function') {
          return solution(input);
        }
        return null;
      } catch (e) {
        return { __error__: e.message };
      }
    `);
    
    const result = executeFunc(input);
    const endTime = performance.now();
    
    clearTimeout(timeoutId);
    
    if (result && result.__error__) {
      self.postMessage({
        result: null,
        error: result.__error__,
        time: endTime - startTime,
        timedOut: false,
      } as ExecutionResult);
    } else {
      self.postMessage({
        result,
        error: null,
        time: endTime - startTime,
        timedOut: false,
      } as ExecutionResult);
    }
  } catch (e: any) {
    const endTime = performance.now();
    clearTimeout(timeoutId);
    self.postMessage({
      result: null,
      error: e.message,
      time: endTime - startTime,
      timedOut: false,
    } as ExecutionResult);
  }
};
```

```typescript
// src/utils/codeExecutor.ts
export class SafeCodeExecutor {
  private worker: Worker | null = null;
  
  async execute(
    code: string,
    input: any,
    timeLimit: number = 5000
  ): Promise<{ result: any; error: string | null; time: number; timedOut: boolean }> {
    return new Promise((resolve) => {
      // 创建 Worker
      const workerCode = `
        self.onmessage = (e) => {
          const { code, input, timeLimit } = e.data;
          const startTime = performance.now();
          
          const timeoutId = setTimeout(() => {
            self.postMessage({
              result: null,
              error: 'Execution timed out',
              time: timeLimit,
              timedOut: true,
            });
            self.close();
          }, timeLimit);
          
          try {
            const executeFunc = new Function('input', code);
            const result = executeFunc(input);
            const endTime = performance.now();
            clearTimeout(timeoutId);
            self.postMessage({
              result,
              error: null,
              time: endTime - startTime,
              timedOut: false,
            });
          } catch (e) {
            clearTimeout(timeoutId);
            self.postMessage({
              result: null,
              error: e.message,
              time: 0,
              timedOut: false,
            });
          }
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
      
      this.worker.onmessage = (e) => {
        resolve(e.data);
        this.worker?.terminate();
        this.worker = null;
      };
      
      this.worker.onerror = (e) => {
        resolve({
          result: null,
          error: e.message,
          time: 0,
          timedOut: false,
        });
        this.worker?.terminate();
        this.worker = null;
      };
      
      this.worker.postMessage({ code, input, timeLimit });
    });
  }
  
  terminate() {
    this.worker?.terminate();
    this.worker = null;
  }
}
```

**修改点**：
1. 修改 `CodeRunner.tsx`，使用 `SafeCodeExecutor` 替代 `safeExecute` 函数
2. 添加执行时间限制配置（默认 5 秒）
3. 添加内存限制监控（可选）

**验收标准**：
- [ ] 用户代码在隔离环境中执行
- [ ] 无法访问 DOM 和全局对象
- [ ] 执行超时自动终止
- [ ] 不影响现有功能

---

#### 4.1.2 P0-002 错误边界处理

**问题分析**：
当前应用缺少错误边界，组件错误可能导致整个应用白屏。

**解决方案**：添加 React Error Boundary

**实现方案**：

```typescript
// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // 可选：上报错误到监控系统
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2>出错了</h2>
            <p>抱歉，页面遇到了一些问题</p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>错误详情</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
            <div className="error-actions">
              <button onClick={this.handleReset} className="retry-btn">
                重试
              </button>
              <button onClick={() => window.location.href = '/'} className="home-btn">
                返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**应用策略**：

```typescript
// src/App.tsx 修改
import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

// 页面级错误边界
const Home = lazy(() => import('./pages/Home').then(m => ({ 
  default: m.Home 
})).catch(() => ({ 
  default: () => <ErrorFallback message="页面加载失败" /> 
})));
```

**验收标准**：
- [ ] 组件错误不会导致白屏
- [ ] 显示友好的错误提示
- [ ] 支持重试和返回首页
- [ ] 开发环境显示错误详情

---

#### 4.1.3 P0-003 代码重复清理

**问题分析**：
`InteractiveDemos.tsx` 与 `demos/` 目录下的 Demo 组件存在重复代码。

**解决方案**：统一导出路径，删除重复代码

**实现方案**：

```typescript
// src/components/demos/index.ts（已存在，需检查）
export { DebounceDemo } from './DebounceDemo';
export { DeepCloneDemo } from './DeepCloneDemo';
export { LogSearchDemo } from './LogSearchDemo';
export { VirtualScrollDemo } from './VirtualScrollDemo';

// 删除 InteractiveDemos.tsx 中的重复实现
// 统一从 demos/index.ts 导入使用
```

**验收标准**：
- [ ] 无重复代码
- [ ] 导出路径统一
- [ ] 功能正常

---

### Phase 2: 内容扩展

#### 4.2.1 P1-001 TypeScript 题目扩展

**新增文件**：`src/data/questions/typescript.ts`

**题目规划**（10+ 道）：

| 题目 | 难度 | 类型 | 核心知识点 |
|------|------|------|-----------|
| TypeScript 类型推断 | easy | theory | 类型推断、类型断言 |
| interface vs type | easy | theory | 接口与类型别名区别 |
| 泛型基础 | medium | theory | 泛型函数、泛型约束 |
| 条件类型 | medium | theory | Conditional Types |
| 映射类型 | medium | theory | Mapped Types |
| 类型体操：DeepReadonly | hard | coding | 递归类型 |
| 类型体操：DeepPartial | hard | coding | 递归类型 |
| 类型体操：UnionToIntersection | hard | coding | 条件类型、逆变 |
| 装饰器实现 | medium | coding | 装饰器模式 |
| 类型守卫与类型窄化 | medium | theory | Type Guards |

**数据结构**：

```typescript
// src/data/questions/typescript.ts
import { Question } from '../../types/question';

export const typescriptQuestions: Question[] = [
  {
    id: 'ts-001',
    category: 'typescript',
    title: 'TypeScript 类型推断原理',
    difficulty: 'easy',
    tags: ['TypeScript', '类型系统', '类型推断'],
    question: '请解释 TypeScript 的类型推断机制，并说明以下代码中变量的类型是如何推断的...',
    questionType: 'theory',
    answer: 'TypeScript 的类型推断主要基于...',
    codeExamples: [
      {
        language: 'typescript',
        code: 'let x = 10; // 推断为 number',
      }
    ],
    createdAt: '2026-03-14',
  },
  // ... 更多题目
];
```

**类型扩展**：

```typescript
// src/types/question.ts 修改
export type Category = 'javascript' | 'react' | 'css' | 'performance' | 'engineering' | 'coding' | 'typescript' | 'algorithm' | 'system-design' | 'toolchain';

export const CATEGORIES: CategoryInfo[] = [
  // ... 现有分类
  { key: 'typescript', label: 'TypeScript', icon: '📘', color: '#3178c6' },
  { key: 'algorithm', label: '算法', icon: '🧮', color: '#e91e63' },
  { key: 'system-design', label: '系统设计', icon: '🏗️', color: '#9c27b0' },
  { key: 'toolchain', label: '工具链', icon: '⚙️', color: '#607d8b' },
];
```

---

#### 4.2.2 P1-002 算法题目扩展

**新增文件**：`src/data/questions/algorithm.ts`

**题目规划**（15+ 道）：

| 题目 | 难度 | 类型 | 核心知识点 |
|------|------|------|-----------|
| 两数之和 | easy | coding | 哈希表 |
| 反转链表 | easy | coding | 链表操作 |
| 有效的括号 | easy | coding | 栈 |
| 最大子数组和 | medium | coding | 动态规划 |
| 合并区间 | medium | coding | 排序、区间 |
| 二叉树层序遍历 | medium | coding | BFS |
| LRU 缓存 | medium | coding | 哈希表 + 双向链表 |
| 最长递增子序列 | medium | coding | 动态规划 |
| 接雨水 | hard | coding | 双指针、栈 |
| 最小覆盖子串 | hard | coding | 滑动窗口 |
| 编辑距离 | hard | coding | 动态规划 |
| 全排列 | medium | coding | 回溯 |
| 快速排序实现 | medium | coding | 排序算法 |
| 二分查找变体 | medium | coding | 二分查找 |
| 字符串解码 | medium | coding | 栈 |

---

#### 4.2.3 P2-006 系统设计题目

**新增文件**：`src/data/questions/system-design.ts`

**题目规划**（5+ 道）：

| 题目 | 难度 | 核心知识点 |
|------|------|-----------|
| 设计一个短链接系统 | medium | 哈希、分布式、缓存 |
| 设计一个实时聊天系统 | hard | WebSocket、消息队列 |
| 设计一个前端监控系统 | hard | 性能采集、错误上报 |
| 设计一个大文件上传系统 | medium | 分片上传、断点续传 |
| 设计一个前端组件库 | medium | 组件设计、主题系统 |

---

#### 4.2.4 P2-007 工具链题目

**新增文件**：`src/data/questions/toolchain.ts`

**题目规划**：

| 题目 | 难度 | 核心知识点 |
|------|------|-----------|
| Webpack 打包原理 | medium | 模块化、打包流程 |
| Webpack Loader vs Plugin | easy | 扩展机制 |
| Vite 为什么快 | medium | ESM、esbuild |
| Babel 转译流程 | medium | AST、编译原理 |
| npm vs yarn vs pnpm | easy | 包管理器 |
| Monorepo 实践 | medium | 工程化 |
| Git Hooks 与 Husky | easy | 工作流 |

---

### Phase 3: 核心功能

#### 4.3.1 P1-003 模拟面试模式

**功能设计**：

**用户流程**：
```
选择模式 → 设置参数 → 开始答题 → 提交答案 → 查看报告
```

**页面设计**：

```typescript
// src/pages/Interview.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { allQuestions } from '../data';
import { useInterviewStore } from '../stores/useInterviewStore';
import { InterviewMode } from '../components/interview/InterviewMode';
import { InterviewTimer } from '../components/interview/InterviewTimer';
import { InterviewQuestion } from '../components/interview/InterviewQuestion';
import { InterviewReport } from '../components/interview/InterviewReport';

type InterviewPhase = 'setup' | 'interview' | 'report';

export const Interview: React.FC = () => {
  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const navigate = useNavigate();
  const {
    questions,
    currentIndex,
    answers,
    startTime,
    setupInterview,
    submitAnswer,
    nextQuestion,
    finishInterview,
  } = useInterviewStore();

  // 设置面试参数
  const handleSetup = (config: InterviewConfig) => {
    const selectedQuestions = selectQuestions(config);
    setupInterview(selectedQuestions, config);
    setPhase('interview');
  };

  // 提交答案
  const handleSubmit = (answer: string) => {
    submitAnswer(currentIndex, answer);
    if (currentIndex < questions.length - 1) {
      nextQuestion();
    } else {
      finishInterview();
      setPhase('report');
    }
  };

  // 超时处理
  const handleTimeout = () => {
    finishInterview();
    setPhase('report');
  };

  return (
    <div className="interview-page">
      {phase === 'setup' && (
        <InterviewMode onStart={handleSetup} />
      )}
      {phase === 'interview' && (
        <>
          <InterviewTimer 
            duration={questions.length * 5 * 60} // 每题 5 分钟
            onTimeout={handleTimeout}
          />
          <InterviewQuestion
            question={questions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            onSubmit={handleSubmit}
            onSkip={() => nextQuestion()}
          />
        </>
      )}
      {phase === 'report' && (
        <InterviewReport
          questions={questions}
          answers={answers}
          startTime={startTime}
          endTime={new Date().toISOString()}
          onRetry={() => setPhase('setup')}
          onBackHome={() => navigate('/')}
        />
      )}
    </div>
  );
};
```

**状态管理**：

```typescript
// src/stores/useInterviewStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question } from '../types/question';

interface InterviewConfig {
  questionCount: 5 | 10 | 15 | 20;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  categories: string[];
  timeLimit: number; // 分钟
}

interface InterviewAnswer {
  questionId: string;
  answer: string;
  submittedAt: string;
  timeSpent: number;
}

interface InterviewSession {
  id: string;
  config: InterviewConfig;
  questions: Question[];
  answers: InterviewAnswer[];
  startTime: string;
  endTime?: string;
}

interface InterviewState {
  currentSession: InterviewSession | null;
  history: InterviewSession[];
  currentIndex: number;
  
  setupInterview: (questions: Question[], config: InterviewConfig) => void;
  submitAnswer: (index: number, answer: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  finishInterview: () => void;
  getReport: () => InterviewReport;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      history: [],
      currentIndex: 0,
      
      setupInterview: (questions, config) => {
        set({
          currentSession: {
            id: crypto.randomUUID(),
            config,
            questions,
            answers: [],
            startTime: new Date().toISOString(),
          },
          currentIndex: 0,
        });
      },
      
      submitAnswer: (index, answer) => {
        set((state) => {
          if (!state.currentSession) return state;
          
          const answers = [...state.currentSession.answers];
          answers[index] = {
            questionId: state.currentSession.questions[index].id,
            answer,
            submittedAt: new Date().toISOString(),
            timeSpent: 0, // 计算实际用时
          };
          
          return {
            currentSession: {
              ...state.currentSession,
              answers,
            },
          };
        });
      },
      
      nextQuestion: () => {
        set((state) => ({
          currentIndex: Math.min(
            state.currentIndex + 1,
            state.currentSession?.questions.length || 0
          ),
        }));
      },
      
      previousQuestion: () => {
        set((state) => ({
          currentIndex: Math.max(state.currentIndex - 1, 0),
        }));
      },
      
      finishInterview: () => {
        set((state) => {
          if (!state.currentSession) return state;
          
          const finishedSession = {
            ...state.currentSession,
            endTime: new Date().toISOString(),
          };
          
          return {
            currentSession: null,
            currentIndex: 0,
            history: [finishedSession, ...state.history],
          };
        });
      },
      
      getReport: () => {
        const session = get().currentSession;
        if (!session) throw new Error('No active session');
        
        // 生成报告逻辑
        return generateReport(session);
      },
    }),
    {
      name: 'interview-session-storage',
    }
  )
);
```

**组件设计**：

```typescript
// src/components/interview/InterviewMode.tsx
interface InterviewConfig {
  questionCount: 5 | 10 | 15 | 20;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  categories: string[];
  timeLimit: number;
}

export const InterviewMode: React.FC<{ onStart: (config: InterviewConfig) => void }> = ({ onStart }) => {
  const [config, setConfig] = useState<InterviewConfig>({
    questionCount: 10,
    difficulty: 'mixed',
    categories: [],
    timeLimit: 50, // 10题 * 5分钟
  });

  return (
    <div className="interview-setup">
      <h2>模拟面试设置</h2>
      
      <div className="setup-option">
        <label>题目数量</label>
        <div className="option-buttons">
          {[5, 10, 15, 20].map(count => (
            <button
              key={count}
              className={config.questionCount === count ? 'active' : ''}
              onClick={() => setConfig({ ...config, questionCount: count as any })}
            >
              {count} 题
            </button>
          ))}
        </div>
      </div>

      <div className="setup-option">
        <label>难度选择</label>
        <select 
          value={config.difficulty}
          onChange={(e) => setConfig({ ...config, difficulty: e.target.value as any })}
        >
          <option value="mixed">混合难度</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>

      <div className="setup-option">
        <label>题目分类（可多选）</label>
        <div className="category-checkboxes">
          {CATEGORIES.map(cat => (
            <label key={cat.key}>
              <input
                type="checkbox"
                checked={config.categories.includes(cat.key)}
                onChange={(e) => {
                  const categories = e.target.checked
                    ? [...config.categories, cat.key]
                    : config.categories.filter(c => c !== cat.key);
                  setConfig({ ...config, categories });
                }}
              />
              {cat.icon} {cat.label}
            </label>
          ))}
        </div>
      </div>

      <button className="start-btn" onClick={() => onStart(config)}>
        开始面试
      </button>
    </div>
  );
};
```

```typescript
// src/components/interview/InterviewTimer.tsx
export const InterviewTimer: React.FC<{
  duration: number;
  onTimeout: () => void;
}> = ({ duration, onTimeout }) => {
  const [remaining, setRemaining] = useState(duration);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onTimeout]);
  
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = ((duration - remaining) / duration) * 100;
  
  return (
    <div className="interview-timer">
      <div className="timer-bar" style={{ width: `${100 - progress}%` }} />
      <span className={`timer-text ${remaining < 60 ? 'warning' : ''}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
```

```typescript
// src/components/interview/InterviewReport.tsx
export const InterviewReport: React.FC<{
  questions: Question[];
  answers: InterviewAnswer[];
  startTime: string;
  endTime: string;
  onRetry: () => void;
  onBackHome: () => void;
}> = ({ questions, answers, startTime, endTime, onRetry, onBackHome }) => {
  const report = useMemo(() => {
    const totalQuestions = questions.length;
    const answeredQuestions = answers.filter(a => a.answer.trim()).length;
    const totalTime = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000 / 60;
    
    // 按分类统计
    const categoryStats = questions.reduce((acc, q, i) => {
      if (!acc[q.category]) {
        acc[q.category] = { total: 0, answered: 0 };
      }
      acc[q.category].total++;
      if (answers[i]?.answer.trim()) {
        acc[q.category].answered++;
      }
      return acc;
    }, {} as Record<string, { total: number; answered: number }>);
    
    return {
      totalQuestions,
      answeredQuestions,
      accuracy: (answeredQuestions / totalQuestions) * 100,
      totalTime,
      categoryStats,
    };
  }, [questions, answers, startTime, endTime]);
  
  return (
    <div className="interview-report">
      <h2>面试报告</h2>
      
      <div className="report-summary">
        <div className="summary-card">
          <div className="summary-value">{report.answeredQuestions}/{report.totalQuestions}</div>
          <div className="summary-label">完成题目</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{report.totalTime.toFixed(1)}分钟</div>
          <div className="summary-label">总用时</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{report.accuracy.toFixed(1)}%</div>
          <div className="summary-label">完成率</div>
        </div>
      </div>
      
      <div className="report-details">
        <h3>答题详情</h3>
        {questions.map((q, i) => (
          <div key={q.id} className="answer-item">
            <div className="answer-header">
              <span className="question-number">第 {i + 1} 题</span>
              <span className="question-title">{q.title}</span>
              <span className={`answer-status ${answers[i]?.answer.trim() ? 'answered' : 'skipped'}`}>
                {answers[i]?.answer.trim() ? '已答' : '跳过'}
              </span>
            </div>
            {answers[i]?.answer.trim() && (
              <div className="answer-content">
                <pre>{answers[i].answer}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="report-actions">
        <button onClick={onRetry}>再来一次</button>
        <button onClick={onBackHome}>返回首页</button>
      </div>
    </div>
  );
};
```

**路由配置**：

```typescript
// src/App.tsx 添加路由
<Route path="/interview" element={<Interview />} />
```

**验收标准**：
- [ ] 支持随机抽取 5/10/15/20 道题目
- [ ] 支持设置答题时间限制
- [ ] 答题过程显示倒计时
- [ ] 生成包含正确率、用时、建议的报告
- [ ] 报告可保存到学习记录

---

#### 4.3.2 P1-005 学习计划制定

**功能设计**：

**状态管理**：

```typescript
// src/stores/usePlanStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DailyGoal {
  targetCount: number;       // 每日目标题数
  completedCount: number;    // 已完成题数
  date: string;              // 日期
}

interface WeeklyPlan {
  id: string;
  weekStart: string;
  weekEnd: string;
  targets: {
    category: string;
    count: number;
  }[];
  progress: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

interface PlanState {
  dailyGoal: DailyGoal;
  weeklyPlans: WeeklyPlan[];
  achievements: Achievement[];
  streak: number;  // 连续学习天数
  
  setDailyTarget: (count: number) => void;
  recordProgress: (count: number) => void;
  createWeeklyPlan: (plan: Omit<WeeklyPlan, 'id' | 'progress'>) => void;
  unlockAchievement: (id: string) => void;
  checkDailyGoal: () => boolean;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      dailyGoal: {
        targetCount: 5,
        completedCount: 0,
        date: new Date().toDateString(),
      },
      weeklyPlans: [],
      achievements: [
        {
          id: 'first-goal',
          name: '初露锋芒',
          description: '完成第一个每日目标',
          icon: '🌟',
        },
        {
          id: 'streak-7',
          name: '坚持一周',
          description: '连续学习 7 天',
          icon: '🔥',
        },
        {
          id: 'streak-30',
          name: '月度达人',
          description: '连续学习 30 天',
          icon: '🏆',
        },
        {
          id: 'master-10',
          name: '小有所成',
          description: '掌握 10 道题目',
          icon: '📚',
        },
        {
          id: 'master-50',
          name: '学富五车',
          description: '掌握 50 道题目',
          icon: '🎓',
        },
      ],
      streak: 0,
      
      setDailyTarget: (count) => {
        set((state) => ({
          dailyGoal: {
            ...state.dailyGoal,
            targetCount: count,
          },
        }));
      },
      
      recordProgress: (count) => {
        set((state) => {
          const today = new Date().toDateString();
          let newGoal = { ...state.dailyGoal };
          
          // 检查是否是新的一天
          if (state.dailyGoal.date !== today) {
            newGoal = {
              targetCount: state.dailyGoal.targetCount,
              completedCount: count,
              date: today,
            };
          } else {
            newGoal.completedCount += count;
          }
          
          // 检查是否完成目标
          const completed = newGoal.completedCount >= newGoal.targetCount;
          
          return {
            dailyGoal: newGoal,
            streak: completed ? state.streak + 1 : state.streak,
          };
        });
        
        // 检查成就
        get().checkDailyGoal();
      },
      
      createWeeklyPlan: (plan) => {
        set((state) => ({
          weeklyPlans: [
            ...state.weeklyPlans,
            {
              ...plan,
              id: crypto.randomUUID(),
              progress: 0,
            },
          ],
        }));
      },
      
      unlockAchievement: (id) => {
        set((state) => ({
          achievements: state.achievements.map(a =>
            a.id === id ? { ...a, unlockedAt: new Date().toISOString() } : a
          ),
        }));
      },
      
      checkDailyGoal: () => {
        const { dailyGoal, streak } = get();
        const completed = dailyGoal.completedCount >= dailyGoal.targetCount;
        
        if (completed && streak === 1) {
          get().unlockAchievement('first-goal');
        }
        if (streak >= 7) {
          get().unlockAchievement('streak-7');
        }
        if (streak >= 30) {
          get().unlockAchievement('streak-30');
        }
        
        return completed;
      },
    }),
    {
      name: 'plan-storage',
    }
  )
);
```

**组件设计**：

```typescript
// src/components/plan/DailyGoal.tsx
export const DailyGoal: React.FC = () => {
  const { dailyGoal, setDailyTarget, recordProgress } = usePlanStore();
  const progress = (dailyGoal.completedCount / dailyGoal.targetCount) * 100;
  
  return (
    <div className="daily-goal">
      <h3>今日目标</h3>
      <div className="goal-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <span className="progress-text">
          {dailyGoal.completedCount} / {dailyGoal.targetCount}
        </span>
      </div>
      <div className="goal-actions">
        <button onClick={() => setDailyTarget(dailyGoal.targetCount - 1)}>-</button>
        <span>{dailyGoal.targetCount} 题/天</span>
        <button onClick={() => setDailyTarget(dailyGoal.targetCount + 1)}>+</button>
      </div>
    </div>
  );
};
```

```typescript
// src/components/plan/Achievement.tsx
export const Achievement: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const isUnlocked = !!achievement.unlockedAt;
  
  return (
    <div className={`achievement ${isUnlocked ? 'unlocked' : 'locked'}`}>
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-info">
        <h4>{achievement.name}</h4>
        <p>{achievement.description}</p>
        {isUnlocked && (
          <span className="unlock-date">
            解锁于 {new Date(achievement.unlockedAt!).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};
```

**验收标准**：
- [ ] 支持设置每日学习目标
- [ ] 显示计划完成进度条
- [ ] 支持周计划、月计划
- [ ] 完成目标显示成就动画

---

### Phase 4: 体验优化

#### 4.4.1 P2-001 复习提醒功能

**艾宾浩斯遗忘曲线算法**：

```typescript
// src/utils/reviewAlgorithm.ts
const REVIEW_INTERVALS = [1, 3, 7, 14, 30]; // 天

export function calculateNextReview(
  lastReviewDate: Date,
  reviewCount: number
): Date {
  const intervalIndex = Math.min(reviewCount, REVIEW_INTERVALS.length - 1);
  const intervalDays = REVIEW_INTERVALS[intervalIndex];
  
  const nextReview = new Date(lastReviewDate);
  nextReview.setDate(nextReview.getDate() + intervalDays);
  
  return nextReview;
}

export function getReviewQueue(
  progress: Record<string, QuestionProgress>
): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return Object.entries(progress)
    .filter(([_, p]) => {
      if (p.status !== 'learning') return false;
      
      const lastReview = new Date(p.lastVisit);
      const nextReview = calculateNextReview(lastReview, p.visitCount);
      
      return nextReview <= today;
    })
    .map(([id]) => id);
}
```

**状态管理**：

```typescript
// src/stores/useReviewStore.ts
interface ReviewState {
  reviewQueue: string[];
  lastNotified: string;
  
  updateReviewQueue: (progress: UserProgress) => void;
  markAsReviewed: (questionId: string) => void;
  shouldNotify: () => boolean;
}
```

**组件设计**：

```typescript
// src/components/review/ReviewQueue.tsx
export const ReviewQueue: React.FC = () => {
  const { reviewQueue, markAsReviewed } = useReviewStore();
  const questions = reviewQueue.map(id => 
    allQuestions.find(q => q.id === id)
  ).filter(Boolean);
  
  return (
    <div className="review-queue">
      <h3>今日复习 ({questions.length})</h3>
      {questions.map(q => (
        <div key={q!.id} className="review-item">
          <span>{q!.title}</span>
          <button onClick={() => markAsReviewed(q!.id)}>
            已复习
          </button>
        </div>
      ))}
    </div>
  );
};
```

**验收标准**：
- [ ] 自动计算复习时间
- [ ] 显示复习队列
- [ ] 支持手动标记已复习

---

#### 4.4.2 P2-002 笔记系统

**类型定义**：

```typescript
// src/types/note.ts
export interface Note {
  id: string;
  questionId: string;
  content: string;      // Markdown 内容
  createdAt: string;
  updatedAt: string;
  tags: string[];
}
```

**状态管理**：

```typescript
// src/stores/useNoteStore.ts
interface NoteState {
  notes: Record<string, Note>;
  
  createNote: (questionId: string, content: string) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  getNoteByQuestion: (questionId: string) => Note | undefined;
  searchNotes: (query: string) => Note[];
}
```

**组件设计**：

```typescript
// src/components/notes/NoteEditor.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const NoteEditor: React.FC<{ questionId: string }> = ({ questionId }) => {
  const { getNoteByQuestion, createNote, updateNote } = useNoteStore();
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  
  useEffect(() => {
    const note = getNoteByQuestion(questionId);
    if (note) setContent(note.content);
  }, [questionId]);
  
  const handleSave = () => {
    const note = getNoteByQuestion(questionId);
    if (note) {
      updateNote(note.id, content);
    } else {
      createNote(questionId, content);
    }
  };
  
  return (
    <div className="note-editor">
      <div className="editor-toolbar">
        <button onClick={() => setIsPreview(false)}>编辑</button>
        <button onClick={() => setIsPreview(true)}>预览</button>
        <button onClick={handleSave}>保存</button>
      </div>
      
      {isPreview ? (
        <div className="note-preview">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在此记录你的学习笔记..."
        />
      )}
    </div>
  );
};
```

**验收标准**：
- [ ] 每道题目可添加/编辑/删除笔记
- [ ] 支持 Markdown 预览
- [ ] 笔记数据持久化存储

---

#### 4.4.3 P2-003 收藏夹分类

**类型定义**：

```typescript
// src/types/favorite.ts
export interface FavoriteFolder {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  questionIds: string[];
}
```

**状态管理**：

```typescript
// src/stores/useFavoriteStore.ts（重构现有收藏功能）
interface FavoriteState {
  folders: FavoriteFolder[];
  defaultFolder: string; // 默认收藏夹 ID
  
  createFolder: (name: string, color: string, icon: string) => void;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
  addToFolder: (folderId: string, questionId: string) => void;
  removeFromFolder: (folderId: string, questionId: string) => void;
  moveBetweenFolders: (questionId: string, fromId: string, toId: string) => void;
  getQuestionFolders: (questionId: string) => FavoriteFolder[];
}
```

**组件设计**：

```typescript
// src/components/FavoriteManager.tsx
export const FavoriteManager: React.FC<{ questionId: string }> = ({ questionId }) => {
  const { folders, addToFolder, removeFromFolder, getQuestionFolders } = useFavoriteStore();
  const currentFolders = getQuestionFolders(questionId);
  
  return (
    <div className="favorite-manager">
      <h4>收藏到</h4>
      {folders.map(folder => {
        const isAdded = currentFolders.some(f => f.id === folder.id);
        return (
          <div key={folder.id} className="folder-item">
            <span style={{ color: folder.color }}>{folder.icon}</span>
            <span>{folder.name}</span>
            <button
              onClick={() => isAdded 
                ? removeFromFolder(folder.id, questionId)
                : addToFolder(folder.id, questionId)
              }
            >
              {isAdded ? '已收藏' : '收藏'}
            </button>
          </div>
        );
      })}
      <button className="create-folder-btn">+ 新建收藏夹</button>
    </div>
  );
};
```

**验收标准**：
- [ ] 支持创建多个收藏夹
- [ ] 题目可收藏到多个收藏夹
- [ ] 支持收藏夹重命名和删除

---

#### 4.4.4 P2-004 搜索增强

**功能设计**：

```typescript
// src/hooks/useSearch.ts
interface SearchOptions {
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

export function useSearch() {
  const [history, setHistory] = useState<string[]>([]);
  
  const search = useCallback((options: SearchOptions) => {
    let results = allQuestions;
    
    // 基础搜索
    if (options.query) {
      results = results.filter(q => {
        if (options.useRegex) {
          try {
            const regex = new RegExp(
              options.query,
              options.caseSensitive ? 'g' : 'gi'
            );
            return regex.test(q.title) || regex.test(q.question);
          } catch {
            return false;
          }
        }
        
        const query = options.caseSensitive 
          ? options.query 
          : options.query.toLowerCase();
        
        return (
          q.title.toLowerCase().includes(query) ||
          q.tags.some(t => t.toLowerCase().includes(query))
        );
      });
    }
    
    // 分类筛选
    if (options.filters.categories?.length) {
      results = results.filter(q => 
        options.filters.categories!.includes(q.category)
      );
    }
    
    // 难度筛选
    if (options.filters.difficulties?.length) {
      results = results.filter(q => 
        options.filters.difficulties!.includes(q.difficulty)
      );
    }
    
    // 保存搜索历史
    if (options.query) {
      setHistory(prev => {
        const newHistory = [options.query, ...prev.filter(h => h !== options.query)];
        return newHistory.slice(0, 10);
      });
    }
    
    return results;
  }, []);
  
  return { search, history, clearHistory: () => setHistory([]) };
}
```

**组件设计**：

```typescript
// src/components/SearchEnhanced.tsx
export const SearchEnhanced: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<SearchOptions>({
    query: '',
    useRegex: false,
    caseSensitive: false,
    searchIn: ['title', 'tags'],
    filters: {},
  });
  const { search, history } = useSearch();
  
  return (
    <div className="search-enhanced">
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="搜索题目..."
          value={options.query}
          onChange={(e) => setOptions({ ...options, query: e.target.value })}
        />
        <button onClick={() => setShowAdvanced(!showAdvanced)}>
          高级
        </button>
      </div>
      
      {history.length > 0 && (
        <div className="search-history">
          <span>历史搜索：</span>
          {history.slice(0, 5).map(h => (
            <button key={h} onClick={() => setOptions({ ...options, query: h })}>
              {h}
            </button>
          ))}
        </div>
      )}
      
      {showAdvanced && (
        <div className="advanced-options">
          <label>
            <input
              type="checkbox"
              checked={options.useRegex}
              onChange={(e) => setOptions({ ...options, useRegex: e.target.checked })}
            />
            正则表达式
          </label>
          <label>
            <input
              type="checkbox"
              checked={options.caseSensitive}
              onChange={(e) => setOptions({ ...options, caseSensitive: e.target.checked })}
            />
            区分大小写
          </label>
          {/* 更多筛选选项 */}
        </div>
      )}
    </div>
  );
};
```

**验收标准**：
- [ ] 支持搜索历史记录
- [ ] 支持正则表达式搜索
- [ ] 支持高级筛选

---

#### 4.4.5 P2-005 学习计时器

**实现方案**：

```typescript
// src/hooks/useTimer.ts
export function useTimer(questionId: string) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { recordTimeSpent } = useUserStore();
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);
  
  // 页面离开时保存时间
  useEffect(() => {
    return () => {
      if (seconds > 0) {
        recordTimeSpent(questionId, seconds);
      }
    };
  }, [questionId, seconds]);
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };
  
  return {
    seconds,
    formattedTime: formatTime(seconds),
    isRunning,
    start: () => setIsRunning(true),
    pause: () => setIsRunning(false),
    reset: () => setSeconds(0),
  };
}
```

**组件设计**：

```typescript
// src/components/StudyTimer.tsx
export const StudyTimer: React.FC<{ questionId: string }> = ({ questionId }) => {
  const { formattedTime, isRunning, start, pause } = useTimer(questionId);
  
  return (
    <div className="study-timer">
      <span className="timer-display">{formattedTime}</span>
      <button onClick={isRunning ? pause : start}>
        {isRunning ? '暂停' : '开始'}
      </button>
    </div>
  );
};
```

**验收标准**：
- [ ] 记录每题学习时间
- [ ] 统计每日学习时长
- [ ] 页面离开自动保存

---

## 五、组件设计汇总

### 5.1 新增组件列表

| 组件名 | 路径 | 职责 |
|--------|------|------|
| ErrorBoundary | components/common/ | 错误边界处理 |
| Loading | components/common/ | 加载状态组件 |
| Modal | components/common/ | 通用弹窗组件 |
| Toast | components/common/ | 消息提示组件 |
| InterviewMode | components/interview/ | 面试模式设置 |
| InterviewTimer | components/interview/ | 面试计时器 |
| InterviewQuestion | components/interview/ | 面试题目展示 |
| InterviewReport | components/interview/ | 面试报告 |
| NoteEditor | components/notes/ | 笔记编辑器 |
| NoteList | components/notes/ | 笔记列表 |
| NotePreview | components/notes/ | 笔记预览 |
| DailyGoal | components/plan/ | 每日目标 |
| PlanProgress | components/plan/ | 计划进度 |
| Achievement | components/plan/ | 成就展示 |
| ReviewQueue | components/review/ | 复习队列 |
| ReviewReminder | components/review/ | 复习提醒 |
| FavoriteManager | components/ | 收藏夹管理 |
| SearchEnhanced | components/ | 增强搜索 |
| StudyTimer | components/ | 学习计时器 |

### 5.2 组件职责说明

**通用组件**：
- `ErrorBoundary`: 捕获子组件错误，显示降级 UI
- `Loading`: 统一的加载状态展示
- `Modal`: 弹窗容器，支持动画和键盘关闭
- `Toast`: 轻量级消息提示，自动消失

**面试模块组件**：
- `InterviewMode`: 面试参数配置界面
- `InterviewTimer`: 倒计时显示，超时回调
- `InterviewQuestion`: 题目展示和答案提交
- `InterviewReport`: 结果统计和可视化

**笔记模块组件**：
- `NoteEditor`: Markdown 编辑和预览切换
- `NoteList`: 笔记列表展示和搜索
- `NotePreview`: Markdown 渲染预览

**计划模块组件**：
- `DailyGoal`: 目标设置和进度展示
- `PlanProgress`: 周计划、月计划进度
- `Achievement`: 成就徽章展示和解锁动画

---

## 六、状态管理方案

### 6.1 Store 架构

```
stores/
├── useUserStore.ts       # 用户数据（现有）
├── useInterviewStore.ts  # 面试会话
├── usePlanStore.ts       # 学习计划
├── useNoteStore.ts       # 笔记数据
├── useFavoriteStore.ts   # 收藏夹（重构）
└── useReviewStore.ts     # 复习提醒
```

### 6.2 数据持久化策略（IndexedDB）

#### 6.2.1 为什么选择 IndexedDB

| 对比项 | localStorage | IndexedDB |
|--------|-------------|-----------|
| 存储容量 | 5-10MB | 数百MB甚至GB |
| 数据类型 | 仅字符串 | 支持对象、数组、Blob 等 |
| 查询能力 | 无 | 支持索引和范围查询 |
| 异步操作 | 同步（阻塞主线程） | 异步（不阻塞） |
| 事务支持 | 无 | 支持事务 |
| 适用场景 | 简单配置、小数据 | 大数据量、复杂查询 |

#### 6.2.2 IndexedDB 数据库设计

```typescript
// src/db/index.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface InterviewReviewDB extends DBSchema {
  questions: {
    key: string;
    value: {
      id: string;
      category: string;
      title: string;
      difficulty: string;
      tags: string[];
      question: string;
      answer: string;
      codeExamples?: any;
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-category': string; 'by-difficulty': string };
  };
  progress: {
    key: string;
    value: {
      questionId: string;
      status: 'not_started' | 'learning' | 'mastered';
      lastVisit: string;
      visitCount: number;
      timeSpent: number;
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-status': string };
  };
  notes: {
    key: string;
    value: {
      id: string;
      questionId: string;
      content: string;
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-question': string };
  };
  favorites: {
    key: string;
    value: {
      id: string;
      questionId: string;
      folderId: string | null;
      createdAt: string;
    };
    indexes: { 'by-folder': string };
  };
  folders: {
    key: string;
    value: {
      id: string;
      name: string;
      color: string;
      icon: string;
      sortOrder: number;
      createdAt: string;
    };
  };
  interviews: {
    key: string;
    value: {
      id: string;
      config: any;
      questions: string[];
      answers: any[];
      startTime: string;
      endTime?: string;
      status: string;
    };
    indexes: { 'by-status': string };
  };
  plans: {
    key: string;
    value: {
      id: string;
      type: string;
      title: string;
      dailyGoal: number;
      startDate: string;
      endDate?: string;
      status: string;
      items: any[];
    };
  };
  achievements: {
    key: string;
    value: {
      id: string;
      type: string;
      key: string;
      earnedAt: string;
    };
    indexes: { 'by-type': string };
  };
  reviews: {
    key: string;
    value: {
      questionId: string;
      reviewCount: number;
      nextReviewAt: string;
      lastReviewAt?: string;
      interval: number;
    };
    indexes: { 'by-next-review': string };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'interview-review-db';
const DB_VERSION = 1;

export async function initDB(): Promise<IDBPDatabase<InterviewReviewDB>> {
  return openDB<InterviewReviewDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 题目存储
      if (!db.objectStoreNames.contains('questions')) {
        const questionStore = db.createObjectStore('questions', { keyPath: 'id' });
        questionStore.createIndex('by-category', 'category');
        questionStore.createIndex('by-difficulty', 'difficulty');
      }

      // 学习进度存储
      if (!db.objectStoreNames.contains('progress')) {
        const progressStore = db.createObjectStore('progress', { keyPath: 'questionId' });
        progressStore.createIndex('by-status', 'status');
      }

      // 笔记存储
      if (!db.objectStoreNames.contains('notes')) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('by-question', 'questionId');
      }

      // 收藏存储
      if (!db.objectStoreNames.contains('favorites')) {
        const favoriteStore = db.createObjectStore('favorites', { keyPath: 'id' });
        favoriteStore.createIndex('by-folder', 'folderId');
      }

      // 收藏夹存储
      if (!db.objectStoreNames.contains('folders')) {
        db.createObjectStore('folders', { keyPath: 'id' });
      }

      // 面试记录存储
      if (!db.objectStoreNames.contains('interviews')) {
        const interviewStore = db.createObjectStore('interviews', { keyPath: 'id' });
        interviewStore.createIndex('by-status', 'status');
      }

      // 学习计划存储
      if (!db.objectStoreNames.contains('plans')) {
        db.createObjectStore('plans', { keyPath: 'id' });
      }

      // 成就存储
      if (!db.objectStoreNames.contains('achievements')) {
        const achievementStore = db.createObjectStore('achievements', { keyPath: 'id' });
        achievementStore.createIndex('by-type', 'type');
      }

      // 复习计划存储
      if (!db.objectStoreNames.contains('reviews')) {
        const reviewStore = db.createObjectStore('reviews', { keyPath: 'questionId' });
        reviewStore.createIndex('by-next-review', 'nextReviewAt');
      }

      // 设置存储
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
}

// 单例数据库连接
let dbInstance: IDBPDatabase<InterviewReviewDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<InterviewReviewDB>> {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
}
```

#### 6.2.3 数据仓库封装

```typescript
// src/db/repositories/noteRepo.ts
import { getDB } from '../index';
import { v4 as uuidv4 } from 'uuid';

export const noteRepo = {
  async getByQuestion(questionId: string) {
    const db = await getDB();
    return db.getFromIndex('notes', 'by-question', questionId);
  },

  async getAll() {
    const db = await getDB();
    return db.getAll('notes');
  },

  async create(data: { questionId: string; content: string }) {
    const db = await getDB();
    const note = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.add('notes', note);
    return note;
  },

  async update(id: string, content: string) {
    const db = await getDB();
    const existing = await db.get('notes', id);
    if (!existing) throw new Error('Note not found');
    
    const updated = {
      ...existing,
      content,
      updatedAt: new Date().toISOString(),
    };
    await db.put('notes', updated);
    return updated;
  },

  async delete(id: string) {
    const db = await getDB();
    await db.delete('notes', id);
  },

  async search(keyword: string) {
    const db = await getDB();
    const all = await db.getAll('notes');
    const lowerKeyword = keyword.toLowerCase();
    return all.filter(note => 
      note.content.toLowerCase().includes(lowerKeyword)
    );
  },
};
```

```typescript
// src/db/repositories/interviewRepo.ts
import { getDB } from '../index';
import { v4 as uuidv4 } from 'uuid';

export const interviewRepo = {
  async getById(id: string) {
    const db = await getDB();
    return db.get('interviews', id);
  },

  async getHistory(limit = 20) {
    const db = await getDB();
    const all = await db.getAll('interviews');
    return all
      .filter(i => i.status === 'completed')
      .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime())
      .slice(0, limit);
  },

  async create(data: any) {
    const db = await getDB();
    const interview = {
      id: uuidv4(),
      ...data,
      status: 'pending',
    };
    await db.add('interviews', interview);
    return interview;
  },

  async update(id: string, data: Partial<any>) {
    const db = await getDB();
    const existing = await db.get('interviews', id);
    if (!existing) throw new Error('Interview not found');
    
    const updated = { ...existing, ...data };
    await db.put('interviews', updated);
    return updated;
  },

  async delete(id: string) {
    const db = await getDB();
    await db.delete('interviews', id);
  },
};
```

#### 6.2.4 Store 与 IndexedDB 集成

```typescript
// src/stores/useNoteStore.ts（重构版）
import { create } from 'zustand';
import { noteRepo } from '../db/repositories/noteRepo';
import { Note } from '../types/note';

interface NoteState {
  notes: Record<string, Note>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadNotes: () => Promise<void>;
  getNoteByQuestion: (questionId: string) => Note | undefined;
  createNote: (questionId: string, content: string) => Promise<Note>;
  updateNote: (id: string, content: string) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  searchNotes: (query: string) => Promise<Note[]>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: {},
  isLoading: false,
  error: null,

  loadNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const allNotes = await noteRepo.getAll();
      const notesMap = allNotes.reduce((acc, note) => {
        acc[note.questionId] = note;
        return acc;
      }, {} as Record<string, Note>);
      set({ notes: notesMap, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  getNoteByQuestion: (questionId: string) => {
    return get().notes[questionId];
  },

  createNote: async (questionId: string, content: string) => {
    const note = await noteRepo.create({ questionId, content });
    set((state) => ({
      notes: { ...state.notes, [questionId]: note },
    }));
    return note;
  },

  updateNote: async (id: string, content: string) => {
    const note = await noteRepo.update(id, content);
    set((state) => ({
      notes: { ...state.notes, [note.questionId]: note },
    }));
    return note;
  },

  deleteNote: async (id: string) => {
    const note = get().notes[Object.keys(get().notes).find(k => get().notes[k].id === id)!];
    if (note) {
      await noteRepo.delete(id);
      set((state) => {
        const { [note.questionId]: _, ...rest } = state.notes;
        return { notes: rest };
      });
    }
  },

  searchNotes: async (query: string) => {
    return noteRepo.search(query);
  },
}));
```

### 6.3 数据导出/导入功能

#### 6.3.1 导出功能

```typescript
// src/utils/exportUtils.ts
import { getDB } from '../db';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export async function exportAllData() {
  const db = await getDB();
  
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    progress: await db.getAll('progress'),
    notes: await db.getAll('notes'),
    favorites: await db.getAll('favorites'),
    folders: await db.getAll('folders'),
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

export async function exportNotes() {
  const db = await getDB();
  const notes = await db.getAll('notes');
  
  let markdown = '# 学习笔记导出\n\n';
  markdown += `导出时间：${new Date().toLocaleString()}\n\n---\n\n`;
  
  for (const note of notes) {
    markdown += `## 题目：${note.questionId}\n\n`;
    markdown += `> 创建时间：${new Date(note.createdAt).toLocaleString()}\n\n`;
    markdown += note.content + '\n\n---\n\n';
  }
  
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const filename = `notes-${new Date().toISOString().split('T')[0]}.md`;
  saveAs(blob, filename);
  return filename;
}
```

#### 6.3.2 导入功能

```typescript
// src/utils/importUtils.ts
import { getDB } from '../db';

export async function importData(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!data.version) {
      return { success: false, message: '无效的备份文件格式' };
    }

    const db = await getDB();
    
    // 使用事务批量导入
    const tx = db.transaction(
      ['progress', 'notes', 'favorites', 'folders', 'interviews', 'plans', 'achievements', 'reviews', 'settings'],
      'readwrite'
    );

    if (data.progress) {
      for (const item of data.progress) {
        await tx.objectStore('progress').put(item);
      }
    }
    if (data.notes) {
      for (const item of data.notes) {
        await tx.objectStore('notes').put(item);
      }
    }
    // ... 其他数据类型

    await tx.done;
    
    return { success: true, message: '数据导入成功' };
  } catch (error: any) {
    return { success: false, message: `导入失败：${error.message}` };
  }
}
```

### 6.4 数据迁移策略

```typescript
// src/db/migrations.ts
import { getDB } from './index';

export async function migrateFromLocalStorage() {
  const db = await getDB();
  
  // 迁移学习进度
  const oldProgress = localStorage.getItem('interview-review-user-data');
  if (oldProgress) {
    try {
      const data = JSON.parse(oldProgress);
      if (data.state?.progress) {
        const tx = db.transaction('progress', 'readwrite');
        for (const [questionId, progress] of Object.entries(data.state.progress)) {
          await tx.objectStore('progress').put({
            questionId,
            ...progress as any,
            updatedAt: new Date().toISOString(),
          });
        }
        await tx.done;
        console.log('学习进度迁移完成');
      }
    } catch (error) {
      console.error('迁移学习进度失败:', error);
    }
  }

  // 迁移收藏夹
  const oldFavorites = localStorage.getItem('favorites-storage');
  if (oldFavorites) {
    try {
      const data = JSON.parse(oldFavorites);
      if (data.state?.favorites) {
        const tx = db.transaction('favorites', 'readwrite');
        for (const favorite of data.state.favorites) {
          await tx.objectStore('favorites').put(favorite);
        }
        await tx.done;
        console.log('收藏夹迁移完成');
      }
    } catch (error) {
      console.error('迁移收藏夹失败:', error);
    }
  }

  // 清理旧的 localStorage 数据（可选）
  // localStorage.removeItem('interview-review-user-data');
  // localStorage.removeItem('favorites-storage');
}
```

### 6.5 存储容量预估

| 数据类型 | 单条大小 | 预估数量 | 总大小 |
|---------|---------|---------|--------|
| 学习进度 | ~200B | 100题 | ~20KB |
| 笔记 | ~2KB | 50条 | ~100KB |
| 收藏 | ~100B | 100条 | ~10KB |
| 面试记录 | ~5KB | 20条 | ~100KB |
| 学习计划 | ~1KB | 10个 | ~10KB |
| 复习记录 | ~200B | 100条 | ~20KB |
| **总计** | - | - | **~260KB** |

IndexedDB 容量通常为 **数百MB甚至GB**，完全满足需求。

---

## 七、数据流设计

### 7.1 数据流向图

```
用户操作 → 组件 → Action → Store → localStorage
                    ↓
              UI 更新 ← State 变化
```

### 7.2 关键数据流

**学习进度记录流程**：
```
1. 用户访问题目页面
2. QuestionDetail 组件调用 recordVisit
3. useUserStore 更新 progress 状态
4. persist 中间件自动保存到 localStorage
5. 进度组件自动更新显示
```

**模拟面试流程**：
```
1. 用户配置面试参数
2. InterviewMode 调用 setupInterview
3. useInterviewStore 初始化会话
4. 用户答题，调用 submitAnswer
5. 面试结束，调用 finishInterview
6. 生成报告，保存到 history
```

**复习提醒流程**：
```
1. 应用启动时检查复习队列
2. useReviewStore 调用 updateReviewQueue
3. 根据艾宾浩斯算法计算待复习题目
4. 显示复习提醒组件
5. 用户标记已复习，更新状态
```

---

## 八、API 接口需求

### 8.1 当前状态

当前系统为纯前端应用，所有数据存储在 `localStorage`。

### 8.2 未来扩展接口（Phase 5）

当实现用户系统时，需要后端提供以下接口：

| 接口 | 方法 | 用途 |
|------|------|------|
| /api/auth/register | POST | 用户注册 |
| /api/auth/login | POST | 用户登录 |
| /api/auth/logout | POST | 用户登出 |
| /api/user/progress | GET/PUT | 同步学习进度 |
| /api/user/favorites | GET/PUT | 同步收藏夹 |
| /api/user/notes | GET/POST/PUT/DELETE | 笔记管理 |
| /api/user/plans | GET/PUT | 学习计划同步 |
| /api/questions | GET | 获取题目列表 |
| /api/questions/:id | GET | 获取题目详情 |
| /api/interview/history | GET | 面试历史记录 |

### 8.3 接口数据格式示例

```typescript
// 同步学习进度
interface SyncProgressRequest {
  progress: UserProgress;
  stats: UserStats;
  lastSyncTime: string;
}

interface SyncProgressResponse {
  success: boolean;
  serverTime: string;
  conflicts?: ConflictItem[];
}

// 笔记接口
interface NoteAPI {
  id: string;
  questionId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  userId: string;
}
```

---

## 九、性能优化方案

### 9.1 代码层面优化

| 优化项 | 方案 | 预期收益 |
|--------|------|----------|
| 组件懒加载 | React.lazy + Suspense | 减少首屏加载时间 |
| 虚拟列表 | 大列表使用虚拟滚动 | 减少DOM节点 |
| 防抖节流 | 搜索输入、滚动事件 | 减少不必要渲染 |
| useMemo/useCallback | 缓存计算结果和回调 | 避免重复计算 |
| Web Worker | 代码执行隔离 | 不阻塞主线程 |

### 9.2 资源优化

| 优化项 | 方案 | 预期收益 |
|--------|------|----------|
| 代码分割 | Vite 自动分包 | 减小单文件体积 |
| Tree Shaking | 移除未使用代码 | 减少打包体积 |
| 图片优化 | 使用 WebP 格式 | 减少图片体积 |
| 字体优化 | 使用系统字体或子集化 | 减少字体加载 |

### 9.3 缓存策略

| 缓存类型 | 策略 | 用途 |
|----------|------|------|
| localStorage | 持久化存储 | 用户数据、学习进度 |
| Memory Cache | 运行时缓存 | 题目数据、计算结果 |
| Service Worker | 可选 | 离线访问支持 |

### 9.4 性能监控

```typescript
// 性能指标采集
const metrics = {
  // 首屏加载时间
  FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
  // 最大内容绘制
  LCP: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
  // 首次输入延迟
  FID: 0, // 需要在交互时采集
  // 累积布局偏移
  CLS: 0, // 需要持续监控
};
```

**性能目标**：
- 首屏加载时间 < 2s
- 代码执行响应时间 < 1s
- Lighthouse 性能分数 > 90

---

## 十、安全方案

### 10.1 代码执行安全

| 风险 | 防护措施 |
|------|----------|
| 恶意代码执行 | Web Worker 隔离 |
| 无限循环 | 执行超时限制（5秒） |
| 内存泄漏 | Worker 执行后立即销毁 |
| 访问全局对象 | Worker 无 DOM 访问权限 |

### 10.2 数据安全

| 风险 | 防护措施 |
|------|----------|
| XSS 攻击 | Markdown 渲染时过滤危险标签 |
| 数据泄露 | localStorage 敏感数据加密 |
| CSRF 攻击 | API 请求携带 CSRF Token（未来） |

### 10.3 内容安全

```typescript
// Markdown 渲染安全配置
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

<ReactMarkdown
  rehypePlugins={[rehypeSanitize]}
  // 禁止渲染 script、iframe 等危险标签
>
  {content}
</ReactMarkdown>
```

### 10.4 CSP 配置（未来）

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  worker-src 'self' blob:;
">
```

---

## 十一、开发排期建议

### 11.1 阶段划分

| 阶段 | 功能模块 | 预估工时 | 开发周期 |
|------|----------|----------|----------|
| Phase 1 | 安全与稳定性 | 7h | 1-2天 |
| Phase 2 | 内容扩展 | 18h | 3-5天 |
| Phase 3 | 核心功能 | 26h | 1-2周 |
| Phase 4 | 体验优化 | 20h | 1周 |
| Phase 5 | 增值功能 | 61h | 持续迭代 |

### 11.2 里程碑

- **M1**: 完成安全优化，通过安全测试
- **M2**: 完成题目扩展，题库达到 70+ 道
- **M3**: 完成模拟面试功能，可正常使用
- **M4**: 完成所有体验优化功能
- **M5**: 用户系统上线，支持云端同步

---

## 十二、风险与应对

| 风险项 | 风险等级 | 应对措施 |
|--------|----------|----------|
| Web Worker 兼容性 | 低 | 降级到 Function 构造函数 + 超时限制 |
| localStorage 容量限制 | 中 | 数据压缩、定期清理、提示用户导出 |
| Monaco Editor 移动端体验 | 中 | 移动端使用简化编辑器（Phase 5） |
| 大量题目性能问题 | 中 | 虚拟列表、分页加载 |
| 数据迁移兼容性 | 低 | 版本化存储、迁移脚本 |

---

## 十三、附录

### 13.1 技术栈版本锁定

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^7.13.1",
    "zustand": "^5.0.11",
    "@monaco-editor/react": "^4.6.0",
    "highlight.js": "^11.9.0",
    "date-fns": "^3.0.0",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "rehype-sanitize": "^6.0.0",
    "recharts": "^2.10.0",
    "framer-motion": "^11.0.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/uuid": "^9.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

### 13.2 相关文档

- [需求文档](./requirements-v1.2.md)
- [产品规划文档](./product-plan-simple.md)
- [重构计划文档](./refactoring-plan.md)

### 13.3 变更记录

| 版本 | 日期 | 变更内容 | 变更人 |
|------|------|----------|--------|
| v1.0.0 | 2026-03-14 | 初始版本，完整技术方案 | 前端工程师 |

---

**文档维护者**: 前端工程师  
**最后更新**: 2026-03-14
