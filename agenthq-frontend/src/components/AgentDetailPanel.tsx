import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Mail, DollarSign, Activity, AlertTriangle, Pause, Play, Trash2 } from 'lucide-react';
import { Agent } from '../lib/api';
import { useStore } from '../stores/appStore';

interface AgentDetailPanelProps {
  agent: Agent;
  onClose: () => void;
}

const roleColors: Record<string, string> = {
  ceo: '#A855F7',
  cto: '#8B5CF6',
  engineer: '#06B6D4',
  designer: '#EC4899',
  marketing: '#F97316',
  support: '#10B981',
  custom: '#6366F1',
};

const roleLabels: Record<string, string> = {
  ceo: 'CEO',
  cto: 'CTO',
  engineer: 'Engineer',
  designer: 'Designer',
  marketing: 'Marketing',
  support: 'Support',
  custom: 'Custom',
};

const providerLabels: Record<string, string> = {
  claude: 'Claude (Anthropic)',
  openai: 'OpenAI',
  custom: 'Custom',
};

export default function AgentDetailPanel({ agent, onClose }: AgentDetailPanelProps) {
  const { updateAgent, deleteAgent, tickets } = useStore();
  const budgetPercent = Math.round((agent.currentSpend / agent.monthlyBudget) * 100);
  const isOverBudget = budgetPercent > 100;
  const isWarning = budgetPercent >= 80 && budgetPercent <= 100;

  const agentTickets = tickets.filter((t) => t.assigneeId === agent.id);
  const activeTickets = agentTickets.filter((t) => t.status !== 'done');

  const handleStatusToggle = async () => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    await updateAgent(agent.id, { status: newStatus });
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to terminate ${agent.name}?`)) {
      await deleteAgent(agent.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#151921] border-l border-[#2A3142] shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#2A3142]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${roleColors[agent.role]}40, ${roleColors[agent.role]})`,
                }}
              >
                {agent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#F4F5F7]">{agent.name}</h2>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${roleColors[agent.role]}20`,
                    color: roleColors[agent.role],
                  }}
                >
                  {roleLabels[agent.role]}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#1C222D] flex items-center justify-center text-[#5C6578] hover:text-[#F4F5F7] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                agent.status === 'active'
                  ? 'bg-green-400 animate-pulse'
                  : agent.status === 'paused'
                  ? 'bg-amber-400'
                  : 'bg-red-400'
              }`}
            />
            <span className="text-sm text-[#9BA3B5] capitalize">{agent.status}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleStatusToggle}
              disabled={agent.status === 'terminated'}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                agent.status === 'active'
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {agent.status === 'active' ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Resume
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              disabled={agent.status === 'terminated'}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Budget */}
          <div className="bg-[#0C0F14] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#9BA3B5]" />
                <span className="text-sm font-medium text-[#9BA3B5]">Monthly Budget</span>
              </div>
              {(isOverBudget || isWarning) && (
                <AlertTriangle
                  className={`w-4 h-4 ${
                    isOverBudget ? 'text-red-400' : 'text-amber-400'
                  }`}
                />
              )}
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-2xl font-bold text-[#F4F5F7]">
                ${agent.currentSpend.toFixed(2)}
              </span>
              <span className="text-sm text-[#5C6578] mb-1">/ ${agent.monthlyBudget.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-[#1C222D] rounded-full overflow-hidden">
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
            <p className="text-xs text-[#5C6578] mt-2">{budgetPercent}% used</p>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#5C6578]">Provider</label>
              <p className="text-[#F4F5F7] mt-1">{providerLabels[agent.provider]}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#5C6578]">Model</label>
              <p className="text-[#F4F5F7] font-mono text-sm mt-1">{agent.model}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#5C6578]">System Prompt</label>
              <p className="text-[#9BA3B5] text-sm mt-1 line-clamp-4">{agent.systemPrompt}</p>
            </div>
          </div>

          {/* Active Tickets */}
          {activeTickets.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[#9BA3B5] mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Active Tickets ({activeTickets.length})
              </h3>
              <div className="space-y-2">
                {activeTickets.slice(0, 3).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-[#0C0F14] rounded-lg p-3 border border-[#2A3142]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#F4F5F7]">{ticket.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ticket.priority === 'critical'
                            ? 'bg-red-500/20 text-red-400'
                            : ticket.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-400'
                            : ticket.priority === 'medium'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C6578] mt-1">{ticket.id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
