import React, { useMemo } from 'react';
import type { InterviewReport as InterviewReportType, InterviewSession } from '../../types/interview';
import type { Question } from '../../types/question';
import { CATEGORIES, DIFFICULTY_LABELS } from '../../types/question';

interface InterviewReportProps {
  report: InterviewReportType;
  questions: Question[];
  session: InterviewSession;
  onRetry: () => void;
  onBackHome: () => void;
  onViewHistory: () => void;
}

/**
 * 面试报告组件 - 结果报告、正确率、用时分析
 */
export const InterviewReport: React.FC<InterviewReportProps> = ({
  report,
  questions,
  session,
  onRetry,
  onBackHome,
  onViewHistory,
}) => {
  // 计算统计数据
  const stats = useMemo(() => {
    const completionRate = report.totalQuestions > 0
      ? Math.round((report.answeredQuestions / report.totalQuestions) * 100)
      : 0;
    
    const avgTime = report.averageTimePerQuestion;
    const totalMinutes = Math.floor(report.totalTime / 60);
    const totalSeconds = report.totalTime % 60;
    
    return {
      completionRate,
      avgTimeMinutes: Math.floor(avgTime / 60),
      avgTimeSeconds: Math.floor(avgTime % 60),
      totalTimeDisplay: `${totalMinutes}分${totalSeconds}秒`,
    };
  }, [report]);
  
  // 格式化时间
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}分${secs}秒`;
  };
  
  // 获取评分等级
  const getGrade = (rate: number) => {
    if (rate >= 90) return { label: '优秀', color: '#52c41a', icon: '🏆' };
    if (rate >= 70) return { label: '良好', color: '#1890ff', icon: '👍' };
    if (rate >= 50) return { label: '及格', color: '#faad14', icon: '✅' };
    return { label: '需努力', color: '#f5222d', icon: '💪' };
  };
  
  const grade = getGrade(stats.completionRate);
  
  return (
    <div className="interview-report">
      {/* 报告头部 */}
      <div className="report-header">
        <div className="grade-badge" style={{ backgroundColor: grade.color }}>
          <span className="grade-icon">{grade.icon}</span>
          <span className="grade-label">{grade.label}</span>
        </div>
        <h2>面试完成</h2>
        <p className="report-date">
          完成时间：{new Date(report.completedAt).toLocaleString()}
        </p>
      </div>
      
      {/* 核心统计 */}
      <div className="report-stats">
        <div className="stat-card primary">
          <div className="stat-value">{report.answeredQuestions}/{report.totalQuestions}</div>
          <div className="stat-label">完成题目</div>
          <div className="stat-bar">
            <div 
              className="stat-fill" 
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.completionRate}%</div>
          <div className="stat-label">完成率</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.totalTimeDisplay}</div>
          <div className="stat-label">总用时</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">
            {stats.avgTimeMinutes > 0 ? `${stats.avgTimeMinutes}分` : ''}
            {stats.avgTimeSeconds}秒
          </div>
          <div className="stat-label">平均用时</div>
        </div>
      </div>
      
      {/* 分类统计 */}
      {report.categoryStats.length > 0 && (
        <div className="report-section">
          <h3>分类表现</h3>
          <div className="category-stats">
            {report.categoryStats.map(stat => {
              const categoryInfo = CATEGORIES.find(c => c.key === stat.category);
              const rate = stat.total > 0 ? Math.round((stat.answered / stat.total) * 100) : 0;
              
              return (
                <div key={stat.category} className="category-stat-item">
                  <div className="category-header">
                    <span style={{ color: categoryInfo?.color }}>
                      {categoryInfo?.icon} {categoryInfo?.label}
                    </span>
                    <span className="category-rate">{rate}%</span>
                  </div>
                  <div className="category-bar">
                    <div 
                      className="category-fill"
                      style={{ 
                        width: `${rate}%`,
                        backgroundColor: categoryInfo?.color 
                      }}
                    />
                  </div>
                  <div className="category-detail">
                    完成 {stat.answered}/{stat.total} 题
                    {stat.skipped > 0 && ` · 跳过 ${stat.skipped} 题`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 难度统计 */}
      {report.difficultyStats.length > 0 && (
        <div className="report-section">
          <h3>难度分布</h3>
          <div className="difficulty-stats">
            {report.difficultyStats.map(stat => {
              const difficultyInfo = DIFFICULTY_LABELS[stat.difficulty];
              const rate = stat.total > 0 ? Math.round((stat.answered / stat.total) * 100) : 0;
              
              return (
                <div key={stat.difficulty} className="difficulty-stat-item">
                  <div className="difficulty-header">
                    <span style={{ color: difficultyInfo?.color }}>
                      {difficultyInfo?.label}
                    </span>
                    <span>{stat.total} 题</span>
                  </div>
                  <div className="difficulty-bar">
                    <div 
                      className="difficulty-fill"
                      style={{ 
                        width: `${rate}%`,
                        backgroundColor: difficultyInfo?.color 
                      }}
                    />
                  </div>
                  <div className="difficulty-detail">
                    完成 {stat.answered} 题
                    {stat.skipped > 0 && ` · 跳过 ${stat.skipped} 题`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 答题详情 */}
      <div className="report-section">
        <h3>答题详情</h3>
        <div className="answer-details">
          {questions.map((q, index) => {
            const answer = session.answers[index];
            const isAnswered = answer && !answer.skipped && answer.answer.trim();
            const isSkipped = answer?.skipped;
            
            return (
              <div 
                key={q.id} 
                className={`answer-item ${isAnswered ? 'answered' : ''} ${isSkipped ? 'skipped' : ''}`}
              >
                <div className="answer-header">
                  <span className="answer-number">第 {index + 1} 题</span>
                  <span className="answer-title">{q.title}</span>
                  <span className={`answer-status ${isAnswered ? 'answered' : 'skipped'}`}>
                    {isSkipped ? '已跳过' : isAnswered ? '已答' : '未答'}
                  </span>
                </div>
                {answer && answer.timeSpent > 0 && (
                  <div className="answer-time">
                    用时：{formatDuration(answer.timeSpent)}
                  </div>
                )}
                {isAnswered && (
                  <div className="answer-content">
                    <pre>{answer.answer}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="report-actions">
        <button className="btn btn-secondary" onClick={onViewHistory}>
          查看历史
        </button>
        <button className="btn btn-primary" onClick={onRetry}>
          再来一次
        </button>
        <button className="btn btn-secondary" onClick={onBackHome}>
          返回首页
        </button>
      </div>
    </div>
  );
};

export default InterviewReport;
