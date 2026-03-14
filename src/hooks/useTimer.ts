import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserStore } from '../stores/useUserStore';

interface UseTimerReturn {
  seconds: number;
  formattedTime: string;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  toggle: () => void;
}

/**
 * 学习计时器 Hook
 * @param questionId 题目 ID
 * @param autoSave 是否自动保存（默认 true）
 */
export function useTimer(questionId: string, autoSave: boolean = true): UseTimerReturn {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<string | null>(null);
  const { recordTimeSpent } = useUserStore();

  // 格式化时间
  const formatTime = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }, []);

  // 计时器逻辑
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = new Date().toISOString();
      }
      
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  // 页面离开时保存时间
  useEffect(() => {
    return () => {
      if (autoSave && seconds > 0 && questionId) {
        recordTimeSpent(questionId, seconds);
      }
    };
  }, [questionId, seconds, autoSave, recordTimeSpent]);

  // 页面可见性变化时处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        // 页面隐藏时暂停
        setIsRunning(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(0);
    startTimeRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  return {
    seconds,
    formattedTime: formatTime(seconds),
    isRunning,
    start,
    pause,
    reset,
    toggle,
  };
}

/**
 * 全局计时器 Hook（用于统计总学习时间）
 */
export function useGlobalTimer() {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTotalSeconds(s => s + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);

  const formatTime = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  }, []);

  return {
    totalSeconds,
    formattedTime: formatTime(totalSeconds),
    isActive,
    start: () => setIsActive(true),
    pause: () => setIsActive(false),
    reset: () => {
      setIsActive(false);
      setTotalSeconds(0);
    },
  };
}
