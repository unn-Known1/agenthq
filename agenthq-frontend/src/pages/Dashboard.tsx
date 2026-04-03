import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Ticket,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Bot,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../stores/appStore';
import AgentModal from '../components/AgentModal';
import TicketModal from '../components/TicketModal';
import { formatDistanceToNow } from 'date-fns';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const roleColors: Record<string, string> = {
  ceo: '#A855F7',
  cto: '#8B5CF6',
  engineer: '#06B6D4',
  designer: '#EC4899',
  marketing: '#F97316',
  support: '#10B981',
  custom: '#6366F1',
};

export default function Dashboard() {
  const {
    stats,
    agents,
    activities,
    fetchStats,
    fetchAgents,
    fetchActivities,
    fetchTickets,
    showAgentModal,
    showTicketModal,
    setShowAgentModal,
    setShowTicketModal,
  } = useStore();

  useEffect(() => {
    fetchStats();
    fetchAgents();
    fetchActivities();
    fetchTickets();
  }, [fetchStats, fetchAgents, fetchActivities, fetchTickets]);

  const activeAgents = agents.filter((a) => a.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F7]">Dashboard</h1>
          <p className="text-[#9BA3B5] mt-1">Overview of your AI workforce</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTicketModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#151921] border border-[#2A3142] rounded-lg text-[#F4F5F7] hover:bg-[#1C222D] transition-colors"
          >
            <Ticket className="w-4 h-4" />
            New Ticket
          </button>
          <button
            onClick={() => setShowAgentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Hire Agent
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div
          variants={item}
          className="bg-[#151921] border border-[#2A3142] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-green-400 text-sm font-medium">Active</span>
          </div>
          <p className="text-3xl font-bold text-[#F4F5F7] mt-4">{stats?.activeAgents || 0}</p>
          <p className="text-sm text-[#9BA3B5] mt-1">Active Agents</p>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-[#151921] border border-[#2A3142] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-cyan-400 text-sm font-medium">
              {stats?.ticketsByStatus?.in_progress || 0} in progress
            </span>
          </div>
          <p className="text-3xl font-bold text-[#F4F5F7] mt-4">{stats?.openTickets || 0}</p>
          <p className="text-sm text-[#9BA3B5] mt-1">Open Tickets</p>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-[#151921] border border-[#2A3142] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-400" />
            </div>
            {(stats?.budgetAlerts?.length || 0) > 0 && (
              <span className="flex items-center gap-1 text-amber-400 text-sm font-medium">
                <AlertTriangle className="w-3 h-3" />
                Alert
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-[#F4F5F7] mt-4">
            ${stats?.totalSpend?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-[#9BA3B5] mt-1">
            of ${stats?.totalMonthlyBudget?.toFixed(2) || '0.00'}
          </p>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-[#151921] border border-[#2A3142] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-purple-400 text-sm font-medium">
              {stats?.ticketsByStatus?.done || 0} done
            </span>
          </div>
          <p className="text-3xl font-bold text-[#F4F5F7] mt-4">{stats?.completionRate || 0}%</p>
          <p className="text-sm text-[#9BA3B5] mt-1">Completion Rate</p>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[#151921] border border-[#2A3142] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#F4F5F7]">Your Team</h2>
            <button
              onClick={() => setShowAgentModal(true)}
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Add Agent <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {activeAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="group relative bg-[#0C0F14] border border-[#2A3142] rounded-xl p-4 hover:border-indigo-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${roleColors[agent.role]}40, ${roleColors[agent.role]})`,
                    }}
                  >
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#F4F5F7] truncate">{agent.name}</p>
                    <p className="text-xs text-[#5C6578] capitalize">{agent.role}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#1C222D] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          (agent.currentSpend / agent.monthlyBudget) * 100,
                          100
                        )}%`,
                        backgroundColor:
                          (agent.currentSpend / agent.monthlyBudget) * 100 > 100
                            ? '#EF4444'
                            : (agent.currentSpend / agent.monthlyBudget) * 100 >= 80
                            ? '#F59E0B'
                            : '#10B981',
                      }}
                    />
                  </div>
                  <span className="text-xs text-[#5C6578]">
                    ${agent.currentSpend.toFixed(0)}
                  </span>
                </div>
                {agent.status === 'active' && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#151921] border border-[#2A3142] rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-[#F4F5F7] mb-4">Recent Activity</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {activities.slice(0, 8).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'agent_joined'
                      ? 'bg-green-500/20 text-green-400'
                      : activity.type === 'budget_alert'
                      ? 'bg-amber-500/20 text-amber-400'
                      : activity.type === 'ticket_created'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-indigo-500/20 text-indigo-400'
                  }`}
                >
                  {activity.type === 'agent_joined' ? (
                    <Bot className="w-4 h-4" />
                  ) : activity.type === 'budget_alert' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Ticket className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F4F5F7]">{activity.message}</p>
                  <p className="text-xs text-[#5C6578] mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Budget Alerts */}
      {stats?.budgetAlerts && stats.budgetAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#151921] border border-amber-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F4F5F7]">Budget Alerts</h2>
              <p className="text-sm text-[#9BA3B5]">
                Some agents are approaching their monthly limits
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {stats.budgetAlerts.map((alert) => (
              <div
                key={alert.agentId}
                className="flex items-center justify-between p-3 bg-[#0C0F14] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-[#9BA3B5]" />
                  <span className="text-[#F4F5F7]">{alert.agentName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#9BA3B5]">
                    ${alert.spent.toFixed(2)} / ${alert.budget.toFixed(2)}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.percentage >= 100
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {alert.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modals */}
      {showAgentModal && <AgentModal onClose={() => setShowAgentModal(false)} />}
      {showTicketModal && <TicketModal onClose={() => setShowTicketModal(false)} />}
    </div>
  );
}
