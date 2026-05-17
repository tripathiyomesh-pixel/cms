'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { sfAPI } from '@/lib/api';
import Link from 'next/link';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const CATS = ['rings','necklaces','earrings','bracelets','bridal','pendants','bangles'];
const METALS = ['gold','silver','platinum','rose_gold','white_gold'];
const OCCASIONS = ['engagement','bridal','daily','gifting','anniversary','party'];

function JewelleryContent() {
  const searchParams = useSearchParams();
  const [items, setItems]    = useState([]);
  const [total, setTotal]    = useState(0);
  const [page,  setPage]     = useState(1);
  const [loading, setLoading]= useState(true);
  const [filters, setFilters]= useState({ category:searchParams.get('category')||'', metal_type:searchParams.get('metal')||'', stone:searchParams.get('stone')||'' });
  const limit = 24;
  const set = (k,v)=>setFilters(f=>({...f,[k]:v}));

  useEffect(()=>{
    setLoading(true);
    sfAPI.products({ inventory_type:'JEWELLERY', status:'active', page, limit, ...Object.fromEntries(Object.entries(filters).filter(([,v])=>v)) })
      .then(r=>{ setItems(r.data.data||[]); setTotal(r.data.pagination?.total||r.data.total||0); })
      .catch(()=>setItems([]))
      .finally(()=>setLoading(false));
  },[filters,page]);

  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const totalPages = Math.ceil(total/limit);

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8"><h1 className="font-serif text-3xl lg:text-4xl text-ink-800 mb-2">Fine Jewellery</h1><p className="text-ink-400">{total} pieces — rings, necklaces, earrings and more</p></div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={()=>set('category','')} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all capitalize ${!filters.category?'bg-gold-500 border-gold-500 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>All</button>
        {CATS.map(c=><button key={c} onClick={()=>set('category',filters.category===c?'':c)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all capitalize ${filters.category===c?'bg-gold-500 border-gold-500 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>{c}</button>)}
      </div>

      {/* Metal filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {METALS.map(m=><button key={m} onClick={()=>set('metal_type',filters.metal_type===m?'':m)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${filters.metal_type===m?'bg-gold-500 border-gold-500 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>{m.replace('_',' ')}</button>)}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array(8).fill(0).map((_,i)=><div key={i} className="card animate-pulse h-72"/>)}</div>
      ) : items.length===0 ? (
        <div className="card p-16 text-center"><p className="text-4xl mb-4">💍</p><p className="text-ink-500">No jewellery found</p></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(p=>{
            const img = p.media?.[0]?.file_url || p.thumb_url;
            const msg = encodeURIComponent(`Hi, I'm interested in: ${p.name} (${p.sku}) — ${p.currency} ${Number(p.final_price||0).toLocaleString()}`);
            return (
              <div key={p.id} className="card overflow-hidden hover:shadow-md transition-all group">
                <div className="relative aspect-square overflow-hidden bg-ink-50">
                  {img ? <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/> : <div className="w-full h-full flex items-center justify-center text-5xl">💍</div>}
                </div>
                <div className="p-4">
                  {p.metal_type && <p className="text-[10px] text-ink-400 uppercase tracking-wide mb-1">{p.metal_type.replace('_',' ')} {p.purity}</p>}
                  <h3 className="text-sm font-medium text-ink-700 mb-3 line-clamp-2">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink-800">{p.currency} {Number(p.final_price||0).toLocaleString()}</span>
                    <div className="flex gap-1.5">
                      <Link href={`/jewellery/${p.slug||p.id}`} className="text-[11px] px-2.5 py-1 rounded-full border border-ink-200 text-ink-500 hover:border-gold-400 hover:text-gold-600 transition-colors">View</Link>
                      {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer" className="text-[11px] px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors"><MessageCircle size={11}/></a>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages>1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button onClick={()=>setPage(p=>p-1)} disabled={page===1} className="p-2 rounded-full border border-ink-200 disabled:opacity-30 hover:border-gold-400"><ChevronLeft size={16}/></button>
          <span className="self-center text-sm text-ink-500">Page {page} of {totalPages}</span>
          <button onClick={()=>setPage(p=>p+1)} disabled={page>=totalPages} className="p-2 rounded-full border border-ink-200 disabled:opacity-30 hover:border-gold-400"><ChevronRight size={16}/></button>
        </div>
      )}
    </div>
  );
}

export default function JewelleryPage() {
  return <Suspense fallback={<div className="pt-32 text-center text-ink-400">Loading…</div>}><JewelleryContent/></Suspense>;
}
