'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

const TYPE_LABELS = { NATURAL_DIAMOND:'Natural Diamond', LAB_GROWN_DIAMOND:'Lab Diamond', GEMSTONE:'Gemstone', PEARL:'Pearl', MOUNTING:'Mounting', JEWELLERY:'Jewellery' };
const TYPE_HREFS  = { NATURAL_DIAMOND:'/diamonds', LAB_GROWN_DIAMOND:'/diamonds', GEMSTONE:'/gemstones', PEARL:'/pearls', MOUNTING:'/mountings', JEWELLERY:'/jewellery' };

function SearchContent() {
  const sp     = useSearchParams();
  const router = useRouter();
  const q0     = sp.get('q')||'';
  const [query,   setQuery]   = useState(q0);
  const [results, setResults] = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState('');

  const doSearch = async (q) => {
    if (!q || q.trim().length < 2) return;
    setLoading(true); setSearched(q);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?q=${encodeURIComponent(q)}&limit=24`);
      const data = await r.json();
      setResults(data.data?.results||[]);
      setTotal(data.data?.total||0);
    } catch { setResults([]); }
    setLoading(false);
  };

  useEffect(()=>{ if(q0) doSearch(q0); },[q0]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    doSearch(query.trim());
  };

  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;

  return (
    <div className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Search bar */}
      <div className="mb-10">
        <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"/>
            <input value={query} onChange={e=>setQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-4 border border-ink-200 rounded-2xl text-sm outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition-all"
              placeholder="Search diamonds, jewellery, gemstones, cert number…"/>
            {query && <button type="button" onClick={()=>setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"><X size={14}/></button>}
          </div>
          <button type="submit" className="btn-gold px-6">Search</button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-ink-700">
            {loading ? 'Searching…' : `${total} results for "${searched}"`}
          </h2>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_,i)=><div key={i} className="card animate-pulse h-64"/>)}
        </div>
      ) : results.length===0 && searched ? (
        <div className="card p-16 text-center">
          <Search size={40} className="mx-auto text-ink-200 mb-4"/>
          <p className="text-ink-500 mb-2">No results found for "{searched}"</p>
          <p className="text-sm text-ink-400 mb-6">Try a different search term — stone shape, carat weight, cert number, or metal type</p>
          {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi, I'm looking for: ${searched}`)}`} target="_blank" rel="noreferrer" className="btn-gold">Ask us on WhatsApp</a>}
        </div>
      ) : results.length>0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map(p=>{
            const type = TYPE_LABELS[p.inventory_type]||p.inventory_type;
            const base = TYPE_HREFS[p.inventory_type]||'/jewellery';
            const href = p.inventory_type==='JEWELLERY' ? `${base}/${p.slug||p.id}` : `${base}/${p.id}`;
            const msg  = encodeURIComponent(`Hi, I found this in search: ${p.name} — ${p.currency} ${Number(p.final_price||0).toLocaleString()}`);
            return (
              <div key={p.id} className="card overflow-hidden hover:shadow-md transition-all group">
                <div className="aspect-square bg-ink-50 overflow-hidden">
                  {p.thumb_url ? <img src={p.thumb_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  : <div className="w-full h-full flex items-center justify-center text-5xl">💎</div>}
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-semibold text-gold-600 uppercase tracking-wide">{type}</span>
                  <h3 className="text-sm font-medium text-ink-700 mt-1 mb-1 line-clamp-2">{p.name}</h3>
                  {p.carat && <p className="text-xs text-ink-400 mb-1">{Number(p.carat).toFixed(2)}ct {p.color} {p.clarity}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-ink-800">{p.currency} {Number(p.final_price||0).toLocaleString()}</span>
                    <div className="flex gap-1.5">
                      <Link href={href} className="text-[11px] px-2.5 py-1 rounded-lg border border-ink-200 text-ink-500 hover:border-gold-400 transition-colors">View</Link>
                      {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer" className="text-[11px] px-2.5 py-1 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors">💬</a>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Popular searches when empty */}
      {!searched && (
        <div className="text-center py-8">
          <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-4">Popular searches</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Round diamond 1ct','Oval engagement ring','Ruby necklace','Pearl bracelet','GIA certified','Emerald earrings','18K gold ring','Platinum solitaire'].map(s=>(
              <button key={s} onClick={()=>{ setQuery(s); router.push(`/search?q=${encodeURIComponent(s)}`); doSearch(s); }}
                className="px-4 py-2 rounded-full text-sm border border-ink-200 text-ink-500 hover:border-gold-400 hover:text-gold-600 transition-colors bg-white">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div className="pt-32 text-center text-ink-400">Loading…</div>}><SearchContent/></Suspense>;
}
