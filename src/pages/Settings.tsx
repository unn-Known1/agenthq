import { Settings as SettingsIcon, Sun, Moon, Monitor, Save, Bot } from 'lucide-react';

interface SettingsPageProps {
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light' | 'system') => void;
}

export default function SettingsPage({ theme, onThemeChange }: SettingsPageProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-secondary)] mt-1">Configure your AgentHQ experience</p>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Appearance</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => onThemeChange('light')}
              className={`p-4 rounded-xl border transition-all ${
                theme === 'light'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
              }`}
            >
              <Sun className="w-6 h-6 mx-auto mb-2 text-[var(--text-primary)]" />
              <p className="text-sm text-[var(--text-primary)]">Light</p>
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              className={`p-4 rounded-xl border transition-all ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
              }`}
            >
              <Moon className="w-6 h-6 mx-auto mb-2 text-[var(--text-primary)]" />
              <p className="text-sm text-[var(--text-primary)]">Dark</p>
            </button>
            <button
              onClick={() => onThemeChange('system')}
              className={`p-4 rounded-xl border transition-all ${
                theme === 'system'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
              }`}
            >
              <Monitor className="w-6 h-6 mx-auto mb-2 text-[var(--text-primary)]" />
              <p className="text-sm text-[var(--text-primary)]">System</p>
            </button>
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Company</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Company Name</label>
              <input
                type="text"
                defaultValue="AgentHQ Corp"
                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Mission Statement</label>
              <textarea
                defaultValue="Build the #1 AI note-taking app"
                rows={3}
                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] resize-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Notifications</h2>
          <div className="space-y-3">
            {[
              { id: 'budget', label: 'Budget alerts', desc: 'Get notified when agents exceed budget thresholds' },
              { id: 'tickets', label: 'Ticket updates', desc: 'Notifications for ticket assignments and completions' },
              { id: 'reports', label: 'Weekly reports', desc: 'Receive weekly summary of agent activities' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{item.label}</p>
                  <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-6">
          <button className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
