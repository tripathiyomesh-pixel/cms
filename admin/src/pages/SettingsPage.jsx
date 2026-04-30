import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Save, Shield, Globe, Palette, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { user } = useAuth();
  const [tab, setTab] = useState('password');
  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pw.new_password !== pw.confirm) return toast.error("Passwords don't match");
    if (pw.new_password.length < 8) return toast.error('Min 8 characters');
    setSaving(true);
    try {
      await authAPI.changePassword({ current_password: pw.current_password, new_password: pw.new_password });
      toast.success('Password changed');
      setPw({ current_password: '', new_password: '', confirm: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const tabs = [
    { id: 'password', label: 'Change password', icon: Lock },
    { id: 'license', label: 'License info', icon: Shield },
  ];

  return (
    <>
      <Topbar title="Settings" collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-2xl flex gap-5">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0 space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                  tab === t.id ? 'bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-300 font-medium' : 'text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1">
            {tab === 'password' && (
              <div className="card p-5">
                <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200 mb-4">Change password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                  <div>
                    <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Current password</label>
                    <input type="password" value={pw.current_password} onChange={e => setPw(p => ({ ...p, current_password: e.target.value }))} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-ink-500 mb-1.5">New password</label>
                    <input type="password" value={pw.new_password} onChange={e => setPw(p => ({ ...p, new_password: e.target.value }))} className="input-field" required minLength={8} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Confirm new password</label>
                    <input type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} className="input-field" required />
                  </div>
                  <button type="submit" disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
                    <Save size={13} /> {saving ? 'Saving...' : 'Update password'}
                  </button>
                </form>
              </div>
            )}

            {tab === 'license' && (
              <div className="card p-5">
                <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200 mb-4">License information</h3>
                <div className="bg-ink-900 dark:bg-ink-800 rounded-lg p-5 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] tracking-[1.5px] uppercase text-ink-400">License</span>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                    </span>
                  </div>
                  <div className="text-lg font-display font-semibold mb-1">JewelCMS</div>
                  <div className="text-[10px] text-ink-500 font-mono tracking-wider">JCM-••••-••••-AE04</div>
                  <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-ink-700/50">
                    <div>
                      <div className="text-[9px] tracking-wider uppercase text-ink-500">Plan</div>
                      <div className="text-xs font-medium mt-1">Standard</div>
                    </div>
                    <div>
                      <div className="text-[9px] tracking-wider uppercase text-ink-500">AMC until</div>
                      <div className="text-xs font-medium mt-1">Dec 2026</div>
                    </div>
                    <div>
                      <div className="text-[9px] tracking-wider uppercase text-ink-500">Account</div>
                      <div className="text-xs font-medium mt-1">{user?.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
