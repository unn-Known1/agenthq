import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../stores/appStore';
import { Agent } from '../lib/api';

interface AgentModalProps {
  onClose: () => void;
}

const roles = [
  { value: 'ceo', label: 'CEO' },
  { value: 'cto', label: 'CTO' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'designer', label: 'Designer' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'support', label: 'Support' },
  { value: 'custom', label: 'Custom' },
];

const providers = [
  { value: 'claude', label: 'Claude (Anthropic)' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'custom', label: 'Custom (OpenAI Compatible)' },
];

const models: Record<string, string[]> = {
  claude: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  custom: [],
};

export default function AgentModal({ onClose }: AgentModalProps) {
  const { createAgent, agents } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: 'engineer' as string,
    provider: 'claude' as string,
    model: 'claude-3-5-haiku-20241022',
    baseUrl: '',
    apiKey: '',
    monthlyBudget: 500,
    parentId: null as string | null,
  });

  const parentOptions = agents.filter((a) => a.canCreateAgents && a.status === 'active');

  const handleProviderChange = (provider: string) => {
    setFormData((prev) => ({
      ...prev,
      provider,
      model: models[provider]?.[0] || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Agent name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const canCreateAgents = formData.role === 'ceo' || formData.role === 'cto';
      await createAgent({
        name: formData.name,
        role: formData.role,
        provider: formData.provider,
        model: formData.model || models[formData.provider]?.[0] || 'default',
        monthlyBudget: formData.monthlyBudget,
        currentSpend: 0,
        status: 'active',
        parentId: formData.parentId,
        canCreateAgents,
        canUseTools: canCreateAgents,
        toolPermissions: canCreateAgents ? ['read_file', 'write_file'] : [],
      });
      onClose();
    } catch (err) {
      setError('Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Hire New Agent</h2>
                <p className="text-sm text-[var(--text-muted)]">Add a new AI worker to your team</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Agent Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Alex, Sam, Jordan"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Provider</label>
                <select
                  value={formData.provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                >
                  {providers.map((provider) => (
                    <option key={provider.value} value={provider.value}>{provider.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.provider === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Base URL <span className="text-red-400">*</span></label>
                  <input
                    type="url"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                    placeholder="https://api.vllm.example.com/v1"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Model ID <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g., meta-llama/Llama-3-70b-instruct"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="sk-..."
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 pr-10 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {formData.provider !== 'custom' && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Model</label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                >
                  {models[formData.provider]?.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Reports To</label>
              <select
                value={formData.parentId || ''}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
              >
                <option value="">No supervisor</option>
                {parentOptions.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.name} ({agent.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Monthly Budget ($)</label>
              <input
                type="number"
                value={formData.monthlyBudget}
                onChange={(e) => setFormData({ ...formData, monthlyBudget: Number(e.target.value) })}
                min={0}
                step={50}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-tertiary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Hiring...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    Hire Agent
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
