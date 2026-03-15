import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Question, DIFFICULTY_LABELS, CATEGORIES, ScoreResult } from '../types/question';
import { AnswerPanel } from './AnswerPanel';
import { CodeRunner } from './CodeRunner';
import { ScorePanel } from './ScorePanel';
import { useUserStore } from '../stores/useUserStore';

interface QuestionCardProps {
  question: Question;
  isExpanded: boolean;
  onToggle: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isExpanded,
  onToggle,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [codeScore, setCodeScore] = useState<ScoreResult | undefined>();
  const [showScorePanel, setShowScorePanel] = useState(false);
  
  const { 
    isFavorite, 
    toggleFavorite, 
    getProgress, 
    updateProgress 
  } = useUserStore();
  
  const category = CATEGORIES.find(c => c.key === question.category);
  const difficulty = DIFFICULTY_LABELS[question.difficulty];
  const isCodingQuestion = question.questionType === 'coding';
  const favorite = isFavorite(question.id);
  const progress = getProgress(question.id);

  const handleScoreCalculated = (score: ScoreResult) => {
    setCodeScore(score);
    setShowScorePanel(true);
  };

  const handleTheorySubmit = () => {
    if (userAnswer.trim()) {
      setShowScorePanel(true);
    }
  };

  const handleProgressChange = (status: 'not_started' | 'learning' | 'mastered') => {
    updateProgress(question.id, status);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    toggleFavorite(question.id);
  };

  return (
    <div className="question-card">
      <div className="question-header" onClick={onToggle}>
        <div className="question-header-top">
          <div className="question-meta">
            <span 
              className="question-category"
              style={{ backgroundColor: category?.color }}
            >
              {category?.icon} {category?.label}
            </span>
            <span 
              className="question-difficulty"
              style={{ color: difficulty.color }}
            >
              {difficulty.label}
            </span>
            {isCodingQuestion && (
              <span className="question-type-badge coding">
                编程题
              </span>
            )}
          </div>
          
          <div className="header-actions">
            <button className="expand-btn">
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
        
        <h3 className="question-title">{question.title}</h3>
        
        <div className="question-tags">
          {question.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>

        {/* 底部状态栏 */}
        <div className="question-status-bar">
          <button
            className={`status-badge ${progress === 'not_started' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleProgressChange('not_started');
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <span>未开始</span>
          </button>
          <button
            className={`status-badge ${progress === 'learning' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleProgressChange('learning');
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span>学习中</span>
          </button>
          <button
            className={`status-badge ${progress === 'mastered' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleProgressChange('mastered');
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>已掌握</span>
          </button>
          <button
            className={`favorite-action ${favorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>{favorite ? '已收藏' : '收藏'}</span>
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="question-content">
          <div className="question-section">
            <h4>题目：</h4>
            <p>{question.question}</p>
          </div>
          
          {/* 编程题 */}
          {isCodingQuestion && question.codingConfig && (
            <div className="coding-section">
              <CodeRunner
                key={question.id}
                questionId={question.id}
                language={question.codingConfig.language}
                starterCode={question.codingConfig.starterCode}
                testCases={question.codingConfig.testCases}
                scoreDimensions={question.scoreDimensions}
                onScoreChange={handleScoreCalculated}
              />
              
              {showScorePanel && codeScore && (
                <ScorePanel
                  score={codeScore}
                  questionType="coding"
                />
              )}
              
              <div className="question-actions">
                <button
                  className="show-answer-btn"
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  {showAnswer ? '隐藏参考答案' : '查看参考答案'}
                </button>
              </div>
              
              {showAnswer && (
                <div className="reference-answer">
                  <h4>参考答案：</h4>
                  <div className="code-editor-container">
                    <Editor
                      height="300px"
                      language={question.codingConfig.language}
                      value={question.answer}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        readOnly: true,
                        fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 理论题 */}
          {!isCodingQuestion && (
            <>
              <div className="user-answer-section">
                <h4>你的答案：</h4>
                <div className="answer-editor-container">
                  <Editor
                    height="200px"
                    language="markdown"
                    value={userAnswer}
                    onChange={(value) => setUserAnswer(value || '')}
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
                      readOnly: false,
                      domReadOnly: false,
                    }}
                  />
                </div>
               
                <button
                  className="submit-answer-btn"
                  onClick={handleTheorySubmit}
                  disabled={!userAnswer.trim()}
                >
                  提交答案并评分
                </button>
              </div>
              
              {showScorePanel && (
                <ScorePanel
                  userAnswer={userAnswer}
                  correctAnswer={question.answer}
                  questionType="theory"
                />
              )}
              
              <div className="question-actions">
                <button
                  className="show-answer-btn"
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  {showAnswer ? '隐藏参考答案' : '查看参考答案'}
                </button>
              </div>
              
              {showAnswer && (
                <AnswerPanel
                  answer={question.answer}
                  codeExamples={question.codeExamples}
                  references={question.references}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
