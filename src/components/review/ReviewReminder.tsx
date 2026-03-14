import React, { useEffect, useState } from 'react';
import { useReviewStore } from '../../stores/useReviewStore';
import { allQuestions } from '../../data';
import './review.css';

interface ReviewReminderProps {
  onClose: () => void;
}

/**
 * 复习提醒弹窗组件
 */
export const ReviewReminder: React.FC<ReviewReminderProps> = ({ onClose }) => {
  const { reviewQueue, shouldNotify, updateLastNotified } = useReviewStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 检查是否需要显示提醒
    if (shouldNotify() && reviewQueue.length > 0) {
      setIsVisible(true);
      updateLastNotified();
    }
  }, [reviewQueue, shouldNotify, updateLastNotified]);

  // 获取前3个待复习题目
  const previewQuestions = reviewQueue.slice(0, 3).map(item => {
    const question = allQuestions.find(q => q.id === item.questionId);
    return question;
  }).filter(Boolean);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <div className="review-reminder-overlay" onClick={handleClose}>
      <div className="review-reminder" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>×</button>
        
        <div className="reminder-icon">🔔</div>
        
        <h2>复习提醒</h2>
        
        <p className="reminder-message">
          你有 <strong>{reviewQueue.length}</strong> 道题目需要复习
        </p>

        {previewQuestions.length > 0 && (
          <div className="preview-list">
            <h4>待复习题目：</h4>
            <ul>
              {previewQuestions.map(q => (
                <li key={q!.id}>
                  <span className="preview-title">{q!.title}</span>
                </li>
              ))}
            </ul>
            {reviewQueue.length > 3 && (
              <p className="more-hint">还有 {reviewQueue.length - 3} 道题目...</p>
            )}
          </div>
        )}

        <div className="reminder-actions">
          <button 
            className="start-review-btn"
            onClick={() => {
              handleClose();
              // 跳转到复习页面或第一道题目
              if (reviewQueue.length > 0) {
                window.location.href = `/questions/${reviewQueue[0].questionId}`;
              }
            }}
          >
            开始复习
          </button>
          <button className="later-btn" onClick={handleClose}>
            稍后提醒
          </button>
        </div>

        <p className="reminder-tip">
          💡 根据艾宾浩斯遗忘曲线，定期复习可以加深记忆
        </p>
      </div>
    </div>
  );
};

/**
 * 复习提醒徽章组件
 */
export const ReviewReminderBadge: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { reviewQueue, loadReviewQueue } = useReviewStore();

  useEffect(() => {
    loadReviewQueue();
  }, [loadReviewQueue]);

  if (reviewQueue.length === 0) return null;

  return (
    <button className="review-badge" onClick={onClick}>
      <span className="badge-icon">🔔</span>
      <span className="badge-count">{reviewQueue.length}</span>
    </button>
  );
};
