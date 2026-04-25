import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, AlertTriangle, ChevronDown, User } from 'lucide-react';
import { useStore } from '../stores/appStore';

// Get API base URL from environment or default to current origin + default port
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const envUrl = (window as any).ENV?.API_BASE_URL;
    if (envUrl) return envUrl;
    // Use same origin with default backend port
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
};

export default function TopBar() {
  const { company, stats, setCompany } = useStore();
  const [editing, setEditing] = useState(false);
  const [missionInput, setMissionInput] = useState('');

  useEffect(() => {
    // Fetch company on mount
    fetch(`${getApiBaseUrl()}/api/company`)
      .then((res) => res.json())
      .then((data) => setCompany(data))
      .catch(console.error);
  }, [setCompany]);

  const handleMissionSubmit = async () => {
    if (missionInput.trim() && missionInput !== company?.mission) {
      await useStore.getState().updateMission(missionInput);
    }
    setEditing(false);
  };

  const budgetPercent = stats
    ? Math.round((stats.totalSpend / stats.totalMonthlyBudget) * 100)
    : 0;
  const isOverBudget = budgetPercent > 100;
  const isWarning = budgetPercent >= 80 && budgetPercent <= 100;

  return (
    <header className="h-16 bg-[#151921] border-b border-[#2A3142] px-6 flex items-center justify-between">
      {/* Mission Statement */}
      <div className="flex-1 max-w-xl">
        {editing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={missionInput}
              onChange={(e) => setMissionInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMissionSubmit()}
              placeholder="Enter company mission..."
              className="flex-1 bg-[#1C222D] border border-[#2A3142] rounded-lg px-3 py-1.5 text-sm text-[#F4F5F7] placeholder-[#5C6578] focus:border-indigo-500 focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleMissionSubmit}
              className="px-3 py-1.5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setMissionInput(company?.mission || '');
              }}
              className="px-3 py-1.5 text-[#9BA3B5] text-sm hover:text-[#F4F5F7] transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => {
              setMissionInput(company?.mission || '');
              setEditing(true);
            }}
            className="flex items-center gap-2 text-left group"
          >
            <Bot className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-sm text-[#9BA3B5] group-hover:text-[#5C6578] transition-colors">
              Mission:
            </span>
            <span className="text-sm text-[#F4F5F7] truncate">
              {company?.mission || 'Click to set mission...'}
            </span>
          </button>
        )}
      </div>

      {/* Budget Indicator */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm text-[#9BA3B5]">
                ${stats?.totalSpend?.toFixed(2) || '0.00'} / ${stats?.totalMonthlyBudget?.toFixed(2) || '0.00'}
              </span>
              {(isOverBudget || isWarning) && (
                <AlertTriangle
                  className={`w-4 h-4 ${
                    isOverBudget ? 'text-red-400' : 'text-amber-400'
                  }`}
                />
              )}
            </div>
            <div className="mt-1 w-32 h-1.5 bg-[#1C222D] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(budgetPercent, 100)}%`,
                  backgroundColor: isOverBudget
                    ? '#EF4444'
                    : isWarning
                    ? '#F59E0B'
                    : '#10B981',
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full"
              />
            </div>
          </div>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-4 border-l border-[#2A3142]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <ChevronDown className="w-4 h-4 text-[#5C6578]" />
        </div>
      </div>
    </header>
  );
}
