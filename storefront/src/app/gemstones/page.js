'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { gemstoneAPI } from '@/lib/api';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

const TYPES = ['Ruby','Sapphire','Emerald','Tanzanite','Alexandrite','Aquamarine','Tourmaline','Spinel','Garnet','Opal','Other'];
const TYPE_COLORS = { Ruby:'bg-red-50 text-red-700', Sapphire:'bg-blue-50 text-blue-700', Emerald:'bg-green-50 text-green-700', Tanzanite:'bg-purple-50 text-purple-700', default:'bg-ink-50 text-ink-600' };

function GemstonesContent() {
  const searchParams = useSearchParams();
  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type')||'');

  useEffect(()=>{
    setLoading(true);
    gemstoneAPI.search({ gemstone_type:typeFilter||undefined, limit:48 })
      .then(r=>{ setItems(r.data.data?.data||[]); setTotal(r.data.data?.total||0); })
      .catch(()=>setItems([]))
      .finally(()=>setLoading(false));
  },[typeFilter]);

  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8"><h1 className="font-serif text-3xl lg:text-4xl text-ink-800 mb-2">Coloured Gemstones</h1><p className="text-ink-400">{total} stones — certified rubies, sapphires, emeralds and more</p></div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={()=>setTypeFilter('')} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${typeFilter===''?'bg-gold-500 border-gold-500 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>All</button>
        {TYPES.map(t=>(
          <button key={t} onClick={()=>setTypeFilter(typeFilter===t?'':t)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${typeFilter===t?'bg-gold-500 border-gold-500 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array(8).fill(0).map((_,i)=><div key={i} className="card animate-pulse h-64"/>)}</div>
      ) : items.length===0 ? (
        <div className="card p-16 text-center"><p className="text-4xl mb-4">💜</p><p className="text-ink-500">No gemstones found</p></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(g=>{
            const tc = TYPE_COLORS[g.gemstone_type] || TYPE_COLORS.default;
            const msg = encodeURIComponent(`Hi Tejori, I am interested in ${g.name||g.gemstone_type} ${g.carat?Number(g.carat).toFixed(2)+'ct':''} | ${g.currency||'USD'} ${Number(g.final_price||0).toLocaleString()}`);
            return (
              <div key={g.id} className="card overflow-hidden hover:shadow-md transition-all group">
                <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-5xl">
                  {g.thumb_url ? <img src={g.thumb_url} alt={g.name} className="w-full h-full object-cover"/> : '💜'}
                </div>
                <div className="p-4">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tc} mb-2 inline-block`}>{g.gemstone_type}</span>
                  <h3 className="text-sm font-medium text-ink-700 mb-1 line-clamp-2">{g.name||`${g.gemstone_type} ${g.carat?Number(g.carat).toFixed(2)+'ct':''}`}</h3>
                  {g.country_of_origin && <p className="text-xs text-ink-400 mb-1">{g.country_of_origin}</p>}
                  {g.treatment && <p className="text-xs text-ink-400">{g.is_treated?'Treated':'No heat'} · {g.treatment}</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
                    <span className="text-sm font-bold text-ink-800">{g.currency||'USD'} {Number(g.final_price||0).toLocaleString()}</span>
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

export default function GemstonesPage() {
  return <Suspense fallback={<div className="pt-32 text-center text-ink-400">Loading…</div>}><GemstonesContent/></Suspense>;
}
