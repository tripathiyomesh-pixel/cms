'use client';
import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function QuickView({ product: p, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = Array.isArray(p?.media) ? p.media.filter(m=>m?.file_url) : [];
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const hasDiscount = p?.compare_price && parseFloat(p.compare_price) > parseFloat(p.final_price);
  const discountPct = hasDiscount ? Math.round((1-parseFloat(p.final_price)/parseFloat(p.compare_price))*100) : 0;
  const msg = encodeURIComponent(`Hi, I'm interested in: ${p?.name} (${p?.sku}) — ${p?.currency} ${Number(p?.final_price||0).toLocaleString()}`);

  useEffect(()=>{
    document.body.style.overflow='hidden';
    const fn = e => e.key==='Escape' && onClose();
    window.addEventListener('keydown',fn);
    return()=>{ document.body.style.overflow=''; window.removeEventListener('keydown',fn); };
  },[]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex" onClick={e=>e.stopPropagation()}>

        {/* Image side */}
        <div className="w-1/2 relative bg-ink-50 flex-shrink-0">
          {imgs.length ? (
            <>
              <img src={imgs[imgIdx].file_url} alt={p.name} className="w-full h-full object-cover"/>
              {imgs.length>1 && (
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
                  {imgs.map((_,i)=>(
                    <button key={i} onClick={()=>setImgIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i===imgIdx?'bg-ink-700 w-4':'bg-ink-300'}`}/>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">💍</div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {p.is_new && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ink-800 text-white">New</span>}
            {hasDiscount && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">-{discountPct}%</span>}
          </div>
        </div>

        {/* Content side */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col">
          <button onClick={onClose} className="self-end p-1.5 rounded-full hover:bg-ink-100 text-ink-400 mb-3"><X size={16}/></button>

          {p.metal_type && <p className="text-[10px] text-ink-400 uppercase tracking-widest mb-2">{p.metal_type.replace('_',' ')} {p.purity||''}</p>}
          <h2 className="font-serif text-xl text-ink-800 mb-1 leading-tight">{p.name}</h2>
          <p className="text-xs text-ink-400 font-mono mb-4">{p.sku}</p>

          {/* Price */}
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-ink-100">
            <span className="text-2xl font-bold text-ink-800">{p.currency} {Number(p.final_price||0).toLocaleString()}</span>
            {hasDiscount && (
              <div>
                <span className="text-sm text-ink-400 line-through block">{p.currency} {Number(p.compare_price).toLocaleString()}</span>
                <span className="text-xs font-bold text-red-500">Save {discountPct}%</span>
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="space-y-2 mb-5 flex-1">
            {[['Metal',p.metal_type?.replace('_',' ')],['Purity',p.purity],['Weight',p.gross_weight?`${p.gross_weight}g`:null],['Occasion',p.occasion],['Gender',p.gender]].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} className="flex justify-between text-xs py-1.5 border-b border-ink-50">
                <span className="text-ink-400">{k}</span>
                <span className="text-ink-600 font-medium capitalize">{v}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="space-y-2">
            {wapp && (
              <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-full transition-all text-sm w-full">
                <MessageCircle size={16}/> Enquire on WhatsApp
              </a>
            )}
            <Link href={`/jewellery/${p.slug||p.id}`} onClick={onClose}
              className="flex items-center justify-center gap-2 border border-ink-200 text-ink-600 hover:border-gold-400 hover:text-gold-600 font-medium py-2.5 rounded-full transition-all text-sm w-full">
              View full details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
