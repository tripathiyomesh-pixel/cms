import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Bell, ChevronDown, User, Settings, LogOut, Shield, Eye } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── Notification Bell ─────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen]           = useState(false);
  const [notifications, setNots]  = useState([]);
  const [unread, setUnread]       = useState(0);
  const ref = useRef();

  useEffect(() => {
    // Load recent activity as notifications
    api.get('/dashboard/recent-activity').then(r => {
      const items = (r.data.data || []).slice(0, 8).map((a, i) => ({
        id: i,
        type: a.type,
        label: a.label,
        sub: a.sub,
        time: a.created_at,
        read: i > 2, // first 3 unread
      }));
      setNots(items);
      setUnread(items.filter(n => !n.read).length);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const TYPE_ICONS = {
    enquiry: '💬', appointment: '📅', order: '🛒',
    custom_order: '✏️', product: '💎', default: '🔔',
  };

  const markAllRead = () => {
    setNots(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 transition-colors">
        <Bell size={16}/>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-ink-900 rounded-xl shadow-xl border border-ink-200/60 dark:border-ink-700 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-800">
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-200">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-[11px] text-gold-600 hover:text-gold-700 font-medium">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell size={24} className="mx-auto text-ink-200 mb-2"/>
                <p className="text-xs text-ink-400">No notifications</p>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-ink-50 dark:border-ink-800/50 last:border-0 transition-colors ${!n.read ? 'bg-gold-50/40 dark:bg-gold-900/10' : ''}`}>
                <span className="text-base flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] || TYPE_ICONS.default}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${!n.read ? 'font-semibold text-ink-700 dark:text-ink-200' : 'text-ink-600 dark:text-ink-300'} truncate`}>{n.label}</p>
                  <p className="text-[11px] text-ink-400 mt-0.5 capitalize">{n.sub} · {n.time ? new Date(n.time).toLocaleTimeString('en-AE', { hour:'2-digit', minute:'2-digit' }) : ''}</p>
                </div>
                {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0 mt-1.5"/>}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-ink-100 dark:border-ink-800 text-center">
            <a href="/audit-log" className="text-[11px] text-gold-600 hover:text-gold-700 font-medium">View all activity →</a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── User Profile Dropdown ──────────────────────────────────────
function UserDropdown() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen]           = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile]     = useState({ name: user?.name || '', email: user?.email || '', phone: '' });
  const [pwForm, setPwForm]       = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving]       = useState(false);
  const ref = useRef();

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.patch(`/users/${user.id}`, { name: profile.name, email: profile.email });
      toast.success('Profile updated');
    } catch(e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (pwForm.next !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.next.length < 8) return toast.error('Password must be at least 8 characters');
    setSaving(true);
    try {
      await api.post('/auth/change-password', { current_password: pwForm.current, new_password: pwForm.next });
      toast.success('Password changed');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch(e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const ROLE_COLORS = {
    super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    admin:       'bg-gold-100 text-gold-700 dark:bg-gold-900/20 dark:text-gold-400',
    manager:     'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    staff:       'bg-green-100 text-green-700',
    viewer:      'bg-ink-100 text-ink-600',
  };

  const inp = 'w-full border border-ink-200 dark:border-ink-700 rounded-xl px-3 py-2 text-xs text-ink-700 dark:text-ink-200 outline-none focus:border-gold-400 transition-all bg-white dark:bg-ink-800';
  const lbl = 'block text-[10px] font-semibold text-ink-400 uppercase tracking-wide mb-1';

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-2 border-l border-ink-200 dark:border-ink-700 ml-1 hover:opacity-80 transition-opacity">
        <div className="w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-ink-700 dark:text-ink-200 leading-none">{user?.name}</p>
          <p className="text-[10px] text-ink-400 leading-none mt-0.5 capitalize">{user?.role?.replace('_', ' ')}</p>
        </div>
        <ChevronDown size={12} className={`text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>

      {/* Dropdown */}
      {open && !showProfile && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-ink-900 rounded-xl shadow-xl border border-ink-200/60 dark:border-ink-700 overflow-hidden z-50">
          {/* User info header */}
          <div className="px-4 py-4 border-b border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-700 dark:text-ink-200 truncate">{user?.name}</p>
                <p className="text-xs text-ink-400 truncate">{user?.email}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${ROLE_COLORS[user?.role] || ROLE_COLORS.viewer}`}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button onClick={() => { setShowProfile(true); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors text-left">
              <User size={14} className="text-ink-400"/>
              My profile & preferences
            </button>

            <button onClick={() => { toggleTheme(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors text-left">
              {dark ? <Sun size={14} className="text-amber-400"/> : <Moon size={14} className="text-ink-400"/>}
              {dark ? 'Switch to light mode' : 'Switch to dark mode'}
            </button>

            <button onClick={() => { navigate('/settings'); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors text-left">
              <Settings size={14} className="text-ink-400"/>
              Store settings
            </button>

            {['super_admin','admin'].includes(user?.role) && (
              <button onClick={() => { navigate('/users'); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors text-left">
                <Shield size={14} className="text-ink-400"/>
                Users & permissions
              </button>
            )}

            <button onClick={() => { navigate('/dev-status'); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors text-left">
              <Eye size={14} className="text-ink-400"/>
              Dev status
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-ink-100 dark:border-ink-800 py-1">
            <button onClick={() => { logout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
              <LogOut size={14}/>
              Log out
            </button>
          </div>
        </div>
      )}

      {/* Profile & preferences panel */}
      {showProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowProfile(false)}>
          <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-800/50">
              <div>
                <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">My Profile & Preferences</h3>
                <p className="text-xs text-ink-400 mt-0.5">{user?.email}</p>
              </div>
              <button onClick={() => setShowProfile(false)} className="p-1.5 rounded-lg hover:bg-ink-200 dark:hover:bg-ink-700 text-ink-400 text-lg leading-none">&times;</button>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Profile info */}
              <div>
                <p className="text-xs font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-3">Profile information</p>
                <div className="space-y-3">
                  <div><label className={lbl}>Display name</label><input value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} className={inp} placeholder="Your name"/></div>
                  <div><label className={lbl}>Email address</label><input type="email" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} className={inp} placeholder="your@email.com"/></div>
                </div>
                <button onClick={handleSaveProfile} disabled={saving} className="btn-gold text-xs mt-3 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save profile'}
                </button>
              </div>

              {/* Preferences */}
              <div className="border-t border-ink-100 dark:border-ink-800 pt-4">
                <p className="text-xs font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-3">Preferences</p>
                <div className="space-y-3">
                  {/* Theme */}
                  <div className="flex items-center justify-between py-2 border-b border-ink-50 dark:border-ink-800">
                    <div>
                      <p className="text-xs font-medium text-ink-700 dark:text-ink-200">Dark mode</p>
                      <p className="text-[11px] text-ink-400">Switch admin panel theme</p>
                    </div>
                    <button onClick={toggleTheme} className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${dark ? 'bg-gold-500' : 'bg-ink-300 dark:bg-ink-600'}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${dark ? 'translate-x-5' : 'translate-x-1'}`}/>
                    </button>
                  </div>
                </div>
              </div>

              {/* Change password */}
              <div className="border-t border-ink-100 dark:border-ink-800 pt-4">
                <p className="text-xs font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-3">Change password</p>
                <div className="space-y-2">
                  <div><label className={lbl}>Current password</label><input type="password" value={pwForm.current} onChange={e=>setPwForm(p=>({...p,current:e.target.value}))} className={inp} placeholder="Current password"/></div>
                  <div><label className={lbl}>New password</label><input type="password" value={pwForm.next} onChange={e=>setPwForm(p=>({...p,next:e.target.value}))} className={inp} placeholder="Min 8 characters"/></div>
                  <div><label className={lbl}>Confirm new password</label><input type="password" value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} className={inp} placeholder="Repeat new password"/></div>
                </div>
                <button onClick={handleChangePassword} disabled={saving || !pwForm.current || !pwForm.next} className="btn-gold text-xs mt-3 disabled:opacity-50">
                  {saving ? 'Updating…' : 'Update password'}
                </button>
              </div>

              {/* Role info */}
              <div className="border-t border-ink-100 dark:border-ink-800 pt-4">
                <p className="text-xs font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-2">Account</p>
                <div className="bg-ink-50 dark:bg-ink-800 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-400">Role</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[user?.role] || ''}`}>{user?.role?.replace('_',' ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-ink-400">User ID</span>
                    <span className="font-mono text-ink-500 text-[10px]">{user?.id?.slice(0,8)}…</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TOPBAR ─────────────────────────────────────────────────────
export default function Topbar({ title, subtitle, actions, collapsed, onToggle }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-ink-900 border-b border-ink-200/60 dark:border-ink-800 flex-shrink-0 h-14">
      {/* Left — sidebar toggle + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 transition-colors flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4"   width="12" height="1.5" rx=".75" fill="currentColor"/>
            <rect x="2" y="7.25" width="9"  height="1.5" rx=".75" fill="currentColor"/>
            <rect x="2" y="10.5" width="12" height="1.5" rx=".75" fill="currentColor"/>
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-ink-800 dark:text-ink-100 truncate leading-none">{title}</h1>
          {subtitle && <p className="text-[11px] text-ink-400 truncate mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Right — page actions + notifications + user */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {actions && <div className="flex items-center gap-2 mr-2">{actions}</div>}
        <NotificationBell/>
        <UserDropdown/>
      </div>
    </div>
  );
}
