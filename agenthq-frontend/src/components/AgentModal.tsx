import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, UserPlus, AlertCircle } from 'lucide-react';
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
  { value: 'custom', label: 'Custom' },
];

const models: Record<string, string[]> = {
  claude: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  custom: ['custom-model'],
};

export default function AgentModal({ onClose }: AgentModalProps) {
  const { createAgent } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    role: 'engineer' as Agent['role'],
    provider: 'claude' as Agent['provider'],
    model: 'claude-3-5-haiku-20241022',
    systemPrompt: '',
    monthlyBudget: 500,
    parentId: null as string | null,
  });

  const handleProviderChange = (provider: Agent['provider']) => {
    setFormData((prev) => ({
      ...prev,
      provider,
      model: models[provider][0],
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
      await createAgent({
        ...formData,
        systemPrompt: formData.systemPrompt || `You are ${formData.name}, working as ${formData.role} at this company.`,
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
          className="w-full max-w-lg bg-[#151921] border border-[#2A3142] rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#2A3142] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#F4F5F7]">Hire New Agent</h2>
                <p className="text-sm text-[#5C6578]">Add a new AI worker to your team</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#1C222D] flex items-center justify-center text-[#5C6578] hover:text-[#F4F5F7] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#9BA3B5] mb-1.5">
                Agent Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Alex, Sam, Jordan"
                className="w-full bg-[#0C0F14] border border-[#2A3142] rounded-lg px-3 py-2.5 text-[#F4F5F7] placeholder-[#5C6578] focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Role & Provider */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#9BA3B5] mb-1.5">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Agent['role'] })}
                  className="w-full bg-[#0C0F14] border border-[#2A3142] rounded-lg px-3 py-2.5 text-[#F4F5F7] focus:border-indigo-500 focus:outline-none transition-colors"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9BA3B5] mb-1.5">Provider</label>
                <select
                  value={formData.provider}
                  onChange={(e) => handleProviderChange(e.target.value as Agent['provider'])}
                  className="w-full bg-[#0C0F14] border border-[#2A3142] rounded-lg px-3 py-2.5 text-[#F4F5F7] focus:border-indigo-500 focus:outline-none transition-colors"
                >
                  {providers.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-[#9BA3B5] mb-1.5">Model</label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-[#0C0F14] border border-[#2A3142] rounded-lg px-3 py-2.5 text-[#F4F5F7] focus:border-indigo-500 focus:outline-none transition-colors"
              >
                {models[formData.provider].map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-[#9BA3B5] mb-1.5">
                Monthly Budget ($)
              </label>
              <input
                type="number"
                value={formData.monthlyBudget}
                onChange={(e) => setFormData({ ...formData, monthlyBudget: Number(e.target.value) })}
                min={0}
                step={50}
                className="w-full bg-[#0C0F14] border border-[#2A3142] rounded-lg px-3 py-2.5 text-[#F4F5F7] focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-[#9BA3B5] mb-1.5">
                System Prompt (Optional)
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="Custom instructions for this agent..."
                rows={3}
                className="w-full bg-[#0C0F14] border border-[#2A3142] rounded-lg px-3 py-2.5 text-[#F4F5F7] placeholder-[#5C6578] focus:border-indigo-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-[#2A3142] rounded-lg text-[#9BA3B5] font-medium hover:bg-[#1C222D] hover:text-[#F4F5F7] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
