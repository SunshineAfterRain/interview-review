import { useEffect, Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { KeyboardHelp } from './components/KeyboardHelp';
import { useUserStore } from './stores/useUserStore';
import { useKeyboardShortcuts, globalShortcuts } from './hooks/useKeyboardShortcuts';
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

// 键盘快捷键处理组件
const KeyboardHandler: React.FC<{ onShowHelp: () => void }> = ({ onShowHelp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTheme, theme } = useUserStore();

  const shortcuts = [
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: globalShortcuts.search.description,
    },
    {
      key: 'h',
      ctrlKey: true,
      action: () => navigate('/'),
      description: globalShortcuts.home.description,
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => navigate('/favorites'),
      description: globalShortcuts.favorites.description,
    },
    {
      key: 'p',
      ctrlKey: true,
      action: () => navigate('/progress'),
      description: globalShortcuts.progress.description,
    },
    {
      key: 'w',
      ctrlKey: true,
      action: () => navigate('/wrong-questions'),
      description: globalShortcuts.wrongQuestions.description,
    },
    {
      key: 't',
      ctrlKey: true,
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      description: globalShortcuts.theme.description,
    },
    {
      key: '?',
      shiftKey: true,
      action: onShowHelp,
      description: globalShortcuts.help.description,
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return null;
};

/**
 * 主应用组件
 */
function AppContent() {
  const { theme } = useUserStore();
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // 应用主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ESC 关闭帮助
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowKeyboardHelp(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
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
        <span className="footer-hint">按 Shift + ? 查看快捷键</span>
      </footer>

      {/* 键盘快捷键处理 */}
      <KeyboardHandler onShowHelp={() => setShowKeyboardHelp(true)} />

      {/* 快捷键帮助弹窗 */}
      <KeyboardHelp 
        isOpen={showKeyboardHelp} 
        onClose={() => setShowKeyboardHelp(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
