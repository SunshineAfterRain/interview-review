import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Question, DIFFICULTY_LABELS, CATEGORIES, ScoreResult } from '../types/question';
import { AnswerPanel } from './AnswerPanel';
import { CodeRunner } from './CodeRunner';
import { ScorePanel } from './ScorePanel';
import { useUserStore } from '../stores/useUserStore';
import { useAnswerStore } from '../stores/useAnswerStore';

// 防抖函数
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

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
  
  const { 
    getAnswer, 
    saveAnswer, 
    getSaveStatus
  } = useAnswerStore();
  
  // 加载已保存的答案
  useEffect(() => {
    const savedAnswer = getAnswer(question.id);
    if (savedAnswer) {
      setUserAnswer(savedAnswer);
    }
  }, [question.id, getAnswer]);
  
  // 防抖保存答案
  const debouncedSave = useCallback(
    debounce((answer: string) => {
      saveAnswer(question.id, answer);
    }, 1000),
    [question.id, saveAnswer]
  );
  
  // 当答案变化时自动保存
  const handleAnswerChange = (value: string) => {
    setUserAnswer(value);
    if (value.trim()) {
      debouncedSave(value);
    }
  };
  
  const category = CATEGORIES.find(c => c.key === question.category);
  const difficulty = DIFFICULTY_LABELS[question.difficulty];
  const isCodingQuestion = question.questionType === 'coding';
  const favorite = isFavorite(question.id);
  const progress = getProgress(question.id);
  const saveStatus = getSaveStatus(question.id);

  const handleScoreCalculated = (score: ScoreResult) => {
    setCodeScore(score);
    setShowScorePanel(true);
    
    // 根据分数自动更新状态
    if (score.totalScore >= 60) {
      updateProgress(question.id, 'mastered');
    } else {
      updateProgress(question.id, 'learning');
    }
  };

  const handleTheorySubmit = () => {
    if (userAnswer.trim()) {
      // 提交前立即保存
      saveAnswer(question.id, userAnswer);
      setShowScorePanel(true);
      
      // 理论题评分后自动更新状态
      const score = scoreTheoryAnswer(userAnswer, question.answer);
      if (score.totalScore >= 60) {
        updateProgress(question.id, 'mastered');
      } else {
        updateProgress(question.id, 'learning');
      }
    }
  };
  
  // 理论题评分函数（从 ScorePanel 复制）
  const scoreTheoryAnswer = (userAnswer: string, correctAnswer: string) => {
    const userKeywords = extractKeywords(userAnswer);
    const correctKeywords = extractKeywords(correctAnswer);
    
    const matchedKeywords = userKeywords.filter(k => 
      correctKeywords.some(ck => ck.includes(k) || k.includes(ck))
    );
    const coverage = correctKeywords.length > 0 
      ? matchedKeywords.length / correctKeywords.length 
      : 0;
    
    const completenessScore = Math.round(coverage * 40);
    const accuracyScore = Math.round(
      (coverage * 0.7 + Math.min(userAnswer.length / correctAnswer.length, 1) * 0.3) * 30
    );
    const structureScore = analyzeStructure(userAnswer);
    const clarityScore = Math.round(structureScore * 20);
    const keywordScore = Math.round(Math.min(matchedKeywords.length / 5, 1) * 10);
    
    return {
      totalScore: completenessScore + accuracyScore + clarityScore + keywordScore,
      maxScore: 100,
      dimensions: [],
      passedTests: matchedKeywords.length,
      totalTests: correctKeywords.length,
      suggestions: []
    };
  };
  
  const extractKeywords = (text: string): string[] => {
    const stopWords = new Set(['的', '是', '在', '和', '了', '有', '不', '这', '我', '他', '她', '它', '们', '个', '中', '上', '下', '为', '以', '于', '到', '从', '时', '也', '就', '都', '而', '及', '与', '或', '但', '如', '若', '因', '被', '让', '把', '给', '向', '对', '能', '会', '可以', '需要', '应该', '必须', '可能', '如果', '那么', '因为', '所以', '但是', '然而', '或者', '以及', '例如', '比如', '通过', '使用', '实现', '方法', '功能', '一种', '一个', '这个', '那个', '这些', '那些', '什么', '怎么', '如何', '为什么', '哪', '哪有']);
    return text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.has(word))
      .slice(0, 20);
  };
  
  const analyzeStructure = (text: string): number => {
    let score = 0;
    if (text.includes('\n')) score += 0.3;
    if (text.includes('。') || text.includes('.')) score += 0.2;
    if (text.includes('，') || text.includes(',')) score += 0.2;
    if (text.length > 50) score += 0.3;
    return Math.min(score, 1);
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
                <h4>你的答案：{saveStatus === 'saving' && <span className="save-status saving">保存中...</span>}{saveStatus === 'saved' && <span className="save-status saved">已保存</span>}</h4>
                <div className="answer-editor-container">
                  <Editor
                    height="200px"
                    language="markdown"
                    value={userAnswer}
                    onChange={(value) => handleAnswerChange(value || '')}
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
