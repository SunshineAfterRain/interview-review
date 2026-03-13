import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';
import './Header.css';

/**
 * 导航组件
 * 包含 Logo、导航菜单、主题切换按钮
 */
export const Header: React.FC = () => {
  const location = useLocation();
  const { theme, setTheme, favorites, getProgressStats } = useUserStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const stats = getProgressStats();

  // 切换主题
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // 导航菜单项
  const navItems = [
    { path: '/', label: '首页', icon: '📚' },
    { path: '/favorites', label: '收藏夹', icon: '⭐', badge: favorites.length },
    { path: '/progress', label: '学习进度', icon: '📊' },
  ];

  // 判断当前路由是否激活
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <span className="logo-icon">💡</span>
          <h1>前端面试复盘系统</h1>
        </Link>

        {/* 桌面端导航菜单 */}
        <nav className="header-nav desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* 右侧操作区 */}
        <div className="header-actions">
          {/* 学习进度统计 */}
          <div className="progress-mini-stats">
            <span className="stat-item">
              <span className="stat-label">已掌握</span>
              <span className="stat-value mastered">{stats.mastered}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">学习中</span>
              <span className="stat-value learning">{stats.learning}</span>
            </span>
          </div>

          {/* 主题切换按钮 */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`切换到${theme === 'dark' ? '亮色' : '暗色'}主题`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* 移动端菜单按钮 */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="切换菜单"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* 移动端导航菜单 */}
      {isMobileMenuOpen && (
        <nav className="header-nav mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};
