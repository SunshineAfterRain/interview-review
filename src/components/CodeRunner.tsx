import React, { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { TestCase, ScoreResult, ScoreDimension } from '../types/question';
import { useUserStore } from '../stores/useUserStore';

interface CodeRunnerProps {
  questionId?: string;
  language: string;
  starterCode: string;
  testCases: TestCase[];
  scoreDimensions?: ScoreDimension[];
  onScoreChange?: (score: ScoreResult) => void;
}

interface TestResult {
  passed: boolean;
  input: any;
  expected: any;
  actual: any;
  error?: string | null;
  executionTime: number;
}

// 安全执行代码
const safeExecute = (code: string, input: any): { result: any; error: string | null; time: number } => {
  const startTime = performance.now();
  
  try {
    // 使用 Function 构造函数执行代码
    const executeFunc = new Function('input', `
      try {
        ${code}
        if (typeof solution === 'function') {
          return solution(input);
        }
        return null;
      } catch (e) {
        return { __error__: e.message };
      }
    `);
    
    const result = executeFunc(input);
    const endTime = performance.now();
    
    if (result && result.__error__) {
      return { result: null, error: result.__error__, time: endTime - startTime };
    }
    
    return { result, error: null, time: endTime - startTime };
  } catch (e: any) {
    const endTime = performance.now();
    return { result: null, error: e.message, time: endTime - startTime };
  }
};

// 代码质量分析
const analyzeCodeQuality = (code: string): { score: number; feedback: string } => {
  let score = 100;
  const feedbacks: string[] = [];
  
  // 检查代码长度
  if (code.length < 50) {
    score -= 10;
    feedbacks.push('代码过于简短，可能缺少必要的边界处理');
  }
  
  // 检查是否有注释
  if (!code.includes('//') && !code.includes('/*')) {
    score -= 5;
    feedbacks.push('建议添加必要的注释说明');
  }
  
  // 检查变量命名
  const singleLetterVars = code.match(/\b[a-z]\s*=/g);
  if (singleLetterVars && singleLetterVars.length > 3) {
    score -= 5;
    feedbacks.push('建议使用更有意义的变量名');
  }
  
  // 检查是否有错误处理
  if (!code.includes('try') && !code.includes('catch')) {
    // 不强制要求错误处理
  }
  
  // 检查是否有 console.log
  if (code.includes('console.log')) {
    score -= 5;
    feedbacks.push('建议移除调试用的 console.log');
  }
  
  return {
    score: Math.max(0, score),
    feedback: feedbacks.length > 0 ? feedbacks.join('; ') : '代码质量良好'
  };
};

export const CodeRunner: React.FC<CodeRunnerProps> = ({
  questionId,
  language,
  starterCode,
  testCases,
  onScoreChange,
}) => {
  const { saveCode, getSavedCode, deleteSavedCode } = useUserStore();
  const [code, setCode] = useState(starterCode);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // 当 starterCode 变化时重置代码，或加载已保存的代码
  useEffect(() => {
    if (questionId) {
      const saved = getSavedCode(questionId);
      if (saved) {
        setCode(saved.code);
        setIsSaved(true);
      } else {
        setCode(starterCode);
        setIsSaved(false);
      }
    } else {
      setCode(starterCode);
    }
    setTestResults([]);
    setConsoleOutput([]);
  }, [starterCode, questionId]);

  // 保存代码
  const handleSaveCode = useCallback(() => {
    if (questionId) {
      saveCode(questionId, code, language);
      setIsSaved(true);
    }
  }, [questionId, code, language, saveCode]);

  // 删除保存的代码
  const handleDeleteSavedCode = useCallback(() => {
    if (questionId) {
      deleteSavedCode(questionId);
      setCode(starterCode);
      setIsSaved(false);
    }
  }, [questionId, starterCode, deleteSavedCode]);

  // 代码变化时标记为未保存
  const handleCodeChange = (value: string) => {
    setCode(value || '');
    setIsSaved(false);
  };

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setConsoleOutput([]);
    setTestResults([]);
    
    const results: TestResult[] = [];
    const logs: string[] = [];
    
    // 重写 console.log 来捕获输出
    const originalLog = console.log;
    console.log = (...args) => {
      logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };
    
    try {
      for (const testCase of testCases) {
        const { result, error, time } = safeExecute(code, testCase.input);
        
        const passed = !error && JSON.stringify(result) === JSON.stringify(testCase.expectedOutput);
        
        results.push({
          passed,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: result,
          error,
          executionTime: time
        });
      }
    } finally {
      console.log = originalLog;
    }
    
    setTestResults(results);
    setConsoleOutput(logs);
    
    // 计算评分
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const correctnessScore = (passedCount / totalCount) * 60;
    
    const qualityAnalysis = analyzeCodeQuality(code);
    const qualityScore = qualityAnalysis.score * 0.2;
    
    // 效率评分（基于平均执行时间）
    const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    let efficiencyScore = 20;
    if (avgTime > 100) efficiencyScore = 10;
    else if (avgTime > 50) efficiencyScore = 15;
    
    const scoreResult: ScoreResult = {
      totalScore: Math.round(correctnessScore + qualityScore + efficiencyScore),
      maxScore: 100,
      dimensions: [
        {
          name: '正确性',
          score: Math.round(correctnessScore),
          maxScore: 60,
          feedback: `通过 ${passedCount}/${totalCount} 个测试用例`
        },
        {
          name: '代码质量',
          score: Math.round(qualityScore),
          maxScore: 20,
          feedback: qualityAnalysis.feedback
        },
        {
          name: '效率',
          score: Math.round(efficiencyScore),
          maxScore: 20,
          feedback: `平均执行时间: ${avgTime.toFixed(2)}ms`
        }
      ],
      passedTests: passedCount,
      totalTests: totalCount,
      suggestions: generateSuggestions(results, code)
    };
    
    onScoreChange?.(scoreResult);
    setIsRunning(false);
  }, [code, testCases, onScoreChange]);

  const generateSuggestions = (results: TestResult[], code: string): string[] => {
    const suggestions: string[] = [];
    
    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      suggestions.push('有测试用例未通过，请检查边界条件和特殊情况');
    }
    
    if (code.includes('for') && code.includes('for')) {
      suggestions.push('存在嵌套循环，注意时间复杂度');
    }
    
    if (!code.includes('return')) {
      suggestions.push('函数可能缺少返回值');
    }
    
    return suggestions;
  };

  return (
    <div className="code-runner">
      <div className="code-runner-header">
        <h4>代码编辑器</h4>
        <div className="code-runner-actions">
          {isSaved && (
            <span className="saved-indicator" title="代码已保存">
              💾 已保存
            </span>
          )}
          {questionId && (
            <>
              <button 
                className="save-btn"
                onClick={handleSaveCode}
                title="保存代码到本地"
              >
                💾 保存
              </button>
              {isSaved && (
                <button 
                  className="delete-saved-btn"
                  onClick={handleDeleteSavedCode}
                  title="删除保存的代码"
                >
                  🗑️ 删除保存
                </button>
              )}
            </>
          )}
          <button 
            className="run-btn"
            onClick={runTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <span className="loading-spinner"></span>
                运行中...
              </>
            ) : (
              <>
                <span className="run-icon">▶</span>
                运行测试
              </>
            )}
          </button>
          <button 
            className="reset-btn"
            onClick={() => {
              if (questionId) {
                const saved = getSavedCode(questionId);
                if (saved) {
                  setCode(saved.code);
                  setIsSaved(true);
                } else {
                  setCode(starterCode);
                  setIsSaved(false);
                }
              } else {
                setCode(starterCode);
              }
            }}
          >
            重置
          </button>
        </div>
      </div>
      
      <div className="code-editor-wrapper">
        <Editor
          height="350px"
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          loading={
            <div className="editor-loading">
              <span className="loading-spinner"></span>
              <span>加载编辑器...</span>
            </div>
          }
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
            fontLigatures: true,
            readOnly: false,
            domReadOnly: false,
          }}
        />
      </div>
      
      {testResults.length > 0 && (
        <div className="test-results">
          <h4>测试结果</h4>
          <div className="test-cases">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`test-case ${result.passed ? 'passed' : 'failed'}`}
              >
                <div className="test-case-header">
                  <span className="test-status">
                    {result.passed ? '✓' : '✗'}
                  </span>
                  <span className="test-name">
                    测试用例 {index + 1}
                    {testCases[index].description && ` - ${testCases[index].description}`}
                  </span>
                  <span className="test-time">
                    {result.executionTime.toFixed(2)}ms
                  </span>
                </div>
                <div className="test-details">
                  <div className="test-row">
                    <span className="label">输入:</span>
                    <code>{JSON.stringify(result.input)}</code>
                  </div>
                  <div className="test-row">
                    <span className="label">期望:</span>
                    <code>{JSON.stringify(result.expected)}</code>
                  </div>
                  <div className="test-row">
                    <span className="label">实际:</span>
                    <code className={result.passed ? '' : 'mismatch'}>
                      {result.error || JSON.stringify(result.actual)}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {consoleOutput.length > 0 && (
        <div className="console-output">
          <h4>控制台输出</h4>
          <pre>{consoleOutput.join('\n')}</pre>
        </div>
      )}
    </div>
  );
};
