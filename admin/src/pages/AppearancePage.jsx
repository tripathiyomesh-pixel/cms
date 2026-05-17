import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Save, Monitor, Moon, Sun, Palette, Layout } from 'lucide-react';
import toast from 'react-hot-toast';

const THEMES = [
  { id:'light',  label:'Light',  icon:Sun,     preview:'bg-white border-ink-200' },
  { id:'dark',   label:'Dark',   icon:Moon,    preview:'bg-ink-900 border-ink-700' },
  { id:'system', label:'System', icon:Monitor, preview:'bg-gradient-to-r from-white to-ink-900 border-ink-300' },
];

const ACCENT_COLORS = [
  { id:'gold',   label:'Gold (default)', color:'#c9a84c' },
  { id:'rose',   label:'Rose Gold',      color:'#b76e79' },
  { id:'silver', label:'Platinum',        color:'#8c8c8c' },
  { id:'teal',   label:'Teal',           color:'#0d9488' },
  { id:'navy',   label:'Navy',           color:'#1e3a5f' },
  { id:'black',  label:'Classic Black',  color:'#1a1a1a' },
];

const DENSITY_OPTIONS = [
  { id:'compact',  label:'Compact',  desc:'Tighter spacing, more info visible' },
  { id:'default',  label:'Default',  desc:'Balanced spacing (recommended)' },
  { id:'relaxed',  label:'Relaxed',  desc:'More breathing room' },
];

export default function AppearancePage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { dark, toggleTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  const [prefs, setPrefs] = useState({
    theme:         'light',
    accent_color:  'gold',
    density:       'default',
    sidebar_icons_only: false,
    show_breadcrumbs:   true,
    table_striped:      true,
    animate_transitions:true,
  });

  useEffect(() => {
    // Load saved preferences
    api.get('/settings/appearance').then(r => {
      const d = r.data?.data || {};
      if (d.theme)        setPrefs(p => ({ ...p, theme: d.theme }));
      if (d.accent_color) setPrefs(p => ({ ...p, accent_color: d.accent_color }));
    }).catch(() => {});
  }, []);

  const set = (k, v) => setPrefs(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/settings/bulk', {
        settings: Object.entries(prefs).map(([key, value]) => ({ key, value: String(value) }))
      });

      // Apply theme immediately
      if (prefs.theme === 'dark' && !dark) toggleTheme();
      if (prefs.theme === 'light' && dark) toggleTheme();

      toast.success('Appearance saved');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const lbl = 'block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1';
  const desc = 'text-xs text-ink-400 mt-0.5 mb-4';

  return (
    <>
      <Topbar title="Appearance" subtitle="Customise how the admin panel looks"
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={
          <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
            <Save size={13}/>{saving ? 'Saving…' : 'Save preferences'}
          </button>
        }/>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-2xl space-y-6">

          {/* Theme */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Palette size={16} className="text-gold-500"/>
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Theme</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(t => (
                <button key={t.id} onClick={() => set('theme', t.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${prefs.theme === t.id ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                  <div className={`w-full h-12 rounded-lg border mb-3 ${t.preview}`}/>
                  <div className="flex items-center gap-1.5">
                    <t.icon size={13} className={prefs.theme === t.id ? 'text-gold-600' : 'text-ink-400'}/>
                    <span className={`text-xs font-medium ${prefs.theme === t.id ? 'text-gold-700 dark:text-gold-400' : 'text-ink-600 dark:text-ink-300'}`}>{t.label}</span>
                  </div>
                  {prefs.theme === t.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Accent colour */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-full bg-gold-500"/>
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Accent colour</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {ACCENT_COLORS.map(ac => (
                <button key={ac.id} onClick={() => set('accent_color', ac.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${prefs.accent_color === ac.id ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'border-ink-200 dark:border-ink-700 hover:border-ink-300'}`}>
                  <div className="w-6 h-6 rounded-full flex-shrink-0 shadow-sm" style={{ background: ac.color }}/>
                  <span className="text-xs font-medium text-ink-600 dark:text-ink-300">{ac.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layout size={16} className="text-gold-500"/>
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Information density</h3>
            </div>
            <div className="space-y-2">
              {DENSITY_OPTIONS.map(d => (
                <button key={d.id} onClick={() => set('density', d.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${prefs.density === d.id ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                  <div>
                    <p className={`text-sm font-medium ${prefs.density === d.id ? 'text-gold-700 dark:text-gold-400' : 'text-ink-700 dark:text-ink-200'}`}>{d.label}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{d.desc}</p>
                  </div>
                  {prefs.density === d.id && (
                    <div className="w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences toggles */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Preferences</h3>
            <div className="space-y-4">
              {[
                { k:'sidebar_icons_only',   l:'Sidebar — icons only (collapsed by default)', d:'Start with sidebar in compact mode' },
                { k:'show_breadcrumbs',     l:'Show breadcrumbs',       d:'Page navigation path at top' },
                { k:'table_striped',        l:'Striped tables',         d:'Alternate row colours in tables and lists' },
                { k:'animate_transitions',  l:'Animate transitions',    d:'Page and panel animations' },
              ].map(item => (
                <div key={item.k} className="flex items-center justify-between py-2 border-b border-ink-100 dark:border-ink-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-ink-700 dark:text-ink-200">{item.l}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{item.d}</p>
                  </div>
                  <button onClick={() => set(item.k, !prefs[item.k])}
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${prefs[item.k] ? 'bg-gold-500' : 'bg-ink-300 dark:bg-ink-600'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${prefs[item.k] ? 'translate-x-5' : 'translate-x-1'}`}/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="card p-5 bg-gold-50 dark:bg-gold-900/10 border-gold-200 dark:border-gold-800">
            <p className="text-xs font-medium text-gold-700 dark:text-gold-400 uppercase tracking-wide mb-3">Preview</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: ACCENT_COLORS.find(a => a.id === prefs.accent_color)?.color || '#c9a84c' }}>A</div>
              <div>
                <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Admin User</p>
                <p className="text-xs" style={{ color: ACCENT_COLORS.find(a => a.id === prefs.accent_color)?.color || '#c9a84c' }}>● Active · {prefs.theme} theme</p>
              </div>
              <button className="ml-auto text-xs px-4 py-2 rounded-full text-white font-semibold" style={{ background: ACCENT_COLORS.find(a => a.id === prefs.accent_color)?.color || '#c9a84c' }}>
                Sample button
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
