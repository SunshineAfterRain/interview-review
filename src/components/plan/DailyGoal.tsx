import React from 'react';
import { usePlanStore } from '../../stores/usePlanStore';
import { DAILY_GOAL_OPTIONS } from '../../types/plan';

/**
 * 每日目标组件 - 每日目标设置
 */
export const DailyGoal: React.FC = () => {
  const { dailyGoal, setDailyTarget, stats } = usePlanStore();
  
  // 计算进度
  const progress = dailyGoal.targetCount > 0 
    ? Math.min(100, Math.round((dailyGoal.completedCount / dailyGoal.targetCount) * 100))
    : 0;
  
  // 是否完成
  const isCompleted = dailyGoal.completedCount >= dailyGoal.targetCount;
  
  // 增加目标
  const increaseTarget = () => {
    const currentIndex = DAILY_GOAL_OPTIONS.findIndex(o => o.value === dailyGoal.targetCount);
    if (currentIndex < DAILY_GOAL_OPTIONS.length - 1) {
      setDailyTarget(DAILY_GOAL_OPTIONS[currentIndex + 1].value);
    }
  };
  
  // 减少目标
  const decreaseTarget = () => {
    const currentIndex = DAILY_GOAL_OPTIONS.findIndex(o => o.value === dailyGoal.targetCount);
    if (currentIndex > 0) {
      setDailyTarget(DAILY_GOAL_OPTIONS[currentIndex - 1].value);
    }
  };
  
  return (
    <div className={`daily-goal ${isCompleted ? 'completed' : ''}`}>
      <div className="goal-header">
        <h3>今日目标</h3>
        {isCompleted && (
          <span className="goal-badge">已完成</span>
        )}
      </div>
      
      {/* 进度环 */}
      <div className="goal-progress-ring">
        <svg viewBox="0 0 100 100" className="progress-circle">
          <circle
            className="progress-bg"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="10"
          />
          <circle
            className="progress-fill"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="10"
            strokeDasharray={`${progress * 2.83} 283`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="progress-content">
          <span className="progress-value">{dailyGoal.completedCount}</span>
          <span className="progress-total">/ {dailyGoal.targetCount}</span>
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="goal-progress-bar">
        <div className="progress-track">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-percent">{progress}%</span>
      </div>
      
      {/* 目标调整 */}
      <div className="goal-adjust">
        <button 
          className="adjust-btn"
          onClick={decreaseTarget}
          disabled={dailyGoal.targetCount <= DAILY_GOAL_OPTIONS[0].value}
        >
          -
        </button>
        <span className="target-value">{dailyGoal.targetCount} 题/天</span>
        <button 
          className="adjust-btn"
          onClick={increaseTarget}
          disabled={dailyGoal.targetCount >= DAILY_GOAL_OPTIONS[DAILY_GOAL_OPTIONS.length - 1].value}
        >
          +
        </button>
      </div>
      
      {/* 统计信息 */}
      <div className="goal-stats">
        <div className="stat-item">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{stats.streak} 天</span>
          <span className="stat-label">连续学习</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">📚</span>
          <span className="stat-value">{stats.masteredQuestions}</span>
          <span className="stat-label">已掌握</span>
        </div>
      </div>
    </div>
  );
};

export default DailyGoal;
