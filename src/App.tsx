import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import OrgChart from './pages/OrgChart';
import Tickets from './pages/Tickets';
import Budgets from './pages/Budgets';
import Conversations from './pages/Conversations';
import Logs from './pages/Logs';
import History from './pages/History';
import SettingsPage from './pages/Settings';
import './App.css';

type Page = 'dashboard' | 'org-chart' | 'tickets' | 'budgets' | 'conversations' | 'logs' | 'history' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'org-chart':
        return <OrgChart />;
      case 'tickets':
        return <Tickets />;
      case 'budgets':
        return <Budgets />;
      case 'conversations':
        return <Conversations />;
      case 'logs':
        return <Logs />;
      case 'history':
        return <History />;
      case 'settings':
        return <SettingsPage theme={theme} onThemeChange={(t) => setTheme(t === 'system' ? 'dark' : t)} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-6 bg-[var(--bg-primary)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;