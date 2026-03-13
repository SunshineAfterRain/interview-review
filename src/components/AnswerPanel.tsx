import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { CodeExample } from '../types/question';

interface AnswerPanelProps {
  answer: string;
  codeExamples?: CodeExample[];
  references?: string[];
}

interface ConsoleMessage {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({
  answer,
  codeExamples,
  references,
}) => {
  const [activeCodeIndex, setActiveCodeIndex] = useState(0);
  const [editedCode, setEditedCode] = useState<Record<number, string>>({});
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  const handleCodeChange = (index: number, value: string) => {
    setEditedCode(prev => ({
      ...prev,
      [index]: value,
    }));
  };

  const getCurrentCode = () => {
    return editedCode[activeCodeIndex] || codeExamples?.[activeCodeIndex]?.code || '';
  };

  const getCurrentLanguage = () => {
    return codeExamples?.[activeCodeIndex]?.language || 'javascript';
  };

  const runJavaScriptCode = () => {
    setIsRunning(true);
    setConsoleMessages([]);
    
    const code = getCurrentCode();
    const logs: ConsoleMessage[] = [];
    
    // 检查是否包含import/export语句
    const hasModules = /\b(import|export)\b/.test(code);
    
    if (hasModules) {
      logs.push({
        type: 'error',
        message: '检测到ES6模块语法（import/export）。\n\n这是示例代码，用于展示概念。在实际项目中，这些代码需要通过构建工具（如Vite、Webpack）编译后才能运行。\n\n请查看代码示例学习用法，或复制到您的项目中运行。',
        timestamp: Date.now(),
      });
      setConsoleMessages(logs);
      setIsRunning(false);
      return;
    }
    
    const customConsole = {
      log: (...args: any[]) => {
        logs.push({
          type: 'log',
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: Date.now(),
        });
      },
      error: (...args: any[]) => {
        logs.push({
          type: 'error',
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: Date.now(),
        });
      },
      warn: (...args: any[]) => {
        logs.push({
          type: 'warn',
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: Date.now(),
        });
      },
      info: (...args: any[]) => {
        logs.push({
          type: 'info',
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: Date.now(),
        });
      },
    };

    try {
      // 移除TypeScript类型注解（简单处理）
      let processedCode = code
        .replace(/:\\s*(string|number|boolean|any|void|never|object|Function|Array<[^>]+>|Map<[^>]+>|Set<[^>]+>|Promise<[^>]+>|React\.[A-Za-z]+|[A-Z][a-zA-Z]+)/g, '')
        .replace(/<[^>]+>/g, '') // 移除泛型
        .replace(/interface\s+\w+\s*\{[^}]*\}/g, '') // 移除interface
        .replace(/type\s+\w+\s*=\s*[^;]+;/g, ''); // 移除type定义
      
      const wrappedCode = `
        (function(console) {
          ${processedCode}
        })
      `;
      
      const fn = eval(wrappedCode);
      fn(customConsole);
      
      if (logs.length === 0) {
        logs.push({
          type: 'info',
          message: '✅ 代码执行成功，无输出',
          timestamp: Date.now(),
        });
      }
    } catch (error: any) {
      logs.push({
        type: 'error',
        message: `❌ 错误: ${error.message}\n\n提示：此代码示例用于学习目的。如需运行，请复制到实际项目中。`,
        timestamp: Date.now(),
      });
    }

    setConsoleMessages(logs);
    setIsRunning(false);
    
    setTimeout(() => {
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    }, 100);
  };

  const runHTMLCode = () => {
    setIsRunning(true);
    const code = getCurrentCode();
    setPreviewContent(code);
    setShowPreview(true);
    setIsRunning(false);
  };

  const runReactCode = () => {
    setIsRunning(true);
    const code = getCurrentCode();
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    
    // 自动渲染第一个导出的组件
    if (typeof App !== 'undefined') {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
    } else if (typeof Example !== 'undefined') {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<Example />);
    }
  </script>
</body>
</html>
    `;
    
    setPreviewContent(htmlContent);
    setShowPreview(true);
    setIsRunning(false);
  };

  const runCode = () => {
    const language = getCurrentLanguage();
    
    switch (language) {
      case 'javascript':
      case 'typescript':
        runJavaScriptCode();
        break;
      case 'html':
        runHTMLCode();
        break;
      case 'react':
      case 'tsx':
      case 'jsx':
        runReactCode();
        break;
      default:
        runJavaScriptCode();
    }
  };

  const clearConsole = () => {
    setConsoleMessages([]);
  };

  const getConsoleMessageColor = (type: string) => {
    switch (type) {
      case 'error': return '#ff6b6b';
      case 'warn': return '#ffd93d';
      case 'info': return '#6bcfff';
      default: return '#00ff88';
    }
  };

  return (
    <div className="answer-panel">
      <div className="answer-section">
        <h4>答案解析：</h4>
        <div className="answer-content">
          {answer.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>

      {codeExamples && codeExamples.length > 0 && (
        <div className="code-examples">
          <h4>代码示例：</h4>
          
          <div className="code-tabs">
            {codeExamples.map((example, index) => (
              <button
                key={index}
                className={`code-tab ${activeCodeIndex === index ? 'active' : ''}`}
                onClick={() => setActiveCodeIndex(index)}
              >
                {example.description || `示例 ${index + 1}`}
              </button>
            ))}
          </div>
          
          <div className="code-editor-container">
            <Editor
              height="400px"
              language={getCurrentLanguage()}
              value={getCurrentCode()}
              onChange={(value) => handleCodeChange(activeCodeIndex, value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
              }}
            />
          </div>
          
          <div className="code-actions">
            <button 
              className="run-button"
              onClick={runCode}
              disabled={isRunning}
            >
              {isRunning ? '⏳ 运行中...' : '▶️ 运行代码'}
            </button>
            {consoleMessages.length > 0 && (
              <button 
                className="clear-button"
                onClick={clearConsole}
              >
                🗑️ 清空控制台
              </button>
            )}
          </div>
          
          {consoleMessages.length > 0 && (
            <div className="console-output" ref={consoleRef}>
              <div className="console-header">
                <span>控制台输出</span>
              </div>
              <div className="console-messages">
                {consoleMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className="console-message"
                    style={{ color: getConsoleMessageColor(msg.type) }}
                  >
                    <span className="console-type">[{msg.type.toUpperCase()}]</span>
                    <pre className="console-text">{msg.message}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {showPreview && previewContent && (
            <div className="preview-container">
              <div className="preview-header">
                <span>实时预览</span>
                <button 
                  className="close-preview"
                  onClick={() => setShowPreview(false)}
                >
                  ✕
                </button>
              </div>
              <iframe
                ref={iframeRef}
                srcDoc={previewContent}
                className="preview-iframe"
                sandbox="allow-scripts allow-same-origin"
                title="Code Preview"
              />
            </div>
          )}
        </div>
      )}

      {references && references.length > 0 && (
        <div className="references-section">
          <h4>参考资料：</h4>
          <ul>
            {references.map((ref, index) => (
              <li key={index}>{ref}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
