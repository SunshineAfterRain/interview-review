import React from 'react';

export const VirtualScrollDemo: React.FC = () => {
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
