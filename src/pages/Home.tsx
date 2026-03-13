import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CategoryNav } from '../components/CategoryNav';
import { QuestionCard } from '../components/QuestionCard';
import { allQuestions } from '../data';
import { Category, DIFFICULTY_LABELS } from '../types/question';
import './Home.css';

/**
 * 首页组件
 * 显示题目列表和搜索筛选功能
 */
export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>(
    (categoryParam as Category) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // 计算各分类题目数量
  const questionCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allQuestions.length,
    };
    
    allQuestions.forEach(q => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    
    return counts;
  }, []);

  // 筛选题目
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      const matchesCategory = activeCategory === 'all' || q.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      
      return matchesCategory && matchesSearch && matchesDifficulty;
    });
  }, [activeCategory, searchQuery, selectedDifficulty]);

  // 处理分类切换
  const handleCategoryChange = (category: Category | 'all') => {
    setActiveCategory(category);
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  // 处理题目展开/收起
  const handleQuestionToggle = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  return (
    <div className="home-page">
      {/* 控制栏 */}
      <div className="app-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索题目或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="difficulty-filter">
          <label>难度筛选：</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="difficulty-select"
          >
            <option value="all">全部难度</option>
            {Object.entries(DIFFICULTY_LABELS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 分类导航 */}
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        questionCounts={questionCounts}
      />

      {/* 题目列表 */}
      <main className="questions-container">
        <div className="questions-header">
          <h2>
            {activeCategory === 'all' ? '全部题目' : 
              allQuestions.find(q => q.category === activeCategory)?.category}
            <span className="count">({filteredQuestions.length})</span>
          </h2>
        </div>

        <div className="questions-list">
          {filteredQuestions.length === 0 ? (
            <div className="no-results">
              <p>没有找到匹配的题目</p>
            </div>
          ) : (
            filteredQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                isExpanded={expandedQuestion === question.id}
                onToggle={() => handleQuestionToggle(question.id)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};
