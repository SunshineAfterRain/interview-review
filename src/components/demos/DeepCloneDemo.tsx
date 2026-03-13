import React from 'react';

export const DeepCloneDemo: React.FC = () => {
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
