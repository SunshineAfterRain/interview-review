import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../stores/useInterviewStore';
import { InterviewSetup, InterviewQuestion, InterviewTimer, InterviewReport } from '../components/interview';
import { allQuestions } from '../data';
import type { Question } from '../types/question';
import type { InterviewReport as InterviewReportType } from '../types/interview';
import './Interview.css';

type InterviewPhase = 'setup' | 'interview' | 'report';

/**
 * 模拟面试页面
 */
export const Interview: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const [report, setReport] = useState<InterviewReportType | null>(null);
  
  const {
    currentSession,
    currentIndex,
    isLoading,
    error,
    setupInterview,
    submitAnswer,
    skipQuestion,
    nextQuestion,
    previousQuestion,
    finishInterview,
    abandonInterview,
    clearError,
    getCurrentQuestion,
    getProgress,
  } = useInterviewStore();
  
  // 清除错误
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);
  
  // 开始面试
  const handleStart = async (config: Parameters<typeof setupInterview>[0]) => {
    try {
      await setupInterview(config);
      setPhase('interview');
    } catch (err) {
      console.error('Failed to start interview:', err);
    }
  };
  
  // 提交答案
  const handleSubmit = async (answer: string) => {
    try {
      await submitAnswer(answer);
      
      const progress = getProgress();
      if (progress.current >= progress.total) {
        // 最后一题，完成面试
        const result = await finishInterview();
        setReport(result);
        setPhase('report');
      } else {
        nextQuestion();
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  };
  
  // 跳过题目
  const handleSkip = async () => {
    try {
      await skipQuestion();
      
      const progress = getProgress();
      if (progress.current >= progress.total) {
        const result = await finishInterview();
        setReport(result);
        setPhase('report');
      } else {
        nextQuestion();
      }
    } catch (err) {
      console.error('Failed to skip question:', err);
    }
  };
  
  // 超时处理
  const handleTimeout = async () => {
    try {
      await skipQuestion();
      
      const progress = getProgress();
      if (progress.current >= progress.total) {
        const result = await finishInterview();
        setReport(result);
        setPhase('report');
      } else {
        nextQuestion();
      }
    } catch (err) {
      console.error('Failed to handle timeout:', err);
    }
  };
  
  // 放弃面试
  const handleAbandon = async () => {
    if (confirm('确定要放弃本次面试吗？')) {
      await abandonInterview();
      setPhase('setup');
    }
  };
  
  // 重试
  const handleRetry = () => {
    setReport(null);
    setPhase('setup');
  };
  
  // 返回首页
  const handleBackHome = () => {
    navigate('/');
  };
  
  // 查看历史
  const handleViewHistory = () => {
    navigate('/progress');
  };
  
  // 获取当前题目
  const currentQuestion = getCurrentQuestion();
  
  // 获取进度
  const progress = getProgress();
  
  // 获取所有题目
  const questions = currentSession?.questionIds.map(id => 
    allQuestions.find(q => q.id === id)
  ).filter(Boolean) as Question[];
  
  return (
    <div className="interview-page">
      {/* 错误提示 */}
      {error && (
        <div className="error-toast">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}
      
      {/* 加载状态 */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <span>加载中...</span>
        </div>
      )}
      
      {/* 设置阶段 */}
      {phase === 'setup' && (
        <div className="setup-phase">
          <InterviewSetup 
            onStart={handleStart}
            onCancel={handleBackHome}
          />
        </div>
      )}
      
      {/* 答题阶段 */}
      {phase === 'interview' && currentSession && currentQuestion && (
        <div className="interview-phase">
          {/* 顶部计时器 */}
          <div className="interview-header">
            <InterviewTimer
              duration={currentSession.config.questionCount * currentSession.config.timeLimit * 60}
              onTimeout={handleTimeout}
            />
            <button className="abandon-btn" onClick={handleAbandon}>
              放弃面试
            </button>
          </div>
          
          {/* 题目内容 */}
          <InterviewQuestion
            question={currentQuestion}
            questionNumber={progress.current}
            totalQuestions={progress.total}
            timeLimit={currentSession.config.timeLimit}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            onPrevious={currentIndex > 0 ? previousQuestion : undefined}
            canGoPrevious={currentIndex > 0 && !currentSession.answers[currentIndex]}
          />
        </div>
      )}
      
      {/* 报告阶段 */}
      {phase === 'report' && report && currentSession && (
        <div className="report-phase">
          <InterviewReport
            report={report}
            questions={questions}
            session={currentSession}
            onRetry={handleRetry}
            onBackHome={handleBackHome}
            onViewHistory={handleViewHistory}
          />
        </div>
      )}
    </div>
  );
};

export default Interview;
