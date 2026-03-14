import React from 'react';
import { useTimer } from '../hooks/useTimer';
import './timer.css';

interface StudyTimerProps {
  questionId: string;
  autoStart?: boolean;
  showControls?: boolean;
  compact?: boolean;
}

/**
 * 学习计时器组件
 */
export const StudyTimer: React.FC<StudyTimerProps> = ({
  questionId,
  autoStart = true,
  showControls = true,
  compact = false,
}) => {
  const { seconds, formattedTime, isRunning, start, reset, toggle } = useTimer(questionId);

  // 自动开始计时
  React.useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  if (compact) {
    return (
      <div className={`study-timer compact ${isRunning ? 'running' : ''}`}>
        <span className="timer-icon">{isRunning ? '⏱️' : '⏸️'}</span>
        <span className="timer-display">{formattedTime}</span>
        {showControls && (
          <button className="timer-toggle" onClick={toggle}>
            {isRunning ? '⏸' : '▶'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`study-timer ${isRunning ? 'running' : ''}`}>
      <div className="timer-header">
        <span className="timer-icon">{isRunning ? '⏱️' : '⏸️'}</span>
        <span className="timer-label">学习时间</span>
      </div>
      
      <div className="timer-display">{formattedTime}</div>
      
      {showControls && (
        <div className="timer-controls">
          <button 
            className="timer-btn primary"
            onClick={toggle}
          >
            {isRunning ? '暂停' : '继续'}
          </button>
          <button 
            className="timer-btn"
            onClick={reset}
            disabled={seconds === 0}
          >
            重置
          </button>
        </div>
      )}
      
      <div className="timer-hint">
        {isRunning ? '计时中...' : '已暂停'}
      </div>
    </div>
  );
};

/**
 * 计时器徽章组件
 */
export const TimerBadge: React.FC<{ questionId: string }> = ({ questionId }) => {
  const { formattedTime, isRunning, toggle } = useTimer(questionId, false);

  return (
    <button 
      className={`timer-badge ${isRunning ? 'running' : ''}`}
      onClick={toggle}
      title={isRunning ? '点击暂停' : '点击开始计时'}
    >
      <span className="badge-icon">⏱️</span>
      <span className="badge-time">{formattedTime}</span>
    </button>
  );
};

/**
 * 今日学习时间统计组件
 */
export const TodayStudyTime: React.FC = () => {
  const [totalTime, setTotalTime] = React.useState(0);

  React.useEffect(() => {
    // 从 localStorage 获取今日学习时间
    const today = new Date().toDateString();
    const savedTime = localStorage.getItem(`study-time-${today}`);
    if (savedTime) {
      setTotalTime(parseInt(savedTime, 10));
    }
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  return (
    <div className="today-study-time">
      <div className="study-time-icon">📚</div>
      <div className="study-time-info">
        <span className="study-time-label">今日学习</span>
        <span className="study-time-value">{formatTime(totalTime)}</span>
      </div>
    </div>
  );
};
