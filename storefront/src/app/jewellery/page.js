'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { sfAPI } from '@/lib/api';
import Link from 'next/link';
import { MessageCircle, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import QuickView from '@/components/ui/QuickView';

const CATS    = ['rings','necklaces','earrings','bracelets','bridal','pendants','bangles','sets'];
const METALS  = ['gold','silver','platinum','rose_gold','white_gold'];
const SORTS   = [['newest','Newest'],['price_asc','Price: Low to High'],['price_desc','Price: High to Low'],['featured','Featured']];

function JewelleryContent() {
  const sp = useSearchParams();
  const [items,   setItems]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [quickView, setQuickView] = useState(null);
  const [filters, setFilters] = useState({
    category:   sp.get('category')||'',
    metal_type: sp.get('metal')||'',
    stone:      sp.get('stone')||'',
    sort:       'newest',
    min_price:  '',
    max_price:  '',
  });
  const limit = 24;
  const set = (k,v) => { setFilters(f=>({...f,[k]:v})); setPage(1); };

  useEffect(()=>{
    setLoading(true);
    const params = { inventory_type:'JEWELLERY', status:'active', page, limit,
      ...Object.fromEntries(Object.entries(filters).filter(([,v])=>v)) };
    sfAPI.products(params)
      .then(r=>{ setItems(r.data.data||[]); setTotal(r.data.pagination?.total||r.data.total||0); })
      .catch(()=>setItems([]))
      .finally(()=>setLoading(false));
  },[filters,page]);

  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const totalPages = Math.ceil(total/limit);

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl text-ink-800 mb-2">Fine Jewellery</h1>
        <p className="text-ink-400">{total} pieces — rings, necklaces, earrings and more</p>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button onClick={()=>set('category','')} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all capitalize ${!filters.category?'bg-ink-800 border-ink-800 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>All</button>
        {CATS.map(c=><button key={c} onClick={()=>set('category',filters.category===c?'':c)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all capitalize ${filters.category===c?'bg-ink-800 border-ink-800 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>{c}</button>)}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        {/* Metal filter */}
        <div className="flex flex-wrap gap-2">
          {METALS.map(m=><button key={m} onClick={()=>set('metal_type',filters.metal_type===m?'':m)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${filters.metal_type===m?'bg-gold-500 border-gold-500 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>{m.replace('_',' ')}</button>)}
        </div>
        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-ink-400"/>
          <select value={filters.sort} onChange={e=>set('sort',e.target.value)}
            className="text-xs border border-ink-200 rounded-lg px-3 py-1.5 outline-none focus:border-gold-400 bg-white text-ink-600">
            {SORTS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_,i)=><div key={i} className="card animate-pulse h-72"/>)}
        </div>
      ) : items.length===0 ? (
        <div className="card p-16 text-center"><p className="text-4xl mb-4">💍</p><p className="text-ink-500">No jewellery found</p></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(p=>{
            const hasDiscount = p.compare_price && parseFloat(p.compare_price) > parseFloat(p.final_price);
            const discountPct = hasDiscount ? Math.round((1 - parseFloat(p.final_price)/parseFloat(p.compare_price))*100) : 0;
            const msg = encodeURIComponent(`Hi, I'm interested in: ${p.name} (${p.sku}) — ${p.currency} ${Number(p.final_price||0).toLocaleString()}`);
            return (
              <div key={p.id} className="card overflow-hidden hover:shadow-lg transition-all duration-300 group relative">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-ink-50">
                  {p.thumb_url
                    ? <img src={p.thumb_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    : <div className="w-full h-full flex items-center justify-center text-5xl">💍</div>}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {p.is_new && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ink-800 text-white">New</span>}
                    {hasDiscount && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">-{discountPct}%</span>}
                    {p.is_featured && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500 text-white">Featured</span>}
                  </div>

                  {/* Quick view on hover */}
                  <button onClick={()=>setQuickView(p)}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] bg-white/90 backdrop-blur-sm text-ink-700 px-4 py-1.5 rounded-full font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap hover:bg-white shadow-md">
                    Quick view
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  {p.metal_type && <p className="text-[10px] text-ink-400 uppercase tracking-wide mb-1">{p.metal_type.replace('_',' ')} {p.purity||''}</p>}
                  <h3 className="text-sm font-medium text-ink-700 mb-2 line-clamp-2 leading-tight">{p.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-ink-800">{p.currency} {Number(p.final_price||0).toLocaleString()}</span>
                    {hasDiscount && <span className="text-xs text-ink-400 line-through">{p.currency} {Number(p.compare_price).toLocaleString()}</span>}
                  </div>
                  <div className="flex gap-1.5">
                    <Link href={`/jewellery/${p.slug||p.id}`} className="flex-1 text-center text-[11px] py-1.5 rounded-lg border border-ink-200 text-ink-500 hover:border-gold-400 hover:text-gold-600 transition-colors">View</Link>
                    {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors"><MessageCircle size={11}/></a>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages>1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button onClick={()=>setPage(p=>p-1)} disabled={page===1} className="p-2.5 rounded-full border border-ink-200 disabled:opacity-30 hover:border-gold-400 transition-colors"><ChevronLeft size={16}/></button>
          <span className="text-sm text-ink-500">Page {page} of {totalPages}</span>
          <button onClick={()=>setPage(p=>p+1)} disabled={page>=totalPages} className="p-2.5 rounded-full border border-ink-200 disabled:opacity-30 hover:border-gold-400 transition-colors"><ChevronRight size={16}/></button>
        </div>
      )}

      {/* Quick view modal */}
      {quickView && <QuickView product={quickView} onClose={()=>setQuickView(null)}/>}
    </div>
  );
}

export default function JewelleryPage() {
  return <Suspense fallback={<div className="pt-32 text-center text-ink-400">Loading…</div>}><JewelleryContent/></Suspense>;
}
