import React, { useEffect, useState } from 'react';

interface InterviewTimerProps {
  duration: number; // 总时长（秒）
  onTimeout: () => void;
  onWarning?: () => void;
  warningThreshold?: number; // 警告阈值（秒），默认 60 秒
}

/**
 * 面试计时器组件
 */
export const InterviewTimer: React.FC<InterviewTimerProps> = ({
  duration,
  onTimeout,
  onWarning,
  warningThreshold = 60,
}) => {
  const [remaining, setRemaining] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        
        // 触发警告
        if (prev === warningThreshold && !isWarning) {
          setIsWarning(true);
          onWarning?.();
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [duration, onTimeout, onWarning, warningThreshold, isPaused, isWarning]);
  
  // 格式化时间
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  // 计算进度
  const progress = ((duration - remaining) / duration) * 100;
  
  // 暂停/继续
  const togglePause = () => {
    setIsPaused(!isPaused);
  };
  
  return (
    <div className={`interview-timer ${isWarning ? 'warning' : ''} ${remaining === 0 ? 'timeout' : ''}`}>
      <div className="timer-progress">
        <svg viewBox="0 0 100 100" className="timer-circle">
          <circle
            className="timer-bg"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
          />
          <circle
            className="timer-fill"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeDasharray={`${progress * 2.83} 283`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="timer-content">
          <span className="timer-value">{formatTime(remaining)}</span>
          <span className="timer-label">剩余时间</span>
        </div>
      </div>
      
      <button 
        className={`timer-pause-btn ${isPaused ? 'paused' : ''}`}
        onClick={togglePause}
        title={isPaused ? '继续' : '暂停'}
      >
        {isPaused ? '▶' : '⏸'}
      </button>
      
      {isWarning && (
        <div className="timer-warning-text">
          ⚠️ 时间即将用尽
        </div>
      )}
    </div>
  );
};

export default InterviewTimer;
