import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from '../hooks/useSearch';
import { CATEGORIES, DIFFICULTY_LABELS } from '../types/question';
import type { SearchOptions } from '../types';
import type { Question } from '../types/question';
import './search.css';

interface SearchEnhancedProps {
  onSearch?: (results: Question[]) => void;
  placeholder?: string;
}

/**
 * 增强搜索组件
 */
export const SearchEnhanced: React.FC<SearchEnhancedProps> = ({ 
  onSearch,
  placeholder = '搜索题目...' 
}) => {
  const {
    results,
    history,
    isSearching,
    search,
    clearHistory,
    getSuggestions,
  } = useSearch();
  
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [options, setOptions] = useState<SearchOptions>({
    query: '',
    useRegex: false,
    caseSensitive: false,
    searchIn: ['title', 'tags'],
    filters: {},
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 获取建议
  const suggestions = getSuggestions(query);

  // 执行搜索
  const handleSearch = () => {
    const searchOptions: SearchOptions = {
      ...options,
      query,
    };
    search(searchOptions);
    onSearch?.(results);
    setShowSuggestions(false);
  };

  // 输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0);
  };

  // 选择建议
  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    const searchOptions: SearchOptions = {
      ...options,
      query: suggestion,
    };
    search(searchOptions);
  };

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // 切换分类筛选
  const toggleCategory = (category: string) => {
    const categories = options.filters.categories || [];
    const newCategories = categories.includes(category)
      ? categories.filter(c => c !== category)
      : [...categories, category];
    
    setOptions({
      ...options,
      filters: { ...options.filters, categories: newCategories },
    });
  };

  // 切换难度筛选
  const toggleDifficulty = (difficulty: string) => {
    const difficulties = options.filters.difficulties || [];
    const newDifficulties = difficulties.includes(difficulty)
      ? difficulties.filter(d => d !== difficulty)
      : [...difficulties, difficulty];
    
    setOptions({
      ...options,
      filters: { ...options.filters, difficulties: newDifficulties },
    });
  };

  return (
    <div className="search-enhanced">
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder={placeholder}
        />
        
        <button 
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '简单' : '高级'}
        </button>
        
        <button 
          className="search-btn"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? '搜索中...' : '搜索'}
        </button>
      </div>

      {/* 搜索建议 */}
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="search-suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-item"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* 搜索历史 */}
      {history.length > 0 && !query && (
        <div className="search-history">
          <span className="history-label">历史搜索：</span>
          {history.slice(0, 5).map((h, index) => (
            <button
              key={index}
              className="history-item"
              onClick={() => handleSelectSuggestion(h.query)}
            >
              {h.query}
              <span className="history-count">({h.resultCount})</span>
            </button>
          ))}
          <button className="clear-history" onClick={clearHistory}>
            清空
          </button>
        </div>
      )}

      {/* 高级搜索选项 */}
      {showAdvanced && (
        <div className="advanced-options">
          <div className="option-group">
            <label>搜索选项</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.useRegex}
                  onChange={(e) => setOptions({ ...options, useRegex: e.target.checked })}
                />
                正则表达式
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.caseSensitive}
                  onChange={(e) => setOptions({ ...options, caseSensitive: e.target.checked })}
                />
                区分大小写
              </label>
            </div>
          </div>

          <div className="option-group">
            <label>搜索范围</label>
            <div className="checkbox-group">
              {(['title', 'tags', 'content'] as const).map(field => (
                <label key={field} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={options.searchIn.includes(field)}
                    onChange={(e) => {
                      const searchIn = e.target.checked
                        ? [...options.searchIn, field]
                        : options.searchIn.filter(f => f !== field);
                      setOptions({ ...options, searchIn });
                    }}
                  />
                  {field === 'title' && '标题'}
                  {field === 'tags' && '标签'}
                  {field === 'content' && '内容'}
                </label>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label>分类筛选</label>
            <div className="filter-chips">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  className={`filter-chip ${options.filters.categories?.includes(cat.key) ? 'active' : ''}`}
                  onClick={() => toggleCategory(cat.key)}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label>难度筛选</label>
            <div className="filter-chips">
              {Object.entries(DIFFICULTY_LABELS).map(([key, value]) => (
                <button
                  key={key}
                  className={`filter-chip ${options.filters.difficulties?.includes(key) ? 'active' : ''}`}
                  style={{ '--chip-color': value.color } as React.CSSProperties}
                  onClick={() => toggleDifficulty(key)}
                >
                  {value.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
