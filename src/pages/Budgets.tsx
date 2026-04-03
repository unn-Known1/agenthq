import { useEffect } from 'react';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useStore } from '../stores/appStore';

export default function Budgets() {
  const { agents, fetchAgents } = useStore();

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const activeAgents = agents.filter((a) => a.status === 'active');
  const totalBudget = activeAgents.reduce((sum, a) => sum + a.monthlyBudget, 0);
  const totalSpent = activeAgents.reduce((sum, a) => sum + a.currentSpend, 0);
  const remaining = totalBudget - totalSpent;
  const usagePercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const chartData = activeAgents.map((agent) => ({
    name: agent.name,
    value: agent.currentSpend,
    budget: agent.monthlyBudget,
  }));

  const COLORS = ['#6366F1', '#8B5CF6', '#A855F7', '#EC4899', '#F97316', '#06B6D4', '#10B981'];

  const roleColors: Record<string, string> = {
    ceo: '#A855F7', cto: '#8B5CF6', engineer: '#06B6D4',
    designer: '#EC4899', marketing: '#F97316', support: '#10B981', custom: '#6366F1',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Budgets</h1>
        <p className="text-[var(--text-secondary)] mt-1">Monitor agent spending</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-4">${remaining.toFixed(2)}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Remaining Budget</p>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-4">${totalSpent.toFixed(2)}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Total Spent</p>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-4">{usagePercent.toFixed(1)}%</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Budget Used</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Spending Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm text-[var(--text-secondary)]">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Agent Budgets</h2>
          <div className="space-y-4">
            {activeAgents.map((agent) => {
              const percent = (agent.currentSpend / agent.monthlyBudget) * 100;
              const isOver = percent > 100;
              const isWarning = percent >= 80 && percent <= 100;
              return (
                <div key={agent.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${roleColors[agent.role] || '#6366F1'})` }}
                      >
                        {agent.name.charAt(0)}
                      </div>
                      <span className="text-[var(--text-primary)]">{agent.name}</span>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">
                      ${agent.currentSpend.toFixed(2)} / ${agent.monthlyBudget}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(percent, 100)}%`,
                        backgroundColor: isOver ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
