import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../stores/appStore';

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

// Simple SVG bar chart component
function SimpleBarChart({ data }: { data: { label: string; value: number; max: number }[] }) {
  const maxValue = Math.max(...data.map(d => d.max), 1);

  return (
    <div className="flex items-end justify-between gap-4 h-40">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div className="w-full relative" style={{ height: '160px' }}>
            {/* Budget bar (background) */}
            <div
              className="absolute bottom-0 w-full bg-[#10B981]/20 rounded-t-lg"
              style={{ height: `${(item.max / maxValue) * 100}%` }}
            />
            {/* Spend bar (foreground) */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg"
            />
          </div>
          <span className="text-xs text-[#9BA3B5] mt-2">{item.label}</span>
          <span className="text-xs text-[#5C6578]">${item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Budgets() {
  const { agents, fetchAgents, updateAgent } = useStore();
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [newBudget, setNewBudget] = useState<number>(0);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const activeAgents = agents.filter((a) => a.status !== 'terminated');
  const totalBudget = activeAgents.reduce((sum, a) => sum + a.monthlyBudget, 0);
  const totalSpend = activeAgents.reduce((sum, a) => sum + a.currentSpend, 0);
  const overBudgetAgents = activeAgents.filter(
    (a) => a.currentSpend > a.monthlyBudget
  );
  const warningAgents = activeAgents.filter(
    (a) =>
      a.currentSpend <= a.monthlyBudget &&
      a.currentSpend >= a.monthlyBudget * 0.8
  );

  const handleBudgetEdit = (agentId: string, currentBudget: number) => {
    setEditingBudget(agentId);
    setNewBudget(currentBudget);
  };

  const handleBudgetSave = async (agentId: string) => {
    if (newBudget > 0) {
      await updateAgent(agentId, { monthlyBudget: newBudget });
    }
    setEditingBudget(null);
  };

  // Mock monthly trend data
  const monthlyTrend = [
    { label: 'Jan', value: 2650, max: 2800 },
    { label: 'Feb', value: 2900, max: 2800 },
    { label: 'Mar', value: 3100, max: 3200 },
    { label: 'Apr', value: 2950, max: 3200 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F7]">Budget Management</h1>
          <p className="text-[#9BA3B5] mt-1">
            Monitor and control your AI workforce spending
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#151921] border border-[#2A3142] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#F4F5F7] mt-4">
            ${totalBudget.toFixed(2)}
          </p>
          <p className="text-sm text-[#9BA3B5] mt-1">Total Monthly Budget</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#151921] border border-[#2A3142] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#F4F5F7] mt-4">
            ${totalSpend.toFixed(2)}
          </p>
          <p className="text-sm text-[#9BA3B5] mt-1">
            Current Spend ({((totalSpend / totalBudget) * 100).toFixed(1)}%)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#151921] border border-amber-500/30 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#F4F5F7] mt-4">{warningAgents.length}</p>
          <p className="text-sm text-[#9BA3B5] mt-1">Warning (80%+)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#151921] border border-red-500/30 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#F4F5F7] mt-4">{overBudgetAgents.length}</p>
          <p className="text-sm text-[#9BA3B5] mt-1">Over Budget</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#151921] border border-[#2A3142] rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-[#F4F5F7] mb-6">Monthly Spending Trend</h2>
          <SimpleBarChart data={monthlyTrend} />
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-sm text-[#9BA3B5]">Actual Spend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10B981]/40" />
              <span className="text-sm text-[#9BA3B5]">Budget</span>
            </div>
          </div>
        </motion.div>

        {/* Budget Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-[#151921] border border-[#2A3142] rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-[#F4F5F7] mb-6">Budget Breakdown</h2>
          <div className="space-y-4">
            {activeAgents.map((agent) => {
              const percentage = (agent.currentSpend / agent.monthlyBudget) * 100;
              const isOver = percentage > 100;
              const isWarning = percentage >= 80 && percentage <= 100;

              return (
                <div key={agent.id} className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${roleColors[agent.role]}40, ${roleColors[agent.role]})`,
                    }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#F4F5F7]">{agent.name}</span>
                      <span className="text-sm text-[#9BA3B5]">
                        ${agent.currentSpend.toFixed(0)} / ${agent.monthlyBudget}
                      </span>
                    </div>
                    <div className="h-2 bg-[#1C222D] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: isOver
                            ? '#EF4444'
                            : isWarning
                            ? '#F59E0B'
                            : '#10B981',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Agent Budget Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-[#F4F5F7] mb-4">Agent Budgets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeAgents.map((agent, index) => {
            const percentage = Math.round(
              (agent.currentSpend / agent.monthlyBudget) * 100
            );
            const isOver = agent.currentSpend > agent.monthlyBudget;
            const isWarning = percentage >= 80 && percentage <= 100;
            const remaining = agent.monthlyBudget - agent.currentSpend;

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`bg-[#151921] border rounded-2xl p-5 ${
                  isOver
                    ? 'border-red-500/30'
                    : isWarning
                    ? 'border-amber-500/30'
                    : 'border-[#2A3142]'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${roleColors[agent.role]}40, ${roleColors[agent.role]})`,
                      }}
                    >
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-[#F4F5F7]">{agent.name}</h3>
                      <span
                        className="text-xs"
                        style={{ color: roleColors[agent.role] }}
                      >
                        {roleLabels[agent.role]}
                      </span>
                    </div>
                  </div>
                  {(isOver || isWarning) && (
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        isOver ? 'text-red-400' : 'text-amber-400'
                      }`}
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[#9BA3B5]">Spent</span>
                      <span className="text-[#F4F5F7] font-medium">
                        ${agent.currentSpend.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 bg-[#1C222D] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: isOver
                            ? '#EF4444'
                            : isWarning
                            ? '#F59E0B'
                            : '#10B981',
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9BA3B5]">Budget</span>
                    {editingBudget === agent.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newBudget}
                          onChange={(e) => setNewBudget(Number(e.target.value))}
                          className="w-20 bg-[#0C0F14] border border-[#2A3142] rounded px-2 py-1 text-[#F4F5F7] text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleBudgetSave(agent.id)}
                          className="text-green-400 text-sm"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleBudgetEdit(agent.id, agent.monthlyBudget)
                        }
                        className="text-[#F4F5F7] font-medium hover:text-indigo-400 transition-colors"
                      >
                        ${agent.monthlyBudget.toFixed(2)}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9BA3B5]">Remaining</span>
                    <span
                      className={`font-medium ${
                        remaining < 0 ? 'text-red-400' : 'text-[#F4F5F7]'
                      }`}
                    >
                      ${remaining.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#2A3142]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#5C6578]">Usage</span>
                    <span
                      className={`font-medium ${
                        isOver
                          ? 'text-red-400'
                          : isWarning
                          ? 'text-amber-400'
                          : 'text-green-400'
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
