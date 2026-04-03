import { useEffect, useState } from 'react';
import { Clock, Bot, Ticket, DollarSign } from 'lucide-react';
import { useStore } from '../stores/appStore';

export default function History() {
  const { tickets, agents, fetchTickets, fetchAgents, fetchHistory } = useStore();
  const [tab, setTab] = useState('tasks');

  useEffect(() => {
    fetchTickets();
    fetchAgents();
    fetchHistory();
  }, [fetchTickets, fetchAgents, fetchHistory]);

  const completedTickets = tickets.filter((t) => t.status === 'completed');
  const terminatedAgents = agents.filter((a) => a.status === 'terminated');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">History</h1>
        <p className="text-[var(--text-secondary)] mt-1">View past records and completed items</p>
      </div>

      <div className="flex gap-2 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)]">
        {[
          { id: 'tasks', label: 'Tasks', icon: Ticket, count: completedTickets.length },
          { id: 'agents', label: 'Agents', icon: Bot, count: terminatedAgents.length },
          { id: 'budget', label: 'Budget', icon: DollarSign, count: agents.length },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              tab === item.id
                ? 'bg-indigo-500 text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
        {tab === 'tasks' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Completed Tasks</h2>
            {completedTickets.length === 0 ? (
              <p className="text-[var(--text-muted)]">No completed tasks yet</p>
            ) : (
              completedTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[var(--text-primary)]">{ticket.title}</h3>
                    <span className="text-sm text-[var(--text-muted)]">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">{ticket.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'agents' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Terminated Agents</h2>
            {terminatedAgents.length === 0 ? (
              <p className="text-[var(--text-muted)]">No terminated agents</p>
            ) : (
              terminatedAgents.map((agent) => (
                <div key={agent.id} className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[var(--text-primary)]">{agent.name}</h3>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Terminated</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 capitalize">{agent.role}</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'budget' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Budget History</h2>
            <div className="space-y-3">
              {agents.map((agent) => (
                <div key={agent.id} className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[var(--text-primary)]">{agent.name}</span>
                    <span className="text-sm text-[var(--text-secondary)]">
                      ${agent.currentSpend.toFixed(2)} spent
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
