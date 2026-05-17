'use client';
import { useEffect, useState } from 'react';
import ImageGallery from '@/components/ui/ImageGallery';
import WhatsAppEnquiry from '@/components/ui/WhatsAppEnquiry';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function MountingDetailPage({ params }) {
  const [mounting, setMounting] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/mountings/${params.id}`)
      .then(r=>r.json()).then(r=>setMounting(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, [params.id]);

  if (loading) return <div className="pt-32 text-center py-20 text-ink-400">Loading…</div>;
  if (!mounting) return <div className="pt-32 text-center py-20"><p className="text-ink-500">Not found</p><Link href="/mountings" className="btn-gold mt-4 inline-block">Back</Link></div>;

  const imgs = Array.isArray(mounting.media) ? mounting.media.filter(m=>m?.file_url) : [];
  const metalOptions = typeof mounting.metal_options==='string' ? JSON.parse(mounting.metal_options||'[]') : (mounting.metal_options||[]);
  const compatShapes = typeof mounting.compatible_shapes==='string' ? JSON.parse(mounting.compatible_shapes||'[]') : (mounting.compatible_shapes||[]);
  const msg = encodeURIComponent(`Hello, I'm interested in the mounting: ${mounting.name} (${mounting.sku}). I'd like to discuss stone options and pricing.`);
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;

  return (
    <div className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/mountings" className="flex items-center gap-2 text-sm text-ink-400 hover:text-gold-600 mb-6"><ArrowLeft size={14}/>Back to mountings</Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          {imgs.length ? <ImageGallery images={imgs} alt={mounting.name}/> : (
            <div className="aspect-square bg-gradient-to-br from-ink-50 to-ink-100 rounded-2xl flex items-center justify-center text-8xl">⚙️</div>
          )}
        </div>
        <div>
          <div className="flex gap-2 mb-3">
            {mounting.mounting_type && <span className="badge bg-ink-100 text-ink-600">{mounting.mounting_type}</span>}
            {mounting.category && <span className="badge bg-blue-100 text-blue-700">{mounting.category}</span>}
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl text-ink-800 mb-2">{mounting.name}</h1>
          <p className="text-xs text-ink-400 font-mono mb-4">SKU: {mounting.sku}</p>
          <div className="text-3xl font-bold text-ink-800 mb-6 pb-6 border-b border-ink-100">
            {mounting.final_price ? `${mounting.currency} ${Number(mounting.final_price).toLocaleString()}` : 'Price on request'}
            <p className="text-xs text-ink-400 font-normal mt-1">Setting only — stone not included</p>
          </div>

          {metalOptions.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3">Available metals</p>
              <div className="space-y-2">
                {metalOptions.map((m,i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-ink-50 rounded-xl text-sm">
                    <span className="text-ink-600 font-medium">{m.metal}</span>
                    {m.price_add > 0 && <span className="text-ink-400 text-xs">+{mounting.currency} {Number(m.price_add).toLocaleString()}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3">Specifications</p>
            <div className="grid grid-cols-2 gap-2">
              {[['Style',mounting.style],['Shank',mounting.shank_style],['Head type',mounting.head_type],
                ['Compatible stones',compatShapes.join(', ')],
                ['Stone carat range',mounting.min_carat&&mounting.max_carat?`${mounting.min_carat}–${mounting.max_carat}ct`:null],
                ['Casting weight',mounting.casting_weight?`${mounting.casting_weight}g`:null],
                ['Production time',mounting.production_days?`${mounting.production_days} days`:null],
              ].filter(([,v])=>v).map(([k,v])=>(
                <div key={k} className="bg-ink-50 rounded-xl p-3">
                  <div className="text-xs text-ink-400 mb-0.5">{k}</div>
                  <div className="text-sm font-medium text-ink-700">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all w-full"><svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.524 5.854L.057 23.215a.75.75 0 00.918.924l5.492-1.437A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.596-.504-5.088-1.383l-.364-.215-3.76.985.998-3.653-.235-.376A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>Enquire about this mounting</a>}
            <Link href="/custom" className="btn-outline-gold w-full justify-center py-3 text-sm flex items-center gap-2"><ChevronRight size={14}/>Use this mounting in a custom order</Link>
          </div>

          {/* Compatible diamonds */}
          {mounting.compatible_diamonds?.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3">Compatible diamonds in our inventory</p>
              <div className="space-y-2">
                {mounting.compatible_diamonds.map(d=>(
                  <Link key={d.id} href={`/diamonds/${d.id}`} className="flex items-center justify-between p-3 bg-ink-50 rounded-xl hover:bg-gold-50 hover:border-gold-200 border border-transparent transition-all">
                    <div>
                      <p className="text-sm font-medium text-ink-700">{d.shape} {d.carat?Number(d.carat).toFixed(2)+'ct':''} {d.color} {d.clarity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gold-600">{d.currency} {Number(d.final_price||0).toLocaleString()}</p>
                      <p className="text-xs text-ink-400">View →</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
