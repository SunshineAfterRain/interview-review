import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReviewStore } from '../../stores/useReviewStore';
import { allQuestions } from '../../data';
import { CATEGORIES, DIFFICULTY_LABELS } from '../../types/question';
import './review.css';

/**
 * 复习队列组件
 * 显示今日待复习的题目列表
 */
export const ReviewQueue: React.FC = () => {
  const { reviewQueue, loadReviewQueue, markAsReviewed, isLoading } = useReviewStore();
  const [filter, setFilter] = useState<'all' | 'overdue'>('all');

  useEffect(() => {
    loadReviewQueue();
  }, [loadReviewQueue]);

  // 获取题目详情
  const getQuestionDetails = (questionId: string) => {
    return allQuestions.find(q => q.id === questionId);
  };

  // 判断是否过期
  const isOverdue = (nextReviewAt: string) => {
    const nextReview = new Date(nextReviewAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return nextReview < today;
  };

  // 过滤队列
  const filteredQueue = filter === 'overdue' 
    ? reviewQueue.filter(item => isOverdue(item.nextReviewAt))
    : reviewQueue;

  // 按复习时间排序
  const sortedQueue = [...filteredQueue].sort((a, b) => 
    new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="review-queue loading">
        <div className="loading-spinner"></div>
        <span>加载复习队列...</span>
      </div>
    );
  }

  if (reviewQueue.length === 0) {
    return (
      <div className="review-queue empty">
        <div className="empty-icon">📚</div>
        <h3>今日复习已完成</h3>
        <p>没有待复习的题目，继续保持学习吧！</p>
      </div>
    );
  }

  return (
    <div className="review-queue">
      <div className="queue-header">
        <h3>
          <span className="header-icon">🔄</span>
          今日复习
          <span className="count-badge">{reviewQueue.length}</span>
        </h3>
        
        <div className="queue-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部 ({reviewQueue.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
            onClick={() => setFilter('overdue')}
          >
            已过期 ({reviewQueue.filter(i => isOverdue(i.nextReviewAt)).length})
          </button>
        </div>
      </div>

      <div className="queue-list">
        {sortedQueue.map((item) => {
          const question = getQuestionDetails(item.questionId);
          if (!question) return null;

          const category = CATEGORIES.find(c => c.key === question.category);
          const difficulty = DIFFICULTY_LABELS[question.difficulty];
          const overdue = isOverdue(item.nextReviewAt);

          return (
            <div key={item.questionId} className={`queue-item ${overdue ? 'overdue' : ''}`}>
              <div className="item-header">
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
                </div>
                
                <div className="review-info">
                  {overdue && <span className="overdue-badge">已过期</span>}
                  <span className="review-count">
                    复习 {item.reviewCount} 次
                  </span>
                </div>
              </div>

              <Link 
                to={`/questions/${question.id}`}
                className="item-title"
              >
                {question.title}
              </Link>

              <div className="item-footer">
                <div className="next-review">
                  <span className="label">下次复习：</span>
                  <span className="date">
                    {new Date(item.nextReviewAt).toLocaleDateString()}
                  </span>
                </div>
                
                <button
                  className="mark-reviewed-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    markAsReviewed(item.questionId);
                  }}
                >
                  已复习
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 复习队列统计组件
 */
export const ReviewQueueStats: React.FC = () => {
  const { reviewQueue, getReviewStats } = useReviewStore();
  const [stats, setStats] = useState({
    total: 0,
    overdue: 0,
    dueToday: 0,
    upcoming: 0,
  });

  useEffect(() => {
    getReviewStats().then(setStats);
  }, [getReviewStats, reviewQueue]);

  return (
    <div className="review-stats">
      <div className="stat-item">
        <span className="stat-value">{stats.total}</span>
        <span className="stat-label">总复习项</span>
      </div>
      <div className="stat-item">
        <span className="stat-value overdue">{stats.overdue}</span>
        <span className="stat-label">已过期</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.dueToday}</span>
        <span className="stat-label">今日待复习</span>
      </div>
      <div className="stat-item">
        <span className="stat-value upcoming">{stats.upcoming}</span>
        <span className="stat-label">本周待复习</span>
      </div>
    </div>
  );
};
