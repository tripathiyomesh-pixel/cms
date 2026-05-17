'use client';
import { useEffect, useState } from 'react';
import ImageGallery from '@/components/ui/ImageGallery';
import WhatsAppEnquiry from '@/components/ui/WhatsAppEnquiry';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PearlDetailPage({ params }) {
  const [pearl,   setPearl]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/pearls/${params.id}`)
      .then(r=>r.json()).then(r=>setPearl(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, [params.id]);

  if (loading) return <div className="pt-32 text-center py-20 text-ink-400">Loading…</div>;
  if (!pearl)  return <div className="pt-32 text-center py-20"><p className="text-ink-500">Not found</p><Link href="/pearls" className="btn-gold mt-4 inline-block">Back</Link></div>;

  const imgs = Array.isArray(pearl.media) ? pearl.media.filter(m=>m?.file_url) : [];

  return (
    <div className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/pearls" className="flex items-center gap-2 text-sm text-ink-400 hover:text-gold-600 mb-6"><ArrowLeft size={14}/>Back to pearls</Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          {imgs.length ? <ImageGallery images={imgs} alt={pearl.name}/> : (
            <div className="aspect-square bg-gradient-to-br from-pink-50 to-white rounded-2xl flex items-center justify-center text-8xl">🤍</div>
          )}
        </div>
        <div>
          <span className="badge bg-pink-100 text-pink-700 mb-3 inline-block">{pearl.pearl_type} Pearl</span>
          <h1 className="font-serif text-2xl lg:text-3xl text-ink-800 mb-2">{pearl.name}</h1>
          <p className="text-xs text-ink-400 font-mono mb-4">SKU: {pearl.sku}</p>
          <div className="text-3xl font-bold text-ink-800 mb-6 pb-6 border-b border-ink-100">
            {pearl.currency} {Number(pearl.final_price||0).toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[['Type',pearl.pearl_type],['Colour',pearl.pearl_color],['Overtone',pearl.overtone],['Shape',pearl.shape],
              ['Size',pearl.size_mm_min&&pearl.size_mm_max?`${pearl.size_mm_min}–${pearl.size_mm_max}mm`:null],
              ['Nacre quality',pearl.nacre_quality],['Lustre',pearl.luster],['Surface',pearl.surface],
              ['Grade',pearl.matching_grade],
              ['Strand',pearl.is_strand?`Yes — ${pearl.strand_length||''} (${pearl.num_pearls||'?'} pearls)`:'Loose pearl'],
            ].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} className="bg-ink-50 rounded-xl p-3">
                <div className="text-xs text-ink-400 mb-0.5">{k}</div>
                <div className="text-sm font-medium text-ink-700">{v}</div>
              </div>
            ))}
          </div>
          {pearl.cert_number && (
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-1">Certificate</p>
              <p className="text-xs text-blue-600 font-mono">{pearl.cert_lab} {pearl.cert_number}</p>
            </div>
          )}
          <div className="space-y-3">
            <WhatsAppEnquiry product={pearl} className="w-full"/>
            <Link href="/appointment" className="btn-outline-gold w-full justify-center py-3 text-sm">Book appointment</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
