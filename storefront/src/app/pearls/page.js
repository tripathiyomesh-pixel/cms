'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { pearlAPI } from '@/lib/api';
import { MessageCircle } from 'lucide-react';

const TYPES = ['Akoya','South Sea','Tahitian','Freshwater'];

function PearlsContent() {
  const searchParams = useSearchParams();
  const [items, setItems]    = useState([]);
  const [total, setTotal]    = useState(0);
  const [loading, setLoading]= useState(true);
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type')||'');

  useEffect(()=>{
    setLoading(true);
    pearlAPI.search({ pearl_type:typeFilter||undefined, limit:48 })
      .then(r=>{ setItems(r.data.data?.data||[]); setTotal(r.data.data?.total||0); })
      .catch(()=>setItems([]))
      .finally(()=>setLoading(false));
  },[typeFilter]);

  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8"><h1 className="font-serif text-3xl lg:text-4xl text-ink-800 mb-2">Pearls</h1><p className="text-ink-400">{total} pearls — South Sea, Tahitian, Akoya and Freshwater</p></div>
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={()=>setTypeFilter('')} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${!typeFilter?'bg-gold-500 border-gold-500 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>All</button>
        {TYPES.map(t=><button key={t} onClick={()=>setTypeFilter(typeFilter===t?'':t)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${typeFilter===t?'bg-gold-500 border-gold-500 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>{t}</button>)}
      </div>
      {loading ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array(8).fill(0).map((_,i)=><div key={i} className="card animate-pulse h-64"/>)}</div>
      : items.length===0 ? <div className="card p-16 text-center"><p className="text-4xl mb-4">🤍</p><p className="text-ink-500">No pearls found</p></div>
      : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(p=>{
            const msg = encodeURIComponent(`Hi Tejori, I am interested in ${p.name} | ${p.currency} ${Number(p.final_price||0).toLocaleString()}`);
            return (
              <div key={p.id} className="card overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-square bg-gradient-to-br from-pink-50 to-white flex items-center justify-center text-5xl">{p.thumb_url?<img src={p.thumb_url} alt={p.name} className="w-full h-full object-cover"/>:'🤍'}</div>
                <div className="p-4">
                  <span className="text-[10px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full font-medium mb-2 inline-block">{p.pearl_type}</span>
                  <h3 className="text-sm font-medium text-ink-700 mb-1 line-clamp-2">{p.name}</h3>
                  {p.size_mm_min && <p className="text-xs text-ink-400">{p.size_mm_min}–{p.size_mm_max}mm · {p.shape}</p>}
                  {p.luster && <p className="text-xs text-ink-400">Luster: {p.luster}</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
                    <span className="text-sm font-bold text-ink-800">{p.currency} {Number(p.final_price||0).toLocaleString()}</span>
                    {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-700"><MessageCircle size={16}/></a>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PearlsPage() {
  return <Suspense fallback={<div className="pt-32 text-center text-ink-400">Loading…</div>}><PearlsContent/></Suspense>;
}
