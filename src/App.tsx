import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { useUserStore } from './stores/useUserStore';
import { allQuestions } from './data';
import './styles/themes.css';
import './index.css';

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Favorites = lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })));
const Progress = lazy(() => import('./pages/Progress').then(m => ({ default: m.Progress })));
const WrongQuestions = lazy(() => import('./pages/WrongQuestions').then(m => ({ default: m.WrongQuestions })));
const QuestionDetail = lazy(() => import('./pages/QuestionDetail').then(m => ({ default: m.QuestionDetail })));

// 加载中组件
const PageLoader = () => (
  <div className="page-loader">
    <div className="loader-spinner"></div>
    <span className="loader-text">加载中...</span>
  </div>
);

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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/wrong-questions" element={<WrongQuestions />} />
              <Route path="/questions/:id" element={<QuestionDetail />} />
            </Routes>
          </Suspense>
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
