import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { Search, ChevronLeft, ChevronRight, X, Upload, Check, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const STATUSES = ['INQUIRY','DESIGNING','APPROVAL_PENDING','APPROVED','MANUFACTURING','STONE_SETTING','POLISHING','QC','READY','SHIPPED','CANCELLED'];
const STATUS_COLORS = {
  INQUIRY:'bg-blue-50 text-blue-600', DESIGNING:'bg-purple-50 text-purple-600',
  APPROVAL_PENDING:'bg-amber-50 text-amber-600', APPROVED:'bg-green-50 text-green-600',
  MANUFACTURING:'bg-orange-50 text-orange-600', STONE_SETTING:'bg-pink-50 text-pink-600',
  POLISHING:'bg-teal-50 text-teal-600', QC:'bg-indigo-50 text-indigo-600',
  READY:'bg-emerald-50 text-emerald-700', SHIPPED:'bg-gray-50 text-gray-600',
  CANCELLED:'bg-red-50 text-red-600',
};

export default function CustomOrdersPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const limit = 20;

  const load = async(p=1) => {
    setLoading(true);
    try {
      const r = await api.get('/custom-orders',{ params:{ page:p,limit,status:filter||undefined,search:search||undefined } });
      setOrders(r.data.data?.data||[]);
      setTotal(r.data.data?.total||0);
    } catch { setOrders([]); }
    setLoading(false);
  };

  useEffect(()=>{ load(1); setPage(1); },[filter,search]);

  const updateStatus = async(id,status) => {
    setUpdatingId(id);
    try { await api.patch(`/custom-orders/${id}/status`,{status}); toast.success(`Moved to ${status}`); load(page); if(selected?.id===id) setSelected(o=>({...o,status})); }
    catch { toast.error('Update failed'); }
    setUpdatingId(null);
  };

  const loadDetail = async(id) => {
    try { const r=await api.get(`/custom-orders/${id}`); setSelected(r.data.data); }
    catch { toast.error('Failed to load'); }
  };

  const totalPages = Math.ceil(total/limit);

  // Workflow arrow
  const FLOW = ['INQUIRY','DESIGNING','APPROVAL_PENDING','APPROVED','MANUFACTURING','STONE_SETTING','POLISHING','QC','READY','SHIPPED'];
  const nextStatus = (s) => { const i=FLOW.indexOf(s); return i>=0&&i<FLOW.length-1?FLOW[i+1]:null; };

  return (
    <>
      <Topbar title="Custom jewellery orders" subtitle={`${total} custom orders`}/>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or order number…" className="input-field pl-9 py-2"/>
          </div>
          <div className="flex gap-1 flex-wrap">
            {['','INQUIRY','DESIGNING','MANUFACTURING','QC','READY','SHIPPED'].map(s=>(
              <button key={s} onClick={()=>setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${filter===s?'bg-gold-500 text-white border-gold-500':'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-gold-400'}`}>
                {s||'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* List */}
          <div className="lg:col-span-2">
            {loading ? <p className="text-sm text-ink-400 p-4">Loading…</p>
            : orders.length===0 ? (
              <div className="card p-12 text-center"><p className="text-sm text-ink-400">No custom orders found</p></div>
            ) : orders.map((o,i)=>(
              <div key={o.id} onClick={()=>loadDetail(o.id)}
                className={`card mb-2 p-4 cursor-pointer hover:border-gold-400 transition-colors ${selected?.id===o.id?'border-gold-400':''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-ink-400">{o.order_number}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full dark:bg-opacity-20 ${STATUS_COLORS[o.status]||'bg-ink-100 text-ink-500'}`}>{o.status?.replace('_',' ')}</span>
                    </div>
                    <p className="text-sm font-medium text-ink-700 dark:text-ink-200">{o.customer_name}</p>
                    <p className="text-xs text-ink-400">{o.customer_phone}</p>
                    {o.description && <p className="text-xs text-ink-500 mt-1 truncate max-w-[300px]">{o.description}</p>}
                  </div>
                  <div className="text-right">
                    {o.quoted_amount && <p className="text-sm font-semibold text-ink-700 dark:text-ink-200">{o.currency} {Number(o.quoted_amount).toLocaleString()}</p>}
                    <p className="text-[10px] text-ink-400 mt-1">{new Date(o.created_at).toLocaleDateString('en-AE',{day:'numeric',month:'short'})}</p>
                  </div>
                </div>
              </div>
            ))}

            {totalPages>1 && (
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-ink-400">Page {page} of {totalPages}</span>
                <div className="flex gap-1">
                  <button onClick={()=>{setPage(p=>p-1);load(page-1);}} disabled={page===1} className="btn-outline disabled:opacity-30 p-1.5"><ChevronLeft size={14}/></button>
                  <button onClick={()=>{setPage(p=>p+1);load(page+1);}} disabled={page>=totalPages} className="btn-outline disabled:opacity-30 p-1.5"><ChevronRight size={14}/></button>
                </div>
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div>
            {selected ? (
              <div className="card p-4 sticky top-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-mono text-xs text-ink-400">{selected.order_number}</p>
                    <p className="font-semibold text-ink-700 dark:text-ink-200 mt-1">{selected.customer_name}</p>
                  </div>
                  <button onClick={()=>setSelected(null)} className="p-1 rounded hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={14}/></button>
                </div>

                {/* Workflow progress */}
                <div className="mb-4">
                  <p className="text-[10px] text-ink-400 uppercase tracking-wide mb-2">Workflow progress</p>
                  <div className="flex flex-wrap gap-1">
                    {FLOW.map(s=>{
                      const idx = FLOW.indexOf(selected.status);
                      const thisIdx = FLOW.indexOf(s);
                      const done = thisIdx<idx; const active=s===selected.status;
                      return (
                        <span key={s} className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${done?'bg-green-100 text-green-700':active?'bg-gold-100 text-gold-700':'bg-ink-100 text-ink-400'}`}>
                          {done&&'✓ '}{s.replace('_',' ')}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs mb-4">
                  {[['Phone',selected.customer_phone],['Email',selected.customer_email],
                    ['Budget',selected.budget_min?`${selected.currency} ${selected.budget_min}–${selected.budget_max}`:'Not specified'],
                    ['Metal',selected.metal_preference],['Stone',selected.stone_preference],
                    ['Quoted',selected.quoted_amount?`${selected.currency} ${Number(selected.quoted_amount).toLocaleString()}`:'Not quoted yet'],
                    ['Created',new Date(selected.created_at).toLocaleDateString('en-AE',{day:'numeric',month:'short',year:'numeric'})],
                  ].filter(([,v])=>v).map(([k,v])=>(
                    <div key={k} className="flex gap-2">
                      <span className="text-ink-400 min-w-[60px]">{k}</span>
                      <span className="text-ink-600 dark:text-ink-300 font-medium">{v}</span>
                    </div>
                  ))}
                </div>

                {selected.description && (
                  <div className="bg-ink-50 dark:bg-ink-800 rounded-lg p-3 text-xs text-ink-500 mb-4">{selected.description}</div>
                )}

                {/* Next step button */}
                {nextStatus(selected.status) && selected.status!=='CANCELLED' && (
                  <button onClick={()=>updateStatus(selected.id,nextStatus(selected.status))}
                    disabled={updatingId===selected.id}
                    className="w-full btn-gold text-xs flex items-center justify-center gap-1.5 mb-2">
                    <Check size={13}/> Move to {nextStatus(selected.status)?.replace('_',' ')}
                  </button>
                )}

                {/* WhatsApp */}
                <a href={`https://wa.me/${selected.customer_phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hello ${selected.customer_name}, regarding your custom jewellery order ${selected.order_number}`)}`}
                  target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 text-xs font-medium hover:bg-green-100 transition-colors">
                  💬 WhatsApp customer
                </a>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-xs text-ink-400">Select an order to view details and manage workflow</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
