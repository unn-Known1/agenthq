import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ticket, AlertCircle } from 'lucide-react';
import { useStore } from '../stores/appStore';

interface TicketModalProps {
  onClose: () => void;
}

const priorities = [
  { value: 'low', label: 'Low', color: '#10B981' },
  { value: 'medium', label: 'Medium', color: '#3B82F6' },
  { value: 'high', label: 'High', color: '#F59E0B' },
  { value: 'critical', label: 'Critical', color: '#EF4444' },
];

export default function TicketModal({ onClose }: TicketModalProps) {
  const { createTicket, agents } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    assigneeId: '' as string,
    budgetAllocated: 0,
  });

  const activeAgents = agents.filter((a) => a.status === 'active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Ticket title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createTicket({
        ...formData,
        assigneeId: formData.assigneeId || null,
      });
      onClose();
    } catch {
      setError('Failed to create ticket');
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#F4F5F7]">Create Ticket</h2>
                <p className="text-sm text-[#5C6578]">Assign a new task to your team</p>
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

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#9BA3B5] mb-1.5">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Implement user authentication"
                className="w-full bg-[#0C0F14] border border-[#2A3142] rounded-lg px-3 py-2.5 text-[#F4F5F7] placeholder-[#5C6578] focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#9BA3B5] mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the task in detail..."
                rows={3}
                className="w-full bg-[#0C0F14] border border-[#2A3142] rounded-lg px-3 py-2.5 text-[#F4F5F7] placeholder-[#5C6578] focus:border-indigo-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Priority & Assignee */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#9BA3B5] mb-1.5">
                  Priority
                </label>
                <div className="flex gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          priority: p.value as typeof formData.priority,
                        })
                      }
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        formData.priority === p.value
                          ? 'ring-2 ring-offset-2 ring-offset-[#151921]'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: `${p.color}20`,
                        color: p.color,
                        ['--tw-ring-color' as string]: p.color,
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9BA3B5] mb-1.5">
                  Assignee
                </label>
                <select
                  value={formData.assigneeId}
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  className="w-full bg-[#0C0F14] border border-[#2A3142] rounded-lg px-3 py-2.5 text-[#F4F5F7] focus:border-indigo-500 focus:outline-none transition-colors"
                >
                  <option value="">Unassigned</option>
                  {activeAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-[#9BA3B5] mb-1.5">
                Budget Allocated ($)
              </label>
              <input
                type="number"
                value={formData.budgetAllocated}
                onChange={(e) =>
                  setFormData({ ...formData, budgetAllocated: Number(e.target.value) })
                }
                min={0}
                step={10}
                className="w-full bg-[#0C0F14] border border-[#2A3142] rounded-lg px-3 py-2.5 text-[#F4F5F7] focus:border-indigo-500 focus:outline-none transition-colors"
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" />
                    Create Ticket
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