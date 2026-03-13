import React from 'react';
import { globalShortcuts } from '../hooks/useKeyboardShortcuts';
import './KeyboardHelp.css';

interface KeyboardHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelp: React.FC<KeyboardHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { ...globalShortcuts.search, keys: '/' },
    { ...globalShortcuts.home, keys: 'Ctrl + H' },
    { ...globalShortcuts.favorites, keys: 'Ctrl + F' },
    { ...globalShortcuts.progress, keys: 'Ctrl + P' },
    { ...globalShortcuts.wrongQuestions, keys: 'Ctrl + W' },
    { ...globalShortcuts.theme, keys: 'Ctrl + T' },
    { ...globalShortcuts.help, keys: 'Shift + ?' },
  ];

  return (
    <div className="keyboard-help-overlay" onClick={onClose}>
      <div className="keyboard-help-modal" onClick={e => e.stopPropagation()}>
        <div className="help-header">
          <h3>⌨️ 键盘快捷键</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="help-content">
          <table className="shortcuts-table">
            <thead>
              <tr>
                <th>快捷键</th>
                <th>功能</th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map((shortcut, index) => (
                <tr key={index}>
                  <td>
                    <kbd className="shortcut-key">{shortcut.keys}</kbd>
                  </td>
                  <td>{shortcut.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="help-footer">
          <span>按 <kbd>Esc</kbd> 或点击外部关闭</span>
        </div>
      </div>
    </div>
  );
};
