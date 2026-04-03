import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Ticket,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Bot,
  MessageSquare,
  ScrollText,
  History,
  Settings,
  Sun,
  Moon
} from 'lucide-react';

type Page = 'dashboard' | 'org-chart' | 'tickets' | 'budgets' | 'conversations' | 'logs' | 'history' | 'settings';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}

const navItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'org-chart' as Page, label: 'Org Chart', icon: Users },
  { id: 'tickets' as Page, label: 'Tickets', icon: Ticket },
  { id: 'budgets' as Page, label: 'Budgets', icon: DollarSign },
  { id: 'conversations' as Page, label: 'Conversations', icon: MessageSquare },
  { id: 'logs' as Page, label: 'Logs', icon: ScrollText },
  { id: 'history' as Page, label: 'History', icon: History },
  { id: 'settings' as Page, label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentPage, onNavigate, collapsed, onToggle, theme, onThemeToggle }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="h-screen bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-lg text-[var(--text-primary)]"
            >
              AgentHQ
            </motion.span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Controls */}
      <div className="p-3 border-t border-[var(--border-subtle)] space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          {!collapsed && <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
