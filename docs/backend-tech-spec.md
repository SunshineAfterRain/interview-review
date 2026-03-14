# 面试复盘系统 - 后端技术方案文档（可选云同步方案）

**版本**: v1.1.0  
**创建日期**: 2026-03-14  
**文档状态**: 设计阶段  
**更新说明**: 调整为可选云同步方案，主方案为纯前端架构

---

## 一、概述

### 1.1 项目背景

面试复盘系统当前为纯前端应用，数据存储在浏览器 IndexedDB 中。本文档描述**可选的云同步后端方案**，供需要多设备同步的用户选择使用。

### 1.2 架构选择

```
┌─────────────────────────────────────────────────────────────────┐
│                        架构方案选择                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  方案一（主方案）：纯前端 + IndexedDB                            │
│  ├─ 部署：Vercel 免费                                           │
│  ├─ 存储：IndexedDB（数百MB容量）                                │
│  ├─ 成本：¥0                                                    │
│  └─ 适用：个人学习、单设备使用                                    │
│                                                                 │
│  方案二（可选）：前端 + 云同步                                    │
│  ├─ 部署：Vercel + Supabase                                     │
│  ├─ 存储：IndexedDB + 云端备份                                   │
│  ├─ 成本：¥0（免费额度内）                                        │
│  └─ 适用：多设备同步、数据备份                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 需求映射

| 需求编号 | 需求名称 | 纯前端支持 | 云同步支持 |
|---------|---------|-----------|-----------|
| P1-003 | 模拟面试模式 | ✅ IndexedDB | ✅ 云端备份 |
| P1-005 | 学习计划制定 | ✅ IndexedDB | ✅ 多设备同步 |
| P2-001 | 复习提醒功能 | ✅ IndexedDB | ✅ 云端备份 |
| P2-002 | 笔记系统 | ✅ IndexedDB | ✅ 多设备同步 |
| P2-003 | 收藏夹分类 | ✅ IndexedDB | ✅ 多设备同步 |
| P3-001 | 用户系统 | ❌ 不需要 | ✅ Supabase Auth |
| P3-002 | 社区功能 | ❌ 不需要 | ✅ Supabase |

---

## 二、主方案：纯前端架构

### 2.1 技术选型

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **前端框架** | React 18 + TypeScript | 现有技术栈 |
| **构建工具** | Vite 5 | 快速构建 |
| **状态管理** | Zustand 5 | 轻量级状态管理 |
| **本地存储** | IndexedDB (idb) | 大容量本地存储 |
| **部署平台** | Vercel | 免费托管 |

### 2.2 数据存储方案

```typescript
// IndexedDB 数据库结构
interface InterviewReviewDB {
  questions: { key: string; value: Question };
  progress: { key: string; value: Progress };
  notes: { key: string; value: Note };
  favorites: { key: string; value: Favorite };
  folders: { key: string; value: Folder };
  interviews: { key: string; value: Interview };
  plans: { key: string; value: Plan };
  achievements: { key: string; value: Achievement };
  reviews: { key: string; value: Review };
  settings: { key: string; value: any };
}
```

### 2.3 数据导出/导入

```typescript
// 导出所有数据为 JSON
async function exportAllData(): Promise<void> {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    progress: await db.getAll('progress'),
    notes: await db.getAll('notes'),
    favorites: await db.getAll('favorites'),
    // ... 其他数据
  };
  
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  saveAs(blob, `backup-${Date.now()}.json`);
}

// 导入数据
async function importData(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text);
  
  // 批量写入 IndexedDB
  const tx = db.transaction(['progress', 'notes', ...], 'readwrite');
  // ... 导入逻辑
}
```

### 2.4 部署方案

```
部署平台：Vercel（免费）
├── 域名：xxx.vercel.app
├── CDN：全球加速
├── HTTPS：自动配置
└── 构建命令：npm run build
```

**成本**: ¥0/月

---

## 三、可选方案：Supabase 云同步

### 3.1 为什么选择 Supabase

| 对比项 | 自建后端 | Supabase |
|--------|---------|----------|
| 开发成本 | 高（需开发后端） | 低（开箱即用） |
| 部署成本 | ¥200+/月 | ¥0（免费额度） |
| 运维成本 | 高 | 无 |
| 认证系统 | 需自己实现 | 内置 |
| 数据库 | 需自己部署 | PostgreSQL 托管 |
| 实时订阅 | 需自己实现 | 内置 |

### 3.2 Supabase 免费额度

| 资源 | 免费额度 | 说明 |
|------|---------|------|
| 数据库 | 500MB | 足够个人使用 |
| 存储 | 1GB | 头像、导出文件 |
| 带宽 | 5GB/月 | 足够个人使用 |
| 并发连接 | 60 | 足够个人使用 |
| MAU | 50,000 | 月活用户数 |

### 3.3 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                      前端应用                                │
│              React + TypeScript + Vite                      │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   IndexedDB     │  │  Supabase SDK   │                  │
│  │   (本地存储)     │  │   (云同步)       │                  │
│  └────────┬────────┘  └────────┬────────┘                  │
└───────────┼────────────────────┼───────────────────────────┘
            │                    │
            │ 本地优先            │ 可选同步
            ▼                    ▼
┌─────────────────┐    ┌─────────────────────────────────────┐
│   IndexedDB     │    │           Supabase                  │
│   (主存储)       │    │  ┌─────────────────────────────┐   │
└─────────────────┘    │  │   PostgreSQL Database       │   │
                       │  │   - 用户数据                  │   │
                       │  │   - 学习进度                  │   │
                       │  │   - 笔记/收藏                 │   │
                       │  └─────────────────────────────┘   │
                       │  ┌─────────────────────────────┐   │
                       │  │   Authentication            │   │
                       │  │   - 邮箱密码登录              │   │
                       │  │   - GitHub OAuth            │   │
                       │  │   - Google OAuth            │   │
                       │  └─────────────────────────────┘   │
                       │  ┌─────────────────────────────┐   │
                       │  │   Storage                   │   │
                       │  │   - 用户头像                 │   │
                       │  │   - 导出文件                 │   │
                       │  └─────────────────────────────┘   │
                       └─────────────────────────────────────┘
```

### 3.4 数据库表结构（Supabase）

```sql
-- 用户表（Supabase Auth 自动创建）
-- auth.users

-- 用户配置
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username VARCHAR(50),
    avatar_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 学习进度
CREATE TABLE learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'not_started',
    last_visit TIMESTAMPTZ,
    visit_count INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- 笔记
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- 收藏夹
CREATE TABLE favorite_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#1890ff',
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 收藏
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES favorite_folders(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- 面试记录
CREATE TABLE mock_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    config JSONB,
    questions TEXT[],
    answers JSONB[],
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 学习计划
CREATE TABLE learning_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    daily_goal INTEGER DEFAULT 5,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 成就
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, key)
);

-- 复习计划
CREATE TABLE review_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    review_count INTEGER DEFAULT 0,
    next_review_at TIMESTAMPTZ NOT NULL,
    last_review_at TIMESTAMPTZ,
    interval INTEGER DEFAULT 1,
    UNIQUE(user_id, question_id)
);

-- 索引
CREATE INDEX idx_progress_user ON learning_progress(user_id);
CREATE INDEX idx_notes_user ON notes(user_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_interviews_user ON mock_interviews(user_id);
CREATE INDEX idx_reviews_next ON review_schedules(next_review_at);
```

### 3.5 Row Level Security (RLS)

```sql
-- 启用 RLS
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_schedules ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own progress" ON learning_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON learning_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON learning_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON learning_progress
    FOR DELETE USING (auth.uid() = user_id);

-- 类似地为其他表创建策略...
```

### 3.6 前端集成代码

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 认证
export const auth = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};

// 数据同步
export const sync = {
  async syncProgress(progress: any[]) {
    const user = await auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('learning_progress')
      .upsert(
        progress.map(p => ({ ...p, user_id: user.id })),
        { onConflict: 'user_id,question_id' }
      );
    
    return { error };
  },

  async syncNotes(notes: any[]) {
    const user = await auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notes')
      .upsert(
        notes.map(n => ({ ...n, user_id: user.id })),
        { onConflict: 'user_id,question_id' }
      );
    
    return { error };
  },

  async pullAll() {
    const user = await auth.getUser();
    if (!user) return null;

    const [progress, notes, favorites, folders, interviews, plans, achievements, reviews] = 
      await Promise.all([
        supabase.from('learning_progress').select('*').eq('user_id', user.id),
        supabase.from('notes').select('*').eq('user_id', user.id),
        supabase.from('favorites').select('*').eq('user_id', user.id),
        supabase.from('favorite_folders').select('*').eq('user_id', user.id),
        supabase.from('mock_interviews').select('*').eq('user_id', user.id),
        supabase.from('learning_plans').select('*').eq('user_id', user.id),
        supabase.from('achievements').select('*').eq('user_id', user.id),
        supabase.from('review_schedules').select('*').eq('user_id', user.id),
      ]);

    return {
      progress: progress.data,
      notes: notes.data,
      favorites: favorites.data,
      folders: folders.data,
      interviews: interviews.data,
      plans: plans.data,
      achievements: achievements.data,
      reviews: reviews.data,
    };
  },
};
```

### 3.7 环境变量配置

```bash
# .env.example
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 四、部署方案对比

### 4.1 方案对比

| 对比项 | 纯前端方案 | 云同步方案 |
|--------|-----------|-----------|
| **部署复杂度** | 简单（仅前端） | 中等（需配置 Supabase） |
| **月成本** | ¥0 | ¥0（免费额度内） |
| **数据存储** | 本地 IndexedDB | 本地 + 云端 |
| **多设备同步** | ❌ 不支持 | ✅ 支持 |
| **数据备份** | 手动导出 | 自动云端备份 |
| **用户系统** | ❌ 不需要 | ✅ Supabase Auth |
| **社区功能** | ❌ 不支持 | ✅ 可扩展 |
| **离线使用** | ✅ 完全支持 | ✅ 本地优先 |
| **运维成本** | 无 | 无（Supabase 托管） |

### 4.2 推荐选择

```
┌─────────────────────────────────────────────────────────────┐
│                      选择建议                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  选择「纯前端方案」如果：                                     │
│  ├─ 仅在单一设备使用                                         │
│  ├─ 不需要多设备同步                                         │
│  ├─ 希望部署最简单                                           │
│  └─ 数据隐私要求高（不上传云端）                              │
│                                                             │
│  选择「云同步方案」如果：                                     │
│  ├─ 需要在多设备间同步数据                                    │
│  ├─ 希望自动云端备份                                         │
│  ├─ 未来可能需要社区功能                                      │
│  └─ 愿意花少量时间配置 Supabase                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 五、实施路线图

### 5.1 阶段一：纯前端架构（当前）

```
目标：完成所有核心功能，数据存储在 IndexedDB

技术栈：
├── React 18 + TypeScript
├── Vite 5
├── Zustand 5
├── IndexedDB (idb)
└── 部署到 Vercel

功能：
├── Phase 1: 安全与稳定性
├── Phase 2: 内容扩展
├── Phase 3: 核心功能
├── Phase 4: 体验优化
└── 数据导出/导入

成本：¥0
```

### 5.2 阶段二：可选云同步（未来）

```
目标：为需要多设备同步的用户提供云同步功能

新增技术：
├── Supabase SDK
├── Supabase Auth
└── Supabase Database

功能：
├── 用户注册/登录
├── 数据云端同步
├── 多设备数据同步
└── 自动云端备份

成本：¥0（免费额度内）
```

---

## 六、Supabase 配置指南（可选）

### 6.1 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 记录 `Project URL` 和 `anon key`

### 6.2 执行数据库迁移

```bash
# 在 Supabase Dashboard 的 SQL Editor 中执行
# 复制本文档中的 CREATE TABLE 语句
```

### 6.3 配置认证

```
Authentication → Providers
├── Email: 启用
├── GitHub: 可选配置
└── Google: 可选配置
```

### 6.4 配置存储

```
Storage → Create Bucket
├── avatars: 用户头像
└── exports: 导出文件
```

---

## 七、附录

### 7.1 技术栈版本

| 技术 | 版本 | 用途 |
|-----|------|------|
| React | 18.x | 前端框架 |
| TypeScript | 5.x | 类型系统 |
| Vite | 5.x | 构建工具 |
| Zustand | 5.x | 状态管理 |
| idb | 8.x | IndexedDB 封装 |
| @supabase/supabase-js | 2.x | Supabase SDK（可选） |
| file-saver | 2.x | 文件导出 |
| jszip | 3.x | ZIP 压缩 |

### 7.2 相关文档

- [需求文档](./requirements-v1.2.md)
- [前端技术方案文档](./frontend-tech-spec.md)

### 7.3 变更记录

| 版本 | 日期 | 变更内容 | 变更人 |
|------|------|----------|--------|
| v1.0.0 | 2026-03-14 | 初始版本，完整后端方案 | 后端开发 |
| v1.1.0 | 2026-03-14 | 调整为可选云同步方案，主方案为纯前端架构 | 后端开发 |

---

**文档维护者**: 后端开发团队  
**最后更新**: 2026-03-14
