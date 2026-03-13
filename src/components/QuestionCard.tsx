import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
          {/* 学习进度标记 */}
          <span className={`progress-badge ${progress}`}>
            {progress === 'not_started' && '○ 未开始'}
            {progress === 'learning' && '◐ 学习中'}
            {progress === 'mastered' && '● 已掌握'}
          </span>
        </div>
        
        <h3 className="question-title">{question.title}</h3>
        
        <div className="question-tags">
          {question.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="header-actions">
          {/* 收藏按钮 */}
          <button
            className={`favorite-btn ${favorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={favorite ? '取消收藏' : '收藏'}
            title={favorite ? '取消收藏' : '收藏'}
          >
            {favorite ? '★' : '☆'}
          </button>
          
          <button className="expand-btn">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="question-content">
          {/* 进度更新按钮 */}
          <div className="progress-actions">
            <span className="progress-label">更新学习状态：</span>
            <button
              className={`progress-btn ${progress === 'not_started' ? 'active' : ''}`}
              onClick={() => handleProgressChange('not_started')}
            >
              ○ 未开始
            </button>
            <button
              className={`progress-btn ${progress === 'learning' ? 'active' : ''}`}
              onClick={() => handleProgressChange('learning')}
            >
              ◐ 学习中
            </button>
            <button
              className={`progress-btn ${progress === 'mastered' ? 'active' : ''}`}
              onClick={() => handleProgressChange('mastered')}
            >
              ● 已掌握
            </button>
            <Link 
              to={`/questions/${question.id}`} 
              className="detail-link"
              onClick={(e) => e.stopPropagation()}
            >
              查看详情 →
            </Link>
          </div>

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
                {!userAnswer.trim() && (
                  <p className="answer-placeholder">请在此输入你的答案...</p>
                )}
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
