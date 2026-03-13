import { Question } from '../../types/question';

export const engineeringQuestions: Question[] = [
  {
    id: 'eng-001',
    category: 'engineering',
    questionType: 'theory',
    title: '前端模块化发展历程',
    difficulty: 'medium',
    tags: ['模块化', 'CommonJS', 'ES6 Module', 'AMD'],
    question: '请介绍前端模块化的发展历程，比较CommonJS、ES6 Module、AMD等模块规范的区别。',
    answer: `**模块化发展历程：**

1. **无模块化时代**
   - 全局变量污染
   - 命名冲突
   - 依赖管理困难

2. **IIFE（立即执行函数）**
   - 实现简单的模块化
   - 避免全局污染

3. **CommonJS**
   - Node.js采用
   - 同步加载
   - 运行时加载

4. **AMD（异步模块定义）**
   - RequireJS实现
   - 异步加载
   - 适合浏览器环境

5. **ES6 Module**
   - ES6标准
   - 静态分析
   - 编译时加载

**CommonJS vs ES6 Module：**

| 特性 | CommonJS | ES6 Module |
|------|----------|------------|
| 加载时机 | 运行时 | 编译时 |
| 输出 | 值的拷贝 | 值的引用 |
| this | 指向当前模块 | undefined |
| 循环依赖 | 只输出已执行部分 | 动态引用 |
| 异步 | 不支持 | 支持 |

**ES6 Module优势：**
1. 静态分析，支持Tree Shaking
2. 更好的循环依赖处理
3. 统一的标准`,
    codeExamples: [
      {
        language: 'javascript',
        description: 'CommonJS模块',
        code: `// 导出 - module.exports
// math.js
const PI = 3.14159;

function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

module.exports = {
  PI,
  add,
  multiply
};

// 或逐个导出
exports.subtract = (a, b) => a - b;

// 导入 - require
const math = require('./math');
console.log(math.add(1, 2)); // 3
console.log(math.PI); // 3.14159

// 动态导入
if (condition) {
  const dynamicModule = require('./dynamic');
}

// 值的拷贝示例
// counter.js
let count = 0;
function increment() {
  count++;
}
module.exports = { count, increment };

// main.js
const counter = require('./counter');
console.log(counter.count); // 0
counter.increment();
console.log(counter.count); // 0 (不会改变)`,
      },
      {
        language: 'javascript',
        description: 'ES6 Module',
        code: `// 导出 - export
// math.js
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// 默认导出
export default class Calculator {
  // ...
}

// 导入 - import
import { add, multiply, PI } from './math.js';
import Calculator from './math.js';
import * as math from './math.js';

console.log(add(1, 2)); // 3
console.log(PI); // 3.14159

// 动态导入
async function loadModule() {
  const module = await import('./dynamic.js');
  module.doSomething();
}

// 值的引用示例
// counter.js
export let count = 0;
export function increment() {
  count++;
}

// main.js
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1 (实时更新)`,
      },
    ],
    references: [
      'ES6标准入门 - Module',
      'JavaScript模块化七日谈',
    ],
    createdAt: '2024-02-01',
  },
  {
    id: 'eng-002',
    category: 'engineering',
    questionType: 'theory',
    title: 'Git工作流程和分支管理',
    difficulty: 'medium',
    tags: ['Git', '版本控制', '分支管理', '工作流'],
    question: '请介绍常见的Git工作流程，包括Git Flow、GitHub Flow等，以及分支管理最佳实践。',
    answer: `**常见Git工作流：**

1. **Git Flow**
   - master：生产环境分支
   - develop：开发分支
   - feature：功能分支
   - release：预发布分支
   - hotfix：紧急修复分支
   
   优点：流程清晰，适合版本发布
   缺点：分支较多，流程复杂

2. **GitHub Flow**
   - master：主分支，随时可部署
   - feature：从master创建，完成后合并回master
   
   优点：简单明了，适合持续部署
   缺点：不适合多版本并行

3. **GitLab Flow**
   - 结合Git Flow和GitHub Flow
   - 环境分支：production、staging、master

**分支命名规范：**
- feature/功能名
- bugfix/问题描述
- hotfix/紧急修复
- release/版本号

**最佳实践：**
1. 提交信息规范
2. 代码审查（Code Review）
3. 保护重要分支
4. 使用Pull Request
5. 及时同步和清理分支`,
    codeExamples: [
      {
        language: 'bash',
        description: 'Git Flow常用命令',
        code: `# 初始化Git Flow
git flow init

# 开始新功能
git flow feature start login

# 完成功能开发
git flow feature finish login

# 发布版本
git flow release start v1.0.0
git flow release finish v1.0.0

# 紧急修复
git flow hotfix start critical-bug
git flow hotfix finish critical-bug`,
      },
      {
        language: 'bash',
        description: 'GitHub Flow工作流',
        code: `# 创建功能分支
git checkout -b feature/login

# 开发并提交
git add .
git commit -m "feat: add login feature"

# 推送到远程
git push origin feature/login

# 在GitHub上创建Pull Request
# 代码审查通过后合并

# 合并后删除分支
git checkout master
git pull origin master
git branch -d feature/login
git push origin --delete feature/login

# 提交信息规范
# feat: 新功能
# fix: 修复bug
# docs: 文档修改
# style: 代码格式修改
# refactor: 代码重构
# test: 测试相关
# chore: 构建/工具相关`,
      },
    ],
    references: [
      'Pro Git - 分支管理',
      'Git Flow工作流程',
    ],
    createdAt: '2024-02-02',
  },
  {
    id: 'eng-003',
    category: 'engineering',
    questionType: 'theory',
    title: '前端工程化和自动化构建',
    difficulty: 'medium',
    tags: ['工程化', '自动化', 'CI/CD', '脚手架'],
    question: '请介绍前端工程化的内容，包括脚手架、自动化构建、CI/CD等。',
    answer: `**前端工程化内容：**

1. **脚手架工具**
   - create-react-app
   - Vue CLI
   - Vite
   - 自定义脚手架

2. **自动化构建**
   - 代码转换（ES6+、TypeScript）
   - 资源压缩
   - 代码分割
   - 自动刷新

3. **代码规范**
   - ESLint：JavaScript代码检查
   - Prettier：代码格式化
   - Stylelint：CSS代码检查
   - Husky：Git Hooks
   - lint-staged：暂存区代码检查

4. **自动化测试**
   - 单元测试：Jest、Mocha
   - E2E测试：Cypress、Playwright
   - 测试覆盖率

5. **CI/CD**
   - 持续集成：GitHub Actions、GitLab CI
   - 持续部署：自动化发布
   - 环境管理：开发、测试、生产

6. **文档和协作**
   - Storybook：组件文档
   - Swagger：API文档
   - 代码审查`,
    codeExamples: [
      {
        language: 'yaml',
        description: 'GitHub Actions CI配置',
        code: `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Build
      run: npm run build
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Deploy to staging
      if: github.ref == 'refs/heads/develop'
      run: |
        # 部署到测试环境
        npm run deploy:staging
    
    - name: Deploy to production
      if: github.ref == 'refs/heads/main'
      run: |
        # 部署到生产环境
        npm run deploy:production`,
      },
      {
        language: 'json',
        description: '代码规范配置',
        code: `{
  "scripts": {
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write src/**/*.{js,jsx,ts,tsx,css,json}",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}`,
      },
    ],
    references: [
      '前端工程化最佳实践',
      'GitHub Actions文档',
    ],
    createdAt: '2024-02-03',
  },
];
