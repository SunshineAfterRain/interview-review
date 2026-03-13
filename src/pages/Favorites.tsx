import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { allQuestions } from '../data';
import { CATEGORIES, DIFFICULTY_LABELS } from '../types/question';
import './Favorites.css';

/**
 * 收藏夹页面
 * 显示用户收藏的题目列表
 */
export const Favorites: React.FC = () => {
  const { favorites, toggleFavorite, getProgress } = useUserStore();

  // 获取收藏的题目列表
  const favoriteQuestions = useMemo(() => {
    return allQuestions.filter(q => favorites.includes(q.id));
  }, [favorites]);

  // 如果没有收藏题目
  if (favoriteQuestions.length === 0) {
    return (
      <div className="favorites-page">
        <div className="favorites-empty">
          <div className="empty-icon">⭐</div>
          <h2>还没有收藏题目</h2>
          <p>浏览题目时点击收藏按钮，将题目添加到收藏夹</p>
          <Link to="/" className="browse-link">
            浏览题目
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h2>
          <span className="header-icon">⭐</span>
          我的收藏
          <span className="count-badge">{favoriteQuestions.length}</span>
        </h2>
        <p className="header-desc">快速访问你收藏的题目</p>
      </div>

      <div className="favorites-list">
        {favoriteQuestions.map((question) => {
          const category = CATEGORIES.find(c => c.key === question.category);
          const difficulty = DIFFICULTY_LABELS[question.difficulty];
          const progress = getProgress(question.id);

          return (
            <div key={question.id} className="favorite-card">
              <div className="favorite-card-header">
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
                  <span className={`progress-badge ${progress}`}>
                    {progress === 'not_started' && '未开始'}
                    {progress === 'learning' && '学习中'}
                    {progress === 'mastered' && '已掌握'}
                  </span>
                </div>
                
                <button
                  className="remove-favorite-btn"
                  onClick={() => toggleFavorite(question.id)}
                  aria-label="取消收藏"
                  title="取消收藏"
                >
                  ✕
                </button>
              </div>

              <Link 
                to={`/questions/${question.id}`} 
                className="favorite-card-title"
              >
                {question.title}
              </Link>

              <div className="question-tags">
                {question.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
                {question.tags.length > 3 && (
                  <span className="tag more">+{question.tags.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
