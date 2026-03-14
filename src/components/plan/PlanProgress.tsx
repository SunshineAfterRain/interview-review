import React, { useMemo } from 'react';
import { usePlanStore } from '../../stores/usePlanStore';
import { useUserStore } from '../../stores/useUserStore';
import type { StudyPlan } from '../../types/plan';

interface PlanProgressProps {
  plan?: StudyPlan;
}

/**
 * 计划进度组件 - 计划进度追踪
 */
export const PlanProgress: React.FC<PlanProgressProps> = ({ plan }) => {
  const { plans, stats } = usePlanStore();
  const { progress } = useUserStore();
  
  // 计算周进度
  const weeklyProgress = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // 本周开始
    
    let completedThisWeek = 0;
    
    Object.values(progress).forEach(p => {
      const lastVisit = new Date(p.lastVisit);
      if (lastVisit >= weekStart && p.status !== 'not_started') {
        completedThisWeek++;
      }
    });
    
    // 假设每周目标 35 题（每天 5 题）
    const weeklyTarget = stats.todayTarget * 7;
    return Math.min(100, Math.round((completedThisWeek / weeklyTarget) * 100));
  }, [progress, stats.todayTarget]);
  
  // 计算月进度
  const monthlyProgress = useMemo(() => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    let completedThisMonth = 0;
    
    Object.values(progress).forEach(p => {
      const lastVisit = new Date(p.lastVisit);
      if (lastVisit >= monthStart && p.status !== 'not_started') {
        completedThisMonth++;
      }
    });
    
    // 假设每月目标 150 题（每天 5 题）
    const monthlyTarget = stats.todayTarget * 30;
    return Math.min(100, Math.round((completedThisMonth / monthlyTarget) * 100));
  }, [progress, stats.todayTarget]);
  
  // 如果传入了特定计划，显示该计划的进度
  if (plan) {
    const total = plan.items.length;
    const completed = plan.items.filter(item => item.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return (
      <div className="plan-progress single-plan">
        <div className="progress-header">
          <h4>{plan.title}</h4>
          <span className="progress-badge">{plan.type === 'daily' ? '日计划' : plan.type === 'weekly' ? '周计划' : '月计划'}</span>
        </div>
        
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="progress-text">{completed}/{total}</span>
        </div>
        
        <div className="progress-details">
          <span>完成度：{percentage}%</span>
          <span>开始日期：{new Date(plan.startDate).toLocaleDateString()}</span>
        </div>
      </div>
    );
  }
  
  // 显示总体进度
  return (
    <div className="plan-progress">
      <h3>学习进度</h3>
      
      {/* 今日进度 */}
      <div className="progress-section">
        <div className="section-header">
          <span className="section-icon">📅</span>
          <span className="section-title">今日</span>
          <span className="section-value">
            {stats.todayCompleted}/{stats.todayTarget}
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill today"
            style={{ 
              width: `${Math.min(100, (stats.todayCompleted / stats.todayTarget) * 100)}%` 
            }}
          />
        </div>
      </div>
      
      {/* 本周进度 */}
      <div className="progress-section">
        <div className="section-header">
          <span className="section-icon">📆</span>
          <span className="section-title">本周</span>
          <span className="section-value">{weeklyProgress}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill weekly"
            style={{ width: `${weeklyProgress}%` }}
          />
        </div>
      </div>
      
      {/* 本月进度 */}
      <div className="progress-section">
        <div className="section-header">
          <span className="section-icon">🗓️</span>
          <span className="section-title">本月</span>
          <span className="section-value">{monthlyProgress}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill monthly"
            style={{ width: `${monthlyProgress}%` }}
          />
        </div>
      </div>
      
      {/* 学习统计 */}
      <div className="progress-stats">
        <div className="stat-box">
          <span className="stat-number">{stats.totalStudyDays}</span>
          <span className="stat-text">学习天数</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{stats.masteredQuestions}</span>
          <span className="stat-text">已掌握</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{Math.floor(stats.totalTimeSpent / 3600)}h</span>
          <span className="stat-text">学习时长</span>
        </div>
      </div>
      
      {/* 活跃计划 */}
      {plans.filter(p => p.status === 'active').length > 0 && (
        <div className="active-plans">
          <h4>进行中的计划</h4>
          {plans.filter(p => p.status === 'active').slice(0, 3).map(p => {
            const completed = p.items.filter(i => i.completed).length;
            const total = p.items.length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            return (
              <div key={p.id} className="plan-item">
                <span className="plan-title">{p.title}</span>
                <div className="plan-mini-progress">
                  <div className="mini-bar">
                    <div className="mini-fill" style={{ width: `${percent}%` }} />
                  </div>
                  <span>{completed}/{total}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlanProgress;
