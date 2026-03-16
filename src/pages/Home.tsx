import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CategoryNav } from '../components/CategoryNav';
import { QuestionCard } from '../components/QuestionCard';
import { allQuestions } from '../data';
import { Category, DIFFICULTY_LABELS } from '../types/question';
import { useAnswerStore } from '../stores/useAnswerStore';
import './Home.css';

// 每页显示的题目数量
const PAGE_SIZE = 10;

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
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { getAnswer, answers } = useAnswerStore();

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

  // 分页数据
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, currentPage]);

  // 总页数
  const totalPages = Math.ceil(filteredQuestions.length / PAGE_SIZE);
  
  // 自动展开有答案的题目（首次加载时）
  useEffect(() => {
    // 检查当前页是否有答案的题目
    const questionsWithAnswers = paginatedQuestions.filter(q => getAnswer(q.id));
    if (questionsWithAnswers.length > 0 && expandedQuestions.size === 0) {
      // 自动展开所有有答案的题目
      setExpandedQuestions(new Set(questionsWithAnswers.map(q => q.id)));
    }
  }, [answers, currentPage, paginatedQuestions]);

  // 当筛选条件改变时重置页码
  const resetPage = () => setCurrentPage(1);

  // 处理分类切换
  const handleCategoryChange = (category: Category | 'all') => {
    setActiveCategory(category);
    resetPage();
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  // 处理题目展开/收起
  const handleQuestionToggle = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // 分页导航
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // 显示的页码数量
    
    if (totalPages <= showPages + 2) {
      // 总页数较少，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总是显示第一页
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // 计算中间显示的页码
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, showPages - 1);
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - showPages + 2);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // 总是显示最后一页
      pages.push(totalPages);
    }
    
    return pages;
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
            onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
            className="search-input"
          />
        </div>

        <div className="difficulty-filter">
          <label>难度筛选：</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => { setSelectedDifficulty(e.target.value); resetPage(); }}
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
          {paginatedQuestions.length === 0 ? (
            <div className="no-results">
              <p>没有找到匹配的题目</p>
            </div>
          ) : (
            paginatedQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                isExpanded={expandedQuestions.has(question.id)}
                onToggle={() => handleQuestionToggle(question.id)}
              />
            ))
          )}
        </div>

        {/* 分页组件 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              上一页
            </button>
            
            <div className="pagination-numbers">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => goToPage(page as number)}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>
            
            <button
              className="pagination-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              下一页
            </button>
            
            <div className="pagination-info">
              第 {currentPage} / {totalPages} 页，共 {filteredQuestions.length} 题
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
