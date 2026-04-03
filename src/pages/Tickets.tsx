import { useEffect, useState } from 'react';
import { Ticket, Plus, Search, Filter } from 'lucide-react';
import { useStore } from '../stores/appStore';
import TicketModal from '../components/TicketModal';

const priorityColors = {
  low: 'bg-gray-500/20 text-gray-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-amber-500/20 text-amber-400',
  urgent: 'bg-red-500/20 text-red-400',
};

const statusColors = {
  open: 'bg-gray-500/20 text-gray-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function Tickets() {
  const { tickets, agents, fetchTickets, fetchAgents, showTicketModal, setShowTicketModal } = useStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTickets();
    fetchAgents();
  }, [fetchTickets, fetchAgents]);

  const filteredTickets = tickets.filter((t) => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getAgentName = (id: string | null) => {
    if (!id) return 'Unassigned';
    const agent = agents.find((a) => a.id === id);
    return agent?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tickets</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage tasks and track progress</p>
        </div>
        <button
          onClick={() => setShowTicketModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          <Plus className="w-4 h-4" />
          Create Ticket
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 hover:border-indigo-500/50 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </div>
                <h3 className="font-medium text-[var(--text-primary)]">{ticket.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{ticket.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-color)]">
              <div className="flex items-center gap-4">
                <span className="text-sm text-[var(--text-muted)]">Assigned to: {getAgentName(ticket.assigneeId)}</span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showTicketModal && <TicketModal onClose={() => setShowTicketModal(false)} />}
    </div>
  );
}
