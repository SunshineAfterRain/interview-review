import React from 'react';

interface InteractiveDemoProps {
  type: string;
}

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ type }) => {
  switch (type) {
    case 'virtual-scroll':
      return <VirtualScrollDemo />;
    case 'debounce':
      return <DebounceDemo />;
    case 'deep-clone':
      return <DeepCloneDemo />;
    case 'log-search':
      return <LogSearchDemo />;
    default:
      return <div>未知的演示类型</div>;
  }
};

const VirtualScrollDemo: React.FC = () => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const itemHeight = 50;
  const containerHeight = 400;
  const itemCount = 10000;
  const bufferSize = 5;
  
  const items = React.useMemo(() => 
    Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      text: `日志条目 #${i + 1} - ${new Date(Date.now() + i * 1000).toLocaleTimeString()}`,
      level: ['INFO', 'WARN', 'ERROR'][Math.floor(Math.random() * 3)] as 'INFO' | 'WARN' | 'ERROR',
    })),
    []
  );
  
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + bufferSize * 2);
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return '#ff6b6b';
      case 'WARN': return '#ffd93d';
      default: return '#00ff88';
    }
  };
  
  return (
    <div className="interactive-demo">
      <div className="demo-header">
        <h4>🎯 虚拟滚动实时演示</h4>
        <div className="demo-stats">
          <span>总条目: {itemCount.toLocaleString()}</span>
          <span>渲染条目: {visibleItems.length}</span>
          <span>内存节省: {((1 - visibleItems.length / itemCount) * 100).toFixed(1)}%</span>
        </div>
      </div>
      
      <div
        ref={containerRef}
        style={{
          height: containerHeight,
          overflow: 'auto',
          border: '2px solid #00f5ff',
          borderRadius: '8px',
          background: '#0a0e17',
          position: 'relative',
        }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: offsetY,
              width: '100%',
            }}
          >
            {visibleItems.map((item) => (
              <div
                key={item.id}
                style={{
                  height: itemHeight,
                  padding: '0 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(0, 245, 255, 0.1)',
                  fontSize: '0.9rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                }}
              >
                <span
                  style={{
                    color: getLevelColor(item.level),
                    fontWeight: 'bold',
                    marginRight: '1rem',
                    minWidth: '60px',
                  }}
                >
                  [{item.level}]
                </span>
                <span style={{ color: '#e0e0e0' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="demo-info">
        <p>💡 <strong>提示：</strong>滚动查看效果，只渲染可见区域的元素</p>
      </div>
    </div>
  );
};

const DebounceDemo: React.FC = () => {
  const [inputValue, setInputValue] = React.useState('');
  const [debouncedValue, setDebouncedValue] = React.useState('');
  const [callCount, setCallCount] = React.useState(0);
  const [debouncedCallCount, setDebouncedCallCount] = React.useState(0);
  const timerRef = React.useRef<number>();
  
  React.useEffect(() => {
    setCallCount(prev => prev + 1);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = window.setTimeout(() => {
      setDebouncedValue(inputValue);
      setDebouncedCallCount(prev => prev + 1);
    }, 500);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [inputValue]);
  
  return (
    <div className="interactive-demo">
      <div className="demo-header">
        <h4>🎯 防抖函数实时演示</h4>
      </div>
      
      <div className="demo-content">
        <input
          type="text"
          placeholder="输入内容查看防抖效果..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #00f5ff',
            borderRadius: '8px',
            background: '#0a0e17',
            color: '#e0e0e0',
            fontFamily: 'Consolas, Monaco, monospace',
          }}
        />
        
        <div className="demo-stats" style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', border: '1px solid #ff6b6b' }}>
            <div style={{ color: '#ff6b6b', fontWeight: 'bold', marginBottom: '0.5rem' }}>原始输入</div>
            <div style={{ fontSize: '0.9rem', color: '#e0e0e0' }}>{inputValue || '(空)'}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ff6b6b' }}>
              调用次数: {callCount}
            </div>
          </div>
          
          <div style={{ padding: '1rem', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '8px', border: '1px solid #00ff88' }}>
            <div style={{ color: '#00ff88', fontWeight: 'bold', marginBottom: '0.5rem' }}>防抖后</div>
            <div style={{ fontSize: '0.9rem', color: '#e0e0e0' }}>{debouncedValue || '(空)'}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#00ff88' }}>
              调用次数: {debouncedCallCount}
            </div>
          </div>
        </div>
      </div>
      
      <div className="demo-info">
        <p>💡 <strong>提示：</strong>快速输入时，防抖函数只在停止输入500ms后才执行</p>
      </div>
    </div>
  );
};

const DeepCloneDemo: React.FC = () => {
  const originalObject = {
    name: '张三',
    age: 25,
    hobbies: ['编程', '阅读'],
    address: {
      city: '北京',
      district: '朝阳',
    },
  };
  
  const [clonedObject, setClonedObject] = React.useState<any>(null);
  const [modified, setModified] = React.useState(false);
  
  const handleDeepClone = () => {
    const cloned = JSON.parse(JSON.stringify(originalObject));
    setClonedObject(cloned);
    setModified(false);
  };
  
  const handleModifyClone = () => {
    if (clonedObject) {
      clonedObject.name = '李四';
      clonedObject.hobbies.push('游戏');
      clonedObject.address.city = '上海';
      setClonedObject({ ...clonedObject });
      setModified(true);
    }
  };
  
  return (
    <div className="interactive-demo">
      <div className="demo-header">
        <h4>🎯 深拷贝实时演示</h4>
      </div>
      
      <div className="demo-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(0, 245, 255, 0.1)', borderRadius: '8px', border: '1px solid #00f5ff' }}>
            <div style={{ color: '#00f5ff', fontWeight: 'bold', marginBottom: '0.5rem' }}>原始对象</div>
            <pre style={{ fontSize: '0.85rem', color: '#e0e0e0', margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(originalObject, null, 2)}
            </pre>
          </div>
          
          <div style={{ padding: '1rem', background: modified ? 'rgba(255, 0, 255, 0.1)' : 'rgba(0, 255, 136, 0.1)', borderRadius: '8px', border: modified ? '1px solid #ff00ff' : '1px solid #00ff88' }}>
            <div style={{ color: modified ? '#ff00ff' : '#00ff88', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {modified ? '修改后的克隆对象' : '克隆对象'}
            </div>
            <pre style={{ fontSize: '0.85rem', color: '#e0e0e0', margin: 0, whiteSpace: 'pre-wrap' }}>
              {clonedObject ? JSON.stringify(clonedObject, null, 2) : '(未克隆)'}
            </pre>
          </div>
        </div>
        
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleDeepClone}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'Consolas, Monaco, monospace',
            }}
          >
            深拷贝
          </button>
          
          <button
            onClick={handleModifyClone}
            disabled={!clonedObject}
            style={{
              padding: '0.75rem 1.5rem',
              background: clonedObject ? 'linear-gradient(135deg, #ff00ff, #cc00cc)' : '#333',
              border: 'none',
              borderRadius: '8px',
              color: clonedObject ? '#fff' : '#666',
              fontWeight: 'bold',
              cursor: clonedObject ? 'pointer' : 'not-allowed',
              fontFamily: 'Consolas, Monaco, monospace',
            }}
          >
            修改克隆对象
          </button>
        </div>
      </div>
      
      <div className="demo-info">
        <p>💡 <strong>提示：</strong>修改克隆对象不会影响原始对象</p>
      </div>
    </div>
  );
};

const LogSearchDemo: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [autoScroll, setAutoScroll] = React.useState(true);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<number>();
  const scrollTopRef = React.useRef(0);
  const itemHeightsRef = React.useRef<Map<number, number>>(new Map());
  const positionCacheRef = React.useRef<Array<{ index: number; offset: number; height: number }>>([]);
  
  const [logs, setLogs] = React.useState<Array<{
    id: number;
    text: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    timestamp: number;
    lines: number; // 消息行数，用于模拟不同高度
  }>>([]);
  
  const estimatedItemHeight = 40;
  const containerHeight = 400;
  const bufferSize = 5;
  
  // 生成随机长度的日志消息
  const generateRandomLog = (id: number) => {
    const users = ['张三', '李四', '王五', '赵六', '孙七'];
    const actions = ['登录', '查询', '删除', '更新', '导出', '导入', '审核', '审批'];
    const details = [
      '操作成功',
      '操作失败，错误码：500',
      '参数验证失败：用户名不能为空，密码长度必须在6-20位之间',
      '数据库连接超时，已重试3次',
      '请求响应时间：1250ms，超过阈值1000ms',
      '用户权限验证通过，角色：管理员，权限列表：[用户管理, 系统设置, 数据导出]',
      '执行批量操作，共处理1000条数据，成功998条，失败2条',
      '系统资源使用率：CPU 45%, 内存 62%, 磁盘 78%',
    ];
    
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const detail = details[Math.floor(Math.random() * details.length)];
    
    // 随机决定消息长度（1-5行）
    const lines = Math.floor(Math.random() * 5) + 1;
    let text = `日志条目 #${id + 1} - 用户${user}执行了${action}操作`;
    
    // 根据行数添加不同的详细程度
    if (lines >= 2) {
      text += ` - ${detail}`;
    }
    if (lines >= 3) {
      text += ` | 请求ID: ${Math.random().toString(36).substring(7)}`;
    }
    if (lines >= 4) {
      text += ` | IP: ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }
    if (lines >= 5) {
      text += ` | 耗时: ${Math.floor(Math.random() * 2000)}ms | 状态码: ${[200, 201, 400, 401, 403, 404, 500][Math.floor(Math.random() * 7)]}`;
    }
    
    return {
      id,
      text,
      level: ['INFO', 'WARN', 'ERROR'][Math.floor(Math.random() * 3)] as 'INFO' | 'WARN' | 'ERROR',
      timestamp: Date.now(),
      lines,
    };
  };
  
  React.useEffect(() => {
    const initialLogs = Array.from({ length: 100 }, (_, i) => generateRandomLog(i));
    setLogs(initialLogs);
  }, []);
  
  React.useEffect(() => {
    if (isStreaming) {
      timerRef.current = window.setInterval(() => {
        setLogs(prev => {
          const newLog = generateRandomLog(prev.length);
          return [...prev, newLog];
        });
        
        if (autoScroll && containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStreaming, autoScroll]);
  
  // 计算所有项的位置（动态高度）
  const positions = React.useMemo(() => {
    const cache: Array<{ index: number; offset: number; height: number }> = [];
    let offset = 0;
    
    for (let i = 0; i < logs.length; i++) {
      const height = itemHeightsRef.current.get(i) || (logs[i].lines * 20 + 20); // 根据行数估算高度
      cache.push({ index: i, offset, height });
      offset += height;
    }
    
    positionCacheRef.current = cache;
    return cache;
  }, [logs]);
  
  const totalHeight = positions.length > 0 ? positions[positions.length - 1].offset + positions[positions.length - 1].height : 0;
  
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
  
  const startIndex = Math.max(0, findStartIndex(scrollTopRef.current) - bufferSize);
  const endIndex = Math.min(logs.length - 1, findStartIndex(scrollTopRef.current + containerHeight) + bufferSize);
  
  const visibleLogs = logs.slice(startIndex, endIndex + 1);
  const offsetY = positions[startIndex]?.offset || 0;
  
  const matches = React.useMemo(() => {
    if (!searchQuery) return [];
    
    const results: Array<{ logIndex: number; matchStart: number; matchEnd: number }> = [];
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    
    logs.forEach((log, logIndex) => {
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(log.text)) !== null) {
        results.push({
          logIndex,
          matchStart: match.index,
          matchEnd: match.index + match[0].length,
        });
      }
    });
    
    return results;
  }, [logs, searchQuery]);
  
  const highlightText = (text: string, logIndex: number) => {
    if (!searchQuery) return text;
    
    const logMatches = matches.filter(m => m.logIndex === logIndex);
    if (logMatches.length === 0) return text;
    
    const parts: Array<{ text: string; highlight: boolean }> = [];
    let lastIndex = 0;
    
    logMatches.forEach(({ matchStart, matchEnd }) => {
      if (matchStart > lastIndex) {
        parts.push({ text: text.slice(lastIndex, matchStart), highlight: false });
      }
      parts.push({ text: text.slice(matchStart, matchEnd), highlight: true });
      lastIndex = matchEnd;
    });
    
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), highlight: false });
    }
    
    return (
      <>
        {parts.map((part, i) => 
          part.highlight ? (
            <mark key={i} style={{ background: '#ff00ff', color: '#fff', padding: '0 2px', borderRadius: '2px' }}>
              {part.text}
            </mark>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </>
    );
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      scrollToMatch(newIndex);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < matches.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      scrollToMatch(newIndex);
    }
  };
  
  const scrollToMatch = (index: number) => {
    if (matches[index] && containerRef.current) {
      const targetScrollTop = positions[matches[index].logIndex]?.offset || 0;
      containerRef.current.scrollTop = targetScrollTop;
    }
  };
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return '#ff6b6b';
      case 'WARN': return '#ffd93d';
      default: return '#00ff88';
    }
  };
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    scrollTopRef.current = e.currentTarget.scrollTop;
  };
  
  // 测量实际高度
  const measureItem = (index: number, height: number) => {
    if (itemHeightsRef.current.get(index) !== height) {
      itemHeightsRef.current.set(index, height);
    }
  };
  
  return (
    <div className="interactive-demo">
      <div className="demo-header">
        <h4>🎯 动态高度虚拟滚动 + WebSocket实时日志演示</h4>
        <div className="demo-stats">
          <span>总日志: {logs.length.toLocaleString()}</span>
          <span>渲染: {visibleLogs.length}</span>
          <span>内存节省: {((1 - visibleLogs.length / logs.length) * 100).toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="demo-content">
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="搜索日志（例如：张三、登录、ERROR）..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentIndex(0);
            }}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '2px solid #00f5ff',
              borderRadius: '8px',
              background: '#0a0e17',
              color: '#e0e0e0',
              fontFamily: 'Consolas, Monaco, monospace',
            }}
          />
          
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            style={{
              padding: '0.75rem 1.5rem',
              background: isStreaming ? 'linear-gradient(135deg, #ff6b6b, #ff4757)' : 'linear-gradient(135deg, #00ff88, #00cc6a)',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'Consolas, Monaco, monospace',
              whiteSpace: 'nowrap',
            }}
          >
            {isStreaming ? '⏹ 停止推送' : '▶ 开始推送'}
          </button>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e0e0e0', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            自动滚动
          </label>
        </div>
        
        {searchQuery && matches.length > 0 && (
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              style={{
                padding: '0.5rem 1rem',
                background: currentIndex === 0 ? '#333' : 'linear-gradient(135deg, #00f5ff, #00c5cc)',
                border: 'none',
                borderRadius: '8px',
                color: currentIndex === 0 ? '#666' : '#000',
                fontWeight: 'bold',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'Consolas, Monaco, monospace',
              }}
            >
              ↑ 上一个
            </button>
            
            <span style={{ color: '#00f5ff', fontFamily: 'Consolas, Monaco, monospace', minWidth: '80px', textAlign: 'center' }}>
              {currentIndex + 1} / {matches.length}
            </span>
            
            <button
              onClick={handleNext}
              disabled={currentIndex === matches.length - 1}
              style={{
                padding: '0.5rem 1rem',
                background: currentIndex === matches.length - 1 ? '#333' : 'linear-gradient(135deg, #00f5ff, #00c5cc)',
                border: 'none',
                borderRadius: '8px',
                color: currentIndex === matches.length - 1 ? '#666' : '#000',
                fontWeight: 'bold',
                cursor: currentIndex === matches.length - 1 ? 'not-allowed' : 'pointer',
                fontFamily: 'Consolas, Monaco, monospace',
              }}
            >
              ↓ 下一个
            </button>
          </div>
        )}
        
        <div
          ref={containerRef}
          style={{
            height: containerHeight,
            overflow: 'auto',
            border: '2px solid #00f5ff',
            borderRadius: '8px',
            background: '#0a0e17',
            position: 'relative',
          }}
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: offsetY,
                width: '100%',
              }}
            >
              {visibleLogs.map((log) => (
                <div
                  key={log.id}
                  data-log-id={log.id}
                  style={{
                    minHeight: '40px',
                    padding: '0.5rem 1rem',
                    borderBottom: '1px solid rgba(0, 245, 255, 0.1)',
                    fontSize: '0.9rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    display: 'flex',
                    alignItems: 'flex-start',
                    background: matches[currentIndex]?.logIndex === log.id ? 'rgba(255, 0, 255, 0.1)' : 'transparent',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                  ref={(el) => {
                    if (el) {
                      const measuredHeight = el.getBoundingClientRect().height;
                      measureItem(log.id, measuredHeight);
                    }
                  }}
                >
                  <span
                    style={{
                      color: getLevelColor(log.level),
                      fontWeight: 'bold',
                      marginRight: '1rem',
                      minWidth: '60px',
                      flexShrink: 0,
                    }}
                  >
                    [{log.level}]
                  </span>
                  <span style={{ color: '#e0e0e0', flex: 1 }}>
                    {highlightText(log.text, log.id)}
                  </span>
                  <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: '1rem', flexShrink: 0 }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="demo-info">
        <p>💡 <strong>提示：</strong>消息长度随机变化（1-5行），展示动态高度虚拟滚动的优势</p>
      </div>
    </div>
  );
};
