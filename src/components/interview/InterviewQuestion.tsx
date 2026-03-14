import React, { useState, useEffect } from 'react';
import type { Question } from '../../types/question';
import { DIFFICULTY_LABELS, CATEGORIES } from '../../types/question';

interface InterviewQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  timeLimit: number; // 每题时间限制（分钟）
  onSubmit: (answer: string) => void;
  onSkip: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
}

/**
 * 面试题目组件 - 答题界面、计时器、进度显示
 */
export const InterviewQuestion: React.FC<InterviewQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  timeLimit,
  onSubmit,
  onSkip,
  onPrevious,
  canGoPrevious = false,
}) => {
  const [answer, setAnswer] = useState('');
  const [remainingTime, setRemainingTime] = useState(timeLimit * 60); // 转换为秒
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReference, setShowReference] = useState(false);
  
  // 重置状态当题目变化时
  useEffect(() => {
    setAnswer('');
    setIsSubmitted(false);
    setShowReference(false);
    setRemainingTime(timeLimit * 60);
    setIsTimeWarning(false);
  }, [question.id, timeLimit]);
  
  // 计时器
  useEffect(() => {
    if (isSubmitted) return; // 提交后停止计时
    
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // 时间到自动跳过
          onSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLimit, onSkip, isSubmitted]);
  
  // 时间警告
  useEffect(() => {
    if (remainingTime <= 60) {
      setIsTimeWarning(true);
    }
  }, [remainingTime]);
  
  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  // 提交答案
  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer.trim());
      setIsSubmitted(true);
    }
  };
  
  // 跳过
  const handleSkip = () => {
    onSkip();
    setAnswer('');
  };
  
  // 进度百分比
  const progress = (questionNumber / totalQuestions) * 100;
  
  // 获取分类信息
  const categoryInfo = CATEGORIES.find(c => c.key === question.category);
  
  // 获取难度信息
  const difficultyInfo = DIFFICULTY_LABELS[question.difficulty];
  
  // 获取编程题的起始代码
  const getStarterCode = () => {
    if (question.questionType === 'coding' && question.codingConfig) {
      return question.codingConfig.starterCode || '';
    }
    return '';
  };
  
  // 获取测试用例
  const getTestCases = () => {
    if (question.questionType === 'coding' && question.codingConfig) {
      return question.codingConfig.testCases || [];
    }
    return [];
  };
  
  return (
    <div className="interview-question">
      {/* 顶部进度条和计时器 */}
      <div className="interview-question-header">
        <div className="progress-info">
          <span className="progress-text">
            第 {questionNumber} / {totalQuestions} 题
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className={`timer ${isTimeWarning ? 'warning' : ''}`}>
          <span className="timer-icon">⏱️</span>
          <span className="timer-value">{formatTime(remainingTime)}</span>
        </div>
      </div>
      
      {/* 题目信息 */}
      <div className="interview-question-meta">
        <span 
          className="interview-question-category"
          style={{ color: categoryInfo?.color }}
        >
          {categoryInfo?.icon} {categoryInfo?.label}
        </span>
        <span 
          className="interview-question-difficulty"
          style={{ color: difficultyInfo?.color }}
        >
          {difficultyInfo?.label}
        </span>
        <span className="interview-question-type">
          {question.questionType === 'theory' ? '理论题' : '编程题'}
        </span>
      </div>
      
      {/* 题目标题 */}
      <h2 className="interview-question-title">{question.title}</h2>
      
      {/* 题目内容 */}
      <div className="interview-question-content">
        <div className="content-text">{question.question}</div>
        
        {/* 编程题显示起始代码和测试用例 */}
        {question.questionType === 'coding' && !isSubmitted && (
          <div className="coding-starter">
            <h4>📝 起始代码</h4>
            <pre className="code-block starter-code">
              <code>{getStarterCode()}</code>
            </pre>
            
            {getTestCases().length > 0 && (
              <div className="test-cases">
                <h4>🧪 测试用例</h4>
                <div className="test-case-list">
                  {getTestCases().slice(0, 2).map((tc, index) => (
                    <div key={index} className="test-case-item">
                      <span className="test-input">输入: {JSON.stringify(tc.input)}</span>
                      <span className="test-output">预期: {JSON.stringify(tc.expectedOutput)}</span>
                    </div>
                  ))}
                  {getTestCases().length > 2 && (
                    <p className="test-more">... 还有 {getTestCases().length - 2} 个测试用例</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 理论题只显示部分代码示例（不显示完整答案） */}
        {question.questionType === 'theory' && question.codeExamples && question.codeExamples.length > 0 && !isSubmitted && (
          <div className="code-examples-hint">
            <p className="hint-text">💡 本题包含代码示例，提交答案后可查看参考答案</p>
          </div>
        )}
      </div>
      
      {/* 答案输入区 - 未提交时显示 */}
      {!isSubmitted && (
        <div className="answer-section">
          <h3>你的答案</h3>
          {question.questionType === 'coding' ? (
            <textarea
              className="answer-textarea code-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="请在此编写代码..."
              spellCheck={false}
            />
          ) : (
            <textarea
              className="answer-textarea"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="请在此输入你的答案..."
              rows={8}
            />
          )}
        </div>
      )}
      
      {/* 提交后显示用户答案和参考答案 */}
      {isSubmitted && (
        <div className="answer-result">
          <div className="user-answer-section">
            <h3>✅ 你的答案</h3>
            <div className="user-answer-content">
              <pre>{answer}</pre>
            </div>
          </div>
          
          {/* 查看参考答案按钮 */}
          {!showReference && (
            <button 
              className="btn btn-secondary show-reference-btn"
              onClick={() => setShowReference(true)}
            >
              📖 查看参考答案
            </button>
          )}
          
          {/* 参考答案 */}
          {showReference && (
            <div className="reference-answer-section">
              <h3>📚 参考答案</h3>
              <div className="reference-answer-content" dangerouslySetInnerHTML={{ __html: question.answer.replace(/\n/g, '<br/>') }} />
              
              {/* 代码示例 */}
              {question.codeExamples && question.codeExamples.length > 0 && (
                <div className="code-examples">
                  <h4>代码示例</h4>
                  {question.codeExamples.map((example, index) => (
                    <div key={index} className="code-example">
                      {example.description && (
                        <p className="example-description">{example.description}</p>
                      )}
                      <pre className="code-block">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* 操作按钮 */}
      <div className="interview-question-actions">
        {!isSubmitted ? (
          <>
            {canGoPrevious && onPrevious && (
              <button className="btn btn-secondary" onClick={onPrevious}>
                上一题
              </button>
            )}
            <button className="btn btn-skip" onClick={handleSkip}>
              跳过
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={!answer.trim()}
            >
              提交答案
            </button>
          </>
        ) : (
          <button className="btn btn-primary next-btn" onClick={handleSkip}>
            下一题 →
          </button>
        )}
      </div>
    </div>
  );
};

export default InterviewQuestion;
