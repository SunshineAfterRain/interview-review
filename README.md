# 🎯 前端面试复盘系统

一个现代化的前端面试准备平台，集成编程题练习、理论题学习、智能评分系统，采用极客风格UI设计。

![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646cff?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ 特性

### 📚 丰富的题库
- **JavaScript基础** - 闭包、原型链、事件循环等核心概念
- **React框架** - Hooks、虚拟DOM、性能优化等
- **CSS布局** - Flex、Grid、BFC等布局技巧
- **性能优化** - 加载优化、渲染优化、Webpack配置
- **工程化** - 模块化、Git工作流、CI/CD
- **编程题** - 8道实战编程题，支持在线运行和测试

### 💻 编程题功能
- 在线代码编辑器（Monaco Editor）
- 实时代码运行和测试
- 多测试用例验证
- 智能评分系统

### 🎯 智能评分系统
**编程题评分维度：**
- 正确性（60分）- 测试用例通过率
- 代码质量（20分）- 代码风格和最佳实践
- 效率（20分）- 执行时间和空间复杂度

**理论题评分维度：**
- 完整性（40分）- 关键词覆盖率
- 准确性（30分）- 答案准确度
- 表达清晰度（20分）- 段落结构
- 关键词覆盖（10分）

### 🎨 极客风格UI
- 深色主题设计
- 霓虹色彩系统
- 代码风格字体
- 炫酷动画效果

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📖 使用指南

### 编程题练习
1. 点击"编程题"分类
2. 选择题目展开查看详情
3. 在代码编辑器中编写代码
4. 点击"运行测试"查看结果
5. 查看评分和参考答案

### 理论题学习
1. 选择感兴趣的分类
2. 展开题目查看详情
3. 点击"查看答案"学习
4. 输入自己的答案进行评分

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **代码编辑器**：Monaco Editor
- **样式方案**：原生CSS（极客风格）
- **状态管理**：React Hooks

## 📊 项目结构

```
interview-review/
├── src/
│   ├── components/          # 组件目录
│   │   ├── CategoryNav.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── AnswerPanel.tsx
│   │   ├── CodeRunner.tsx
│   │   └── ScorePanel.tsx
│   ├── data/                # 数据目录
│   │   ├── questions/
│   │   │   ├── javascript.ts
│   │   │   ├── react.ts
│   │   │   ├── css.ts
│   │   │   ├── performance.ts
│   │   │   ├── engineering.ts
│   │   │   ├── resume-based.ts
│   │   │   └── coding.ts
│   │   └── index.ts
│   ├── types/               # 类型定义
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎯 题目统计

- **总题目数**：34道
- **JavaScript**：6道
- **React**：5道
- **CSS**：4道
- **性能优化**：2道
- **工程化**：3道
- **简历针对性**：6道
- **编程题**：8道

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

[MIT License](LICENSE)

## 🙏 致谢

感谢所有开源项目的贡献者，让前端开发变得更加美好！
