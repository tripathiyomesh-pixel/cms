import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import api from '../services/api';
import {
  MessageSquare, Search, Phone, Mail,
  Calendar, Package, Clock,
  RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

const STAGES = [
  { id:'new',        label:'New',        color:'#3b82f6', bg:'#eff6ff' },
  { id:'contacted',  label:'Contacted',  color:'#f59e0b', bg:'#fffbeb' },
  { id:'qualified',  label:'Qualified',  color:'#8b5cf6', bg:'#f5f3ff' },
  { id:'won',        label:'Won',        color:'#22c55e', bg:'#f0fdf4' },
  { id:'lost',       label:'Lost',       color:'#ef4444', bg:'#fef2f2' },
];

function StageBadge({ status }) {
  const s = STAGES.find(x => x.id === status) || STAGES[0];
  return (
    <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:20, background:s.bg, color:s.color, textTransform:'uppercase', letterSpacing:'0.08em' }}>
      {s.label}
    </span>
  );
}

export default function EnquiriesPage() {
  const { collapsed } = useOutletContext() || {};

  const [enquiries, setEnquiries] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('');
  const [selected,  setSelected]  = useState(null);
  const [updating,  setUpdating]  = useState(false);
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = (p = page) => {
    setLoading(true);
    api.get('/enquiries', {
      params: {
        page:   p,
        limit:  PAGE_SIZE,
        status: filter  || undefined,
        search: search  || undefined,
      },
    })
      .then(r => {
        const payload = r.data.data;
        if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
          setEnquiries(payload.data);
          setTotal(payload.total || payload.data.length);
        } else {
          setEnquiries(Array.isArray(payload) ? payload : []);
          setTotal(Array.isArray(payload) ? payload.length : 0);
        }
      })
      .catch(() => { setEnquiries([]); setTotal(0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    load(1);
  }, [filter]);

  const goToPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    load(next);
  };

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      await api.put(`/enquiries/${id}`, { status });
      toast.success(`Moved to ${status}`);
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      if (selected?.id === id) setSelected(s => ({ ...s, status }));
    } catch {
      toast.error('Failed to update');
    }
    setUpdating(false);
  };

  return (
    <>
      <Topbar
        title="Enquiries"
        subtitle="Manage customer enquiries and leads"
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400"/>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setPage(1); load(1); } }}
                placeholder="Search enquiries…"
                className="input-field pl-8 text-xs w-44"
              />
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field text-xs w-32">
              <option value="">All stages</option>
              {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <button onClick={() => load()} className="btn-ghost text-xs flex items-center gap-1">
              <RefreshCw size={12}/>
            </button>
          </div>
        }
      />

      {/* Pipeline overview */}
      <div className="grid grid-cols-5 border-b border-ink-200/60 dark:border-ink-800 flex-shrink-0">
        {STAGES.map(stage => {
          const count = enquiries.filter(e => e.status === stage.id).length;
          return (
            <button
              key={stage.id}
              onClick={() => setFilter(filter === stage.id ? '' : stage.id)}
              className="flex flex-col items-center py-3 px-2 transition-all hover:bg-ink-50 dark:hover:bg-ink-800/50"
              style={{ borderBottom: filter === stage.id ? `2px solid ${stage.color}` : '2px solid transparent' }}
            >
              <span style={{ fontSize:20, fontWeight:700, color:stage.color }}>{count}</span>
              <span style={{ fontSize:10, color:'var(--color-text-secondary)', fontWeight:500 }}>{stage.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* List + pagination */}
        <div className="flex flex-col border-r border-ink-200/60 dark:border-ink-800 overflow-hidden" style={{ width:360, flexShrink:0 }}>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-20 m-3 rounded-xl bg-ink-100 dark:bg-ink-800 animate-pulse"/>
              ))
            ) : enquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <MessageSquare size={28} className="text-ink-200 dark:text-ink-700 mb-2"/>
                <p className="text-sm text-ink-400">No enquiries found</p>
              </div>
            ) : (
              enquiries.map(enq => (
                <button
                  key={enq.id}
                  onClick={() => setSelected(enq)}
                  className={`w-full text-left p-4 border-b border-ink-50 dark:border-ink-800/50 transition-all hover:bg-ink-50 dark:hover:bg-ink-800/50 ${
                    selected?.id === enq.id
                      ? 'bg-gold-50 dark:bg-gold-900/10 border-l-2 border-l-gold-500'
                      : 'border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-ink-700 dark:text-ink-200 truncate">
                      {enq.customer_name || enq.name || 'Unknown'}
                    </p>
                    <StageBadge status={enq.status || 'new'}/>
                  </div>
                  {enq.product_name && (
                    <p className="text-xs text-ink-400 truncate flex items-center gap-1 mb-1">
                      <Package size={10}/>{enq.product_name}
                    </p>
                  )}
                  <p className="text-xs text-ink-400 flex items-center gap-1">
                    <Clock size={10}/>
                    {new Date(enq.created_at).toLocaleDateString('en-AE', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Pagination bar */}
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-ink-200/60 dark:border-ink-800 flex-shrink-0">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="btn-ghost text-xs flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft size={12}/> Prev
              </button>
              <span className="text-[11px] text-ink-400">
                Page {page} of {totalPages}
                <span className="ml-1 text-ink-300">({total} total)</span>
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="btn-ghost text-xs flex items-center gap-1 disabled:opacity-40"
              >
                Next <ChevronRight size={12}/>
              </button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare size={40} className="text-ink-200 dark:text-ink-700 mb-3"/>
              <p className="text-sm text-ink-400">Select an enquiry to view details</p>
            </div>
          ) : (
            <div className="p-6 max-w-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, color:'var(--color-text-primary)', marginBottom:4 }}>
                    {selected.customer_name || selected.name || 'Unknown Customer'}
                  </h2>
                  <StageBadge status={selected.status || 'new'}/>
                </div>
                <div className="flex items-center gap-2">
                  {selected.phone && (
                    <a
                      href={`https://wa.me/${(selected.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${selected.customer_name || ''}, thank you for your enquiry about ${selected.product_name || 'our collection'}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg"
                      style={{ background:'#1a7a35', color:'#fff' }}
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Contact info */}
              <div className="card p-4 mb-4 grid grid-cols-2 gap-3">
                {selected.email        && <div className="flex items-center gap-2 text-xs text-ink-500"><Mail     size={12}/>{selected.email}</div>}
                {selected.phone        && <div className="flex items-center gap-2 text-xs text-ink-500"><Phone    size={12}/>{selected.phone}</div>}
                {selected.product_name && <div className="flex items-center gap-2 text-xs text-ink-500"><Package  size={12}/>{selected.product_name}</div>}
                {selected.created_at   && <div className="flex items-center gap-2 text-xs text-ink-500"><Calendar size={12}/>{new Date(selected.created_at).toLocaleString('en-AE', { timeZone:'Asia/Dubai' })}</div>}
              </div>

              {/* Message */}
              {selected.message && (
                <div className="card p-4 mb-4">
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide mb-2">Message</p>
                  <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">{selected.message}</p>
                </div>
              )}

              {/* Stage pipeline */}
              <div className="card p-4">
                <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide mb-3">Move to stage</p>
                <div className="grid grid-cols-5 gap-2">
                  {STAGES.map(stage => (
                    <button
                      key={stage.id}
                      onClick={() => updateStatus(selected.id, stage.id)}
                      disabled={updating || selected.status === stage.id}
                      style={{
                        padding:'8px 4px', borderRadius:8, border:'2px solid',
                        borderColor: selected.status === stage.id ? stage.color : 'var(--color-border-secondary)',
                        background:  selected.status === stage.id ? stage.bg    : 'var(--color-background-primary)',
                        color:       selected.status === stage.id ? stage.color : 'var(--color-text-secondary)',
                        cursor:      selected.status === stage.id ? 'default'   : 'pointer',
                        fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em',
                        transition:'all .15s',
                      }}
                    >
                      {selected.status === stage.id && <span className="block text-center mb-0.5">✓</span>}
                      {stage.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
