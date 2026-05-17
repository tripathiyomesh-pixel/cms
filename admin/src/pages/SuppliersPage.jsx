import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { Plus, Search, Edit2, X, Save, Building, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const empty = { name:'',code:'',contact_name:'',email:'',phone:'',whatsapp:'',country:'',city:'',address:'',payment_terms:'',currency:'USD',discount_pct:'0',notes:'' };

export default function SuppliersPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [memos, setMemos] = useState([]);
  const [showMemos, setShowMemos] = useState(false);

  const load = async() => {
    setLoading(true);
    try {
      const r = await api.get('/suppliers', { params: { search:search||undefined } });
      setSuppliers(r.data.data?.data || []);
      setTotal(r.data.data?.total || 0);
    } catch { setSuppliers([]); }
    setLoading(false);
  };

  const loadMemos = async() => {
    try { const r = await api.get('/suppliers/memos/list'); setMemos(r.data.data?.data || []); }
    catch {}
  };

  useEffect(()=>{ load(); },[search]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSave = async(e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal==='new') { await api.post('/suppliers',form); toast.success('Supplier added'); }
      else { await api.patch(`/suppliers/${modal.id}`,form); toast.success('Supplier updated'); }
      setModal(null); load();
    } catch(e) { toast.error(e.response?.data?.message||'Save failed'); }
    setSaving(false);
  };

  const openEdit = (s) => { setForm({...empty,...s,discount_pct:s.discount_pct||'0'}); setModal(s); };
  const openNew  = () => { setForm(empty); setModal('new'); };

  const STATUS_COLOR = { OPEN:'text-blue-600 bg-blue-50', RETURNED:'text-green-600 bg-green-50', SOLD:'text-purple-600 bg-purple-50', OVERDUE:'text-red-600 bg-red-50' };

  return (
    <>
      <Topbar title="Suppliers & memos" subtitle={`${total} suppliers`}
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={<button onClick={openNew} className="btn-gold flex items-center gap-1.5 text-xs"><Plus size={14}/>Add supplier</button>}/>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search suppliers…" className="input-field pl-9 py-2"/>
        </div>

        {/* Suppliers grid */}
        {loading ? <p className="text-sm text-ink-400">Loading…</p>
        : suppliers.length===0 ? (
          <div className="card p-12 text-center"><Building size={28} className="mx-auto text-ink-300 mb-3"/><p className="text-sm text-ink-400 mb-3">No suppliers yet</p><button onClick={openNew} className="btn-gold text-xs">Add first supplier</button></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map(s=>(
              <div key={s.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center text-sm font-semibold text-ink-600 dark:text-ink-300">
                      {s.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-700 dark:text-ink-200">{s.name}</p>
                      {s.code && <p className="text-[10px] text-ink-400 font-mono">{s.code}</p>}
                    </div>
                  </div>
                  <button onClick={()=>openEdit(s)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400"><Edit2 size={13}/></button>
                </div>
                <div className="space-y-1 text-xs text-ink-500">
                  {s.contact_name && <div>{s.contact_name}</div>}
                  {s.email && <div className="text-blue-500">{s.email}</div>}
                  {s.phone && <div>{s.phone}</div>}
                  {s.city && <div>{s.city}, {s.country}</div>}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100 dark:border-ink-800">
                  <span className="text-[10px] text-ink-400">{s.currency} · {s.discount_pct||0}% discount</span>
                  {s.payment_terms && <span className="text-[10px] text-ink-400">{s.payment_terms}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Memos section */}
        <div className="card overflow-hidden">
          <button onClick={()=>{ setShowMemos(!showMemos); if(!showMemos) loadMemos(); }}
            className="flex items-center justify-between w-full px-4 py-3 text-left">
            <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Memo tracking</span>
            {showMemos ? <ChevronUp size={16} className="text-ink-400"/> : <ChevronDown size={16} className="text-ink-400"/>}
          </button>
          {showMemos && (
            <div className="border-t border-ink-200/60 dark:border-ink-700">
              {memos.length===0 ? <p className="text-center py-8 text-sm text-ink-400">No memos yet</p>
              : memos.map((m,i)=>(
                <div key={m.id} className={`flex items-center gap-4 px-4 py-3 text-xs ${i%2===0?'':'bg-ink-50/50 dark:bg-ink-800/30'} ${i<memos.length-1?'border-b border-ink-100 dark:border-ink-800':''}`}>
                  <span className="font-mono font-medium text-ink-600 dark:text-ink-300 min-w-[100px]">{m.memo_number}</span>
                  <span className="flex-1 text-ink-500">{m.customer_name||m.supplier_name||'—'}</span>
                  <span className="text-ink-400">{m.due_date||'—'}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[m.status]||'text-ink-500 bg-ink-100'}`}>{m.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={()=>setModal(null)}>
          <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">{modal==='new'?'Add supplier':'Edit supplier'}</h3>
              <button onClick={()=>setModal(null)} className="p-1 rounded hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16}/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 grid grid-cols-2 gap-4">
              {[
                {k:'name',l:'Name *',full:true},{k:'code',l:'Supplier code'},{k:'contact_name',l:'Contact person'},
                {k:'email',l:'Email',type:'email'},{k:'phone',l:'Phone'},{k:'whatsapp',l:'WhatsApp'},
                {k:'country',l:'Country'},{k:'city',l:'City'},
                {k:'address',l:'Address',full:true,type:'textarea'},
                {k:'payment_terms',l:'Payment terms'},{k:'currency',l:'Currency'},{k:'discount_pct',l:'Discount %'},
                {k:'notes',l:'Notes',full:true,type:'textarea'},
              ].map(f=>(
                <div key={f.k} className={f.full?'col-span-2':''}>
                  <label className="block text-[11px] font-medium text-ink-500 mb-1.5">{f.l}</label>
                  {f.type==='textarea'
                    ? <textarea value={form[f.k]} onChange={e=>set(f.k,e.target.value)} className="input-field" rows={2}/>
                    : <input type={f.type||'text'} required={f.k==='name'} value={form[f.k]} onChange={e=>set(f.k,e.target.value)} className="input-field"/>}
                </div>
              ))}
              <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-ink-100 dark:border-ink-800">
                <button type="button" onClick={()=>setModal(null)} className="btn-ghost text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
                  {saving?<span className="w-3 h-3 border border-t-transparent border-black/30 rounded-full animate-spin"/>:<Save size={13}/>}
                  {modal==='new'?'Add supplier':'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
