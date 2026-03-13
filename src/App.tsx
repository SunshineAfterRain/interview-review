import { useState, useMemo } from 'react';
import { CategoryNav } from './components/CategoryNav';
import { QuestionCard } from './components/QuestionCard';
import { allQuestions } from './data';
import { Category, DIFFICULTY_LABELS } from './types/question';

function App() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const questionCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allQuestions.length,
    };
    
    allQuestions.forEach(q => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    
    return counts;
  }, []);

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

  const handleQuestionToggle = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>前端面试复盘系统</h1>
        <p className="subtitle">系统化整理前端面试知识点，助力面试成功</p>
      </header>

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

      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        questionCounts={questionCounts}
      />

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

      <footer className="app-footer">
        <p>© 2024 前端面试复盘系统 | 共 {allQuestions.length} 道题目</p>
      </footer>
    </div>
  );
}

export default App;
