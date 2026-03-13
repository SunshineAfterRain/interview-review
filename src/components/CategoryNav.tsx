import React from 'react';
import { Category, CATEGORIES } from '../types/question';

interface CategoryNavProps {
  activeCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  questionCounts: Record<string, number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onCategoryChange,
  questionCounts,
}) => {
  return (
    <nav className="category-nav">
      <button
        className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
        onClick={() => onCategoryChange('all')}
      >
        <span className="category-icon">📚</span>
        <span className="category-label">全部</span>
        <span className="category-count">{questionCounts['all'] || 0}</span>
      </button>
      
      {CATEGORIES.map((category) => (
        <button
          key={category.key}
          className={`category-btn ${activeCategory === category.key ? 'active' : ''}`}
          onClick={() => onCategoryChange(category.key)}
          style={{
            '--category-color': category.color,
          } as React.CSSProperties}
        >
          <span className="category-icon">{category.icon}</span>
          <span className="category-label">{category.label}</span>
          <span className="category-count">{questionCounts[category.key] || 0}</span>
        </button>
      ))}
    </nav>
  );
};
