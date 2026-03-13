import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { CodeExample } from '../types/question';

interface AnswerPanelProps {
  answer: string;
  codeExamples?: CodeExample[];
  references?: string[];
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({
  answer,
  codeExamples,
  references,
}) => {
  const [activeCodeIndex, setActiveCodeIndex] = useState(0);
  const [editedCode, setEditedCode] = useState<Record<number, string>>({});

  const handleCodeChange = (index: number, value: string) => {
    setEditedCode(prev => ({
      ...prev,
      [index]: value,
    }));
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
              language={codeExamples[activeCodeIndex].language}
              value={editedCode[activeCodeIndex] || codeExamples[activeCodeIndex].code}
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
