import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { Favorites } from './pages/Favorites';
import { Progress } from './pages/Progress';
import { QuestionDetail } from './pages/QuestionDetail';
import { useUserStore } from './stores/useUserStore';
import { allQuestions } from './data';
import './styles/themes.css';
import './index.css';

/**
 * 主应用组件
 */
function App() {
  const { theme } = useUserStore();

  // 应用主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Router>
      <div className="app">
        {/* 导航栏 */}
        <Header />

        {/* 页面内容 */}
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/questions/:id" element={<QuestionDetail />} />
          </Routes>
        </div>

        {/* 页脚 */}
        <footer className="app-footer">
          <p>© 2024 前端面试复盘系统 | 共 {allQuestions.length} 道题目</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
