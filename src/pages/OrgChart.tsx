import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../stores/appStore';
import AgentModal from '../components/AgentModal';

export default function OrgChart() {
  const { agents, fetchAgents, showAgentModal, setShowAgentModal } = useStore();

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const roleColors: Record<string, string> = {
    ceo: '#A855F7', cto: '#8B5CF6', engineer: '#06B6D4',
    designer: '#EC4899', marketing: '#F97316', support: '#10B981', custom: '#6366F1',
  };

  const activeAgents = agents.filter((a) => a.status === 'active');
  const ceo = activeAgents.find((a) => a.role === 'ceo');
  const getReports = (parentId: string | null) => activeAgents.filter((a) => a.parentId === parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Organization Chart</h1>
          <p className="text-[var(--text-secondary)] mt-1">Your agent hierarchy</p>
        </div>
        <button
          onClick={() => setShowAgentModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          <Plus className="w-4 h-4" />
          Add Agent
        </button>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8">
        <div className="flex flex-col items-center gap-8">
          {/* CEO */}
          {ceo && (
            <div className="flex flex-col items-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${roleColors.ceo}, ${roleColors.ceo}80)` }}
              >
                {ceo.name.charAt(0).toUpperCase()}
              </div>
              <p className="mt-2 font-medium text-[var(--text-primary)]">{ceo.name}</p>
              <p className="text-sm text-[var(--text-muted)] capitalize">{ceo.role}</p>
            </div>
          )}

          {/* Level 2 */}
          <div className="flex gap-8">
            {getReports(ceo?.id || null).map((agent) => (
              <div key={agent.id} className="flex flex-col items-center">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${roleColors[agent.role] || roleColors.custom}, ${roleColors[agent.role] || roleColors.custom}80)` }}
                >
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <p className="mt-2 font-medium text-[var(--text-primary)]">{agent.name}</p>
                <p className="text-sm text-[var(--text-muted)] capitalize">{agent.role}</p>

                {/* Level 3 */}
                <div className="mt-6 flex gap-4">
                  {getReports(agent.id).map((sub) => (
                    <div key={sub.id} className="flex flex-col items-center">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${roleColors[sub.role] || roleColors.custom}, ${roleColors[sub.role] || roleColors.custom}80)` }}
                      >
                        {sub.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{sub.name}</p>
                      <p className="text-xs text-[var(--text-muted)] capitalize">{sub.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {activeAgents.map((agent) => (
          <div key={agent.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${roleColors[agent.role] || roleColors.custom}, ${roleColors[agent.role] || roleColors.custom}80)` }}
              >
                {agent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">{agent.name}</p>
                <p className="text-xs text-[var(--text-muted)] capitalize">{agent.role}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-[var(--text-muted)]">
              <p>{agent.provider} - {agent.model}</p>
            </div>
          </div>
        ))}
      </div>

      {showAgentModal && <AgentModal onClose={() => setShowAgentModal(false)} />}
    </div>
  );
}
