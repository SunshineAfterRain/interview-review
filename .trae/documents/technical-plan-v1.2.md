# 技术方案设计文档 - 面试复盘系统 v1.2

> 基于需求文档 [requirements-v1.2.md](./requirements-v1.2.md) 的技术实现方案

**版本**: v1.0  
**创建日期**: 2026-03-14  
**文档状态**: 规划阶段

---

## 一、技术架构概览

### 1.1 当前技术栈
- **前端**: React 18 + TypeScript + Vite
- **状态管理**: Zustand
- **路由**: React Router v7
- **UI组件**: Monaco Editor、highlight.js
- **数据存储**: localStorage

### 1.2 建议新增技术栈
- **后端**: Node.js + Express / NestJS
- **数据库**: PostgreSQL / MongoDB
- **AI集成**: OpenAI API / 本地部署模型
- **实时通信**: WebSocket（用于模拟面试）
- **缓存**: Redis

---

## 二、前端技术方案

### 2.1 P0-001 代码执行安全优化

#### 方案一：Web Worker 隔离（推荐）

```typescript
// src/workers/code-runner.worker.ts
self.onmessage = (e) => {
  const { code, testCases, language } = e.data;
  
  try {
    // 使用 Function 构造器替代 eval
    const fn = new Function('return ' + code);
    const result = fn();
    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};
```

**优点**:
- 完全隔离，无法访问主线程 DOM
- 不阻塞主线程
- 可设置超时

**实现步骤**:
1. 创建 Web Worker 文件
2. 封装 Worker 通信 Hook
3. 添加超时控制
4. 替换现有 eval 调用

#### 方案二：iframe 沙箱

```typescript
// 创建隔离的 iframe
const sandbox = document.createElement('iframe');
sandbox.sandbox = 'allow-scripts';
sandbox.style.display = 'none';
document.body.appendChild(sandbox);

// 通过 postMessage 通信
sandbox.contentWindow.postMessage({ code }, '*');
```

**推荐**: Web Worker 方案，更轻量且性能更好

---

### 2.2 P0-002 错误边界处理

```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>出错了</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**应用位置**:
- App 根组件
- CodeRunner 组件
- QuestionCard 组件

---

### 2.3 P1-003 模拟面试模式

#### 组件结构

```
src/pages/MockInterview/
├── index.tsx              # 主页面
├── InterviewSetup.tsx     # 设置面板
├── InterviewQuestion.tsx  # 答题界面
├── InterviewResult.tsx    # 结果报告
├── Timer.tsx              # 计时器组件
└── MockInterview.css      # 样式
```

#### 状态管理

```typescript
// src/stores/useInterviewStore.ts
interface InterviewState {
  status: 'idle' | 'setup' | 'running' | 'finished';
  config: {
    questionCount: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    categories: string[];
    timeLimit: number; // 分钟
  };
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  startTime: number;
  endTime: number;
}

export const useInterviewStore = create<InterviewState>()((set, get) => ({
  status: 'idle',
  config: {
    questionCount: 10,
    difficulty: 'mixed',
    categories: [],
    timeLimit: 30,
  },
  questions: [],
  currentIndex: 0,
  answers: {},
  startTime: 0,
  endTime: 0,
  
  startInterview: (questions) => set({ 
    status: 'running', 
    questions,
    startTime: Date.now() 
  }),
  submitAnswer: (questionId, answer) => set((state) => ({
    answers: { ...state.answers, [questionId]: answer }
  })),
  nextQuestion: () => set((state) => ({
    currentIndex: state.currentIndex + 1
  })),
  finishInterview: () => set({ 
    status: 'finished',
    endTime: Date.now()
  }),
}));
```

#### 路由配置

```typescript
// 添加路由
<Route path="/mock-interview" element={<MockInterview />} />
```

---

### 2.4 P1-004 AI 评分功能

#### 前端实现

```typescript
// src/services/ai-scoring.ts
interface ScoringResult {
  score: number;
  feedback: string;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

export async function scoreAnswer(
  question: string,
  userAnswer: string,
  referenceAnswer: string
): Promise<ScoringResult> {
  // 调用后端 API
  const response = await fetch('/api/ai/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, userAnswer, referenceAnswer }),
  });
  
  return response.json();
}

// 或者使用客户端直接调用（用户配置 API Key）
export async function scoreAnswerClient(
  apiKey: string,
  question: string,
  userAnswer: string
): Promise<ScoringResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `你是一位资深前端面试官，请对用户的答案进行评分和反馈。
                   评分标准：准确性(40%)、完整性(30%)、清晰度(20%)、深度(10%)。
                   返回JSON格式：{score, feedback, suggestions, strengths, weaknesses}`
        },
        {
          role: 'user',
          content: `问题：${question}\n\n用户答案：${userAnswer}`
        }
      ]
    }),
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
```

#### 配置管理

```typescript
// src/stores/useSettingsStore.ts
interface SettingsState {
  aiProvider: 'openai' | 'anthropic' | 'local';
  apiKey: string;
  apiEndpoint: string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      aiProvider: 'openai',
      apiKey: '',
      apiEndpoint: 'https://api.openai.com/v1',
      setApiKey: (key) => set({ apiKey: key }),
      setProvider: (provider) => set({ aiProvider: provider }),
    }),
    { name: 'interview-settings' }
  )
);
```

---

### 2.5 P1-005 学习计划制定

#### 数据结构

```typescript
// src/types/plan.ts
interface StudyPlan {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  dailyGoal: number; // 每日目标题目数
  targetCategories: string[];
  progress: {
    date: string;
    completed: number;
    target: number;
  }[];
}

interface DailyGoal {
  date: string;
  targetCount: number;
  completedCount: number;
  questions: string[];
}
```

#### Store 实现

```typescript
// src/stores/usePlanStore.ts
export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: [],
      activePlan: null,
      dailyGoals: {},
      
      createPlan: (plan) => set((state) => ({
        plans: [...state.plans, plan],
        activePlan: plan.id
      })),
      
      updateDailyProgress: (date, questionId) => set((state) => {
        const goal = state.dailyGoals[date] || { 
          date, 
          targetCount: state.plans.find(p => p.id === state.activePlan)?.dailyGoal || 5,
          completedCount: 0,
          questions: []
        };
        
        if (!goal.questions.includes(questionId)) {
          return {
            dailyGoals: {
              ...state.dailyGoals,
              [date]: {
                ...goal,
                completedCount: goal.completedCount + 1,
                questions: [...goal.questions, questionId]
              }
            }
          };
        }
        return state;
      }),
    }),
    { name: 'study-plans' }
  )
);
```

---

### 2.6 P2-001 复习提醒（艾宾浩斯曲线）

#### 算法实现

```typescript
// src/utils/review-schedule.ts
const REVIEW_INTERVALS = [1, 3, 7, 14, 30]; // 天

export function calculateNextReview(
  learnedDate: Date,
  reviewCount: number
): Date {
  const intervalIndex = Math.min(reviewCount, REVIEW_INTERVALS.length - 1);
  const days = REVIEW_INTERVALS[intervalIndex];
  
  const nextReview = new Date(learnedDate);
  nextReview.setDate(nextReview.getDate() + days);
  
  return nextReview;
}

export function getReviewQueue(
  progress: Record<string, QuestionProgress>
): Array<{ questionId: string; nextReview: Date; overdue: boolean }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return Object.entries(progress)
    .filter(([_, p]) => p.status === 'mastered')
    .map(([id, p]) => {
      const reviewCount = p.reviewCount || 0;
      const lastReview = p.lastReview ? new Date(p.lastReview) : new Date(p.lastVisit);
      const nextReview = calculateNextReview(lastReview, reviewCount);
      
      return {
        questionId: id,
        nextReview,
        overdue: nextReview <= today
      };
    })
    .filter(item => item.overdue)
    .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
}
```

---

### 2.7 P2-002 笔记系统

#### 数据结构

```typescript
// src/types/note.ts
interface QuestionNote {
  questionId: string;
  content: string; // Markdown 格式
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// src/stores/useNoteStore.ts
export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: {},
      
      saveNote: (questionId, content) => set((state) => ({
        notes: {
          ...state.notes,
          [questionId]: {
            questionId,
            content,
            createdAt: state.notes[questionId]?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: []
          }
        }
      })),
      
      deleteNote: (questionId) => set((state) => {
        const { [questionId]: _, ...rest } = state.notes;
        return { notes: rest };
      }),
    }),
    { name: 'question-notes' }
  )
);
```

#### Markdown 编辑器

```typescript
// 使用 react-markdown 或 @uiw/react-md-editor
import MDEditor from '@uiw/react-md-editor';

function NoteEditor({ questionId }: { questionId: string }) {
  const { notes, saveNote } = useNoteStore();
  const [content, setContent] = useState(notes[questionId]?.content || '');
  
  return (
    <div className="note-editor">
      <MDEditor
        value={content}
        onChange={(v) => setContent(v || '')}
        height={300}
      />
      <button onClick={() => saveNote(questionId, content)}>
        保存笔记
      </button>
    </div>
  );
}
```

---

## 三、后端技术方案

### 3.1 技术选型
- **框架**: NestJS（推荐）或 Express
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT
- **AI集成**: OpenAI SDK

### 3.2 项目结构

```
server/
├── src/
│   ├── modules/
│   │   ├── auth/           # 用户认证
│   │   ├── questions/      # 题目管理
│   │   ├── progress/       # 学习进度
│   │   ├── ai/             # AI 评分
│   │   ├── interview/      # 模拟面试
│   │   └── notes/          # 笔记系统
│   ├── common/
│   │   ├── guards/         # 认证守卫
│   │   ├── decorators/     # 自定义装饰器
│   │   └── filters/        # 异常过滤器
│   └── main.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

### 3.3 数据库设计

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  progress  UserProgress[]
  notes     Note[]
  plans     StudyPlan[]
  favorites Favorite[]
}

model UserProgress {
  id           String   @id @default(cuid())
  userId       String
  questionId   String
  status       String   // not_started, learning, mastered
  score        Int?
  timeSpent    Int      @default(0)
  reviewCount  Int      @default(0)
  lastVisit    DateTime @default(now())
  lastReview   DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user         User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, questionId])
}

model Note {
  id          String   @id @default(cuid())
  userId      String
  questionId  String
  content     String   @db.Text
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, questionId])
}

model StudyPlan {
  id              String   @id @default(cuid())
  userId          String
  name            String
  startDate       DateTime
  endDate         DateTime
  dailyGoal       Int
  targetCategories String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id])
  dailyProgress   DailyProgress[]
}

model DailyProgress {
  id              String   @id @default(cuid())
  planId          String
  date            DateTime
  targetCount     Int
  completedCount  Int      @default(0)
  questionIds     String[]
  
  plan            StudyPlan @relation(fields: [planId], references: [id])
  
  @@unique([planId, date])
}

model Favorite {
  id          String   @id @default(cuid())
  userId      String
  questionId  String
  folder      String   @default("default")
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, questionId, folder])
}

model InterviewSession {
  id            String   @id @default(cuid())
  userId        String
  config        Json
  questionIds   String[]
  answers       Json
  results       Json?
  score         Int?
  startTime     DateTime
  endTime       DateTime?
  createdAt     DateTime @default(now())
}
```

### 3.4 API 设计

#### AI 评分接口

```typescript
// src/modules/ai/ai.controller.ts
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('score')
  async scoreAnswer(@Body() body: ScoreDto) {
    return this.aiService.scoreAnswer(body);
  }
}

// src/modules/ai/ai.service.ts
@Injectable()
export class AiService {
  async scoreAnswer(dto: ScoreDto): Promise<ScoringResult> {
    const prompt = this.buildPrompt(dto);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SCORING_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });
    
    return JSON.parse(response.choices[0].message.content);
  }
}
```

#### 模拟面试接口

```typescript
// src/modules/interview/interview.controller.ts
@Controller('interview')
@UseGuards(JwtAuthGuard)
export class InterviewController {
  @Post('start')
  async startInterview(@Body() config: InterviewConfigDto, @User() user) {
    return this.interviewService.createSession(user.id, config);
  }

  @Post(':sessionId/submit')
  async submitAnswer(
    @Param('sessionId') sessionId: string,
    @Body() answer: AnswerDto
  ) {
    return this.interviewService.submitAnswer(sessionId, answer);
  }

  @Post(':sessionId/finish')
  async finishInterview(@Param('sessionId') sessionId: string) {
    return this.interviewService.finishSession(sessionId);
  }

  @Get(':sessionId/result')
  async getResult(@Param('sessionId') sessionId: string) {
    return this.interviewService.getResult(sessionId);
  }
}
```

### 3.5 安全考虑

```typescript
// src/common/guards/rate-limit.guard.ts
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const key = `rate-limit:${userId}:${context.getHandler().name}`;
    
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, 60); // 1分钟窗口
    }
    
    if (count > 10) { // 每分钟最多10次
      throw new TooManyRequestsException('请求过于频繁');
    }
    
    return true;
  }
}
```

---

## 四、实施计划

### 4.1 Phase 1: 安全修复（1-2天）

| 任务 | 前端 | 后端 |
|------|------|------|
| P0-001 代码执行安全 | Web Worker 实现 | - |
| P0-002 错误边界 | ErrorBoundary 组件 | - |
| P0-003 代码清理 | 删除重复代码 | - |

### 4.2 Phase 2: 内容扩展（3-5天）

| 任务 | 前端 | 后端 |
|------|------|------|
| P1-001 TypeScript 题目 | 题目数据 | 题目数据 |
| P1-002 算法题目 | 题目数据 | 题目数据 |
| P2-006 系统设计题目 | 题目数据 | 题目数据 |
| P2-007 工具链题目 | 题目数据 | 题目数据 |

### 4.3 Phase 3: 核心功能（1-2周）

| 任务 | 前端 | 后端 |
|------|------|------|
| P1-003 模拟面试 | 页面组件 + Store | API + 数据库 |
| P1-004 AI 评分 | 服务层 + 设置页 | API + OpenAI 集成 |
| P1-005 学习计划 | 页面组件 + Store | API + 数据库 |

### 4.4 Phase 4: 体验优化（1周）

| 任务 | 前端 | 后端 |
|------|------|------|
| P2-001 复习提醒 | 队列组件 + 通知 | - |
| P2-002 笔记系统 | 编辑器组件 + Store | API + 数据库 |
| P2-003 收藏夹分类 | 分类组件 + Store | API 更新 |
| P2-004 搜索增强 | 搜索组件优化 | - |
| P2-005 学习计时器 | 计时器组件 | - |

---

## 五、技术风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| AI API 调用成本高 | 中 | 实现缓存机制，相似问题复用结果 |
| Web Worker 兼容性 | 低 | 提供 fallback 方案 |
| 数据库迁移复杂 | 中 | 使用 Prisma 迁移工具 |
| 实时面试同步 | 中 | WebSocket + Redis Pub/Sub |

---

## 六、验收清单

### 前端验收
- [ ] Web Worker 代码执行正常
- [ ] 错误边界捕获异常
- [ ] 模拟面试流程完整
- [ ] AI 评分返回正确结果
- [ ] 学习计划创建和追踪正常
- [ ] 复习提醒计算正确
- [ ] 笔记保存和加载正常

### 后端验收
- [ ] API 接口响应正常
- [ ] 数据库迁移成功
- [ ] AI 集成工作正常
- [ ] 认证授权正确
- [ ] 限流机制生效

---

**文档维护者**: 技术团队  
**最后更新**: 2026-03-14
