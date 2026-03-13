import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { allQuestions } from '../data';
import { CATEGORIES, Category } from '../types/question';
import './Progress.css';

/**
 * 学习进度页面
 * 显示学习统计和进度可视化
 */
export const Progress: React.FC = () => {
  const { progress, getProgressStats } = useUserStore();
  const stats = getProgressStats();
  const totalQuestions = allQuestions.length;

  // 计算总体进度百分比
  const overallProgress = totalQuestions > 0 
    ? Math.round((stats.mastered / totalQuestions) * 100) 
    : 0;

  // 按分类统计进度
  const categoryStats = useMemo(() => {
    const stats: Record<Category, {
      total: number;
      notStarted: number;
      learning: number;
      mastered: number;
    }> = {} as any;

    // 初始化所有分类
    CATEGORIES.forEach(cat => {
      stats[cat.key] = {
        total: 0,
        notStarted: 0,
        learning: 0,
        mastered: 0,
      };
    });

    // 统计每个分类的进度
    allQuestions.forEach(q => {
      const category = q.category;
      stats[category].total++;
      
      const questionProgress = progress[q.id];
      const status = questionProgress?.status || 'not_started';
      if (status === 'not_started') {
        stats[category].notStarted++;
      } else if (status === 'learning') {
        stats[category].learning++;
      } else {
        stats[category].mastered++;
      }
    });

    return stats;
  }, [progress]);

  // 如果还没有开始学习
  if (stats.total === 0) {
    return (
      <div className="progress-page">
        <div className="progress-empty">
          <div className="empty-icon">📊</div>
          <h2>还没有开始学习</h2>
          <p>开始学习题目，系统会自动记录你的学习进度</p>
          <Link to="/" className="start-link">
            开始学习
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-page">
      {/* 总体统计 */}
      <div className="progress-header">
        <h2>
          <span className="header-icon">📊</span>
          学习进度
        </h2>
        <p className="header-desc">追踪你的学习进度，持续提升</p>
      </div>

      {/* 总体进度卡片 */}
      <div className="overall-progress-card">
        <div className="overall-progress-header">
          <h3>总体进度</h3>
          <span className="overall-percentage">{overallProgress}%</span>
        </div>
        
        <div className="overall-progress-bar">
          <div 
            className="overall-progress-fill"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <div className="overall-stats">
          <div className="stat-box">
            <span className="stat-number">{totalQuestions}</span>
            <span className="stat-label">总题数</span>
          </div>
          <div className="stat-box">
            <span className="stat-number mastered">{stats.mastered}</span>
            <span className="stat-label">已掌握</span>
          </div>
          <div className="stat-box">
            <span className="stat-number learning">{stats.learning}</span>
            <span className="stat-label">学习中</span>
          </div>
          <div className="stat-box">
            <span className="stat-number not-started">
              {totalQuestions - stats.mastered - stats.learning}
            </span>
            <span className="stat-label">未开始</span>
          </div>
        </div>
      </div>

      {/* 分类进度 */}
      <div className="category-progress-section">
        <h3>分类进度</h3>
        
        <div className="category-progress-list">
          {CATEGORIES.map(category => {
            const catStats = categoryStats[category.key];
            const percentage = catStats.total > 0 
              ? Math.round((catStats.mastered / catStats.total) * 100) 
              : 0;

            return (
              <div key={category.key} className="category-progress-card">
                <div className="category-progress-header">
                  <div className="category-info">
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.label}</span>
                  </div>
                  <span className="category-percentage">{percentage}%</span>
                </div>

                <div className="category-progress-bar">
                  <div 
                    className="category-progress-fill"
                    style={{ 
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, ${category.color}, var(--neon-cyan))`
                    }}
                  />
                </div>

                <div className="category-stats">
                  <span className="cat-stat mastered">
                    ✓ {catStats.mastered} 已掌握
                  </span>
                  <span className="cat-stat learning">
                    ⏳ {catStats.learning} 学习中
                  </span>
                  <span className="cat-stat not-started">
                    ○ {catStats.notStarted} 未开始
                  </span>
                </div>

                <Link 
                  to={`/?category=${category.key}`}
                  className="view-category-link"
                >
                  查看题目 →
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* 学习建议 */}
      <div className="learning-suggestions">
        <h3>💡 学习建议</h3>
        <ul>
          {stats.mastered < totalQuestions * 0.3 && (
            <li>建议先完成基础题目，打好基础</li>
          )}
          {stats.learning > 5 && (
            <li>你有 {stats.learning} 道题目正在学习中，建议集中精力完成它们</li>
          )}
          {overallProgress >= 50 && overallProgress < 80 && (
            <li>进度不错！继续保持，争取掌握更多题目</li>
          )}
          {overallProgress >= 80 && (
            <li>太棒了！你已经掌握了大部分题目，继续保持！</li>
          )}
        </ul>
      </div>
    </div>
  );
};
