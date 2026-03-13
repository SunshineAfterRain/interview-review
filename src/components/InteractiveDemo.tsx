import React from 'react';
import { VirtualScrollDemo, DebounceDemo, DeepCloneDemo, LogSearchDemo } from './demos';

interface InteractiveDemoProps {
  type: string;
}

// 导出所有demo组件，供代码示例和交互式演示共用
export { VirtualScrollDemo, DebounceDemo, DeepCloneDemo, LogSearchDemo };

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
