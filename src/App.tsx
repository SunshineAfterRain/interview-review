import { useEffect, Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { KeyboardHelp } from './components/KeyboardHelp';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ReviewReminder, ReviewReminderBadge } from './components/review';
import { useUserStore } from './stores/useUserStore';
import { useReviewStore } from './stores/useReviewStore';
import { useNoteStore } from './stores/useNoteStore';
import { useFavoriteStore } from './stores/useFavoriteStore';
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
const Interview = lazy(() => import('./pages/Interview').then(m => ({ default: m.Interview })));
const Plan = lazy(() => import('./pages/Plan').then(m => ({ default: m.Plan })));

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
      key: 'i',
      ctrlKey: true,
      action: () => navigate('/interview'),
      description: '打开模拟面试',
    },
    {
      key: 'p',
      ctrlKey: true,
      action: () => navigate('/plan'),
      description: '打开学习计划',
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => navigate('/favorites'),
      description: globalShortcuts.favorites.description,
    },
    {
      key: 'g',
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

// 数据初始化组件
const DataInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loadReviewQueue, reviewQueue, shouldNotify, updateLastNotified } = useReviewStore();
  const { loadNotes } = useNoteStore();
  const { loadFolders, loadFavorites, folders, migrateFromUserStore } = useFavoriteStore();
  const { favorites } = useUserStore();
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    // 初始化数据
    const initData = async () => {
      // 加载笔记
      await loadNotes();
      
      // 加载收藏夹
      await loadFolders();
      await loadFavorites();
      
      // 加载复习队列
      await loadReviewQueue();
    };
    
    initData();
  }, [loadNotes, loadFolders, loadFavorites, loadReviewQueue]);

  // 迁移旧数据（仅首次）
  useEffect(() => {
    const migrateData = async () => {
      // 如果有旧的收藏数据但没有收藏夹，进行迁移
      if (favorites.length > 0 && folders.length === 0) {
        await migrateFromUserStore(favorites);
      }
    };
    
    migrateData();
  }, [favorites, folders.length, migrateFromUserStore]);

  // 检查是否需要显示复习提醒
  useEffect(() => {
    if (shouldNotify()) {
      setShowReminder(true);
      updateLastNotified();
    }
  }, [reviewQueue, shouldNotify, updateLastNotified]);

  return (
    <>
      {children}
      {showReminder && (
        <ReviewReminder onClose={() => setShowReminder(false)} />
      )}
    </>
  );
};

/**
 * 主应用组件
 */
function AppContent() {
  const { theme } = useUserStore();
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showReviewReminder, setShowReviewReminder] = useState(false);

  // 应用主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ESC 关闭帮助
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowKeyboardHelp(false);
        setShowReviewReminder(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <DataInitializer>
      <div className="app">
        {/* 导航栏 */}
        <Header />

        {/* 复习提醒徽章 */}
        <ReviewReminderBadge onClick={() => setShowReviewReminder(true)} />

        {/* 页面内容 */}
        <div className="app-content">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/interview" element={<Interview />} />
                <Route path="/plan" element={<Plan />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/wrong-questions" element={<WrongQuestions />} />
                <Route path="/questions/:id" element={<QuestionDetail />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
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

        {/* 复习提醒弹窗 */}
        {showReviewReminder && (
          <ReviewReminder onClose={() => setShowReviewReminder(false)} />
        )}
      </div>
    </DataInitializer>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
