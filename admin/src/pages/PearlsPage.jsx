import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const TYPE_COLORS = { Akoya:'bg-blue-50 text-blue-700', 'South Sea':'bg-amber-50 text-amber-700', Tahitian:'bg-gray-50 text-gray-700', Freshwater:'bg-pink-50 text-pink-700', Keshi:'bg-purple-50 text-purple-700' };

export default function PearlsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const TYPES = ['Akoya','South Sea','Tahitian','Freshwater'];

  const load = async () => {
    setLoading(true);
    try { const r=await api.get('/pearls',{params:{search:search||undefined,pearl_type:typeFilter||undefined}}); setItems(r.data.data?.data||[]); setTotal(r.data.data?.total||0); }
    catch { setItems([]); }
    setLoading(false);
  };
  useEffect(()=>{ load(); },[search,typeFilter]);

  const handleDelete = async(id,name) => {
    if(!confirm(`Delete "${name}"?`)) return;
    try { await api.delete(`/pearls/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <>
      <Topbar title="Pearls" subtitle={`${total} pearls in inventory`}
        actions={<button onClick={()=>navigate('/pearls/new')} className="btn-gold flex items-center gap-1.5 text-xs"><Plus size={14}/>Add pearl</button>}/>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="card p-4 mb-4 flex gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search pearls…" className="input-field pl-9 py-2"/></div>
          {['', ...TYPES].map(t=><button key={t} onClick={()=>setTypeFilter(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${typeFilter===t?'bg-gold-500 text-white border-gold-500':'border-ink-200 dark:border-ink-700 text-ink-500'}`}>{t||'All'}</button>)}
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-ink-200/60 dark:border-ink-700">{['Pearl','Type','Shape','Size','Luster','Nacre','Grade','Price',''].map(h=><th key={h} className="text-left px-4 py-3 text-[10px] font-medium text-ink-400 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={9} className="text-center py-12 text-sm text-ink-400">Loading…</td></tr>
              : items.length===0 ? <tr><td colSpan={9} className="text-center py-16"><p className="text-sm text-ink-400 mb-2">No pearls yet</p><button onClick={()=>navigate('/pearls/new')} className="btn-gold text-xs">Add first pearl</button></td></tr>
              : items.map((p,i)=>(
                <tr key={p.id} className={`border-b border-ink-100 dark:border-ink-800 hover:bg-ink-50/50 dark:hover:bg-ink-800/30 ${i%2===0?'':'bg-ink-50/30 dark:bg-ink-800/10'}`}>
                  <td className="px-4 py-3"><p className="text-xs font-medium text-ink-700 dark:text-ink-200 max-w-[160px] truncate">{p.name}</p><p className="text-[10px] text-ink-400">{p.sku}</p></td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[p.pearl_type]||'bg-ink-100 text-ink-500'}`}>{p.pearl_type}</span></td>
                  <td className="px-4 py-3 text-ink-500">{p.shape||'—'}</td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{p.size_mm_min&&p.size_mm_max?`${p.size_mm_min}–${p.size_mm_max}mm`:p.size_mm_min?`${p.size_mm_min}mm`:'—'}</td>
                  <td className="px-4 py-3 text-ink-500">{p.luster||'—'}</td>
                  <td className="px-4 py-3 text-ink-500">{p.nacre_quality||'—'}</td>
                  <td className="px-4 py-3"><span className="text-xs font-bold text-gold-600">{p.matching_grade||'—'}</span></td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{p.final_price?`${p.currency} ${Number(p.final_price).toLocaleString()}`:'—'}</td>
                  <td className="px-4 py-3"><div className="flex gap-1"><button onClick={()=>navigate(`/pearls/${p.id}`)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400"><Edit2 size={13}/></button><button onClick={()=>handleDelete(p.id,p.name)} className="p-1.5 rounded hover:bg-red-50 text-ink-400 hover:text-red-500"><Trash2 size={13}/></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
