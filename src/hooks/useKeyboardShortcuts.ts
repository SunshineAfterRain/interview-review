import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

/**
 * 键盘快捷键 Hook
 * @param shortcuts 快捷键配置数组
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 忽略在输入框中的快捷键（除了特定的组合键）
    const target = event.target as HTMLElement;
    const isInputting = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.isContentEditable;

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey || (!shortcut.ctrlKey && !event.ctrlKey);
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey || (!shortcut.shiftKey && !event.shiftKey);
      const altMatch = !!shortcut.altKey === event.altKey || (!shortcut.altKey && !event.altKey);

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        // 如果正在输入，只响应 Ctrl 组合键
        if (isInputting && !shortcut.ctrlKey) {
          continue;
        }
        
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

/**
 * 全局快捷键配置
 */
export const globalShortcuts = {
  search: { key: '/', description: '搜索题目' },
  home: { key: 'h', ctrlKey: true, description: '返回首页' },
  favorites: { key: 'f', ctrlKey: true, description: '收藏夹' },
  progress: { key: 'p', ctrlKey: true, description: '学习进度' },
  wrongQuestions: { key: 'w', ctrlKey: true, description: '错题本' },
  theme: { key: 't', ctrlKey: true, description: '切换主题' },
  help: { key: '?', shiftKey: true, description: '显示快捷键帮助' },
};
