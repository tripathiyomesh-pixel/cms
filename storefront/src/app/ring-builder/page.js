'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, MessageCircle } from 'lucide-react';

function RingBuilderContent() {
  const [result, setResult]  = useState(null);
  const [loading, setLoading]= useState(false);

  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const total = result?.pricing?.total;
  const msg = result ? encodeURIComponent(
    `Hello, I'd like to build a ring:\n\nDiamond: ${result.diamond.shape} ${result.diamond.carat}ct ${result.diamond.color} ${result.diamond.clarity}\nSetting: ${result.mounting.name}\nTotal: ${result.pricing.currency} ${total?.toLocaleString()}\n\nPlease confirm and advise next steps.`
  ) : '';

  return (
    <div className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl lg:text-4xl text-ink-800 mb-3">Build Your Ring</h1>
        <p className="text-ink-400">Choose your perfect diamond, then choose your setting</p>
      </div>

      {/* Steps guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {[
          { n:'1', t:'Choose a diamond', d:'Browse certified natural or lab-grown diamonds. Filter by shape, carat, color, clarity and price.', href:'/diamonds', cta:'Browse diamonds' },
          { n:'2', t:'Choose a setting', d:'Pick from our mounting catalogue — solitaire, halo, pave, bezel. Each shows compatible stone sizes.', href:'/mountings', cta:'Browse mountings' },
          { n:'3', t:'Enquire on WhatsApp', d:'Once you have selected both, WhatsApp us with the details. We will confirm pricing and place the order.', href:null, cta:null },
        ].map((s,i)=>(
          <div key={s.n} className="card p-6 text-center">
            <div className="w-10 h-10 bg-gold-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">{s.n}</div>
            <h3 className="font-semibold text-ink-700 mb-2">{s.t}</h3>
            <p className="text-xs text-ink-400 mb-4 leading-relaxed">{s.d}</p>
            {s.href && <Link href={s.href} className="btn-outline-gold text-xs px-4 py-2">{s.cta} →</Link>}
          </div>
        ))}
      </div>

      {/* Quick enquiry */}
      <div className="card p-8 text-center border-gold-200 bg-gold-50">
        <h2 className="font-serif text-xl text-ink-800 mb-3">Ready to build your ring?</h2>
        <p className="text-sm text-ink-500 mb-6">Tell us the diamond you liked and the setting style you want. Our team will create a custom quote within 2 hours.</p>
        {wapp && (
          <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${encodeURIComponent('Hello, I would like to build a custom ring. Please help me choose a diamond and setting.')}`}
            target="_blank" rel="noreferrer" className="btn-gold px-8 py-4 text-base">
            <MessageCircle size={18}/> Start on WhatsApp
          </a>
        )}
        <p className="text-xs text-ink-400 mt-3">Or <Link href="/custom" className="text-gold-600 hover:underline">submit a detailed custom request</Link></p>
      </div>
    </div>
  );
}

export default function RingBuilderPage() {
  return <Suspense fallback={<div className="pt-32 text-center text-ink-400">Loading…</div>}><RingBuilderContent/></Suspense>;
}
