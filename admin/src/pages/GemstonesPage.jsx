import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function GemstonesPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const TYPES = ['Ruby','Sapphire','Emerald','Tanzanite','Alexandrite','Aquamarine','Other'];

  const load = async() => {
    setLoading(true);
    try {
      const r = await api.get('/gemstones',{ params:{ search:search||undefined, gemstone_type:typeFilter||undefined } });
      setItems(r.data.data?.data||[]); setTotal(r.data.data?.total||0);
    } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(()=>{ load(); },[search,typeFilter]);

  const handleDelete = async(id,name)=>{
    if(!confirm(`Delete "${name}"?`)) return;
    try { await api.delete(`/gemstones/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <>
      <Topbar title="Gemstones" subtitle={`${total} coloured stones in inventory`}
        actions={<button onClick={()=>navigate('/gemstones/new')} className="btn-gold flex items-center gap-1.5 text-xs"><Plus size={14}/>Add gemstone</button>}/>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="card p-4 mb-4 flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search gemstones…" className="input-field pl-9 py-2"/>
          </div>
          <div className="flex gap-1 flex-wrap">
            {['', ...TYPES].map(t=>(
              <button key={t} onClick={()=>setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${typeFilter===t?'bg-gold-500 text-white border-gold-500':'border-ink-200 dark:border-ink-700 text-ink-500'}`}>
                {t||'All'}
              </button>
            ))}
          </div>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-ink-200/60 dark:border-ink-700">
                {['Stone','Type','Origin','Carat','Colour','Treatment','Cert','Price',''].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-medium text-ink-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={9} className="text-center py-12 text-sm text-ink-400">Loading…</td></tr>
              : items.length===0 ? (
                <tr><td colSpan={9} className="text-center py-16">
                  <p className="text-sm text-ink-400 mb-2">No gemstones yet</p>
                  <button onClick={()=>navigate('/gemstones/new')} className="btn-gold text-xs">Add first gemstone</button>
                </td></tr>
              ) : items.map((g,i)=>(
                <tr key={g.id} className={`border-b border-ink-100 dark:border-ink-800 hover:bg-ink-50/50 dark:hover:bg-ink-800/30 ${i%2===0?'':'bg-ink-50/30 dark:bg-ink-800/10'}`}>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-ink-700 dark:text-ink-200 max-w-[160px] truncate">{g.name||`${g.gemstone_type} ${g.carat||''}ct`}</p>
                    <p className="text-[10px] text-ink-400">{g.sku}</p>
                  </td>
                  <td className="px-4 py-3"><span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium">{g.gemstone_type}</span></td>
                  <td className="px-4 py-3 text-ink-500">{g.country_of_origin||'—'}</td>
                  <td className="px-4 py-3 font-medium text-ink-700 dark:text-ink-200">{g.carat?parseFloat(g.carat).toFixed(2)+'ct':'—'}</td>
                  <td className="px-4 py-3 text-ink-500 max-w-[120px] truncate">{g.color_description||'—'}</td>
                  <td className="px-4 py-3">
                    {g.is_treated
                      ? <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Treated</span>
                      : <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">No heat</span>}
                  </td>
                  <td className="px-4 py-3">
                    {g.cert_number ? <span className="text-[10px] font-mono text-blue-600">{g.cert_lab} {g.cert_number}</span> : <span className="text-ink-300">—</span>}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{g.final_price?`${g.currency} ${Number(g.final_price).toLocaleString()}`:'—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={()=>navigate(`/gemstones/${g.id}`)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400"><Edit2 size={13}/></button>
                      <button onClick={()=>handleDelete(g.id,g.name||g.sku)} className="p-1.5 rounded hover:bg-red-50 text-ink-400 hover:text-red-500"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
