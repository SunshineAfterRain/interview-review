import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { allQuestions } from '../data';
import { QuestionCard } from '../components/QuestionCard';
import './WrongQuestions.css';

export const WrongQuestions: React.FC = () => {
  const wrongQuestions = useUserStore((state) => state.wrongQuestions);
  const removeFromWrongQuestions = useUserStore((state) => state.removeFromWrongQuestions);

  const wrongQuestionsList = useMemo(() => {
    return allQuestions.filter((q) => wrongQuestions.includes(q.id));
  }, [wrongQuestions]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    wrongQuestionsList.forEach((q) => {
      stats[q.category] = (stats[q.category] || 0) + 1;
    });
    return stats;
  }, [wrongQuestionsList]);

  const difficultyStats = useMemo(() => {
    const stats: Record<string, number> = {
      easy: 0,
      medium: 0,
      hard: 0,
    };
    wrongQuestionsList.forEach((q) => {
      stats[q.difficulty] = (stats[q.difficulty] || 0) + 1;
    });
    return stats;
  }, [wrongQuestionsList]);

  const [expandedQuestion, setExpandedQuestion] = React.useState<string | null>(null);

  const handleQuestionToggle = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const handleRemoveFromWrong = (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWrongQuestions(questionId);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      javascript: 'JavaScript',
      react: 'React',
      css: 'CSS',
      performance: '性能优化',
      engineering: '工程化',
      'resume-based': '简历相关',
    };
    return labels[category] || category;
  };

  if (wrongQuestionsList.length === 0) {
    return (
      <div className="wrong-questions-page">
        <div className="wrong-questions-header">
          <h1>错题本</h1>
          <p className="subtitle">记录需要重点复习的题目</p>
        </div>

        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>错题本是空的</h2>
          <p>在题目详情页点击"加入错题本"按钮，将需要重点复习的题目添加到这里</p>
          <Link to="/" className="browse-btn">
            浏览题目
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrong-questions-page">
      <div className="wrong-questions-header">
        <h1>错题本</h1>
        <p className="subtitle">共 {wrongQuestionsList.length} 道题目需要复习</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{wrongQuestionsList.length}</div>
            <div className="stat-label">错题总数</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <div className="stat-value">{Object.keys(categoryStats).length}</div>
            <div className="stat-label">涉及分类</div>
          </div>
        </div>

        <div className="stat-card difficulty-stat">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="difficulty-bars">
              <div className="difficulty-bar">
                <span className="diff-label">简单</span>
                <div className="bar-container">
                  <div
                    className="bar-fill easy"
                    style={{ width: `${(difficultyStats.easy / wrongQuestionsList.length) * 100}%` }}
                  />
                </div>
                <span className="diff-count">{difficultyStats.easy}</span>
              </div>
              <div className="difficulty-bar">
                <span className="diff-label">中等</span>
                <div className="bar-container">
                  <div
                    className="bar-fill medium"
                    style={{ width: `${(difficultyStats.medium / wrongQuestionsList.length) * 100}%` }}
                  />
                </div>
                <span className="diff-count">{difficultyStats.medium}</span>
              </div>
              <div className="difficulty-bar">
                <span className="diff-label">困难</span>
                <div className="bar-container">
                  <div
                    className="bar-fill hard"
                    style={{ width: `${(difficultyStats.hard / wrongQuestionsList.length) * 100}%` }}
                  />
                </div>
                <span className="diff-count">{difficultyStats.hard}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="category-tags">
        {Object.entries(categoryStats).map(([category, count]) => (
          <span key={category} className="category-tag">
            {getCategoryLabel(category)} ({count})
          </span>
        ))}
      </div>

      <div className="questions-list">
        {wrongQuestionsList.map((question) => (
          <div key={question.id} className="wrong-question-item">
            <QuestionCard
              question={question}
              isExpanded={expandedQuestion === question.id}
              onToggle={() => handleQuestionToggle(question.id)}
            />
            <button
              className="remove-wrong-btn"
              onClick={(e) => handleRemoveFromWrong(question.id, e)}
              title="从错题本移除"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
