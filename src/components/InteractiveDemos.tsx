import React, { useState, useRef, useEffect, useMemo } from 'react';

interface VirtualListDemoProps {
  itemCount?: number;
  containerHeight?: number;
}

export const VirtualListDemo: React.FC<VirtualListDemoProps> = ({
  itemCount = 10000,
  containerHeight = 400,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 50;
  const bufferSize = 5;
  
  const items = useMemo(() => 
    Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      text: `日志条目 #${i + 1} - ${new Date(Date.now() + i * 1000).toLocaleTimeString()}`,
      level: ['INFO', 'WARN', 'ERROR'][Math.floor(Math.random() * 3)] as 'INFO' | 'WARN' | 'ERROR',
    })),
    [itemCount]
  );
  
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + bufferSize * 2);
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };
  
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

interface DebounceDemoProps {}

export const DebounceDemo: React.FC<DebounceDemoProps> = () => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [callCount, setCallCount] = useState(0);
  const [debouncedCallCount, setDebouncedCallCount] = useState(0);
  const timerRef = useRef<number>();
  
  useEffect(() => {
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

interface DeepCloneDemoProps {}

export const DeepCloneDemo: React.FC<DeepCloneDemoProps> = () => {
  const originalObject = {
    name: '张三',
    age: 25,
    hobbies: ['编程', '阅读'],
    address: {
      city: '北京',
      district: '朝阳',
    },
    date: new Date(),
  };
  
  const [clonedObject, setClonedObject] = useState<any>(null);
  const [modified, setModified] = useState(false);
  
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

export const interactiveDemos = {
  'virtual-list': VirtualListDemo,
  'debounce': DebounceDemo,
  'deep-clone': DeepCloneDemo,
};
