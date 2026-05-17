import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Gem, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const SHAPES = ['','Round','Princess','Oval','Marquise','Pear','Cushion','Emerald','Asscher','Radiant','Heart'];
const COLORS = ['','D','E','F','G','H','I','J','K','L','M'];
const CLARITIES = ['','FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2'];
const CUTS = ['','Excellent','Very Good','Good','Fair','Poor'];

const TYPE_COLOR = { NATURAL:{ bg:'#fef9c3',color:'#a16207',label:'Natural' }, LAB_GROWN:{ bg:'#dbeafe',color:'#1e40af',label:'Lab-grown' } };

export default function DiamondsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const [diamonds, setDiamonds] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ search:'', diamond_type:'', shape:'', color:'', clarity:'', cut:'', min_carat:'', max_carat:'' });
  const limit = 20;

  const load = async (p=1) => {
    setLoading(true);
    try {
      const r = await api.get('/diamonds', { params: { page:p, limit, ...filters } });
      setDiamonds(r.data.data?.data || []);
      setTotal(r.data.data?.total || 0);
    } catch { setDiamonds([]); }
    setLoading(false);
  };

  useEffect(() => { load(1); setPage(1); }, [filters]);

  const handleDelete = async(id,name) => {
    if(!confirm(`Delete "${name}"?`)) return;
    try { await api.delete(`/diamonds/${id}`); toast.success('Deleted'); load(page); }
    catch { toast.error('Delete failed'); }
  };

  const totalPages = Math.ceil(total/limit);
  const setF = (k,v) => setFilters(f=>({...f,[k]:v}));

  const GRADE_COLOR = { Excellent:'text-green-600', 'Very Good':'text-blue-600', Good:'text-ink-500', Fair:'text-amber-600', Poor:'text-red-500' };

  return (
    <>
      <Topbar title="Diamonds" subtitle={`${total} stones in inventory`}
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={<div className="flex gap-2">
          <button onClick={()=>setShowFilters(!showFilters)} className="btn-outline flex items-center gap-1.5 text-xs"><Filter size={13}/>Filters</button>
          <button onClick={()=>navigate('/diamonds/new')} className="btn-gold flex items-center gap-1.5 text-xs"><Plus size={14}/>Add diamond</button>
        </div>}/>

      <div className="flex-1 overflow-y-auto p-5">

        {/* Search + filters */}
        <div className="card p-4 mb-4 space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"/>
            <input value={filters.search} onChange={e=>setF('search',e.target.value)}
              placeholder="Search by name or cert number…" className="input-field pl-9 py-2"/>
          </div>
          {showFilters && (
            <div className="grid grid-cols-4 gap-3 pt-1">
              {[
                {k:'diamond_type',l:'Type',opts:[{v:'',l:'All types'},{v:'NATURAL',l:'Natural'},{v:'LAB_GROWN',l:'Lab-grown'}]},
                {k:'shape',l:'Shape',opts:SHAPES.map(s=>({v:s,l:s||'All shapes'}))},
                {k:'color',l:'Color',opts:COLORS.map(c=>({v:c,l:c||'All colors'}))},
                {k:'clarity',l:'Clarity',opts:CLARITIES.map(c=>({v:c,l:c||'All clarities'}))},
                {k:'cut',l:'Cut',opts:CUTS.map(c=>({v:c,l:c||'All cuts'}))},
              ].map(f=>(
                <div key={f.k}>
                  <label className="block text-[10px] text-ink-400 mb-1 uppercase tracking-wide">{f.l}</label>
                  <select value={filters[f.k]} onChange={e=>setF(f.k,e.target.value)} className="input-field py-1.5 text-xs">
                    {f.opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-[10px] text-ink-400 mb-1 uppercase tracking-wide">Min carat</label>
                <input type="number" step="0.01" value={filters.min_carat} onChange={e=>setF('min_carat',e.target.value)} className="input-field py-1.5 text-xs" placeholder="0.50"/>
              </div>
              <div>
                <label className="block text-[10px] text-ink-400 mb-1 uppercase tracking-wide">Max carat</label>
                <input type="number" step="0.01" value={filters.max_carat} onChange={e=>setF('max_carat',e.target.value)} className="input-field py-1.5 text-xs" placeholder="5.00"/>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-ink-200/60 dark:border-ink-700">
                {['Stone','Shape','Carat','Color','Clarity','Cut','Cert','Price','Status',''].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-medium text-ink-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={10} className="text-center py-12 text-sm text-ink-400">Loading…</td></tr>
              : diamonds.length===0 ? (
                <tr><td colSpan={10} className="text-center py-16">
                  <Gem size={28} className="mx-auto text-ink-300 mb-3"/>
                  <p className="text-sm text-ink-400 mb-2">No diamonds yet</p>
                  <button onClick={()=>navigate('/diamonds/new')} className="btn-gold text-xs">Add first diamond</button>
                </td></tr>
              ) : diamonds.map((d,i)=>{
                const tc = TYPE_COLOR[d.diamond_type] || TYPE_COLOR.NATURAL;
                return (
                  <tr key={d.id} className={`border-b border-ink-100 dark:border-ink-800 hover:bg-ink-50/50 dark:hover:bg-ink-800/30 ${i%2===0?'':'bg-ink-50/30 dark:bg-ink-800/10'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span style={{fontSize:9,padding:'2px 6px',borderRadius:20,background:tc.bg,color:tc.color,fontWeight:600,whiteSpace:'nowrap'}}>{tc.label}</span>
                        <div>
                          <p className="text-xs font-medium text-ink-700 dark:text-ink-200 max-w-[160px] truncate">{d.name||`${d.shape} ${d.carat}ct`}</p>
                          <p className="text-[10px] text-ink-400">{d.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{d.shape||'—'}</td>
                    <td className="px-4 py-3 font-medium text-ink-700 dark:text-ink-200">{d.carat?parseFloat(d.carat).toFixed(2)+'ct':'—'}</td>
                    <td className="px-4 py-3"><span className="font-mono font-semibold text-ink-700 dark:text-ink-200">{d.color||'—'}</span></td>
                    <td className="px-4 py-3 font-mono text-ink-600 dark:text-ink-300">{d.clarity||'—'}</td>
                    <td className="px-4 py-3"><span className={GRADE_COLOR[d.cut]||'text-ink-500'}>{d.cut||'—'}</span></td>
                    <td className="px-4 py-3">
                      {d.primary_cert_no ? (
                        <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                          {d.primary_cert_lab} {d.primary_cert_no}
                        </span>
                      ) : <span className="text-ink-300">—</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-700 dark:text-ink-200 whitespace-nowrap">
                      {d.final_price ? `${d.currency} ${Number(d.final_price).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {d.is_available
                        ? <span className="text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full font-medium">Available</span>
                        : <span className="text-[10px] text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full font-medium">On hold</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={()=>navigate(`/diamonds/${d.id}`)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400"><Edit2 size={13}/></button>
                        <button onClick={()=>handleDelete(d.id,d.name||d.sku)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-ink-200/60 dark:border-ink-700">
              <span className="text-xs text-ink-400">Page {page} of {totalPages} ({total} diamonds)</span>
              <div className="flex gap-1">
                <button onClick={()=>{setPage(p=>p-1);load(page-1);}} disabled={page===1} className="btn-outline disabled:opacity-30 p-1.5"><ChevronLeft size={14}/></button>
                <button onClick={()=>{setPage(p=>p+1);load(page+1);}} disabled={page>=totalPages} className="btn-outline disabled:opacity-30 p-1.5"><ChevronRight size={14}/></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
