import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function MountingsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const load = async() => {
    setLoading(true);
    try {
      const r = await api.get('/mountings',{ params:{ search:search||undefined, category:catFilter||undefined } });
      setItems(r.data.data?.data||[]); setTotal(r.data.data?.total||0);
    } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(()=>{ load(); },[search,catFilter]);

  const handleDelete = async(id,name)=>{
    if(!confirm(`Delete "${name}"?`)) return;
    try { await api.delete(`/mountings/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <>
      <Topbar title="Mountings" subtitle={`${total} mountings in catalogue`}
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={<button onClick={()=>navigate('/mountings/new')} className="btn-gold flex items-center gap-1.5 text-xs"><Plus size={14}/>Add mounting</button>}/>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="card p-4 mb-4 flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search mountings…" className="input-field pl-9 py-2"/>
          </div>
          {['','Ring','Pendant','Earring','Bracelet'].map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${catFilter===c?'bg-gold-500 text-white border-gold-500':'border-ink-200 dark:border-ink-700 text-ink-500'}`}>
              {c||'All'}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? <p className="text-sm text-ink-400 col-span-4 p-4">Loading…</p>
          : items.length===0 ? (
            <div className="col-span-4 card p-12 text-center">
              <p className="text-sm text-ink-400 mb-2">No mountings yet</p>
              <button onClick={()=>navigate('/mountings/new')} className="btn-gold text-xs">Add first mounting</button>
            </div>
          ) : items.map(m=>(
            <div key={m.id} className="card p-4">
              {m.thumb_url && <img src={m.thumb_url} alt={m.name} className="w-full h-36 object-cover rounded-lg mb-3 bg-ink-100"/>}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-ink-700 dark:text-ink-200 leading-tight">{m.name}</p>
                  <p className="text-[10px] text-ink-400 font-mono">{m.sku}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={()=>navigate(`/mountings/${m.id}`)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400"><Edit2 size={13}/></button>
                  <button onClick={()=>handleDelete(m.id,m.name)} className="p-1.5 rounded hover:bg-red-50 text-ink-400 hover:text-red-500"><Trash2 size={13}/></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {m.mounting_type && <span className="text-[10px] bg-ink-100 dark:bg-ink-800 text-ink-500 px-2 py-0.5 rounded">{m.mounting_type}</span>}
                {m.category && <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded">{m.category}</span>}
                {m.gender && <span className="text-[10px] bg-pink-50 dark:bg-pink-900/20 text-pink-600 px-2 py-0.5 rounded">{m.gender}</span>}
              </div>
              <div className="text-xs text-ink-500 space-y-1">
                {m.min_carat && <div>Carat range: {m.min_carat}–{m.max_carat}ct</div>}
                {m.production_days && <div>Production: {m.production_days} days</div>}
              </div>
              <div className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">
                  {m.final_price ? `${m.currency} ${Number(m.final_price).toLocaleString()}` : 'On request'}
                </span>
                {m.cad_file_url && <span className="text-[10px] text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">CAD ✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
