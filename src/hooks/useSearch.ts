import { useState, useCallback, useMemo } from 'react';
import { allQuestions } from '../data';
import type { Question } from '../types/question';
import type { SearchOptions, SearchHistory } from '../types';

interface UseSearchReturn {
  results: Question[];
  history: SearchHistory[];
  isSearching: boolean;
  search: (options: SearchOptions) => void;
  clearHistory: () => void;
  removeFromHistory: (query: string) => void;
  getSuggestions: (query: string) => string[];
}

const MAX_HISTORY = 10;

/**
 * 增强搜索 Hook
 */
export function useSearch(): UseSearchReturn {
  const [results, setResults] = useState<Question[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>(() => {
    try {
      const saved = localStorage.getItem('search-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSearching, setIsSearching] = useState(false);

  // 保存搜索历史
  const saveHistory = useCallback((newHistory: SearchHistory[]) => {
    setHistory(newHistory);
    localStorage.setItem('search-history', JSON.stringify(newHistory.slice(0, MAX_HISTORY)));
  }, []);

  // 搜索函数
  const search = useCallback((options: SearchOptions) => {
    setIsSearching(true);
    
    try {
      let filtered = [...allQuestions];
      
      // 基础搜索
      if (options.query.trim()) {
        filtered = filtered.filter(q => {
          const searchFields: string[] = [];
          
          // 根据搜索范围收集字段
          if (options.searchIn.includes('title')) {
            searchFields.push(q.title);
          }
          if (options.searchIn.includes('tags')) {
            searchFields.push(...q.tags);
          }
          if (options.searchIn.includes('content')) {
            searchFields.push(q.question);
            searchFields.push(q.answer);
          }
          
          const searchText = searchFields.join(' ');
          
          if (options.useRegex) {
            try {
              const regex = new RegExp(
                options.query,
                options.caseSensitive ? 'g' : 'gi'
              );
              return regex.test(searchText);
            } catch {
              // 正则表达式无效，使用普通搜索
              return false;
            }
          }
          
          const query = options.caseSensitive 
            ? options.query 
            : options.query.toLowerCase();
          const text = options.caseSensitive 
            ? searchText 
            : searchText.toLowerCase();
          
          return text.includes(query);
        });
      }
      
      // 分类筛选
      if (options.filters.categories?.length) {
        filtered = filtered.filter(q => 
          options.filters.categories!.includes(q.category)
        );
      }
      
      // 难度筛选
      if (options.filters.difficulties?.length) {
        filtered = filtered.filter(q => 
          options.filters.difficulties!.includes(q.difficulty)
        );
      }
      
      // 状态筛选（需要配合 useUserStore）
      // 这里暂时跳过，在组件层面处理
      
      setResults(filtered);
      
      // 保存搜索历史
      if (options.query.trim()) {
        const newHistory: SearchHistory = {
          query: options.query,
          timestamp: new Date().toISOString(),
          resultCount: filtered.length,
        };
        
        saveHistory([
          newHistory,
          ...history.filter(h => h.query !== options.query),
        ].slice(0, MAX_HISTORY));
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [history, saveHistory]);

  // 清空历史
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  // 从历史中移除
  const removeFromHistory = useCallback((query: string) => {
    saveHistory(history.filter(h => h.query !== query));
  }, [history, saveHistory]);

  // 获取搜索建议
  const suggestions = useMemo(() => {
    const allTags = new Set<string>();
    const allTitles: string[] = [];
    
    allQuestions.forEach(q => {
      allTitles.push(q.title);
      q.tags.forEach(tag => allTags.add(tag));
    });
    
    return {
      tags: Array.from(allTags),
      titles: allTitles,
    };
  }, []);

  const getSuggestions = useCallback((query: string): string[] => {
    if (!query.trim()) {
      return history.slice(0, 5).map(h => h.query);
    }
    
    const lowerQuery = query.toLowerCase();
    const matched: string[] = [];
    
    // 匹配标签
    suggestions.tags
      .filter(tag => tag.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .forEach(tag => matched.push(tag));
    
    // 匹配标题
    suggestions.titles
      .filter(title => title.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .forEach(title => {
        if (!matched.includes(title)) {
          matched.push(title);
        }
      });
    
    return matched.slice(0, 5);
  }, [suggestions, history]);

  return {
    results,
    history,
    isSearching,
    search,
    clearHistory,
    removeFromHistory,
    getSuggestions,
  };
}

/**
 * 简单搜索 Hook（用于快速搜索）
 */
export function useSimpleSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Question[]>([]);

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = allQuestions.filter(q => 
      q.title.toLowerCase().includes(lowerQuery) ||
      q.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      q.question.toLowerCase().includes(lowerQuery)
    );
    
    setResults(filtered);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return {
    query,
    results,
    search,
    clear,
  };
}
