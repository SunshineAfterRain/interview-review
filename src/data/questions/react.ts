import { Question } from '../../types/question';

export const reactQuestions: Question[] = [
  {
    id: 'react-001',
    category: 'react',
    questionType: 'theory',
    title: 'React Hooks 原理及常用 Hooks',
    difficulty: 'hard',
    tags: ['Hooks', 'useState', 'useEffect', 'useRef'],
    question: '请解释 React Hooks 的工作原理，并介绍常用的 Hooks 及其使用场景。',
    answer: `**React Hooks 原理：**

Hooks 的核心原理是基于 Fiber 架构和链表结构：
1. 每个 Fiber 节点都有一个 memoizedState 属性，存储该组件的 hooks 链表
2. Hooks 按照调用顺序以链表形式存储
3. 每次渲染时，React 按照相同的顺序遍历 hooks 链表
4. 这就是为什么 Hooks 必须在顶层调用，不能在条件语句中使用

**常用 Hooks：**

1. **useState** - 状态管理
2. **useEffect** - 副作用处理
3. **useContext** - 上下文消费
4. **useReducer** - 复杂状态逻辑
5. **useCallback** - 函数缓存
6. **useMemo** - 值缓存
7. **useRef** - 引用保存
8. **useLayoutEffect** - 同步副作用

**Hooks 使用规则：**
1. 只在顶层调用 Hooks
2. 只在 React 函数中调用 Hooks
3. 使用 ESLint 插件确保规则`,
    codeExamples: [
      {
        language: 'typescript',
        description: '手写简易 useState',
        code: `/**
 * 手写简易 useState - 理解 Hooks 原理
 * 
 * 核心原理：
 * 1. Hooks 使用数组/链表按顺序存储状态
 * 2. 每次渲染时，按相同顺序读取状态
 * 3. 这就是为什么 Hooks 不能在条件语句中使用
 */

// 模拟 React 的状态存储
let state: any[] = [];  // 存储所有状态的数组
let index = 0;          // 当前 hooks 索引

/**
 * 简易 useState 实现
 * @param initialValue 初始值
 * @returns [当前状态, 更新函数]
 */
function myUseState<T>(initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // 保存当前索引，然后递增
  // 这样下次调用 myUseState 会使用下一个位置
  const currentIndex = index;
  index++;
  
  // 初始化：如果是第一次调用，存入初始值
  if (state[currentIndex] === undefined) {
    state[currentIndex] = initialValue;
  }
  
  // setState 函数：更新状态并触发重渲染
  const setState = (newValue: T | ((prev: T) => T)) => {
    // 支持函数式更新：setState(prev => prev + 1)
    if (typeof newValue === 'function') {
      state[currentIndex] = (newValue as Function)(state[currentIndex]);
    } else {
      state[currentIndex] = newValue;
    }
    // 触发重新渲染
    render();
  };
  
  return [state[currentIndex], setState];
}

// 使用示例
function Counter() {
  // 第一次调用：index = 0，存入 count 的初始值 0
  const [count, setCount] = myUseState(0);
  // 第二次调用：index = 1，存入 name 的初始值 'React'
  const [name, setName] = myUseState('React');
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(c => c + 1)}>函数式更新+1</button>
      <p>Name: {name}</p>
      <input 
        value={name} 
        onChange={e => setName(e.target.value)} 
      />
    </div>
  );
}

// 渲染函数：每次渲染前重置索引
function render() {
  index = 0; // 重要：重置索引，确保每次渲染按相同顺序读取状态
  ReactDOM.render(<Counter />, document.getElementById('root'));
}

/**
 * 为什么不能在条件语句中使用 Hooks？
 * 
 * 错误示例：
 * if (condition) {
 *   const [count, setCount] = myUseState(0); // 有时调用，有时不调用
 * }
 * 
 * 问题：条件语句会导致 Hooks 调用顺序不一致
 * - 第一次渲染：condition=true，count 存在 index=0
 * - 第二次渲染：condition=false，跳过这个 Hook
 * - 后续 Hooks 的索引全部错位，状态混乱
 */`,
      },
      {
        language: 'typescript',
        description: '常用 Hooks 示例',
        code: `import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  useReducer,
  useContext,
  createContext 
} from 'react';

/**
 * useState - 状态管理
 * 最基础的 Hook，用于在函数组件中添加状态
 */
function useStateExample() {
  // 基础用法
  const [count, setCount] = useState(0);
  
  // 惰性初始化：初始值通过函数计算，只执行一次
  const [data, setData] = useState(() => {
    // 复杂计算只会在首次渲染时执行
    const saved = localStorage.getItem('data');
    return saved ? JSON.parse(saved) : { name: 'default' };
  });
  
  // 函数式更新：基于前一个状态更新
  const increment = () => setCount(prev => prev + 1);
  
  return { count, setCount, data, setData, increment };
}

/**
 * useEffect - 副作用处理
 * 用于处理副作用：数据获取、订阅、DOM操作等
 */
function useEffectExample() {
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState(1);
  
  // 1. 每次渲染后都执行
  useEffect(() => {
    console.log('组件渲染了');
  });
  
  // 2. 只在挂载时执行一次（空依赖数组）
  useEffect(() => {
    console.log('组件挂载了');
    // 清理函数：组件卸载时执行
    return () => {
      console.log('组件卸载了');
    };
  }, []);
  
  // 3. 依赖变化时执行
  useEffect(() => {
    // 模拟 API 请求
    const fetchData = async () => {
      const response = await fetch(\`/api/users/\${userId}\`);
      const data = await response.json();
      console.log(data);
    };
    fetchData();
    
    // 清理函数：下次 effect 执行前或卸载时执行
    return () => {
      console.log('清理上一次 effect');
    };
  }, [userId]); // 只在 userId 变化时重新执行
  
  return { count, setCount, userId, setUserId };
}

/**
 * useRef - 引用保存
 * 1. 获取 DOM 元素引用
 * 2. 保存可变值（修改不触发重渲染）
 */
function useRefExample() {
  // 获取 DOM 引用
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 保存可变值（类似类组件的实例属性）
  const renderCount = useRef(0);
  const previousValue = useRef<string>();
  
  // 记录渲染次数
  useEffect(() => {
    renderCount.current += 1;
  });
  
  // 保存前一个值
  const [value, setValue] = useState('');
  useEffect(() => {
    previousValue.current = value;
  }, [value]);
  
  const focusInput = () => {
    // 访问 DOM 元素
    inputRef.current?.focus();
  };
  
  return { inputRef, focusInput, renderCount, previousValue, value, setValue };
}

/**
 * useMemo - 缓存计算结果
 * 避免每次渲染都重新计算
 */
function useMemoExample({ items, filter }: { items: string[], filter: string }) {
  // 缓存计算结果，只在依赖变化时重新计算
  const filteredItems = useMemo(() => {
    console.log('重新计算过滤结果');
    return items.filter(item => item.includes(filter));
  }, [items, filter]);
  
  // 缓存复杂对象，避免引用变化
  const config = useMemo(() => ({
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000,
    retries: 3
  }), []); // 空依赖：对象永远不会改变
  
  return { filteredItems, config };
}

/**
 * useCallback - 缓存函数
 * 避免函数引用变化导致子组件重渲染
 */
function useCallbackExample() {
  const [count, setCount] = useState(0);
  
  // 不使用 useCallback：每次渲染都创建新函数
  const handleClickBad = () => setCount(count + 1);
  
  // 使用 useCallback：缓存函数引用
  const handleClick = useCallback(() => {
    setCount(c => c + 1); // 使用函数式更新，不依赖 count
  }, []); // 空依赖：函数永远不会改变
  
  // 带依赖的 useCallback
  const handleClickWithDeps = useCallback((value: number) => {
    setCount(count + value);
  }, [count]); // count 变化时，函数会更新
  
  return { count, handleClick, handleClickWithDeps };
}

/**
 * useReducer - 复杂状态管理
 * 适合：状态逻辑复杂、多个子值、下一个状态依赖前一个状态
 */
type State = { count: number };
type Action = 
  | { type: 'increment' } 
  | { type: 'decrement' } 
  | { type: 'reset'; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: action.payload };
    default:
      throw new Error('Unknown action');
  }
}

function useReducerExample() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset', payload: 0 })}>
        Reset
      </button>
    </div>
  );
}

/**
 * useContext - 上下文消费
 * 跨组件共享数据，避免 prop drilling
 */
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

function useContextExample() {
  // 直接获取 Context 值
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <div className={\`theme-\${theme}\`}>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}`,
      },
    ],
    references: [
      'React官方文档 - Hooks',
      '深入理解 React Hooks 原理',
    ],
    createdAt: '2024-01-21',
  },
  {
    id: 'react-002',
    category: 'react',
    questionType: 'theory',
    title: '虚拟DOM和Diff算法原理',
    difficulty: 'hard',
    tags: ['虚拟DOM', 'Diff算法', 'Fiber', '协调'],
    question: '请解释React的虚拟DOM是什么？Diff算法的原理和优化策略是什么？',
    answer: `**虚拟DOM（Virtual DOM）：**

虚拟DOM是用JavaScript对象描述真实DOM的树形结构：
- type: 元素类型
- props: 属性
- children: 子元素

**为什么需要虚拟DOM：**
1. 跨平台：可以渲染到不同平台（浏览器、原生应用、Canvas）
2. 批量更新：多次修改合并为一次更新
3. 性能优化：通过Diff算法最小化DOM操作

**Diff 算法策略：**

React 采用同层比较策略，时间复杂度 O(n)：

1. **Tree Diff**
   - 只比较同一层级的节点
   - 跨层级移动视为删除+创建

2. **Component Diff**
   - 同类型组件：继续比较虚拟DOM树
   - 不同类型组件：直接替换整个组件

3. **Element Diff**
   - 同一层级的节点通过唯一 key 标识
   - 通过 key 判断节点是否可复用

**Fiber 架构：**
- 可中断的增量式更新
- 优先级调度
- 时间切片`,
    codeExamples: [
      {
        language: 'javascript',
        description: '虚拟DOM结构',
        code: `// 虚拟DOM对象
const vnode = {
  type: 'div',
  props: {
    id: 'container',
    className: 'wrapper',
    style: { color: 'red' }
  },
  children: [
    {
      type: 'h1',
      props: {},
      children: 'Hello React'
    },
    {
      type: 'ul',
      props: {},
      children: [
        {
          type: 'li',
          props: { key: '1' },
          children: 'Item 1'
        },
        {
          type: 'li',
          props: { key: '2' },
          children: 'Item 2'
        }
      ]
    }
  ]
};

// 对应的真实DOM
// <div id="container" class="wrapper" style="color: red">
//   <h1>Hello React</h1>
//   <ul>
//     <li>Item 1</li>
//     <li>Item 2</li>
//   </ul>
// </div>`,
      },
      {
        language: 'javascript',
        description: '简易Diff算法实现',
        code: `function diff(oldNode, newNode) {
  // 节点类型不同，直接替换
  if (oldNode.type !== newNode.type) {
    return {
      type: 'REPLACE',
      newNode
    };
  }
  
  // 文本节点
  if (typeof oldNode === 'string' || typeof newNode === 'string') {
    if (oldNode !== newNode) {
      return {
        type: 'TEXT',
        newText: newNode
      };
    }
    return null;
  }
  
  // 属性变化
  const propsPatches = diffProps(oldNode.props, newNode.props);
  
  // 子节点变化
  const childrenPatches = diffChildren(
    oldNode.children, 
    newNode.children
  );
  
  if (propsPatches || childrenPatches.length > 0) {
    return {
      type: 'UPDATE',
      props: propsPatches,
      children: childrenPatches
    };
  }
  
  return null;
}

function diffChildren(oldChildren, newChildren) {
  const patches = [];
  const maxLength = Math.max(oldChildren.length, newChildren.length);
  
  for (let i = 0; i < maxLength; i++) {
    const patch = diff(oldChildren[i], newChildren[i]);
    if (patch) {
      patches.push({ index: i, patch });
    }
  }
  
  return patches;
}

function diffProps(oldProps = {}, newProps = {}) {
  const patches = {};
  let isChanged = false;
  
  // 检查新属性
  for (const key in newProps) {
    if (oldProps[key] !== newProps[key]) {
      patches[key] = newProps[key];
      isChanged = true;
    }
  }
  
  // 检查删除的属性
  for (const key in oldProps) {
    if (!(key in newProps)) {
      patches[key] = null;
      isChanged = true;
    }
  }
  
  return isChanged ? patches : null;
}`,
      },
    ],
    references: [
      'React官方文档 - 协调',
      '深入理解 React Fiber 架构',
    ],
    createdAt: '2024-01-22',
  },
  {
    id: 'react-003',
    category: 'react',
    questionType: 'theory',
    title: 'React性能优化策略',
    difficulty: 'medium',
    tags: ['性能优化', 'memo', 'useMemo', 'useCallback', '虚拟列表'],
    question: '请介绍React应用中常见的性能优化策略，包括组件优化、渲染优化等。',
    answer: `**React 性能优化策略：**

1. **组件级别优化**
   - React.memo：避免不必要的重新渲染
   - PureComponent：类组件的浅比较优化
   - shouldComponentUpdate：自定义更新逻辑

2. **数据优化**
   - useMemo：缓存计算结果
   - useCallback：缓存函数引用
   - 状态下沉：减少状态提升范围

3. **列表优化**
   - 使用稳定的 key
   - 虚拟列表（react-window、react-virtualized）
   - 分页加载

4. **代码分割**
   - React.lazy + Suspense
   - 动态 import()
   - 路由级别分割

5. **其他优化**
   - 避免内联函数和对象
   - 合理使用 Context
   - 使用 React DevTools 分析`,
    codeExamples: [
      {
        language: 'typescript',
        description: 'React.memo 和 useMemo 使用',
        code: `import React, { memo, useMemo, useCallback } from 'react';

// React.memo - 避免子组件不必要的渲染
const ChildComponent = memo(({ data, onClick }) => {
  console.log('Child render');
  return (
    <div onClick={onClick}>
      {data.name} - {data.age}
    </div>
  );
});

function ParentComponent() {
  const [count, setCount] = React.useState(0);
  const [name, setName] = React.useState('React');
  
  // useMemo - 缓存对象，避免每次创建新引用
  const data = useMemo(() => ({
    name,
    age: 18
  }), [name]);
  
  // useCallback - 缓存函数，避免每次创建新引用
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      <ChildComponent data={data} onClick={handleClick} />
    </div>
  );
}`,
      },
      {
        language: 'typescript',
        description: '虚拟列表实现',
        code: `import React, { useState, useRef, useEffect } from 'react';

interface VirtualListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
}

function VirtualList({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem 
}: VirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 计算可见区域的起始索引
  const startIndex = Math.floor(scrollTop / itemHeight);
  
  // 可见项数量
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  
  // 结束索引（多渲染几个作为缓冲）
  const endIndex = Math.min(
    startIndex + visibleCount + 5, 
    items.length
  );
  
  // 可见项
  const visibleItems = items.slice(
    Math.max(0, startIndex - 5), 
    endIndex
  );
  
  // 总高度
  const totalHeight = items.length * itemHeight;
  
  // 偏移量
  const offsetY = Math.max(0, (startIndex - 5) * itemHeight);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };
  
  return (
    <div
      ref={containerRef}
      style={{ 
        height: containerHeight, 
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight }}>
        <div style={{ 
          transform: \`translateY(\${offsetY}px)\` 
        }}>
          {visibleItems.map((item, index) => (
            <div 
              key={startIndex - 5 + index} 
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex - 5 + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 使用示例
function App() {
  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    text: \`Item \${i}\`
  }));
  
  return (
    <VirtualList
      items={items}
      itemHeight={50}
      containerHeight={500}
      renderItem={(item) => (
        <div style={{ 
          padding: '10px', 
          borderBottom: '1px solid #ccc' 
        }}>
          {item.text}
        </div>
      )}
    />
  );
}`,
      },
      {
        language: 'typescript',
        description: '代码分割',
        code: `import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 懒加载组件
const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Dashboard = lazy(() => import('./Dashboard'));

// 加载组件
function Loading() {
  return <div>Loading...</div>;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// 预加载
const preloadDashboard = () => {
  import('./Dashboard');
};

function Home() {
  return (
    <div>
      <h1>Home</h1>
      <button 
        onClick={preloadDashboard}
        onMouseEnter={preloadDashboard}
      >
        Go to Dashboard
      </button>
    </div>
  );
}`,
      },
    ],
    references: [
      'React官方文档 - 性能优化',
      'React性能优化最佳实践',
    ],
    createdAt: '2024-01-23',
  },
  {
    id: 'react-004',
    category: 'react',
    questionType: 'theory',
    title: 'React状态管理方案',
    difficulty: 'medium',
    tags: ['状态管理', 'Redux', 'Context', 'Zustand'],
    question: '请比较React中不同的状态管理方案（Context、Redux、MobX、Zustand等），各自的优缺点和使用场景。',
    answer: `**状态管理方案对比：**

1. **Context API**
   - 优点：内置API，无需额外依赖，简单易用
   - 缺点：性能问题（任何值变化都会导致所有消费者重新渲染）
   - 适用：小型应用、低频更新的状态

2. **Redux**
   - 优点：可预测、单一数据源、强大的中间件、时间旅行调试
   - 缺点：样板代码多、学习曲线陡峭
   - 适用：大型应用、复杂状态逻辑

3. **MobX**
   - 优点：响应式编程、自动追踪依赖、代码简洁
   - 缺点：概念多、调试困难
   - 适用：面向对象风格的项目

4. **Zustand**
   - 优点：极简API、无样板代码、TypeScript友好、支持中间件
   - 缺点：社区相对较小
   - 适用：中小型应用、追求简洁的项目

5. **Recoil / Jotai**
   - 优点：原子化状态、细粒度更新、React风格
   - 缺点：概念新颖、学习成本
   - 适用：需要细粒度状态管理的应用`,
    codeExamples: [
      {
        language: 'typescript',
        description: 'Context API 使用',
        code: `import React, { createContext, useContext, useReducer } from 'react';

// 创建 Context
const StateContext = createContext(null);
const DispatchContext = createContext(null);

// Reducer
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

// Provider
function StateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// 自定义 Hooks
function useState() {
  const context = useContext(StateContext);
  if (!context) throw new Error('useState must be used within Provider');
  return context;
}

function useDispatch() {
  const context = useContext(DispatchContext);
  if (!context) throw new Error('useDispatch must be used within Provider');
  return context;
}

// 使用
function Counter() {
  const state = useState();
  const dispatch = useDispatch();
  
  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  );
}`,
      },
      {
        language: 'typescript',
        description: 'Zustand 使用',
        code: `import create from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// 创建 store
const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        // 状态
        count: 0,
        todos: [],
        
        // Actions
        increment: () => set(state => ({ count: state.count + 1 })),
        decrement: () => set(state => ({ count: state.count - 1 })),
        
        addTodo: (text) => set(state => ({
          todos: [...state.todos, { 
            id: Date.now(), 
            text, 
            completed: false 
          }]
        })),
        
        toggleTodo: (id) => set(state => ({
          todos: state.todos.map(todo =>
            todo.id === id 
              ? { ...todo, completed: !todo.completed }
              : todo
          )
        })),
        
        // 异步 Action
        fetchTodos: async () => {
          const response = await fetch('/api/todos');
          const todos = await response.json();
          set({ todos });
        },
        
        // 计算属性
        getCompletedTodos: () => {
          return get().todos.filter(todo => todo.completed);
        }
      }),
      { name: 'todo-storage' } // localStorage key
    )
  )
);

// 使用
function TodoApp() {
  const { 
    todos, 
    addTodo, 
    toggleTodo,
    count,
    increment 
  } = useStore();
  
  const completedTodos = useStore(state => 
    state.todos.filter(t => t.completed)
  );
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
      
      <button onClick={() => addTodo('New Todo')}>
        Add Todo
      </button>
      
      {todos.map(todo => (
        <div 
          key={todo.id}
          onClick={() => toggleTodo(todo.id)}
          style={{ 
            textDecoration: todo.completed 
              ? 'line-through' 
              : 'none' 
          }}
        >
          {todo.text}
        </div>
      ))}
    </div>
  );
}`,
      },
    ],
    references: [
      'React官方文档 - Context',
      'Redux官方文档',
      'Zustand官方文档',
    ],
    createdAt: '2024-01-24',
  },
  {
    id: 'react-005',
    category: 'react',
    questionType: 'theory',
    title: 'React组件通信方式',
    difficulty: 'medium',
    tags: ['组件通信', 'Props', 'Context', '事件总线'],
    question: '请列举React中组件通信的各种方式，并说明各自的适用场景。',
    answer: `**React 组件通信方式：**

1. **父子通信**
   - Props 传递
   - 最基本的方式

2. **子父通信**
   - 回调函数
   - 自定义事件

3. **兄弟通信**
   - 状态提升
   - 共同父组件中转

4. **跨层级通信**
   - Context API
   - 全局状态管理（Redux、Zustand）

5. **任意组件通信**
   - 事件总线（EventEmitter）
   - 观察者模式
   - 全局状态管理

**选择建议：**
- 简单父子关系：Props + 回调
- 跨多层组件：Context
- 复杂应用：Redux / Zustand
- 非相关组件：事件总线`,
    codeExamples: [
      {
        language: 'typescript',
        description: '父子组件通信',
        code: `// 父传子：Props
interface ChildProps {
  name: string;
  age: number;
  onUpdate: (newAge: number) => void;
}

function Child({ name, age, onUpdate }: ChildProps) {
  return (
    <div>
      <p>Name: {name}</p>
      <p>Age: {age}</p>
      <button onClick={() => onUpdate(age + 1)}>
        Update Age
      </button>
    </div>
  );
}

function Parent() {
  const [age, setAge] = useState(18);
  
  return (
    <Child 
      name="React" 
      age={age} 
      onUpdate={setAge}
    />
  );
}`,
      },
      {
        language: 'typescript',
        description: '跨层级通信 - Context',
        code: `import React, { createContext, useContext } from 'react';

// 创建 Context
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

// Provider 组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState('light');
  
  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 深层子组件直接使用
function DeepChild() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <div style={{ 
      background: theme === 'light' ? '#fff' : '#333',
      color: theme === 'light' ? '#333' : '#fff'
    }}>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

// 使用
function App() {
  return (
    <ThemeProvider>
      <div>
        <DeepChild />
      </div>
    </ThemeProvider>
  );
}`,
      },
      {
        language: 'typescript',
        description: '事件总线',
        code: `// EventEmitter 实现
class EventEmitter {
  private events: { [key: string]: Function[] } = {};
  
  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // 返回取消订阅函数
    return () => {
      this.events[event] = this.events[event]
        .filter(cb => cb !== callback);
    };
  }
  
  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }
  
  off(event: string, callback?: Function) {
    if (!callback) {
      delete this.events[event];
    } else {
      this.events[event] = this.events[event]
        .filter(cb => cb !== callback);
    }
  }
}

// 全局事件总线
const eventBus = new EventEmitter();

// 组件A：发送事件
function ComponentA() {
  const sendMessage = () => {
    eventBus.emit('message', {
      text: 'Hello from A',
      timestamp: Date.now()
    });
  };
  
  return <button onClick={sendMessage}>Send Message</button>;
}

// 组件B：接收事件
function ComponentB() {
  const [messages, setMessages] = React.useState([]);
  
  React.useEffect(() => {
    const unsubscribe = eventBus.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    
    // 清理
    return unsubscribe;
  }, []);
  
  return (
    <div>
      {messages.map((msg, i) => (
        <p key={i}>{msg.text}</p>
      ))}
    </div>
  );
}`,
      },
    ],
    references: [
      'React官方文档 - 组件通信',
      'React设计模式',
    ],
    createdAt: '2024-01-25',
  },
];
