'use client';
import { useEffect, useState } from 'react';
import ImageGallery from '@/components/ui/ImageGallery';
import WhatsAppEnquiry from '@/components/ui/WhatsAppEnquiry';
import Link from 'next/link';
import { ArrowLeft, Shield, ExternalLink } from 'lucide-react';

export default function GemstoneDetailPage({ params }) {
  const [gem, setGem]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/gemstones/${params.id}`)
      .then(r=>r.json()).then(r=>setGem(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, [params.id]);

  if (loading) return <div className="pt-32 text-center py-20 text-ink-400">Loading…</div>;
  if (!gem) return <div className="pt-32 text-center py-20"><p className="text-ink-500">Not found</p><Link href="/gemstones" className="btn-gold mt-4 inline-block">Back</Link></div>;

  const imgs = Array.isArray(gem.media) ? gem.media.filter(m=>m?.file_url) : [];
  const TYPE_EMOJI = { Ruby:'🔴', Sapphire:'💙', Emerald:'💚', Tanzanite:'💜', default:'💎' };

  return (
    <div className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/gemstones" className="flex items-center gap-2 text-sm text-ink-400 hover:text-gold-600 mb-6"><ArrowLeft size={14}/>Back to gemstones</Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          {imgs.length ? <ImageGallery images={imgs} alt={gem.name}/> : (
            <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl flex items-center justify-center text-8xl">
              {TYPE_EMOJI[gem.gemstone_type]||TYPE_EMOJI.default}
            </div>
          )}
        </div>
        <div>
          <div className="flex gap-2 mb-3">
            <span className="badge bg-purple-100 text-purple-700">{gem.gemstone_type}</span>
            {gem.cert_lab && <span className="badge badge-cert">{gem.cert_lab} Certified</span>}
            {gem.is_treated === false && <span className="badge badge-green">No heat</span>}
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl text-ink-800 mb-2">{gem.name||`${gem.gemstone_type} ${gem.carat||''}ct`}</h1>
          <p className="text-xs text-ink-400 font-mono mb-4">SKU: {gem.sku}</p>
          <div className="text-3xl font-bold text-ink-800 mb-6 pb-6 border-b border-ink-100">
            {gem.currency} {Number(gem.final_price||0).toLocaleString()}
          </div>
          <div className="mb-6">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3">Stone details</p>
            <div className="grid grid-cols-2 gap-2">
              {[['Type',gem.gemstone_type],['Species',gem.species],['Variety',gem.variety],['Origin',gem.country_of_origin],['Shape',gem.shape],['Carat',gem.carat?Number(gem.carat).toFixed(2)+'ct':null],['Dimensions',gem.dimensions_mm],['Treatment',gem.treatment||'Not specified'],['Saturation',gem.saturation],['Tone',gem.tone],['Transparency',gem.transparency],['Lustre',gem.luster]].filter(([,v])=>v).map(([k,v])=>(
                <div key={k} className="bg-ink-50 rounded-xl p-3">
                  <div className="text-xs text-ink-400 mb-0.5">{k}</div>
                  <div className="text-sm font-medium text-ink-700">{v}</div>
                </div>
              ))}
            </div>
          </div>
          {gem.color_description && (
            <div className="mb-6 bg-purple-50 border border-purple-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-purple-700 mb-1">Colour description</p>
              <p className="text-sm text-purple-600">{gem.color_description}</p>
            </div>
          )}
          {gem.cert_number && (
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2"><Shield size={14} className="text-blue-600"/><p className="text-sm font-semibold text-blue-700">Certificate</p></div>
              <p className="text-xs text-blue-600 font-mono">{gem.cert_lab} {gem.cert_number}</p>
              {gem.cert_url && <a href={gem.cert_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"><ExternalLink size={10}/>View certificate</a>}
            </div>
          )}
          <div className="space-y-3">
            <WhatsAppEnquiry product={gem} className="w-full"/>
            <Link href="/appointment" className="btn-outline-gold w-full justify-center py-3 text-sm">Book appointment to view</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
