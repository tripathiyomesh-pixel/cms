'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { diamondAPI } from '@/lib/api';
import { Search, Filter, X, ChevronLeft, ChevronRight, MessageCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const SHAPES    = ['Round','Oval','Princess','Cushion','Pear','Emerald','Marquise','Asscher','Radiant','Heart','Trillion'];
const COLORS    = ['D','E','F','G','H','I','J','K','L','M'];
const CLARITIES = ['FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2'];
const CUTS      = ['Excellent','Very Good','Good'];
const LABS      = ['GIA','IGI','HRD'];

const GRADE_COLOR = { Excellent:'text-green-600 font-semibold','Very Good':'text-blue-600','Good':'text-ink-500','Fair':'text-amber-500' };

function DiamondCard({ d }) {
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const name = d.name || `${d.diamond_type==='LAB_GROWN'?'Lab':'Natural'} ${d.shape} ${d.carat}ct ${d.color} ${d.clarity}`;
  const msg  = encodeURIComponent(`Hi, I'm interested in: ${name} | Cert: ${d.primary_cert_lab||''} ${d.primary_cert_no||''} | ${d.currency||'USD'} ${Number(d.final_price||0).toLocaleString()}`);

  return (
    <div className="card p-4 hover:shadow-md transition-all hover:border-gold-200">
      {/* Type badge */}
      <div className="flex items-start justify-between mb-3">
        <span className={`badge text-[10px] ${d.diamond_type==='LAB_GROWN'?'badge-lab':'badge-natural'}`}>
          {d.diamond_type==='LAB_GROWN'?'Lab-Grown':'Natural'}
        </span>
        {!d.is_available && <span className="badge bg-red-50 text-red-600 text-[10px]">On Hold</span>}
      </div>

      {/* Main specs */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-ink-700 mb-1 line-clamp-2">{name}</h3>
        <p className="text-xs text-ink-400 font-mono">{d.sku}</p>
      </div>

      {/* 4Cs grid */}
      <div className="grid grid-cols-4 gap-1 mb-3">
        {[['Shape',d.shape],['Carat',d.carat?Number(d.carat).toFixed(2):'—'],['Color',d.color||'—'],['Clarity',d.clarity||'—']].map(([k,v])=>(
          <div key={k} className="text-center bg-ink-50 rounded-lg p-1.5">
            <div className="text-[10px] text-ink-400">{k}</div>
            <div className="text-xs font-semibold text-ink-700">{v}</div>
          </div>
        ))}
      </div>

      {/* Grades */}
      <div className="flex gap-3 text-xs mb-3">
        {d.cut && <span>Cut: <span className={GRADE_COLOR[d.cut]||'text-ink-500'}>{d.cut}</span></span>}
        {d.polish && <span>Polish: <span className="text-ink-600">{d.polish}</span></span>}
      </div>

      {/* Cert */}
      {d.primary_cert_no && (
        <div className="bg-blue-50 rounded-lg px-3 py-2 mb-3 flex items-center justify-between">
          <span className="text-xs text-blue-700 font-medium">{d.primary_cert_lab} {d.primary_cert_no}</span>
          {d.cert_url && <a href={d.cert_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700"><ExternalLink size={11}/></a>}
          <Link href={`/verify/${d.primary_cert_no}`} className="text-[10px] text-blue-500 hover:underline">Verify</Link>
        </div>
      )}

      {/* Price + actions */}
      <div className="flex items-center justify-between pt-2 border-t border-ink-100">
        <div>
          <div className="text-base font-bold text-ink-800">{d.currency||'USD'} {Number(d.final_price||0).toLocaleString()}</div>
          {d.rap_rate && d.carat && <div className="text-[10px] text-ink-400">Rap: ${d.rap_rate}/ct</div>}
        </div>
        <div className="flex gap-1.5">
          <Link href={`/diamonds/${d.id}`} className="text-[11px] px-3 py-1.5 rounded-full border border-ink-200 text-ink-500 hover:border-gold-400 hover:text-gold-600 transition-colors">Details</Link>
          {wapp && (
            <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer"
              className="text-[11px] px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 flex items-center gap-1 transition-colors">
              <MessageCircle size={11}/> Enquire
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function DiamondsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [diamonds, setDiamonds] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const limit = 24;

  const [filters, setFilters] = useState({
    diamond_type: searchParams.get('type') || '',
    shape:        searchParams.get('shape') || '',
    color:        searchParams.get('color') || '',
    clarity:      searchParams.get('clarity') || '',
    cut:          searchParams.get('cut') || '',
    min_carat:    searchParams.get('min_carat') || '',
    max_carat:    searchParams.get('max_carat') || '',
    min_price:    searchParams.get('min_price') || '',
    max_price:    searchParams.get('max_price') || '',
    cert_lab:     searchParams.get('cert_lab') || '',
    search:       searchParams.get('search') || '',
  });

  const set = (k,v) => setFilters(f=>({...f,[k]:v}));

  const load = async (p=1) => {
    setLoading(true);
    try {
      const params = { page:p, limit, is_available:'true', ...Object.fromEntries(Object.entries(filters).filter(([,v])=>v)) };
      const r = await diamondAPI.search(params);
      setDiamonds(r.data.data?.data||[]);
      setTotal(r.data.data?.total||0);
    } catch { setDiamonds([]); }
    setLoading(false);
  };

  useEffect(()=>{ load(1); setPage(1); },[filters]);

  const clearFilter = (k) => set(k,'');
  const activeFilters = Object.entries(filters).filter(([,v])=>v);
  const totalPages = Math.ceil(total/limit);

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl text-ink-800 mb-2">
          {filters.diamond_type==='LAB_GROWN'?'Lab-Grown Diamonds':filters.diamond_type==='NATURAL'?'Natural Diamonds':'All Diamonds'}
        </h1>
        <p className="text-ink-400">{total} certified stones available</p>
      </div>

      {/* Active filter tags */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {activeFilters.map(([k,v])=>(
            <button key={k} onClick={()=>clearFilter(k)}
              className="flex items-center gap-1 text-xs bg-gold-50 border border-gold-200 text-gold-700 px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
              {k.replace(/_/g,' ')}: {v} <X size={10}/>
            </button>
          ))}
          <button onClick={()=>setFilters(Object.fromEntries(Object.keys(filters).map(k=>[k,''])))} className="text-xs text-ink-400 hover:text-red-500 px-2">Clear all</button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filter sidebar */}
        {showFilters && (
          <div className="w-56 flex-shrink-0 space-y-5">
            {/* Type */}
            <div>
              <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-2">Type</p>
              <div className="space-y-1">
                {[['','All'],['NATURAL','Natural'],['LAB_GROWN','Lab-Grown']].map(([v,l])=>(
                  <label key={v} className="flex items-center gap-2 text-sm text-ink-600 cursor-pointer hover:text-gold-600">
                    <input type="radio" name="type" value={v} checked={filters.diamond_type===v} onChange={e=>set('diamond_type',e.target.value)} className="accent-gold-500"/>
                    {l}
                  </label>
                ))}
              </div>
            </div>

            {/* Shape */}
            <div>
              <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-2">Shape</p>
              <div className="flex flex-wrap gap-1.5">
                {SHAPES.map(s=>(
                  <button key={s} onClick={()=>set('shape',filters.shape===s?'':s)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${filters.shape===s?'bg-gold-500 border-gold-500 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Carat range */}
            <div>
              <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-2">Carat</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="0.1" value={filters.min_carat} onChange={e=>set('min_carat',e.target.value)} placeholder="Min" className="w-full border border-ink-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-gold-400 outline-none"/>
                <input type="number" step="0.1" value={filters.max_carat} onChange={e=>set('max_carat',e.target.value)} placeholder="Max" className="w-full border border-ink-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-gold-400 outline-none"/>
              </div>
            </div>

            {/* Color */}
            <div>
              <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-2">Color</p>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map(c=>(
                  <button key={c} onClick={()=>set('color',filters.color===c?'':c)}
                    className={`text-[11px] w-7 h-7 rounded-full border font-mono font-bold transition-all ${filters.color===c?'bg-gold-500 border-gold-500 text-white':'border-ink-200 text-ink-600 hover:border-gold-400'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Clarity */}
            <div>
              <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-2">Clarity</p>
              <div className="flex flex-wrap gap-1.5">
                {CLARITIES.map(c=>(
                  <button key={c} onClick={()=>set('clarity',filters.clarity===c?'':c)}
                    className={`text-[11px] px-2 py-1 rounded-full border font-mono transition-all ${filters.clarity===c?'bg-gold-500 border-gold-500 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Cut */}
            <div>
              <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-2">Cut</p>
              <div className="space-y-1">
                {CUTS.map(c=>(
                  <label key={c} className="flex items-center gap-2 text-sm text-ink-600 cursor-pointer hover:text-gold-600">
                    <input type="radio" name="cut" value={c} checked={filters.cut===c} onChange={e=>set('cut',e.target.value)} className="accent-gold-500"/>
                    <span className={GRADE_COLOR[c]||''}>{c}</span>
                  </label>
                ))}
                {filters.cut && <button onClick={()=>set('cut','')} className="text-[11px] text-ink-400 hover:text-red-500">Clear</button>}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-2">Price (USD)</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={filters.min_price} onChange={e=>set('min_price',e.target.value)} placeholder="Min" className="w-full border border-ink-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-gold-400 outline-none"/>
                <input type="number" value={filters.max_price} onChange={e=>set('max_price',e.target.value)} placeholder="Max" className="w-full border border-ink-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-gold-400 outline-none"/>
              </div>
            </div>

            {/* Cert lab */}
            <div>
              <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-2">Certificate</p>
              <div className="flex flex-wrap gap-1.5">
                {LABS.map(l=>(
                  <button key={l} onClick={()=>set('cert_lab',filters.cert_lab===l?'':l)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${filters.cert_lab===l?'bg-gold-500 border-gold-500 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <button onClick={()=>setShowFilters(!showFilters)} className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-gold-600 border border-ink-200 px-3 py-1.5 rounded-full transition-colors">
              <Filter size={12}/>{showFilters?'Hide':'Show'} filters
            </button>
            <span className="text-xs text-ink-400">{total} diamonds found</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_,i)=><div key={i} className="card p-4 animate-pulse h-64"/>)}
            </div>
          ) : diamonds.length===0 ? (
            <div className="card p-16 text-center">
              <p className="text-4xl mb-4">💎</p>
              <p className="text-ink-500 mb-2">No diamonds match your filters</p>
              <p className="text-sm text-ink-400">Try adjusting carat range or clarity grade</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {diamonds.map(d=><DiamondCard key={d.id} d={d}/>)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={()=>{setPage(p=>p-1);load(page-1);}} disabled={page===1} className="p-2 rounded-full border border-ink-200 disabled:opacity-30 hover:border-gold-400 transition-colors"><ChevronLeft size={16}/></button>
              <span className="text-sm text-ink-500">Page {page} of {totalPages}</span>
              <button onClick={()=>{setPage(p=>p+1);load(page+1);}} disabled={page>=totalPages} className="p-2 rounded-full border border-ink-200 disabled:opacity-30 hover:border-gold-400 transition-colors"><ChevronRight size={16}/></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiamondsPage() {
  return (
    <Suspense fallback={<div className="pt-24 text-center py-20 text-ink-400">Loading diamonds…</div>}>
      <DiamondsContent />
    </Suspense>
  );
}
