import React from 'react';

export const DebounceDemo: React.FC = () => {
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
