import { Question } from '../../types/question';

export const resumeBasedQuestions: Question[] = [
  {
    id: 'resume-001',
    category: 'performance',
    questionType: 'theory',
    title: 'SSE流式交互与大模型应用',
    difficulty: 'hard',
    tags: ['SSE', '流式传输', '大模型', '实时通信'],
    question: '你提到在AI辅助编程工具中基于SSE实现大模型流式输出，请详细说明：1）SSE相比WebSocket的优劣势？2）如何设计断线重连和心跳检测机制？3）如何实现"打字机"效果并避免UI阻塞？',
    answer: `**SSE vs WebSocket 对比：**

**SSE优势：**
1. 协议简单，基于HTTP，无需额外握手
2. 自动重连机制（浏览器原生支持）
3. 适合服务器单向推送场景
4. 兼容性好，支持IE9+

**SSE劣势：**
1. 只能单向通信（服务器→客户端）
2. 二进制数据支持较弱
3. 连接数限制（浏览器同域限制6个）

**WebSocket优势：**
1. 全双工通信
2. 支持二进制数据
3. 更低的延迟
4. 更灵活的协议控制

**断线重连和心跳检测设计：**

1. **心跳机制**
   - 客户端定时发送心跳包
   - 服务器响应心跳确认
   - 超时未响应触发重连

2. **断线重连策略**
   - 指数退避算法
   - 最大重连次数限制
   - 重连失败提示用户

3. **状态恢复**
   - 保存已接收的数据位置
   - 重连后从断点继续
   - 避免数据重复或丢失

**"打字机"效果实现：**

1. **数据流处理**
   - 逐字符接收并缓存
   - 使用requestAnimationFrame控制渲染节奏
   - 避免频繁setState导致性能问题

2. **UI阻塞优化**
   - 使用虚拟DOM批量更新
   - 文本分段渲染
   - 支持中断和暂停`,
    codeExamples: [
      {
        language: 'typescript',
        description: 'SSE客户端实现',
        code: `class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatTimer: number | null = null;
  private lastEventId: string = '';
  
  connect(url: string) {
    this.eventSource = new EventSource(url);
    
    this.eventSource.onmessage = (event) => {
      this.lastEventId = event.lastEventId;
      this.reconnectAttempts = 0; // 重置重连计数
      
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.eventSource.onerror = (error) => {
      console.error('SSE连接错误:', error);
      this.reconnect(url);
    };
    
    this.startHeartbeat();
  }
  
  private startHeartbeat() {
    this.heartbeatTimer = window.setInterval(() => {
      // 发送心跳请求
      fetch('/api/heartbeat', {
        method: 'POST',
        body: JSON.stringify({ lastEventId: this.lastEventId })
      }).catch(err => {
        console.error('心跳失败:', err);
      });
    }, 30000); // 30秒心跳
  }
  
  private reconnect(url: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('达到最大重连次数');
      this.disconnect();
      return;
    }
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    
    setTimeout(() => {
      console.log(\`尝试重连 (\${this.reconnectAttempts}/\${this.maxReconnectAttempts})\`);
      this.connect(url);
    }, delay);
  }
  
  private handleMessage(data: any) {
    // 处理接收到的数据
    console.log('收到消息:', data);
  }
  
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}`,
      },
      {
        language: 'typescript',
        description: '打字机效果实现',
        code: `import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

function Typewriter({ text, speed = 50, onComplete }: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    if (!text) return;
    
    setIsTyping(true);
    indexRef.current = 0;
    setDisplayText('');
    
    const type = () => {
      if (indexRef.current < text.length) {
        setDisplayText(prev => prev + text[indexRef.current]);
        indexRef.current++;
        animationRef.current = requestAnimationFrame(() => {
          setTimeout(type, speed);
        });
      } else {
        setIsTyping(false);
        onComplete?.();
      }
    };
    
    type();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [text, speed, onComplete]);
  
  return (
    <div>
      {displayText}
      {isTyping && <span className="cursor">|</span>}
    </div>
  );
}

// 流式文本渲染组件
function StreamingText({ stream }: { stream: ReadableStream }) {
  const [text, setText] = useState('');
  const bufferRef = useRef('');
  const renderTimerRef = useRef<number>();
  
  useEffect(() => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    
    const processStream = async () => {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        bufferRef.current += decoder.decode(value, { stream: true });
        
        // 批量更新，避免频繁渲染
        if (!renderTimerRef.current) {
          renderTimerRef.current = window.setTimeout(() => {
            setText(bufferRef.current);
            renderTimerRef.current = undefined;
          }, 16); // 约60fps
        }
      }
    };
    
    processStream();
    
    return () => {
      if (renderTimerRef.current) {
        clearTimeout(renderTimerRef.current);
      }
    };
  }, [stream]);
  
  return <div>{text}</div>;
}`,
      },
    ],
    references: [
      'MDN - Server-sent events',
      '大模型流式输出最佳实践',
    ],
    createdAt: '2024-02-04',
  },
  {
    id: 'resume-002',
    category: 'performance',
    questionType: 'theory',
    title: '虚拟滚动与海量数据渲染优化',
    difficulty: 'hard',
    tags: ['虚拟滚动', '性能优化', 'react-window', '大数据渲染'],
    question: '你在DevFlow平台中处理10万行日志渲染，采用虚拟滚动方案将内存占用降低80%。请详细说明：1）虚拟滚动的实现原理？2）如何处理动态高度的列表项？3）如何实现日志搜索和高亮功能？',
    answer: `**虚拟滚动原理：**

虚拟滚动通过只渲染可视区域内的元素，大幅减少DOM节点数量：

1. **核心概念**
   - 可视区域（Viewport）：用户当前能看到的部分
   - 缓冲区：额外渲染的部分，避免滚动时出现白屏
   - 总高度容器：撑开滚动条
   - 偏移量：动态调整渲染位置

2. **实现步骤**
   - 计算可视区域能容纳的项数
   - 监听滚动事件，计算起始索引
   - 只渲染可视区域+缓冲区的项
   - 使用transform调整位置

**动态高度处理：**

1. **预估高度法**
   - 先使用预估高度计算
   - 渲染后测量真实高度
   - 更新位置缓存

2. **位置映射表**
   - 维护每个项的位置信息
   - 二分查找快速定位
   - 动态更新映射表

**日志搜索和高亮：**

1. **搜索算法**
   - 字符串匹配（KMP、Boyer-Moore）
   - 索引优化（倒排索引）
   - 模糊搜索（正则、Levenshtein距离）

2. **高亮实现**
   - 虚拟DOM diff避免全量重渲染
   - 使用dangerouslySetInnerHTML或组件
   - 滚动到第一个匹配项`,
    codeExamples: [
      {
        language: 'typescript',
        description: '虚拟滚动实现（支持动态高度）',
        interactiveDemo: 'virtual-scroll',
        code: `import React, { useState, useRef, useEffect, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  estimatedItemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T, index: number) => string | number;
}

interface ItemPosition {
  index: number;
  offset: number;
  height: number;
}

function VirtualList<T>({
  items,
  estimatedItemHeight,
  containerHeight,
  renderItem,
  getItemKey,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeights = useRef<Map<number, number>>(new Map());
  const positionCache = useRef<ItemPosition[]>([]);
  
  // 计算所有项的位置
  const positions = useMemo(() => {
    const cache: ItemPosition[] = [];
    let offset = 0;
    
    for (let i = 0; i < items.length; i++) {
      const height = itemHeights.current.get(i) || estimatedItemHeight;
      cache.push({ index: i, offset, height });
      offset += height;
    }
    
    positionCache.current = cache;
    return cache;
  }, [items, estimatedItemHeight]);
  
  // 总高度
  const totalHeight = positions.length > 0 
    ? positions[positions.length - 1].offset + positions[positions.length - 1].height 
    : 0;
  
  // 二分查找起始索引
  const findStartIndex = (scrollOffset: number): number => {
    let low = 0;
    let high = positions.length - 1;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const pos = positions[mid];
      
      if (pos.offset + pos.height < scrollOffset) {
        low = mid + 1;
      } else if (pos.offset > scrollOffset) {
        high = mid - 1;
      } else {
        return mid;
      }
    }
    
    return low;
  };
  
  // 计算可见项
  const visibleItems = useMemo(() => {
    const bufferSize = 5; // 缓冲区大小
    const startIndex = Math.max(0, findStartIndex(scrollTop) - bufferSize);
    const endIndex = Math.min(
      items.length - 1,
      findStartIndex(scrollTop + containerHeight) + bufferSize
    );
    
    return items.slice(startIndex, endIndex + 1).map((item, i) => {
      const actualIndex = startIndex + i;
      const pos = positions[actualIndex];
      return {
        item,
        index: actualIndex,
        key: getItemKey(item, actualIndex),
        offset: pos?.offset || 0,
        height: pos?.height || estimatedItemHeight,
      };
    });
  }, [items, scrollTop, containerHeight, positions, estimatedItemHeight]);
  
  // 测量实际高度
  const measureItem = (index: number, height: number) => {
    if (itemHeights.current.get(index) !== height) {
      itemHeights.current.set(index, height);
    }
  };
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };
  
  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, key, offset, height }) => (
          <div
            key={key}
            style={{
              position: 'absolute',
              top: offset,
              width: '100%',
            }}
            ref={(el) => {
              if (el) {
                const measuredHeight = el.getBoundingClientRect().height;
                if (measuredHeight !== height) {
                  measureItem(index, measuredHeight);
                }
              }
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}`,
      },
      {
        language: 'typescript',
        description: '动态高度虚拟滚动 + WebSocket实时日志 + 搜索高亮',
        interactiveDemo: 'log-search',
        code: `// 使用独立的demo组件
import { LogSearchDemo } from './components/demos/LogSearchDemo';

function App() {
  return <LogSearchDemo />;
}

// 或者查看完整实现：
// src/components/demos/LogSearchDemo.tsx
// 
// 功能特性：
// - 动态高度虚拟滚动（消息长度1-5行随机）
// - WebSocket实时推送模拟
// - 自动滚动到最新消息
// - 实时搜索和高亮
// - 内存占用优化（90%+节省）
// - 二分查找快速定位`,
      },
    ],
    references: [
      'react-window官方文档',
      '虚拟滚动实现原理',
    ],
    createdAt: '2024-02-05',
  },
  {
    id: 'resume-003',
    category: 'engineering',
    questionType: 'theory',
    title: '低代码平台架构设计',
    difficulty: 'hard',
    tags: ['低代码', 'LowCode Engine', '可视化搭建', '插件化'],
    question: '你提到基于LowCode Engine二次开发可视化活动搭建平台，请详细说明：1）低代码平台的核心架构设计？2）如何设计插件化物料体系？3）如何实现拖拽解析器和属性配置面板？',
    answer: `**低代码平台核心架构：**

1. **设计器层**
   - 画布：可视化编辑区域
   - 物料面板：组件库
   - 属性面板：配置组件属性
   - 大纲树：组件层级结构

2. **引擎层**
   - 渲染引擎：组件渲染
   - 拖拽引擎：交互处理
   - 状态管理：数据流控制
   - 历史管理：撤销重做

3. **协议层**
   - 组件描述协议
   - 页面描述协议
   - 属性配置协议

4. **运行时层**
   - 组件运行时
   - 数据源运行时
   - 事件运行时

**插件化物料体系：**

1. **物料描述**
   - 组件元数据
   - 属性配置schema
   - 事件定义
   - 数据绑定

2. **物料注册**
   - 动态加载机制
   - 依赖管理
   - 版本控制

3. **物料扩展**
   - 插件钩子
   - 自定义渲染器
   - 属性配置器

**拖拽解析器实现：**

1. **拖拽流程**
   - 拖拽开始：记录源组件
   - 拖拽过程：实时预览
   - 拖拽结束：更新树结构

2. **位置计算**
   - 坐标转换
   - 容器判断
   - 插入位置计算

3. **属性配置**
   - Schema驱动
   - 动态表单
   - 实时预览`,
    codeExamples: [
      {
        language: 'typescript',
        description: '低代码引擎核心架构',
        code: `// 组件描述协议
interface ComponentMeta {
  componentName: string;
  title: string;
  icon: string;
  group: string;
  props: PropSchema[];
  events?: EventSchema[];
  slots?: SlotSchema[];
}

interface PropSchema {
  name: string;
  title: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: any;
  setter: 'StringSetter' | 'NumberSetter' | 'SelectSetter' | 'JsonSetter';
  options?: Array<{ label: string; value: any }>;
}

// 页面描述协议
interface PageSchema {
  componentName: 'Page';
  props: Record<string, any>;
  children: NodeSchema[];
}

interface NodeSchema {
  id: string;
  componentName: string;
  props: Record<string, any>;
  children?: NodeSchema[];
  condition?: boolean;
  loop?: {
    open: boolean;
    data: any[];
    itemName: string;
  };
}

// 低代码引擎核心类
class LowCodeEngine {
  private schema: PageSchema;
  private selectedNode: NodeSchema | null = null;
  private history: PageSchema[] = [];
  private materials: Map<string, ComponentMeta> = new Map();
  
  // 注册物料
  registerMaterial(meta: ComponentMeta) {
    this.materials.set(meta.componentName, meta);
  }
  
  // 渲染页面
  renderPage(): React.ReactElement {
    return this.renderNode(this.schema);
  }
  
  // 递归渲染节点
  private renderNode(node: NodeSchema): React.ReactElement {
    const meta = this.materials.get(node.componentName);
    if (!meta) {
      return <div>Unknown component: {node.componentName}</div>;
    }
    
    const Component = this.getComponent(meta.componentName);
    const children = node.children?.map(child => this.renderNode(child));
    
    return (
      <Component key={node.id} {...node.props}>
        {children}
      </Component>
    );
  }
  
  // 拖拽处理
  handleDrop(dragNode: NodeSchema, targetId: string, position: 'before' | 'after' | 'inner') {
    this.saveHistory();
    
    // 从原位置移除
    this.removeNode(dragNode.id);
    
    // 插入到新位置
    this.insertNode(dragNode, targetId, position);
    
    this.emitChange();
  }
  
  // 插入节点
  private insertNode(node: NodeSchema, targetId: string, position: string) {
    const target = this.findNode(targetId);
    if (!target) return;
    
    if (position === 'inner') {
      target.children = target.children || [];
      target.children.push(node);
    } else {
      const parent = this.findParent(targetId);
      if (!parent || !parent.children) return;
      
      const index = parent.children.findIndex(c => c.id === targetId);
      const insertIndex = position === 'before' ? index : index + 1;
      parent.children.splice(insertIndex, 0, node);
    }
  }
  
  // 撤销
  undo() {
    const lastSchema = this.history.pop();
    if (lastSchema) {
      this.schema = lastSchema;
      this.emitChange();
    }
  }
  
  // 保存历史
  private saveHistory() {
    this.history.push(JSON.parse(JSON.stringify(this.schema)));
  }
  
  // 查找节点
  private findNode(id: string, node: NodeSchema = this.schema): NodeSchema | null {
    if (node.id === id) return node;
    
    if (node.children) {
      for (const child of node.children) {
        const found = this.findNode(id, child);
        if (found) return found;
      }
    }
    
    return null;
  }
  
  // 事件发射
  private emitChange() {
    this.listeners.forEach(listener => listener(this.schema));
  }
  
  private listeners: Array<(schema: PageSchema) => void> = [];
  
  onChange(listener: (schema: PageSchema) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }
}`,
      },
      {
        language: 'typescript',
        description: '属性配置面板',
        code: `import React from 'react';

interface PropertyPanelProps {
  node: NodeSchema;
  meta: ComponentMeta;
  onChange: (props: Record<string, any>) => void;
}

function PropertyPanel({ node, meta, onChange }: PropertyPanelProps) {
  const handlePropChange = (propName: string, value: any) => {
    onChange({
      ...node.props,
      [propName]: value,
    });
  };
  
  return (
    <div className="property-panel">
      <h3>{meta.title}</h3>
      
      {meta.props.map(prop => (
        <div key={prop.name} className="prop-item">
          <label>{prop.title}</label>
          
          {prop.setter === 'StringSetter' && (
            <input
              type="text"
              value={node.props[prop.name] || ''}
              onChange={(e) => handlePropChange(prop.name, e.target.value)}
            />
          )}
          
          {prop.setter === 'NumberSetter' && (
            <input
              type="number"
              value={node.props[prop.name] || 0}
              onChange={(e) => handlePropChange(prop.name, Number(e.target.value))}
            />
          )}
          
          {prop.setter === 'SelectSetter' && prop.options && (
            <select
              value={node.props[prop.name]}
              onChange={(e) => handlePropChange(prop.name, e.target.value)}
            >
              {prop.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          
          {prop.setter === 'JsonSetter' && (
            <textarea
              value={JSON.stringify(node.props[prop.name] || {}, null, 2)}
              onChange={(e) => {
                try {
                  const value = JSON.parse(e.target.value);
                  handlePropChange(prop.name, value);
                } catch (err) {
                  // JSON解析错误
                }
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}`,
      },
    ],
    references: [
      'LowCode Engine官方文档',
      '低代码平台架构设计',
    ],
    createdAt: '2024-02-06',
  },
  {
    id: 'resume-004',
    category: 'engineering',
    questionType: 'theory',
    title: 'WebSocket实时通信与弱网优化',
    difficulty: 'hard',
    tags: ['WebSocket', '实时通信', '弱网优化', '心跳保活'],
    question: '你在DevFlow平台中基于WebSocket构建日志流推送服务，请详细说明：1）WebSocket连接管理策略？2）如何设计指数退避重连策略？3）弱网环境下的优化方案？',
    answer: `**WebSocket连接管理：**

1. **连接状态管理**
   - CONNECTING：连接中
   - OPEN：已连接
   - CLOSING：关闭中
   - CLOSED：已关闭

2. **心跳保活机制**
   - 客户端定时发送ping
   - 服务器响应pong
   - 超时未响应触发重连

3. **消息队列**
   - 断线期间缓存消息
   - 重连后发送缓存消息
   - 消息确认机制

**指数退避重连策略：**

1. **算法原理**
   - 初始延迟：1秒
   - 每次失败延迟翻倍
   - 最大延迟：30秒
   - 随机抖动避免同时重连

2. **重连流程**
   - 检测连接断开
   - 等待退避时间
   - 尝试重新连接
   - 成功后重置计数器

**弱网优化方案：**

1. **数据压缩**
   - 使用gzip压缩
   - 二进制协议（Protobuf）
   - 增量传输

2. **断点续传**
   - 记录已接收位置
   - 重连后请求缺失数据
   - 数据去重

3. **降级策略**
   - 自动降级到HTTP轮询
   - 减少数据传输频率
   - 本地缓存`,
    codeExamples: [
      {
        language: 'typescript',
        description: 'WebSocket连接管理',
        code: `class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private heartbeatInterval = 30000;
  private heartbeatTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private messageQueue: any[] = [];
  private lastMessageId = 0;
  
  constructor(url: string) {
    this.url = url;
  }
  
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }
    
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('WebSocket连接成功');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.startHeartbeat();
      this.flushMessageQueue();
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'pong') {
        // 心跳响应
        return;
      }
      
      // 处理业务消息
      this.handleMessage(message);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket错误:', error);
    };
    
    this.ws.onclose = (event) => {
      console.log('WebSocket关闭:', event.code, event.reason);
      this.stopHeartbeat();
      
      if (!event.wasClean) {
        this.scheduleReconnect();
      }
    };
  }
  
  private startHeartbeat() {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.heartbeatInterval);
  }
  
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('达到最大重连次数');
      this.onMaxReconnectFailed();
      return;
    }
    
    // 指数退避 + 随机抖动
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    ) + Math.random() * 1000;
    
    console.log(\`\${delay}ms后尝试重连\`);
    
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
  
  send(message: any) {
    const messageWithId = {
      ...message,
      id: ++this.lastMessageId,
    };
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(messageWithId));
    } else {
      // 连接未就绪，加入队列
      this.messageQueue.push(messageWithId);
    }
  }
  
  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws?.send(JSON.stringify(message));
    }
  }
  
  disconnect() {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }
  
  private handleMessage(message: any) {
    // 子类实现
  }
  
  private onMaxReconnectFailed() {
    // 子类实现
  }
}`,
      },
      {
        language: 'typescript',
        description: '弱网优化 - 断点续传',
        code: `class ResumableWebSocket extends WebSocketManager {
  private receivedMessages = new Map<number, any>();
  private lastReceivedId = 0;
  
  constructor(url: string) {
    super(url);
  }
  
  protected override onOpen() {
    super.onOpen();
    
    // 重连后请求缺失的消息
    if (this.lastReceivedId > 0) {
      this.send({
        type: 'resume',
        from: this.lastReceivedId + 1,
      });
    }
  }
  
  protected override handleMessage(message: any) {
    const { id, data, isResend } = message;
    
    // 去重
    if (this.receivedMessages.has(id)) {
      return;
    }
    
    this.receivedMessages.set(id, data);
    this.lastReceivedId = Math.max(this.lastReceivedId, id);
    
    // 处理消息
    this.processMessage(data);
    
    // 定期清理旧消息
    if (this.receivedMessages.size > 1000) {
      const oldIds = Array.from(this.receivedMessages.keys())
        .sort((a, b) => a - b)
        .slice(0, 500);
      
      oldIds.forEach(id => this.receivedMessages.delete(id));
    }
  }
  
  private processMessage(data: any) {
    // 业务处理
    console.log('处理消息:', data);
  }
}`,
      },
    ],
    references: [
      'WebSocket API文档',
      '弱网优化最佳实践',
    ],
    createdAt: '2024-02-07',
  },
  {
    id: 'resume-005',
    category: 'engineering',
    questionType: 'theory',
    title: '组件库设计与工程化实践',
    difficulty: 'medium',
    tags: ['组件库', '工程化', '文档生成', '按需加载'],
    question: '你提到从0到1搭建移动端组件库，实现自动化文档生成与按需加载机制。请详细说明：1）组件库的架构设计？2）如何实现自动化文档生成？3）按需加载的实现方案？',
    answer: `**组件库架构设计：**

1. **目录结构**
   components/
   ├── button/
   │   ├── index.tsx
   │   ├── style.ts
   │   ├── demo/
   │   └── test/
   ├── input/
   └── index.ts

2. **技术选型**
   - 开发框架：React/Vue
   - 构建工具：Vite/Rollup
   - 样式方案：CSS-in-JS/CSS Modules
   - 测试工具：Jest + Testing Library
   - 文档工具：Storybook/Dumi

3. **核心模块**
   - 组件实现
   - 样式系统
   - 工具函数
   - 类型定义

**自动化文档生成：**

1. **API文档**
   - TypeScript类型提取
   - JSDoc注释解析
   - Props自动生成

2. **示例文档**
   - Markdown编写
   - 代码高亮
   - 实时预览

3. **文档工具**
   - Storybook
   - Dumi
   - VitePress

**按需加载实现：**

1. **ES Module方式**
   - Tree Shaking
   - import { Button } from 'lib'
   - 自动按需加载

2. **插件方式**
   - babel-plugin-import
   - 自动转换导入语句
   - 样式自动引入

3. **手动方式**
   - import Button from 'lib/button'
   - import 'lib/button/style'`,
    codeExamples: [
      {
        language: 'typescript',
        description: '组件库目录结构',
        code: `// components/button/index.tsx
import React from 'react';
import './style.css';

export interface ButtonProps {
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'danger';
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large';
  /** 是否禁用 */
  disabled?: boolean;
  /** 点击事件 */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** 子元素 */
  children: React.ReactNode;
}

/**
 * 按钮组件
 * @example
 * <Button type="primary" onClick={() => console.log('clicked')}>
 *   点击我
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({
  type = 'default',
  size = 'medium',
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <button
      className={\`btn btn-\${type} btn-\${size}\`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// components/index.ts
export { Button } from './button';
export { Input } from './input';
export { Select } from './select';
// ... 其他组件`,
      },
      {
        language: 'typescript',
        description: 'babel-plugin-import配置',
        code: `// .babelrc.js
module.exports = {
  plugins: [
    [
      'import',
      {
        libraryName: 'my-component-library',
        libraryDirectory: 'es',
        style: true,
      },
      'my-component-library',
    ],
  ],
};

// 转换前
import { Button, Input } from 'my-component-library';

// 转换后
import Button from 'my-component-library/es/button';
import 'my-component-library/es/button/style';
import Input from 'my-component-library/es/input';
import 'my-component-library/es/input/style';

// vite.config.ts - 按需加载配置
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'custom-import',
      enforce: 'pre',
      resolveId(id) {
        // 处理组件导入
        if (id.startsWith('my-lib/')) {
          const component = id.split('/')[1];
          return {
            id: require.resolve(\`my-lib/es/\${component}\`),
            external: false,
          };
        }
      },
    },
  ],
});`,
      },
      {
        language: 'typescript',
        description: '自动化文档生成',
        code: `import React from 'react';
import { Button } from '../button';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    type: {
      control: 'select',
      options: ['primary', 'default', 'danger'],
      description: '按钮类型',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '按钮大小',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'medium' },
      },
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  type: 'primary',
  children: 'Primary Button',
};

export const Default = Template.bind({});
Default.args = {
  type: 'default',
  children: 'Default Button',
};

export const Danger = Template.bind({});
Danger.args = {
  type: 'danger',
  children: 'Danger Button',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  children: 'Disabled Button',
};`,
      },
    ],
    references: [
      'Storybook官方文档',
      '组件库设计最佳实践',
    ],
    createdAt: '2024-02-08',
  },
  {
    id: 'resume-006',
    category: 'css',
    questionType: 'theory',
    title: 'Canvas动画与骨骼动画编辑器',
    difficulty: 'hard',
    tags: ['Canvas', 'Pixi.js', 'Spine', '骨骼动画'],
    question: '你提到深度集成Pixi.js与Spine Runtime开发骨骼动画编辑器，请详细说明：1）Canvas动画的性能优化策略？2）骨骼动画的实现原理？3）如何实现动画帧的实时预览和导出？',
    answer: `**Canvas动画性能优化：**

1. **渲染优化**
   - 使用requestAnimationFrame
   - 离屏Canvas缓存
   - 分层渲染
   - 脏矩形渲染

2. **内存优化**
   - 对象池复用
   - 纹理图集
   - 及时销毁不用的资源

3. **计算优化**
   - 避免频繁创建对象
   - 使用Web Worker
   - 减少重绘区域

**骨骼动画原理：**

1. **核心概念**
   - 骨骼：控制节点
   - 插槽：挂载点
   - 皮肤：外观资源
   - 动画：时间轴数据

2. **渲染流程**
   - 更新骨骼变换
   - 计算世界坐标
   - 更新插槽附件
   - 渲染到Canvas

3. **动画混合**
   - 多动画同时播放
   - 权重混合
   - 平滑过渡

**实时预览和导出：**

1. **预览实现**
   - 时间轴控制
   - 帧率控制
   - 循环播放

2. **导出功能**
   - 序列帧导出
   - 视频导出
   - JSON数据导出`,
    codeExamples: [
      {
        language: 'typescript',
        description: 'Pixi.js骨骼动画编辑器',
        code: `import * as PIXI from 'pixi.js';
import { Spine } from 'pixi-spine';

class SpineAnimationEditor {
  private app: PIXI.Application;
  private spine: Spine | null = null;
  private animations: string[] = [];
  private currentAnimation = '';
  private isPlaying = false;
  private timeScale = 1;
  
  constructor(container: HTMLElement) {
    this.app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x1099bb,
      antialias: true,
    });
    
    container.appendChild(this.app.view);
  }
  
  async loadSpine(jsonPath: string, atlasPath: string) {
    const loader = this.app.loader;
    
    return new Promise((resolve, reject) => {
      loader.add('spine', jsonPath, { metadata: { spineAtlasFile: atlasPath } });
      
      loader.load((loader, resources) => {
        const spineData = resources.spine.spineData;
        this.spine = new Spine(spineData);
        
        // 获取所有动画
        this.animations = spineData.animations.map(anim => anim.name);
        
        // 居中显示
        this.spine.x = this.app.screen.width / 2;
        this.spine.y = this.app.screen.height / 2;
        
        this.app.stage.addChild(this.spine);
        
        resolve(this.spine);
      });
      
      loader.onError.add(reject);
    });
  }
  
  playAnimation(name: string, loop = true) {
    if (!this.spine) return;
    
    this.currentAnimation = name;
    this.spine.state.setAnimation(0, name, loop);
    this.isPlaying = true;
  }
  
  stopAnimation() {
    if (!this.spine) return;
    
    this.spine.state.clearTracks();
    this.isPlaying = false;
  }
  
  setTimeScale(scale: number) {
    if (!this.spine) return;
    
    this.timeScale = scale;
    this.spine.state.timeScale = scale;
  }
  
  setSkin(skinName: string) {
    if (!this.spine) return;
    
    this.spine.skeleton.setSkinByName(skinName);
    this.spine.skeleton.setSlotsToSetupPose();
  }
  
  // 导出当前帧为图片
  exportFrame(): string {
    const renderer = this.app.renderer;
    const renderTexture = PIXI.RenderTexture.create({
      width: this.app.screen.width,
      height: this.app.screen.height,
    });
    
    renderer.render(this.app.stage, renderTexture);
    
    const canvas = renderer.extract.canvas(renderTexture);
    return canvas.toDataURL('image/png');
  }
  
  // 导出动画序列帧
  async exportAnimationSequence(
    animationName: string,
    fps: number = 30
  ): Promise<string[]> {
    const frames: string[] = [];
    const duration = this.getAnimationDuration(animationName);
    const frameCount = Math.ceil(duration * fps);
    const frameDelay = 1000 / fps;
    
    this.playAnimation(animationName, false);
    
    for (let i = 0; i < frameCount; i++) {
      await new Promise(resolve => setTimeout(resolve, frameDelay));
      frames.push(this.exportFrame());
    }
    
    return frames;
  }
  
  private getAnimationDuration(name: string): number {
    if (!this.spine) return 0;
    
    const animation = this.spine.spineData.animations.find(a => a.name === name);
    return animation ? animation.duration : 0;
  }
  
  destroy() {
    this.app.destroy(true);
  }
}`,
      },
      {
        language: 'typescript',
        description: 'Canvas性能优化',
        code: `class CanvasOptimizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private objectPool: Map<string, any[]> = new Map();
  private dirtyRects: Array<{ x: number; y: number; width: number; height: number }> = [];
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // 创建离屏Canvas
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = canvas.width;
    this.offscreenCanvas.height = canvas.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
  }
  
  // 对象池
  getObject<T>(type: string, factory: () => T): T {
    const pool = this.objectPool.get(type) || [];
    
    if (pool.length > 0) {
      return pool.pop();
    }
    
    return factory();
  }
  
  returnObject<T>(type: string, obj: T) {
    const pool = this.objectPool.get(type) || [];
    pool.push(obj);
    this.objectPool.set(type, pool);
  }
  
  // 脏矩形渲染
  addDirtyRect(x: number, y: number, width: number, height: number) {
    this.dirtyRects.push({ x, y, width, height });
  }
  
  renderDirtyRects(renderFunc: (ctx: CanvasRenderingContext2D, rect: any) => void) {
    // 合并重叠的脏矩形
    const mergedRects = this.mergeRects(this.dirtyRects);
    
    // 只渲染脏区域
    mergedRects.forEach(rect => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
      this.ctx.clip();
      
      // 清除脏区域
      this.ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
      
      // 渲染内容
      renderFunc(this.ctx, rect);
      
      this.ctx.restore();
    });
    
    this.dirtyRects = [];
  }
  
  private mergeRects(rects: any[]): any[] {
    // 简化的合并算法
    if (rects.length === 0) return [];
    if (rects.length === 1) return rects;
    
    // 这里可以实现更复杂的合并逻辑
    return rects;
  }
  
  // 离屏Canvas缓存
  cacheToOffscreen(renderFunc: (ctx: CanvasRenderingContext2D) => void) {
    this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    renderFunc(this.offscreenCtx);
  }
  
  drawFromOffscreen(x: number, y: number) {
    this.ctx.drawImage(this.offscreenCanvas, x, y);
  }
}`,
      },
    ],
    references: [
      'Pixi.js官方文档',
      'Spine动画原理',
    ],
    createdAt: '2024-02-09',
  },
];
