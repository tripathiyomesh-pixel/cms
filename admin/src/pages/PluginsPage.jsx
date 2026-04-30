import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { pluginsAPI } from '../services/api';
import { Gem, Shirt, Building2, Puzzle, Download, Power, Settings, X, Save, Check, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const ICONS = { Gem, Shirt, Building2, Package };
const COLORS = {
  amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600', border: 'border-amber-200 dark:border-amber-800' },
  pink:   { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600', border: 'border-pink-200 dark:border-pink-800' },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600', border: 'border-teal-200 dark:border-teal-800' },
};

export default function PluginsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configModal, setConfigModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await pluginsAPI.marketplace();
      setPlugins(res.data.data || []);
    } catch { toast.error('Failed to load plugins'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleInstall = async (pluginId) => {
    try {
      await pluginsAPI.install(pluginId);
      toast.success('Plugin installed');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Install failed'); }
  };

  const handleUninstall = async (pluginId) => {
    if (!confirm('Uninstall this plugin? Product extension data will remain.')) return;
    try {
      await pluginsAPI.uninstall(pluginId);
      toast.success('Plugin uninstalled');
      load();
    } catch { toast.error('Uninstall failed'); }
  };

  const handleToggle = async (pluginId) => {
    try {
      const res = await pluginsAPI.toggle(pluginId);
      toast.success(res.data.data.is_active ? 'Plugin activated' : 'Plugin deactivated');
      load();
    } catch { toast.error('Toggle failed'); }
  };

  const installed = plugins.filter(p => p.installed);
  const available = plugins.filter(p => !p.installed);

  return (
    <>
      <Topbar title="Plugin marketplace" subtitle="Extend your CMS with industry modules"
        collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Installed */}
            {installed.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-ink-500 tracking-wider uppercase mb-3">Installed plugins</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {installed.map(p => <PluginCard key={p.id} plugin={p} onToggle={handleToggle} onUninstall={handleUninstall} onConfigure={setConfigModal} />)}
                </div>
              </div>
            )}

            {/* Available */}
            {available.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-ink-500 tracking-wider uppercase mb-3">Available plugins</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {available.map(p => <PluginCard key={p.id} plugin={p} onInstall={handleInstall} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {configModal && <ConfigModal plugin={configModal} onClose={() => setConfigModal(null)} onSave={() => { setConfigModal(null); load(); }} />}
    </>
  );
}

function PluginCard({ plugin: p, onInstall, onToggle, onUninstall, onConfigure }) {
  const colors = COLORS[p.color] || COLORS.teal;
  const Icon = ICONS[p.icon] || Puzzle;

  return (
    <div className={`card p-5 ${p.installed && p.is_active ? `border-l-[3px] ${colors.border}` : ''}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={colors.text} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-ink-700 dark:text-ink-200 truncate">{p.name}</h4>
            {p.is_premium && <span className="badge badge-gold text-[9px]">Premium</span>}
          </div>
          <p className="text-[10px] text-ink-400 mt-0.5">v{p.version} · {p.author}</p>
        </div>
        {p.installed && (
          <button onClick={() => onToggle(p.id)}
            className={`flex-shrink-0 w-9 h-5 rounded-full relative transition-colors ${p.is_active ? 'bg-emerald-500' : 'bg-ink-300 dark:bg-ink-600'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${p.is_active ? 'left-[18px]' : 'left-0.5'}`} />
          </button>
        )}
      </div>

      <p className="text-xs text-ink-500 dark:text-ink-400 leading-relaxed mb-4 line-clamp-2">{p.description}</p>

      {/* Field count */}
      {p.product_fields?.length > 0 && (
        <div className="text-[10px] text-ink-400 mb-3">
          {p.product_fields.length} product fields · {[...new Set(p.product_fields.map(f => f.group))].length} sections
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-ink-100 dark:border-ink-700">
        {p.installed ? (
          <>
            <button onClick={() => onConfigure(p)} className="btn-ghost flex items-center gap-1 text-[11px]">
              <Settings size={12} /> Configure
            </button>
            <button onClick={() => onUninstall(p.id)} className="btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-[11px]">
              Uninstall
            </button>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500">
              <Check size={11} /> Installed
            </span>
          </>
        ) : (
          <button onClick={() => onInstall(p.id)} className="btn-gold flex items-center gap-1.5 text-xs w-full justify-center">
            <Download size={13} /> Install plugin
          </button>
        )}
      </div>
    </div>
  );
}

function ConfigModal({ plugin, onClose, onSave }) {
  const [settings, setSettings] = useState(plugin.settings || {});
  const [saving, setSaving] = useState(false);
  const schema = plugin.config_schema || {};

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await pluginsAPI.updateSettings(plugin.id, settings);
      toast.success('Settings saved');
      onSave();
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
          <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">{plugin.name} — settings</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-100 text-ink-400"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          {Object.entries(schema).map(([key, cfg]) => (
            <div key={key}>
              <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              {cfg.type === 'select' ? (
                <select value={settings[key] || cfg.default} onChange={e => set(key, e.target.value)} className="input-field">
                  {cfg.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : cfg.type === 'boolean' ? (
                <label className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-300 cursor-pointer">
                  <input type="checkbox" checked={settings[key] ?? cfg.default} onChange={e => set(key, e.target.checked)} className="rounded border-ink-300" />
                  {key.replace(/_/g, ' ')}
                </label>
              ) : (
                <input value={settings[key] || ''} onChange={e => set(key, e.target.value)} className="input-field" />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="btn-outline text-xs">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
              <Save size={13} /> {saving ? 'Saving...' : 'Save settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
