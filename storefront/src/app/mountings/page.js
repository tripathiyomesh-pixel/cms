'use client';
import { useEffect, useState } from 'react';
import { mountingAPI } from '@/lib/api';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function MountingsPage() {
  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    mountingAPI.search({ limit:48 }).then(r=>{ setItems(r.data.data?.data||[]); setTotal(r.data.data?.total||0); }).catch(()=>setItems([])).finally(()=>setLoading(false));
  },[]);

  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl text-ink-800 mb-2">Mountings</h1>
        <p className="text-ink-400 mb-4">{total} settings — solitaire, halo, pave and more. Pair with your chosen diamond or gemstone.</p>
        <div className="bg-gold-50 border border-gold-200 rounded-2xl p-4 text-sm text-gold-700">
          💡 <strong>How it works:</strong> Choose a mounting from our catalogue, then select your centre stone (natural or lab-grown diamond, coloured gemstone). WhatsApp us to discuss pricing and customisation.
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array(8).fill(0).map((_,i)=><div key={i} className="card animate-pulse h-72"/>)}</div>
      ) : items.length===0 ? (
        <div className="card p-16 text-center"><p className="text-4xl mb-4">⚙️</p><p className="text-ink-500">No mountings in catalogue yet</p></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(m=>{
            const msg = encodeURIComponent(`Hi Tejori, I am interested in the mounting: ${m.name} (${m.sku}). Please share pricing and availability.`);
            return (
              <div key={m.id} className="card overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-square bg-ink-50 flex items-center justify-center text-5xl">{m.thumb_url?<img src={m.thumb_url} alt={m.name} className="w-full h-full object-cover"/>:'⚙️'}</div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {m.mounting_type && <span className="text-[10px] bg-ink-100 text-ink-500 px-2 py-0.5 rounded-full">{m.mounting_type}</span>}
                    {m.category && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{m.category}</span>}
                  </div>
                  <h3 className="text-sm font-medium text-ink-700 mb-1 line-clamp-2">{m.name}</h3>
                  {m.min_carat && <p className="text-xs text-ink-400 mb-1">Fits {m.min_carat}–{m.max_carat}ct stones</p>}
                  {m.production_days && <p className="text-xs text-ink-400">Production: {m.production_days} days</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
                    <span className="text-sm font-bold text-ink-800">{m.final_price?`${m.currency} ${Number(m.final_price).toLocaleString()}`:'On request'}</span>
                    {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full hover:bg-green-100 transition-colors"><MessageCircle size={11}/>Enquire</a>}
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
