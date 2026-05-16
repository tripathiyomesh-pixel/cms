import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { pluginsAPI } from '../services/api';
import { Gem, Shirt, Building2, Puzzle, Power, Settings2, X, Save,
         BarChart3, MessageCircle, Calendar, Languages, TrendingUp, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const ICON_MAP = {
  Gem, Shirt, Building2, Puzzle, BarChart3,
  MessageCircle, Calendar, Languages, TrendingUp, Zap,
};

const COLOR_MAP = {
  amber:  { bg:'bg-amber-50 dark:bg-amber-900/20',  text:'text-amber-600',  ring:'ring-amber-200 dark:ring-amber-800' },
  green:  { bg:'bg-green-50 dark:bg-green-900/20',  text:'text-green-600',  ring:'ring-green-200 dark:ring-green-800' },
  blue:   { bg:'bg-blue-50 dark:bg-blue-900/20',    text:'text-blue-600',   ring:'ring-blue-200 dark:ring-blue-800' },
  purple: { bg:'bg-purple-50 dark:bg-purple-900/20',text:'text-purple-600', ring:'ring-purple-200 dark:ring-purple-800' },
  orange: { bg:'bg-orange-50 dark:bg-orange-900/20',text:'text-orange-600', ring:'ring-orange-200 dark:ring-orange-800' },
  pink:   { bg:'bg-pink-50 dark:bg-pink-900/20',    text:'text-pink-600',   ring:'ring-pink-200 dark:ring-pink-800' },
  teal:   { bg:'bg-teal-50 dark:bg-teal-900/20',    text:'text-teal-600',   ring:'ring-teal-200 dark:ring-teal-800' },
  gold:   { bg:'bg-amber-50 dark:bg-amber-900/20',  text:'text-amber-500',  ring:'ring-amber-200 dark:ring-amber-800' },
};

const CATEGORY_LABELS = {
  industry:'Industry', communication:'Communication', commerce:'Commerce',
  marketing:'Marketing', localization:'Localization', pricing:'Pricing',
};

export default function PluginsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [plugins,     setPlugins]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [configModal, setConfigModal] = useState(null);
  const [installing,  setInstalling]  = useState(null);
  const [activeTab,   setActiveTab]   = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const r = await pluginsAPI.marketplace();
      setPlugins(r.data.data || []);
    } catch { toast.error('Failed to load plugins'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleInstall = async (pluginId) => {
    setInstalling(pluginId);
    try {
      await pluginsAPI.install(pluginId);
      toast.success('Plugin installed and activated');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Install failed'); }
    setInstalling(null);
  };

  const handleUninstall = async (pluginId, name) => {
    if (!confirm(`Uninstall "${name}"? Your product extension data will remain.`)) return;
    try {
      await pluginsAPI.uninstall(pluginId);
      toast.success('Plugin uninstalled');
      load();
    } catch { toast.error('Uninstall failed'); }
  };

  const handleToggle = async (p) => {
    try {
      const r = await pluginsAPI.toggle(p.id);
      toast.success(r.data.data.is_active ? `${p.name} activated` : `${p.name} deactivated`);
      load();
    } catch { toast.error('Failed'); }
  };

  const installed = plugins.filter(p => p.installed);
  const available = plugins.filter(p => !p.installed);
  const filtered  = activeTab === 'installed' ? installed : activeTab === 'available' ? available : plugins;
  const categories = [...new Set(plugins.map(p => p.category))];

  return (
    <>
      <Topbar title="Plugin marketplace" subtitle={`${installed.length} installed · ${available.length} available`}
        collapsed={collapsed} onToggle={toggleSidebar}/>

      <div className="flex-1 overflow-y-auto p-5">

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {[
            { id:'all',       label:`All (${plugins.length})` },
            { id:'installed', label:`Installed (${installed.length})` },
            { id:'available', label:`Available (${available.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                activeTab===t.id
                  ? 'bg-gold-500 text-white border-gold-500'
                  : 'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-gold-400 hover:text-gold-600'
              }`}>{t.label}
            </button>
          ))}
        </div>

        {/* Installed strip — status overview */}
        {installed.length > 0 && activeTab !== 'available' && (
          <div className="card p-4 mb-5">
            <p className="text-[11px] font-medium text-ink-400 uppercase tracking-wide mb-3">Active plugins</p>
            <div className="flex flex-wrap gap-2">
              {installed.map(p => {
                const colors = COLOR_MAP[p.color] || COLOR_MAP.amber;
                const Icon = ICON_MAP[p.icon] || Puzzle;
                return (
                  <div key={p.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ring-1 ${colors.bg} ${colors.text} ${colors.ring}`}>
                    <Icon size={11}/>
                    {p.name}
                    <div className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-green-500' : 'bg-ink-300'}`}/>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Plugin grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_,i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-ink-100 dark:bg-ink-800"/>
                  <div className="flex-1"><div className="h-4 bg-ink-100 dark:bg-ink-800 rounded w-3/4 mb-2"/><div className="h-3 bg-ink-100 dark:bg-ink-800 rounded w-1/2"/></div>
                </div>
                <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded mb-2"/>
                <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded w-4/5"/>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Puzzle size={32} className="mx-auto text-ink-300 mb-3"/>
            <p className="text-sm text-ink-400">No plugins found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => {
              const colors = COLOR_MAP[p.color] || COLOR_MAP.amber;
              const Icon   = ICON_MAP[p.icon]   || Puzzle;
              const fields = p.product_fields ? JSON.parse(typeof p.product_fields==='string'?p.product_fields:'[]') : [];
              const config = p.config_schema   ? JSON.parse(typeof p.config_schema==='string'?p.config_schema:'{}') : {};
              const hasConfig = Object.keys(config).length > 0;

              return (
                <div key={p.id} className={`card p-5 transition-all ${p.installed ? 'ring-1 ring-gold-200 dark:ring-gold-900' : ''}`}>
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                      <Icon size={18} className={colors.text}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">{p.name}</span>
                        {p.is_premium && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 border border-amber-200 dark:border-amber-800">PRO</span>
                        )}
                        {p.installed && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-ink-100 dark:bg-ink-800 text-ink-400'}`}>
                            {p.is_active ? '● ON' : '○ OFF'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-ink-400 mt-0.5">
                        v{p.version} · {CATEGORY_LABELS[p.category] || p.category} · {p.author}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-ink-500 dark:text-ink-400 leading-relaxed mb-3">{p.description}</p>

                  {/* Product fields */}
                  {fields.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-medium text-ink-400 uppercase tracking-wide mb-1.5">Adds product fields</p>
                      <div className="flex flex-wrap gap-1">
                        {fields.slice(0,6).map(f => (
                          <span key={f} className="text-[10px] bg-ink-50 dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-1.5 py-0.5 rounded text-ink-500">{f}</span>
                        ))}
                        {fields.length > 6 && <span className="text-[10px] text-ink-400">+{fields.length-6} more</span>}
                      </div>
                    </div>
                  )}

                  {/* Operational status note */}
                  <div className={`text-[10px] px-2.5 py-1.5 rounded-lg mb-3 flex items-center gap-1.5 ${
                    p.installed
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                      : 'bg-ink-50 dark:bg-ink-800 text-ink-400'
                  }`}>
                    {p.installed ? <Check size={10}/> : <Zap size={10}/>}
                    {p.installed
                      ? `Fully operational · ${fields.length > 0 ? 'Product fields active' : 'Routes active'}`
                      : 'Install to activate API routes and product fields'}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    {p.installed ? (
                      <>
                        <button onClick={() => handleToggle(p)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                            p.is_active
                              ? 'bg-ink-100 dark:bg-ink-800 text-ink-500 hover:bg-ink-200'
                              : 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100'
                          }`}>
                          <Power size={12}/> {p.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        {hasConfig && (
                          <button onClick={() => setConfigModal({ ...p, parsedConfig: config })}
                            className="px-3 py-2 rounded-lg bg-ink-50 dark:bg-ink-800 text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition-colors">
                            <Settings2 size={14}/>
                          </button>
                        )}
                        <button onClick={() => handleUninstall(p.id, p.name)}
                          className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors text-[10px]">
                          Remove
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleInstall(p.id)} disabled={installing===p.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-black text-xs font-semibold transition-colors disabled:opacity-60">
                        {installing===p.id
                          ? <><span className="w-3 h-3 border border-t-transparent border-black/30 rounded-full animate-spin"/> Installing…</>
                          : <><Zap size={12}/> Install</>
                        }
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Config modal */}
      {configModal && (
        <PluginConfigModal plugin={configModal} onClose={() => setConfigModal(null)} onSave={() => { setConfigModal(null); load(); }}/>
      )}
    </>
  );
}

function PluginConfigModal({ plugin, onClose, onSave }) {
  const [settings, setSettings] = useState(
    plugin.settings ? JSON.parse(typeof plugin.settings==='string'?plugin.settings:'{}') : {}
  );
  const [saving, setSaving] = useState(false);
  const config = plugin.parsedConfig || {};

  const handleSave = async () => {
    setSaving(true);
    try {
      await pluginsAPI.saveSettings(plugin.id, settings);
      toast.success('Plugin settings saved');
      onSave();
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
          <div>
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Configure — {plugin.name}</h3>
            <p className="text-[10px] text-ink-400 mt-0.5">v{plugin.version}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16}/></button>
        </div>
        <div className="p-5 space-y-4">
          {Object.entries(config).map(([key, cfg]) => (
            <div key={key}>
              <label className="label">{cfg.label}</label>
              {cfg.type === 'boolean' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!settings[key]}
                    onChange={e => setSettings(s => ({...s,[key]:e.target.checked}))}
                    className="w-4 h-4 rounded accent-gold-500"/>
                  <span className="text-xs text-ink-500">Enabled</span>
                </label>
              ) : cfg.type === 'select' ? (
                <select value={settings[key]||cfg.default||''} onChange={e => setSettings(s=>({...s,[key]:e.target.value}))} className="input-field">
                  {(cfg.options||[]).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : cfg.type === 'textarea' ? (
                <textarea value={settings[key]||''} onChange={e => setSettings(s=>({...s,[key]:e.target.value}))}
                  className="input-field" rows={3} placeholder={cfg.placeholder||''}/>
              ) : (
                <input type={cfg.type==='number'?'number':'text'} value={settings[key]||''} onChange={e => setSettings(s=>({...s,[key]:e.target.value}))}
                  className="input-field" placeholder={cfg.placeholder||cfg.default||''}/>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="btn-ghost text-xs">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
            {saving ? <span className="w-3 h-3 border border-t-transparent border-black/30 rounded-full animate-spin"/> : <Save size={13}/>}
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}
