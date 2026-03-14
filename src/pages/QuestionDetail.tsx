import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { allQuestions } from '../data';
import { CATEGORIES, DIFFICULTY_LABELS } from '../types/question';
import { useUserStore } from '../stores/useUserStore';
import { useNoteStore } from '../stores/useNoteStore';
import { useReviewStore } from '../stores/useReviewStore';
import { useFavoriteStore } from '../stores/useFavoriteStore';
import { AnswerPanel } from '../components/AnswerPanel';
import { CodeRunner } from '../components/CodeRunner';
import { ScorePanel } from '../components/ScorePanel';
import { NoteEditor, NotePreview } from '../components/notes';
import { FolderSelector } from '../components/FavoriteManager';
import { StudyTimer, TimerBadge } from '../components/StudyTimer';
import './QuestionDetail.css';

/**
 * 题目详情页面
 * 显示单个题目的详细信息
 */
export const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const question = allQuestions.find(q => q.id === id);
  
  const { 
    isFavorite, 
    toggleFavorite, 
    getProgress, 
    updateProgress,
    isWrongQuestion,
    addToWrongQuestions,
    removeFromWrongQuestions,
    recordVisit
  } = useUserStore();

  const { 
    getNoteByQuestion, 
    deleteNote 
  } = useNoteStore();

  const { 
    addToReviewQueue,
    markAsReviewed 
  } = useReviewStore();

  const {
    loadFolders,
    loadFavorites
  } = useFavoriteStore();

  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [codeScore, setCodeScore] = useState<any>();
  const [showScorePanel, setShowScorePanel] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showFolderSelector, setShowFolderSelector] = useState(false);

  // 初始化
  useEffect(() => {
    loadFolders();
    loadFavorites();
  }, [loadFolders, loadFavorites]);

  // 记录访问
  useEffect(() => {
    if (id) {
      recordVisit(id);
    }
  }, [id, recordVisit]);

  // 如果题目不存在
  if (!question) {
    return (
      <div className="question-detail-page">
        <div className="question-not-found">
          <div className="not-found-icon">🔍</div>
          <h2>题目不存在</h2>
          <p>抱歉，没有找到该题目</p>
          <Link to="/" className="back-link">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find(c => c.key === question.category);
  const difficulty = DIFFICULTY_LABELS[question.difficulty];
  const isCodingQuestion = question.questionType === 'coding';
  const favorite = isFavorite(question.id);
  const progress = getProgress(question.id);
  const isWrong = isWrongQuestion(question.id);
  const note = getNoteByQuestion(question.id);

  const handleScoreCalculated = (score: any) => {
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
    
    // 如果标记为学习中，添加到复习队列
    if (status === 'learning') {
      addToReviewQueue(question.id);
    }
    
    // 如果标记为已掌握，从复习队列移除
    if (status === 'mastered') {
      markAsReviewed(question.id);
    }
  };

  // 分享功能
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/questions/${question.id}`;
    const shareText = `前端面试题：${question.title}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // 用户取消分享
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch (err) {
        prompt('复制链接:', shareUrl);
      }
    }
  };

  return (
    <div className="question-detail-page">
      {/* 面包屑导航 */}
      <div className="breadcrumb">
        <Link to="/">首页</Link>
        <span className="separator">/</span>
        <span className="current">{question.title}</span>
      </div>

      {/* 题目头部 */}
      <div className="question-detail-header">
        <div className="header-top">
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
            {/* 学习状态徽章 */}
            <button
              className={`header-status-badge ${progress}`}
              onClick={() => {
                const nextStatus = progress === 'not_started' ? 'learning' : progress === 'learning' ? 'mastered' : 'not_started';
                handleProgressChange(nextStatus);
              }}
              title="点击切换状态"
            >
              {progress === 'not_started' && (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  <span>未开始</span>
                </>
              )}
              {progress === 'learning' && (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <span>学习中</span>
                </>
              )}
              {progress === 'mastered' && (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>已掌握</span>
                </>
              )}
            </button>

            {/* 学习计时器 */}
            <TimerBadge questionId={question.id} />

            {/* 收藏按钮 */}
            <button
              className={`favorite-btn ${favorite ? 'active' : ''}`}
              onClick={() => toggleFavorite(question.id)}
              aria-label={favorite ? '取消收藏' : '收藏'}
            >
              {favorite ? '★' : '☆'}
            </button>

            {/* 收藏夹选择器 */}
            <div className="folder-selector-wrapper">
              <button
                className="folder-btn"
                onClick={() => setShowFolderSelector(!showFolderSelector)}
              >
                📁
              </button>
              {showFolderSelector && (
                <FolderSelector 
                  questionId={question.id}
                  onToggle={() => {
                    loadFavorites();
                  }}
                />
              )}
            </div>

            {/* 错题本按钮 */}
            <button
              className={`wrong-btn ${isWrong ? 'active' : ''}`}
              onClick={() => isWrong ? removeFromWrongQuestions(question.id) : addToWrongQuestions(question.id)}
              aria-label={isWrong ? '从错题本移除' : '加入错题本'}
              title={isWrong ? '从错题本移除' : '加入错题本'}
            >
              {isWrong ? '📝' : '🗒️'}
            </button>

            {/* 分享按钮 */}
            <button
              className={`share-btn ${shareCopied ? 'copied' : ''}`}
              onClick={handleShare}
              aria-label="分享题目"
              title="分享题目"
            >
              {shareCopied ? '✓' : '🔗'}
            </button>
          </div>
        </div>

        <h1 className="question-title">{question.title}</h1>

        <div className="question-tags">
          {question.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 学习计时器 */}
      <div className="timer-section">
        <StudyTimer questionId={question.id} compact />
      </div>

      {/* 题目内容 */}
      <div className="question-detail-content">
        <div className="question-section">
          <h3>题目描述</h3>
          <p>{question.question}</p>
        </div>

        {/* 编程题 */}
        {isCodingQuestion && question.codingConfig && (
          <div className="coding-section">
            <CodeRunner
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
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                    placeholder: '请在此输入你的答案...',
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

        {/* 笔记区域 */}
        <div className="note-section">
          <div className="note-section-header">
            <h3>📝 学习笔记</h3>
            {!showNoteEditor && !note && (
              <button 
                className="add-note-btn"
                onClick={() => setShowNoteEditor(true)}
              >
                + 添加笔记
              </button>
            )}
          </div>

          {showNoteEditor ? (
            <NoteEditor
              questionId={question.id}
              onSave={() => {
                setShowNoteEditor(false);
              }}
              onCancel={() => setShowNoteEditor(false)}
            />
          ) : note ? (
            <div className="note-container">
              <NotePreview
                note={note}
                onEdit={() => setShowNoteEditor(true)}
                onDelete={async () => {
                  if (confirm('确定要删除这条笔记吗？')) {
                    await deleteNote(note.id);
                  }
                }}
              />
            </div>
          ) : (
            <div className="note-placeholder">
              <p>还没有笔记，点击上方按钮添加学习笔记</p>
            </div>
          )}
        </div>
      </div>

      {/* 返回按钮 */}
      <div className="back-to-home">
        <Link to="/" className="back-link">
          ← 返回题目列表
        </Link>
      </div>
    </div>
  );
};
