import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ScrollText,
  Search,
  Bot,
  AlertTriangle,
  Info,
  Download,
} from 'lucide-react';
import { useStore } from '../stores/appStore';
import { logsApi, LogEntry } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

const levelColors = {
  debug: '#6B7280',
  info: '#3B82F6',
  warning: '#F59E0B',
  error: '#EF4444',
};

const levelIcons = {
  debug: Info,
  info: Info,
  warning: AlertTriangle,
  error: AlertTriangle,
};

const categoryColors = {
  agent: '#A855F7',
  tool: '#06B6D4',
  task: '#F59E0B',
  conversation: '#EC4899',
  system: '#6366F1',
  budget: '#10B981',
};

export default function Logs() {
  const { agents } = useStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterAgent, setFilterAgent] = useState<string>('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await logsApi.getAll();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterLevel && log.level !== filterLevel) {
      return false;
    }
    if (filterCategory && log.category !== filterCategory) {
      return false;
    }
    if (filterAgent && log.agentId !== filterAgent) {
      return false;
    }
    return true;
  });

  const getAgentName = (agentId?: string) => {
    if (!agentId) return 'System';
    const agent = agents.find((a) => a.id === agentId);
    return agent?.name || 'Unknown Agent';
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `agenthq-logs-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Logs</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            View agent activity, tool executions, and system events
          </p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none cursor-pointer"
        >
          <option value="">All Levels</option>
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none cursor-pointer"
        >
          <option value="">All Categories</option>
          <option value="agent">Agent</option>
          <option value="tool">Tool</option>
          <option value="task">Task</option>
          <option value="conversation">Conversation</option>
          <option value="system">System</option>
          <option value="budget">Budget</option>
        </select>

        <select
          value={filterAgent}
          onChange={(e) => setFilterAgent(e.target.value)}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none cursor-pointer"
        >
          <option value="">All Agents</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4">
          <p className="text-sm text-[var(--text-muted)]">Total Logs</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{logs.length}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4">
          <p className="text-sm text-[var(--text-muted)]">Errors</p>
          <p className="text-2xl font-bold text-red-400">{logs.filter((l) => l.level === 'error').length}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4">
          <p className="text-sm text-[var(--text-muted)]">Warnings</p>
          <p className="text-2xl font-bold text-amber-400">{logs.filter((l) => l.level === 'warning').length}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4">
          <p className="text-sm text-[var(--text-muted)]">Tool Executions</p>
          <p className="text-2xl font-bold text-cyan-400">{logs.filter((l) => l.category === 'tool').length}</p>
        </div>
      </div>

      {/* Logs List */}
      <div className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
              <ScrollText className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No logs found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {filteredLogs.map((log, index) => {
                const LevelIcon = levelIcons[log.level];
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-4 hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Level Icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${levelColors[log.level]}20` }}
                      >
                        <LevelIcon className="w-4 h-4" style={{ color: levelColors[log.level] }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-mono text-[var(--text-muted)]">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `${categoryColors[log.category]}20`,
                              color: categoryColors[log.category],
                            }}
                          >
                            {log.category}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                            <Bot className="w-3 h-3" />
                            {getAgentName(log.agentId)}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-primary)]">{log.message}</p>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-[var(--text-muted)] cursor-pointer">
                              View metadata
                            </summary>
                            <pre className="mt-1 p-2 bg-[var(--bg-primary)] rounded text-xs font-mono text-[var(--text-secondary)] overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>

                      {/* Time */}
                      <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
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