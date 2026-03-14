import React, { useState, useMemo } from 'react';
import type { InterviewConfig } from '../../types/interview';
import { QUESTION_COUNT_OPTIONS, DIFFICULTY_OPTIONS, TIME_LIMIT_OPTIONS } from '../../types/interview';
import { CATEGORIES, type Category, type Difficulty } from '../../types/question';

interface InterviewSetupProps {
  onStart: (config: InterviewConfig) => void;
  onCancel?: () => void;
}

/**
 * 面试设置组件 - 选择题目数量、难度、分类
 */
export const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStart, onCancel }) => {
  const [config, setConfig] = useState<InterviewConfig>({
    questionCount: 10,
    difficulty: 'mixed',
    categories: [],
    timeLimit: 5, // 5分钟/题
  });
  
  // 计算总时间
  const totalTime = useMemo(() => {
    return config.questionCount * config.timeLimit;
  }, [config.questionCount, config.timeLimit]);
  
  // 切换分类
  const toggleCategory = (category: Category) => {
    setConfig(prev => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };
  
  // 选择全部分类
  const selectAllCategories = () => {
    setConfig(prev => ({
      ...prev,
      categories: CATEGORIES.map(c => c.key as Category),
    }));
  };
  
  // 清除分类选择
  const clearCategories = () => {
    setConfig(prev => ({ ...prev, categories: [] }));
  };
  
  // 开始面试
  const handleStart = () => {
    // 如果没有选择分类，默认选择全部
    const finalConfig = {
      ...config,
      categories: config.categories.length > 0 ? config.categories : CATEGORIES.map(c => c.key as Category),
    };
    onStart(finalConfig);
  };
  
  // 获取难度颜色
  const getDifficultyColor = (difficulty: Difficulty | 'mixed') => {
    switch (difficulty) {
      case 'easy': return '#52c41a';
      case 'medium': return '#faad14';
      case 'hard': return '#f5222d';
      default: return '#1890ff';
    }
  };
  
  return (
    <div className="interview-setup">
      <div className="setup-header">
        <h2>模拟面试设置</h2>
        <p>根据您的需求定制面试题目</p>
      </div>
      
      {/* 题目数量选择 */}
      <div className="setup-section">
        <h3>题目数量</h3>
        <div className="option-buttons">
          {QUESTION_COUNT_OPTIONS.map(option => (
            <button
              key={option.value}
              className={`option-btn ${config.questionCount === option.value ? 'active' : ''}`}
              onClick={() => setConfig(prev => ({ ...prev, questionCount: option.value }))}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* 难度选择 */}
      <div className="setup-section">
        <h3>难度选择</h3>
        <div className="option-buttons difficulty-options">
          {DIFFICULTY_OPTIONS.map(option => (
            <button
              key={option.value}
              className={`option-btn ${config.difficulty === option.value ? 'active' : ''}`}
              style={{ 
                '--difficulty-color': getDifficultyColor(option.value) 
              } as React.CSSProperties}
              onClick={() => setConfig(prev => ({ ...prev, difficulty: option.value }))}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* 题目分类 */}
      <div className="setup-section">
        <div className="section-header">
          <h3>题目分类</h3>
          <div className="section-actions">
            <button className="text-btn" onClick={selectAllCategories}>全选</button>
            <button className="text-btn" onClick={clearCategories}>清除</button>
          </div>
        </div>
        <div className="category-grid">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`interview-category-btn ${config.categories.includes(cat.key as Category) ? 'active' : ''}`}
              style={{ 
                '--cat-color': cat.color,
                borderColor: config.categories.includes(cat.key as Category) ? cat.color : 'transparent'
              } as React.CSSProperties}
              onClick={() => toggleCategory(cat.key as Category)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
              {config.categories.includes(cat.key as Category) && (
                <span className="cat-check">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* 时间限制 */}
      <div className="setup-section">
        <h3>每题时间限制</h3>
        <div className="option-buttons">
          {TIME_LIMIT_OPTIONS.map(option => (
            <button
              key={option.value}
              className={`option-btn ${config.timeLimit === option.value ? 'active' : ''}`}
              onClick={() => setConfig(prev => ({ ...prev, timeLimit: option.value }))}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* 总时间预览 */}
      <div className="setup-summary">
        <div className="summary-item">
          <span className="summary-label">预计总时长</span>
          <span className="summary-value">{Math.floor(totalTime / 60)} 小时 {totalTime % 60} 分钟</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">题目数量</span>
          <span className="summary-value">{config.questionCount} 题</span>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="setup-actions">
        {onCancel && (
          <button className="btn btn-secondary" onClick={onCancel}>
            取消
          </button>
        )}
        <button className="btn btn-primary" onClick={handleStart}>
          开始面试
        </button>
      </div>
    </div>
  );
};

export default InterviewSetup;
