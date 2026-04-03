import { useEffect, useState } from 'react';
import { ScrollText, Filter, Search } from 'lucide-react';
import { useStore } from '../stores/appStore';

const levelColors = {
  debug: 'bg-gray-500/20 text-gray-400',
  info: 'bg-blue-500/20 text-blue-400',
  warning: 'bg-amber-500/20 text-amber-400',
  error: 'bg-red-500/20 text-red-400',
};

export default function Logs() {
  const { logs, fetchLogs } = useStore();
  const [filter, setFilter] = useState({ level: '', category: '', agentId: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs(filter);
  }, [filter, fetchLogs]);

  const filteredLogs = logs.filter((log) =>
    log.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Logs</h1>
        <p className="text-[var(--text-secondary)] mt-1">Monitor agent activity and system events</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
        </div>
        <select
          value={filter.level}
          onChange={(e) => setFilter({ ...filter, level: e.target.value })}
          className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
        >
          <option value="">All Levels</option>
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
        >
          <option value="">All Categories</option>
          <option value="agent">Agent</option>
          <option value="tool">Tool</option>
          <option value="conversation">Conversation</option>
          <option value="budget">Budget</option>
          <option value="system">System</option>
        </select>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-tertiary)]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Level</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-[var(--text-muted)] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelColors[log.level]}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)] capitalize">{log.category}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
