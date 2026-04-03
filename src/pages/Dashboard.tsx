import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Ticket, DollarSign, CheckCircle, Bot, Plus } from 'lucide-react';
import { useStore } from '../stores/appStore';
import AgentModal from '../components/AgentModal';
import TicketModal from '../components/TicketModal';

export default function Dashboard() {
  const {
    stats, agents, tickets, activities,
    fetchStats, fetchAgents, fetchTickets, fetchActivities,
    showAgentModal, showTicketModal,
    setShowAgentModal, setShowTicketModal,
  } = useStore();

  useEffect(() => {
    fetchStats();
    fetchAgents();
    fetchTickets();
    fetchActivities();
  }, [fetchStats, fetchAgents, fetchTickets, fetchActivities]);

  const activeAgents = agents.filter((a) => a.status === 'active');
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
  const completedTickets = tickets.filter((t) => t.status === 'completed');
  const totalBudget = agents.reduce((sum, a) => sum + a.monthlyBudget, 0);
  const totalSpent = agents.reduce((sum, a) => sum + a.currentSpend, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-[var(--text-secondary)] mt-1">Overview of your AI workforce</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTicketModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
          >
            <Ticket className="w-4 h-4" />
            New Ticket
          </button>
          <button
            onClick={() => setShowAgentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            <Plus className="w-4 h-4" />
            Hire Agent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-4">{activeAgents.length}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Active Agents</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-4">{openTickets.length}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Open Tickets</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-4">${totalSpent.toFixed(0)}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">of ${totalBudget} budget</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-4">{completedTickets.length}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Completed</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Your Team</h2>
            <button
              onClick={() => setShowAgentModal(true)}
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Add Agent <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {activeAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">{agent.name}</p>
                    <p className="text-xs text-[var(--text-muted)] capitalize">{agent.role}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
                    <span>Budget</span>
                    <span>{((agent.currentSpend / agent.monthlyBudget) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((agent.currentSpend / agent.monthlyBudget) * 100, 100)}%`,
                        backgroundColor: (agent.currentSpend / agent.monthlyBudget) >= 0.8 ? '#F59E0B' : '#10B981',
                      }}
                    />
                  </div>
                </div>
                {agent.status === 'active' && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Activity</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {activities.slice(0, 8).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-primary)]">{activity.description}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAgentModal && <AgentModal onClose={() => setShowAgentModal(false)} />}
      {showTicketModal && <TicketModal onClose={() => setShowTicketModal(false)} />}
    </div>
  );
}
