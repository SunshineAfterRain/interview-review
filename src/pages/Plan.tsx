import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanStore } from '../stores/usePlanStore';
import { DailyGoal, PlanProgress, AchievementNotification, AchievementList } from '../components/plan';
import { ACHIEVEMENT_DEFINITIONS } from '../types/plan';
import type { StudyPlan, Achievement } from '../types/plan';
import './Plan.css';

/**
 * 学习计划页面
 */
export const Plan: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'plans'>('overview');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  
  const {
    plans,
    achievements,
    newAchievements,
    loadPlans,
    loadAchievements,
    loadStats,
    clearNewAchievements,
    createPlan,
    deletePlan,
  } = usePlanStore();
  
  // 加载数据
  useEffect(() => {
    loadPlans();
    loadAchievements();
    loadStats();
  }, [loadPlans, loadAchievements, loadStats]);
  
  // 创建计划
  const handleCreatePlan = async (planData: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createPlan(planData);
      setShowCreatePlan(false);
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  };
  
  // 删除计划
  const handleDeletePlan = async (id: string) => {
    if (confirm('确定要删除这个计划吗？')) {
      await deletePlan(id);
    }
  };
  
  // 获取所有成就（包含未解锁的）
  const allAchievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map(def => {
    const earned = achievements.find(a => a.key === def.key);
    return earned || {
      id: def.key,
      key: def.key,
      type: def.type,
      name: def.name,
      description: def.description,
      icon: def.icon,
    };
  });
  
  // 统计成就
  const earnedCount = achievements.length;
  const totalCount = ACHIEVEMENT_DEFINITIONS.length;
  
  return (
    <div className="plan-page">
      {/* 成就通知 */}
      <AchievementNotification
        achievements={newAchievements}
        onClose={clearNewAchievements}
      />
      
      {/* 页面头部 */}
      <div className="plan-header">
        <h1>学习计划</h1>
        <p>制定学习目标，追踪学习进度</p>
      </div>
      
      {/* 标签导航 */}
      <div className="plan-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          概览
        </button>
        <button
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          成就 ({earnedCount}/{totalCount})
        </button>
        <button
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          计划列表
        </button>
      </div>
      
      {/* 概览标签 */}
      {activeTab === 'overview' && (
        <div className="plan-overview">
          <div className="overview-grid">
            {/* 每日目标 */}
            <div className="overview-card">
              <DailyGoal />
            </div>
            
            {/* 学习进度 */}
            <div className="overview-card">
              <PlanProgress />
            </div>
            
            {/* 最近成就 */}
            <div className="overview-card achievements-card">
              <h3>最近成就</h3>
              {achievements.length > 0 ? (
                <div className="recent-achievements">
                  {achievements.slice(0, 4).map(a => (
                    <div key={a.id} className="recent-achievement">
                      <span className="achievement-icon">{a.icon}</span>
                      <div className="achievement-info">
                        <span className="achievement-name">{a.name}</span>
                        <span className="achievement-date">
                          {new Date(a.earnedAt!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-achievements">
                  <p>还没有解锁成就</p>
                  <p>开始学习来解锁成就吧！</p>
                </div>
              )}
              <button 
                className="view-all-btn"
                onClick={() => setActiveTab('achievements')}
              >
                查看全部
              </button>
            </div>
            
            {/* 快捷操作 */}
            <div className="overview-card quick-actions">
              <h3>快捷操作</h3>
              <div className="action-buttons">
                <button 
                  className="action-btn"
                  onClick={() => navigate('/interview')}
                >
                  <span className="action-icon">🎯</span>
                  <span>开始面试</span>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => navigate('/')}
                >
                  <span className="action-icon">📚</span>
                  <span>浏览题目</span>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => navigate('/progress')}
                >
                  <span className="action-icon">📊</span>
                  <span>学习统计</span>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setShowCreatePlan(true)}
                >
                  <span className="action-icon">📝</span>
                  <span>创建计划</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 成就标签 */}
      {activeTab === 'achievements' && (
        <div className="plan-achievements">
          <div className="achievements-header">
            <h2>成就系统</h2>
            <p>完成学习目标，解锁成就徽章</p>
          </div>
          
          <div className="achievements-stats">
            <div className="stat-item">
              <span className="stat-value">{earnedCount}</span>
              <span className="stat-label">已解锁</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{totalCount - earnedCount}</span>
              <span className="stat-label">待解锁</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Math.round((earnedCount / totalCount) * 100)}%</span>
              <span className="stat-label">完成度</span>
            </div>
          </div>
          
          <div className="achievements-list">
            <AchievementList achievements={allAchievements} showAll />
          </div>
        </div>
      )}
      
      {/* 计划列表标签 */}
      {activeTab === 'plans' && (
        <div className="plan-list">
          <div className="list-header">
            <h2>我的计划</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreatePlan(true)}
            >
              创建计划
            </button>
          </div>
          
          {plans.length > 0 ? (
            <div className="plans-grid">
              {plans.map(plan => (
                <div key={plan.id} className={`plan-card ${plan.status}`}>
                  <div className="plan-header">
                    <h3>{plan.title}</h3>
                    <span className="plan-type">
                      {plan.type === 'daily' ? '日计划' : plan.type === 'weekly' ? '周计划' : '月计划'}
                    </span>
                  </div>
                  
                  <PlanProgress plan={plan} />
                  
                  <div className="plan-footer">
                    <span className="plan-date">
                      创建于 {new Date(plan.createdAt).toLocaleDateString()}
                    </span>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-plans">
              <p>还没有创建学习计划</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreatePlan(true)}
              >
                创建第一个计划
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 创建计划弹窗 */}
      {showCreatePlan && (
        <CreatePlanModal
          onClose={() => setShowCreatePlan(false)}
          onSubmit={handleCreatePlan}
        />
      )}
    </div>
  );
};

/**
 * 创建计划弹窗
 */
const CreatePlanModal: React.FC<{
  onClose: () => void;
  onSubmit: (plan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
}> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<StudyPlan['type']>('daily');
  const [dailyGoal, setDailyGoal] = useState(5);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    onSubmit({
      type,
      title: title.trim(),
      dailyGoal,
      startDate: new Date().toISOString(),
      status: 'active',
      items: [],
    });
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>创建学习计划</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>计划标题</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：JavaScript 进阶学习"
              required
            />
          </div>
          
          <div className="form-group">
            <label>计划类型</label>
            <div className="type-options">
              {[
                { value: 'daily', label: '日计划' },
                { value: 'weekly', label: '周计划' },
                { value: 'monthly', label: '月计划' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`type-btn ${type === option.value ? 'active' : ''}`}
                  onClick={() => setType(option.value as StudyPlan['type'])}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>每日目标（题）</label>
            <input
              type="number"
              value={dailyGoal}
              onChange={e => setDailyGoal(Number(e.target.value))}
              min={1}
              max={50}
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Plan;
