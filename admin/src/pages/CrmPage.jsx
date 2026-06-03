/**
 * VANTIX-CMS Admin — CRM Page
 * Tabs: Leads Kanban | Pipeline List | Stats
 * Accessible from /crm route
 */
import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { crmAPI } from '../services/api';
import {
  Plus, X, Edit2, Trash2, Phone, Mail, MessageCircle,
  TrendingUp, Users, Target, ChevronDown, ChevronRight,
  DollarSign, Flag, RefreshCw, CheckCircle, Circle,
  ArrowRight, MoreVertical, Star, Clock, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────────────────────
const STAGES = [
  { key: 'new',       label: 'New',       color: 'bg-ink-100 dark:bg-ink-800',          dot: 'bg-ink-400',    text: 'text-ink-600 dark:text-ink-300' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-50 dark:bg-blue-900/20',       dot: 'bg-blue-400',   text: 'text-blue-600 dark:text-blue-300' },
  { key: 'qualified', label: 'Qualified', color: 'bg-purple-50 dark:bg-purple-900/20',   dot: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-300' },
  { key: 'proposal',  label: 'Proposal',  color: 'bg-amber-50 dark:bg-amber-900/20',     dot: 'bg-amber-500',  text: 'text-amber-600 dark:text-amber-300' },
  { key: 'won',       label: 'Won ✓',     color: 'bg-green-50 dark:bg-green-900/20',     dot: 'bg-green-500',  text: 'text-green-600 dark:text-green-300' },
  { key: 'lost',      label: 'Lost',      color: 'bg-red-50 dark:bg-red-900/20',         dot: 'bg-red-400',    text: 'text-red-500 dark:text-red-400' },
];

const PRIORITY_CONFIG = {
  high:   { label: 'High',   icon: Flag,        color: 'text-red-500' },
  normal: { label: 'Normal', icon: Circle,      color: 'text-ink-400' },
  low:    { label: 'Low',    icon: ChevronDown, color: 'text-ink-300' },
};

const SOURCES = ['website','whatsapp','walk-in','exhibition','referral','rapnet','instagram','other'];

const emptyLead = {
  name: '', email: '', phone: '', source: 'website',
  stage: 'new', interest: '', budget_min: '', budget_max: '',
  currency: 'AED', priority: 'normal', notes: '', value: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n, cur = 'AED') =>
  n ? `${cur} ${Number(n).toLocaleString('en-AE', { minimumFractionDigits: 0 })}` : '—';

const timeAgo = (d) => {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// ── Lead Card (Kanban) ────────────────────────────────────────────────────────
function LeadCard({ lead, onEdit, onMove, stages }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);
  const PC = PRIORITY_CONFIG[lead.priority] || PRIORITY_CONFIG.normal;
  const PIcon = PC.icon;

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const nextStage = stages.find((_, i) => stages[i - 1]?.key === lead.stage);

  return (
    <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-700 p-3.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onEdit(lead)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-ink-800 dark:text-ink-100 leading-snug">{lead.name}</p>
          {lead.interest && (
            <p className="text-[10px] text-ink-400 mt-0.5 line-clamp-1">{lead.interest}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <PIcon size={11} className={PC.color}/>
          <div ref={ref} className="relative">
            <button onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-ink-100 dark:hover:bg-ink-800 transition-all">
              <MoreVertical size={11} className="text-ink-400"/>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-6 z-20 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-xl shadow-xl py-1 w-36"
                onClick={e => e.stopPropagation()}>
                {nextStage && (
                  <button onClick={() => { onMove(lead.id, nextStage.key); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 flex items-center gap-2">
                    <ArrowRight size={10}/> Move to {nextStage.label}
                  </button>
                )}
                {!['won','lost'].includes(lead.stage) && (
                  <>
                    <button onClick={() => { onMove(lead.id, 'won'); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2">
                      <CheckCircle size={10}/> Mark Won
                    </button>
                    <button onClick={() => { onMove(lead.id, 'lost'); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                      <X size={10}/> Mark Lost
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Value */}
      {lead.value && (
        <div className="text-xs font-bold text-brand-600 dark:text-brand-400 mb-2">
          {fmt(lead.value, lead.currency)}
        </div>
      )}

      {/* Contact */}
      <div className="flex items-center gap-3 flex-wrap">
        {lead.phone && (
          <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[10px] text-ink-400 hover:text-ink-600 transition-colors">
            <Phone size={9}/> {lead.phone}
          </a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}`} onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[10px] text-ink-400 hover:text-ink-600 transition-colors truncate max-w-[120px]">
            <Mail size={9}/> {lead.email}
          </a>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-ink-100 dark:border-ink-800">
        <span className="text-[9px] text-ink-300">{timeAgo(lead.created_at)}</span>
        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-500`}>
          {lead.source}
        </span>
      </div>
    </div>
  );
}

// ── Lead Form Modal ───────────────────────────────────────────────────────────
function LeadModal({ lead, onClose, onSave }) {
  const [form, setForm] = useState(lead ? { ...lead } : { ...emptyLead });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (lead?.id) {
        await crmAPI.updateLead(lead.id, form);
        toast.success('Lead updated');
      } else {
        await crmAPI.createLead(form);
        toast.success('Lead created');
      }
      onSave();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-lg shadow-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 dark:border-ink-800">
          <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">
            {lead?.id ? 'Edit Lead' : 'New Lead'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800">
            <X size={15} className="text-ink-400"/>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="label">Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className="input w-full" placeholder="Customer name"/>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input w-full" placeholder="+971 50..."/>
            </div>
            <div>
              <label className="label">Email</label>
              <input value={form.email} onChange={e => set('email', e.target.value)} type="email" className="input w-full" placeholder="name@email.com"/>
            </div>
          </div>

          {/* Stage & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Stage</label>
              <select value={form.stage} onChange={e => set('stage', e.target.value)} className="input w-full">
                {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className="input w-full">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Source & Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Source</label>
              <select value={form.source} onChange={e => set('source', e.target.value)} className="input w-full">
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Expected value (AED)</label>
              <input value={form.value} onChange={e => set('value', e.target.value)} type="number" className="input w-full" placeholder="0"/>
            </div>
          </div>

          {/* Budget range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Budget min</label>
              <input value={form.budget_min} onChange={e => set('budget_min', e.target.value)} type="number" className="input w-full" placeholder="0"/>
            </div>
            <div>
              <label className="label">Budget max</label>
              <input value={form.budget_max} onChange={e => set('budget_max', e.target.value)} type="number" className="input w-full" placeholder="0"/>
            </div>
          </div>

          {/* Interest */}
          <div>
            <label className="label">Interest / What are they looking for?</label>
            <input value={form.interest} onChange={e => set('interest', e.target.value)} className="input w-full" placeholder="e.g. 18K engagement ring, ~1ct diamond, round cut"/>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              className="input w-full resize-none" placeholder="Any additional context…"/>
          </div>

          {/* Lost reason */}
          {form.stage === 'lost' && (
            <div>
              <label className="label">Lost reason</label>
              <input value={form.lost_reason || ''} onChange={e => set('lost_reason', e.target.value)}
                className="input w-full" placeholder="e.g. Price too high, bought elsewhere"/>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-ink-100 dark:border-ink-800">
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving…' : lead?.id ? 'Update Lead' : 'Create Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main CRM Page ─────────────────────────────────────────────────────────────
export default function CrmPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [tab,         setTab]         = useState(0); // 0=Kanban 1=List 2=Stats
  const [board,       setBoard]       = useState({});
  const [leads,       setLeads]       = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [modalLead,   setModalLead]   = useState(null); // null | 'new' | lead_obj
  const [stageFilter, setStageFilter] = useState('');
  const [search,      setSearch]      = useState('');
  const [deleting,    setDeleting]    = useState(null);

  // ── Load board ──────────────────────────────────────────────
  const loadBoard = async () => {
    setLoading(true);
    try {
      const r = await crmAPI.leadsBoard();
      setBoard(r.data.data || {});
    } catch { toast.error('Failed to load board'); }
    setLoading(false);
  };

  // ── Load list ───────────────────────────────────────────────
  const loadList = async () => {
    setLoading(true);
    try {
      const r = await crmAPI.leads({ stage: stageFilter || undefined, search: search || undefined, limit: 100 });
      setLeads(r.data.data || []);
    } catch { setLeads([]); }
    setLoading(false);
  };

  // ── Load stats ──────────────────────────────────────────────
  const loadStats = async () => {
    try {
      const r = await crmAPI.stats();
      setStats(r.data.data);
    } catch {}
  };

  useEffect(() => {
    if (tab === 0) loadBoard();
    if (tab === 1) loadList();
    if (tab === 2) loadStats();
  }, [tab, stageFilter, search]);

  const handleMove = async (leadId, newStage) => {
    try {
      await crmAPI.updateLead(leadId, { stage: newStage });
      toast.success(`Moved to ${newStage}`);
      loadBoard();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return;
    setDeleting(id);
    try {
      await crmAPI.deleteLead(id);
      toast.success('Lead deleted');
      if (tab === 0) loadBoard();
      else loadList();
    } catch { toast.error('Failed'); }
    setDeleting(null);
  };

  const onModalSave = () => {
    setModalLead(null);
    if (tab === 0) loadBoard();
    else loadList();
  };

  // ── Total pipeline value ────────────────────────────────────
  const totalPipelineValue = Object.values(board).flat()
    .filter(l => !['won','lost'].includes(l.stage))
    .reduce((s, l) => s + (parseFloat(l.value) || 0), 0);

  const totalWonValue = (board['won'] || []).reduce((s, l) => s + (parseFloat(l.value) || 0), 0);

  // ── Stats helper ────────────────────────────────────────────
  const StatCard = ({ label, value, sub, color = 'text-ink-700 dark:text-ink-200' }) => (
    <div className="card p-4">
      <p className="text-xs text-ink-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-ink-400 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="CRM & Leads"
        subtitle="Pipeline · Leads · Customer activity"
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        actions={
          <button onClick={() => setModalLead('new')} className="btn-primary flex items-center gap-1.5 text-xs">
            <Plus size={13}/> New Lead
          </button>
        }
      />

      {/* Summary strip */}
      {tab === 0 && !loading && (
        <div className="flex gap-6 px-6 py-3 border-b border-ink-100 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-900/50 text-xs text-ink-500">
          <span><span className="font-semibold text-ink-700 dark:text-ink-200">{Object.values(board).flat().length}</span> total leads</span>
          <span><span className="font-semibold text-brand-600">AED {totalPipelineValue.toLocaleString()}</span> open pipeline</span>
          <span><span className="font-semibold text-green-600">AED {totalWonValue.toLocaleString()}</span> won</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 border-b border-ink-200 dark:border-ink-700">
        {['Kanban Board', 'Lead List', 'Stats'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === i
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">

        {/* ── TAB 0: KANBAN BOARD ── */}
        {tab === 0 && (
          <div className="p-6 overflow-x-auto">
            {loading ? (
              <div className="flex gap-4">
                {STAGES.map(s => (
                  <div key={s.key} className="flex-shrink-0 w-64 space-y-3">
                    <div className="h-6 bg-ink-100 dark:bg-ink-800 rounded animate-pulse"/>
                    {Array(2).fill(0).map((_, i) => (
                      <div key={i} className="h-28 bg-ink-100 dark:bg-ink-800 rounded-xl animate-pulse"/>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-4 min-w-max pb-4">
                {STAGES.map(stage => {
                  const stageLeads = board[stage.key] || [];
                  const stageValue = stageLeads.reduce((s, l) => s + (parseFloat(l.value) || 0), 0);
                  return (
                    <div key={stage.key} className="flex-shrink-0 w-64">
                      {/* Column header */}
                      <div className={`rounded-xl px-3 py-2 mb-3 ${stage.color}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${stage.dot}`}/>
                            <span className={`text-xs font-semibold ${stage.text}`}>{stage.label}</span>
                          </div>
                          <span className={`text-xs font-bold ${stage.text}`}>{stageLeads.length}</span>
                        </div>
                        {stageValue > 0 && (
                          <p className="text-[10px] mt-1 opacity-70 font-medium">AED {stageValue.toLocaleString()}</p>
                        )}
                      </div>

                      {/* Cards */}
                      <div className="space-y-2.5">
                        {stageLeads.map(lead => (
                          <LeadCard
                            key={lead.id}
                            lead={lead}
                            stages={STAGES}
                            onEdit={l => setModalLead(l)}
                            onMove={handleMove}
                          />
                        ))}
                        {stageLeads.length === 0 && (
                          <div className="h-20 border-2 border-dashed border-ink-200 dark:border-ink-800 rounded-xl flex items-center justify-center">
                            <p className="text-xs text-ink-300">Empty</p>
                          </div>
                        )}
                      </div>

                      {/* Add button at bottom of column */}
                      <button
                        onClick={() => setModalLead({ ...emptyLead, stage: stage.key })}
                        className="w-full mt-2.5 py-2 text-[10px] text-ink-400 hover:text-ink-600 hover:bg-ink-100 dark:hover:bg-ink-800/50 rounded-xl border border-dashed border-ink-200 dark:border-ink-700 flex items-center justify-center gap-1 transition-colors">
                        <Plus size={10}/> Add
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 1: LIST VIEW ── */}
        {tab === 1 && (
          <div className="p-6 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, email, phone…"
                className="input w-56 text-xs"
              />
              <div className="flex gap-1 flex-wrap">
                {[{ key: '', label: 'All' }, ...STAGES].map(s => (
                  <button key={s.key} onClick={() => setStageFilter(s.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      stageFilter === s.key
                        ? 'bg-brand-500 text-white'
                        : 'bg-ink-100 dark:bg-ink-800 text-ink-500 hover:bg-ink-200'
                    }`}>
                    {s.label || 'All'}
                  </button>
                ))}
              </div>
            </div>

            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 dark:border-ink-800">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">Lead</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide w-28">Stage</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide w-28">Value</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide w-20">Source</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide w-24">Added</th>
                    <th className="px-4 py-3 w-24"/>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(8).fill(0).map((_, i) => (
                      <tr key={i} className="border-b border-ink-100 dark:border-ink-800">
                        {Array(7).fill(0).map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-4 bg-ink-100 dark:bg-ink-800 rounded animate-pulse"/></td>
                        ))}
                      </tr>
                    ))
                  ) : leads.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-16 text-center text-sm text-ink-400">
                      No leads found. <button onClick={() => setModalLead('new')} className="text-brand-500 hover:underline">Create the first one</button>
                    </td></tr>
                  ) : leads.map(lead => {
                    const stage = STAGES.find(s => s.key === lead.stage) || STAGES[0];
                    const PC = PRIORITY_CONFIG[lead.priority] || PRIORITY_CONFIG.normal;
                    const PIcon = PC.icon;
                    return (
                      <tr key={lead.id} className="border-b border-ink-100 dark:border-ink-800 hover:bg-ink-50/50 dark:hover:bg-ink-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <PIcon size={11} className={PC.color}/>
                            <div>
                              <p className="text-xs font-medium text-ink-700 dark:text-ink-200">{lead.name}</p>
                              {lead.interest && <p className="text-[10px] text-ink-400 truncate max-w-[180px]">{lead.interest}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            {lead.phone && <p className="text-xs text-ink-500">{lead.phone}</p>}
                            {lead.email && <p className="text-[10px] text-ink-400 truncate max-w-[140px]">{lead.email}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${stage.color} ${stage.text}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${stage.dot}`}/> {stage.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-ink-600 dark:text-ink-300">{fmt(lead.value, lead.currency)}</td>
                        <td className="px-4 py-3 text-[10px] text-ink-400 capitalize">{lead.source}</td>
                        <td className="px-4 py-3 text-[10px] text-ink-400">{timeAgo(lead.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => setModalLead(lead)}
                              className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400 hover:text-ink-600 transition-colors">
                              <Edit2 size={12}/>
                            </button>
                            <button onClick={() => handleDelete(lead.id)} disabled={deleting === lead.id}
                              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500 transition-colors">
                              {deleting === lead.id ? <RefreshCw size={12} className="animate-spin"/> : <Trash2 size={12}/>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: STATS ── */}
        {tab === 2 && (
          <div className="p-6 space-y-6 max-w-5xl">
            {!stats ? (
              <div className="flex items-center gap-2 text-sm text-ink-400"><RefreshCw size={14} className="animate-spin"/> Loading…</div>
            ) : (
              <>
                {/* KPI row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Total Leads" value={stats.total_leads} sub="all time"/>
                  <StatCard label="Open Pipeline" value={stats.open_leads} sub="active stages" color="text-blue-600"/>
                  <StatCard label="Customers" value={stats.total_customers} sub="in database"/>
                  <StatCard
                    label="Won This Pipeline"
                    value={`AED ${(stats.pipeline?.won?.value || 0).toLocaleString()}`}
                    sub={`${stats.pipeline?.won?.count || 0} deals`}
                    color="text-green-600"
                  />
                </div>

                {/* Stage breakdown */}
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Pipeline Breakdown</h3>
                  <div className="space-y-3">
                    {STAGES.map(stage => {
                      const data = stats.pipeline?.[stage.key] || { count: 0, value: 0 };
                      const total = Object.values(stats.pipeline || {}).reduce((s, d) => s + (d.count || 0), 1);
                      const pct = Math.round((data.count / total) * 100);
                      return (
                        <div key={stage.key} className="flex items-center gap-3">
                          <div className="w-24 flex-shrink-0">
                            <span className={`text-xs font-medium ${stage.text}`}>{stage.label}</span>
                          </div>
                          <div className="flex-1 h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                            <div className={`h-full ${stage.dot} rounded-full transition-all`} style={{ width: `${pct}%` }}/>
                          </div>
                          <div className="w-24 flex-shrink-0 text-right">
                            <span className="text-xs font-bold text-ink-700 dark:text-ink-200">{data.count}</span>
                            {data.value > 0 && <span className="text-[10px] text-ink-400 ml-1">AED {Number(data.value).toLocaleString()}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent activity */}
                {stats.recent_activities?.length > 0 && (
                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {stats.recent_activities.map((a, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0 text-xs">
                            {a.type === 'note' ? '📝' : a.type === 'enquiry' ? '💬' : a.type === 'appointment' ? '📅' : '🔔'}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-ink-700 dark:text-ink-200">{a.title}</p>
                            {a.customer_name && <p className="text-[10px] text-ink-400">{a.customer_name}</p>}
                          </div>
                          <span className="text-[10px] text-ink-300 flex-shrink-0">{timeAgo(a.occurred_at)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Lead Modal */}
      {modalLead !== null && (
        <LeadModal
          lead={modalLead === 'new' ? null : modalLead}
          onClose={() => setModalLead(null)}
          onSave={onModalSave}
        />
      )}
    </div>
  );
}
