import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { allQuestions } from '../data';
import { CATEGORIES, Category, DIFFICULTY_LABELS } from '../types/question';
import './Progress.css';

/**
 * 学习进度页面
 * 显示学习统计和进度可视化
 */
export const Progress: React.FC = () => {
  const { progress, getProgressStats, wrongQuestions, stats: userStats } = useUserStore();
  const stats = getProgressStats();
  const totalQuestions = allQuestions.length;

  // 计算总体进度百分比
  const overallProgress = totalQuestions > 0 
    ? Math.round((stats.mastered / totalQuestions) * 100) 
    : 0;

  // 格式化时间
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`;
  };

  // 计算学习天数
  const studyDays = useMemo(() => {
    const dates = new Set<string>();
    Object.values(progress).forEach(p => {
      if (p.lastVisit) {
        dates.add(new Date(p.lastVisit).toDateString());
      }
    });
    return dates.size;
  }, [progress]);

  // 最近7天学习统计
  const weeklyStats = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const count = Object.values(progress).filter(
        p => new Date(p.lastVisit).toDateString() === dateStr
      ).length;
      days.push({
        date: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        count
      });
    }
    return days;
  }, [progress]);

  // 最大连续学习天数
  const maxStreak = useMemo(() => {
    const dates = Object.values(progress)
      .map(p => new Date(p.lastVisit).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());
    
    if (dates.length === 0) return 0;
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const diff = Math.floor(
        (dates[i - 1].getTime() - dates[i].getTime()) / 86400000
      );
      if (diff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  }, [progress]);

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

  // 学习路径推荐
  const recommendedPath = useMemo(() => {
    // 获取未学习的题目，按难度排序
    const notStarted = allQuestions.filter(q => 
      !progress[q.id] || progress[q.id].status === 'not_started'
    );
    
    // 获取学习中的题目
    const learning = allQuestions.filter(q => 
      progress[q.id]?.status === 'learning'
    );

    // 按难度排序
    const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
    
    // 推荐顺序：先完成学习中的，再学简单的，然后中等，最后困难
    const recommended = [
      ...learning.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]),
      ...notStarted.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
    ];

    return recommended.slice(0, 5); // 返回前5个推荐
  }, [progress]);

  // 难度统计
  const difficultyStats = useMemo(() => {
    const stats = {
      easy: { total: 0, mastered: 0 },
      medium: { total: 0, mastered: 0 },
      hard: { total: 0, mastered: 0 },
    };

    allQuestions.forEach(q => {
      stats[q.difficulty].total++;
      if (progress[q.id]?.status === 'mastered') {
        stats[q.difficulty].mastered++;
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

      {/* 学习统计仪表盘 */}
      <div className="stats-dashboard">
        <div className="dashboard-card streak-card">
          <div className="dashboard-icon">🔥</div>
          <div className="dashboard-content">
            <div className="dashboard-value">{userStats.streak || 0}</div>
            <div className="dashboard-label">连续学习天数</div>
          </div>
          {userStats.streak >= 7 && (
            <div className="streak-badge">坚持达人!</div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon">📅</div>
          <div className="dashboard-content">
            <div className="dashboard-value">{studyDays}</div>
            <div className="dashboard-label">累计学习天数</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon">⏱️</div>
          <div className="dashboard-content">
            <div className="dashboard-value">{formatTime(userStats.totalTimeSpent || 0)}</div>
            <div className="dashboard-label">累计学习时长</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon">🏆</div>
          <div className="dashboard-content">
            <div className="dashboard-value">{maxStreak}</div>
            <div className="dashboard-label">最长连续学习</div>
          </div>
        </div>
      </div>

      {/* 最近7天学习统计 */}
      {weeklyStats.length > 0 && (
        <div className="weekly-stats-section">
          <h3>📈 最近7天学习情况</h3>
          <div className="weekly-chart">
            {weeklyStats.map((day, index) => (
              <div key={index} className="weekly-bar-container">
                <div className="weekly-bar-wrapper">
                  <div 
                    className="weekly-bar"
                    style={{ 
                      height: day.count > 0 ? `${Math.min(day.count * 20, 100)}%` : '4px',
                      backgroundColor: day.count > 0 ? 'var(--neon-cyan)' : 'var(--border-color)'
                    }}
                  >
                    {day.count > 0 && (
                      <span className="weekly-count">{day.count}</span>
                    )}
                  </div>
                </div>
                <div className="weekly-label">{day.weekday}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 学习路径推荐 */}
      <div className="learning-path-section">
        <h3>🎯 推荐学习路径</h3>
        <p className="section-desc">根据你的学习进度，为你推荐以下题目</p>
        
        <div className="recommended-path">
          {recommendedPath.map((question, index) => {
            const isLearning = progress[question.id]?.status === 'learning';
            const difficulty = DIFFICULTY_LABELS[question.difficulty];
            
            return (
              <Link 
                key={question.id}
                to={`/questions/${question.id}`}
                className={`recommended-item ${isLearning ? 'learning' : ''}`}
              >
                <div className="recommend-rank">{index + 1}</div>
                <div className="recommend-content">
                  <div className="recommend-title">{question.title}</div>
                  <div className="recommend-meta">
                    <span 
                      className="recommend-difficulty"
                      style={{ color: difficulty.color }}
                    >
                      {difficulty.label}
                    </span>
                    <span className="recommend-category">
                      {CATEGORIES.find(c => c.key === question.category)?.label}
                    </span>
                    {isLearning && (
                      <span className="learning-badge">学习中</span>
                    )}
                  </div>
                </div>
                <div className="recommend-arrow">→</div>
              </Link>
            );
          })}
        </div>

        {recommendedPath.length === 0 && (
          <div className="all-completed">
            <span className="completed-icon">🎉</span>
            <p>恭喜！你已经完成了所有题目！</p>
          </div>
        )}
      </div>

      {/* 难度进度 */}
      <div className="difficulty-progress-section">
        <h3>📈 难度进度</h3>
        
        <div className="difficulty-progress-list">
          {Object.entries(difficultyStats).map(([key, value]) => {
            const label = DIFFICULTY_LABELS[key];
            const percentage = value.total > 0 
              ? Math.round((value.mastered / value.total) * 100) 
              : 0;

            return (
              <div key={key} className="difficulty-progress-item">
                <div className="difficulty-progress-header">
                  <span className="difficulty-label" style={{ color: label.color }}>
                    {label.label}
                  </span>
                  <span className="difficulty-count">
                    {value.mastered} / {value.total}
                  </span>
                </div>
                <div className="difficulty-progress-bar">
                  <div 
                    className="difficulty-progress-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: label.color 
                    }}
                  />
                </div>
              </div>
            );
          })}
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

      {/* 错题提醒 */}
      {wrongQuestions.length > 0 && (
        <div className="wrong-reminder-section">
          <h3>⚠️ 错题提醒</h3>
          <p className="section-desc">
            你有 <strong>{wrongQuestions.length}</strong> 道题目需要重点复习
          </p>
          <Link to="/wrong-questions" className="wrong-reminder-link">
            查看错题本 →
          </Link>
        </div>
      )}

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
          {wrongQuestions.length > 3 && (
            <li>错题本中有 {wrongQuestions.length} 道题目，建议优先复习</li>
          )}
        </ul>
      </div>
    </div>
  );
};
