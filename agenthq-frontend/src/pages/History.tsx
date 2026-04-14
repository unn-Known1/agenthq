import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  History as HistoryIcon,
  CheckCircle,
  UserPlus,
  UserMinus,
  DollarSign,
  Settings,
} from 'lucide-react';
import { historyApi, HistoryEntry } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

const typeIcons = {
  task_completed: CheckCircle,
  agent_created: UserPlus,
  agent_deleted: UserMinus,
  budget_transaction: DollarSign,
  system_config: Settings,
};

const typeColors = {
  task_completed: '#10B981',
  agent_created: '#A855F7',
  agent_deleted: '#EF4444',
  budget_transaction: '#F59E0B',
  system_config: '#6366F1',
};

const typeLabels = {
  task_completed: 'Task Completed',
  agent_created: 'Agent Hired',
  agent_deleted: 'Agent Terminated',
  budget_transaction: 'Budget Transaction',
  system_config: 'System Config',
};

export default function History() {
  const [taskHistory, setTaskHistory] = useState<HistoryEntry[]>([]);
  const [agentHistory, setAgentHistory] = useState<HistoryEntry[]>([]);
  const [budgetHistory, setBudgetHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'agents' | 'budget'>('tasks');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const [tasks, agents, budget] = await Promise.all([
        historyApi.getTasks(),
        historyApi.getAgents(),
        historyApi.getBudget(),
      ]);
      setTaskHistory(tasks);
      setAgentHistory(agents);
      setBudgetHistory(budget);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentHistory = activeTab === 'tasks' ? taskHistory : activeTab === 'agents' ? agentHistory : budgetHistory;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">History</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Historical records, completed tasks, and audit trail
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-subtle)] flex-shrink-0">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'tasks'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Tasks ({taskHistory.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'agents'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Agents ({agentHistory.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'budget'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Budget ({budgetHistory.length})
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : currentHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
              <HistoryIcon className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No history yet</p>
              <p className="text-sm">History will appear as events occur</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {currentHistory.map((entry, index) => {
                const Icon = typeIcons[entry.type];
                const color = typeColors[entry.type];
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-4 hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: `${color}20`, color }}
                          >
                            {typeLabels[entry.type]}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {new Date(entry.timestamp).toLocaleDateString()} at{' '}
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-primary)]">{entry.description}</p>
                        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(entry.metadata).map(([key, value]) => (
                              <span
                                key={key}
                                className="px-2 py-1 bg-[var(--bg-primary)] rounded text-xs text-[var(--text-secondary)]"
                              >
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Time Ago */}
                      <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}