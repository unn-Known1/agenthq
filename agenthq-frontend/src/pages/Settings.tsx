import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Building2,
  Bell,
  Shield,
  Palette,
  Save,
  RefreshCw,
  Bot,
} from 'lucide-react';
import { useStore } from '../stores/appStore';

interface SettingsPageProps {
  theme: 'dark' | 'light' | 'system';
  onThemeChange: (theme: 'dark' | 'light' | 'system') => void;
}

export default function SettingsPage({ theme, onThemeChange }: SettingsPageProps) {
  const { company, setCompany, updateMission } = useStore();
  const [mission, setMission] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (company) {
      setMission(company.mission || '');
    }
  }, [company]);

  const handleSaveMission = async () => {
    setSaving(true);
    try {
      await updateMission(mission);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save mission:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-secondary)] mt-1">Configure your AgentHQ workspace</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Appearance</h2>
              <p className="text-sm text-[var(--text-muted)]">Customize the look and feel</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onThemeChange('light')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-active)]'
                }`}
              >
                <Sun className="w-6 h-6 text-amber-400" />
                <span className="text-sm font-medium text-[var(--text-primary)]">Light</span>
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-active)]'
                }`}
              >
                <Moon className="w-6 h-6 text-indigo-400" />
                <span className="text-sm font-medium text-[var(--text-primary)]">Dark</span>
              </button>
              <button
                onClick={() => onThemeChange('system')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === 'system'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-active)]'
                }`}
              >
                <Monitor className="w-6 h-6 text-[var(--text-secondary)]" />
                <span className="text-sm font-medium text-[var(--text-primary)]">System</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Company Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Company</h2>
              <p className="text-sm text-[var(--text-muted)]">Define your organization</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={company?.name || ''}
                readOnly
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Company Mission
              </label>
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder="Define your company's mission..."
                rows={4}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={handleSaveMission}
              disabled={saving}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              } disabled:opacity-50`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Shield className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Mission
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notifications</h2>
              <p className="text-sm text-[var(--text-muted)]">Manage alert preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Budget Alerts</p>
                <p className="text-xs text-[var(--text-muted)]">Get notified when agents exceed budget</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Agent Status Changes</p>
                <p className="text-xs text-[var(--text-muted)]">Notifications for agent pauses/terminations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Task Updates</p>
                <p className="text-xs text-[var(--text-muted)]">Notifications for task completions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">About AgentHQ</h2>
              <p className="text-sm text-[var(--text-muted)]">Platform information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
              <span className="text-sm text-[var(--text-muted)]">Version</span>
              <span className="text-sm text-[var(--text-primary)] font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
              <span className="text-sm text-[var(--text-muted)]">Build</span>
              <span className="text-sm text-[var(--text-primary)] font-mono">Production</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-[var(--text-muted)]">Documentation</span>
              <a
                href="#"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                View Docs →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
