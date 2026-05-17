'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sfAPI } from '@/lib/api';
import { MapPin, Phone, Calendar, ChevronRight } from 'lucide-react';

export default function AboutPage() {
  const [locations, setLocations] = useState([]);
  useEffect(()=>{
    sfAPI.store().then(r=>setLocations(r.data.data?.locations||[])).catch(()=>{});
  },[]);

  return (
    <div className="pt-24">
      {/* Hero */}
      <div className="relative h-[55vh] min-h-[420px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80" alt="Our boutique" className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10"/>
        <div className="absolute bottom-0 left-0 right-0 p-10 max-w-5xl mx-auto">
          <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-3">La Maison</p>
          <h1 className="font-serif text-4xl lg:text-6xl text-white leading-tight">Timeless Craftsmanship,<br/><em className="italic">Endless Brilliance.</em></h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Brand story */}
        <div className="py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-b border-ink-100">
          <div>
            <p className="text-xs text-gold-600 font-semibold uppercase tracking-widest mb-4">Our Story</p>
            <h2 className="font-serif text-3xl text-ink-800 mb-6">A legacy spanning decades</h2>
            <div className="space-y-4 text-ink-500 text-base leading-relaxed">
              <p>Our story began in Dubai, when the founding family established their own jewellery business, laying the foundation for a legacy of excellence.</p>
              <p>Building on this heritage, we specialize in crafting bespoke jewellery that blends timeless elegance with modern artistry — from dazzling diamonds to exquisite coloured gemstones.</p>
              <p>From a single boutique, we have grown to serve discerning clients across the UAE and globally, with an unwavering commitment to quality, craftsmanship, and exceptional service.</p>
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=700&q=80" alt="Craftsmanship" className="rounded-2xl w-full object-cover aspect-square"/>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl">
              <p className="text-3xl font-bold text-gold-600 font-serif">60+</p>
              <p className="text-sm text-ink-400 mt-0.5">Years of heritage</p>
            </div>
          </div>
        </div>

        {/* Why choose us */}
        <div className="py-16 border-b border-ink-100">
          <div className="text-center mb-12">
            <p className="text-xs text-gold-600 font-semibold uppercase tracking-widest mb-3">Why choose us</p>
            <h2 className="font-serif text-3xl text-ink-800">The Difference</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { emoji:'🏆', title:'Authenticity Guaranteed', desc:'Every piece is handpicked and meticulously inspected. We guarantee the authenticity of every diamond and gemstone.' },
              { emoji:'💎', title:'Rare & Iconic Jewellery', desc:'Our rare pieces are not just timeless — they are a valuable investment. Each piece tells a unique story.' },
              { emoji:'✨', title:'Heritage of Craftsmanship', desc:'With a heritage spanning decades, we create masterpieces built to last a lifetime. GIA & IGI certified.' },
            ].map(c=>(
              <div key={c.title} className="text-center">
                <div className="text-4xl mb-4">{c.emoji}</div>
                <h3 className="font-serif text-xl text-ink-800 mb-3">{c.title}</h3>
                <p className="text-ink-400 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom jewellery process (Tejori style 4 steps) */}
        <div className="py-16 border-b border-ink-100">
          <div className="text-center mb-12">
            <p className="text-xs text-gold-600 font-semibold uppercase tracking-widest mb-3">Bespoke Service</p>
            <h2 className="font-serif text-3xl text-ink-800">Custom Jewellery Process</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { n:'01', title:'Personalisation', desc:'Share your design with us or discuss your thoughts with our jewellery experts.' },
              { n:'02', title:'Approval', desc:'Our designers create a 3D CAD of your piece, shared for your approval before production.' },
              { n:'03', title:'Production', desc:'Once approved, we send it to our factory to craft your bespoke piece with precision.' },
              { n:'04', title:'Delivery', desc:'Collect from our boutiques or have your piece shipped insured, anywhere in the world.' },
            ].map(s=>(
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 border-2 border-gold-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-serif text-gold-500 text-lg">{s.n}</span>
                </div>
                <h3 className="font-semibold text-ink-700 mb-2">{s.title}</h3>
                <p className="text-sm text-ink-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/custom" className="btn-gold px-10 py-4">Start your custom jewellery →</Link>
          </div>
        </div>

        {/* Boutique finder */}
        <div className="py-16">
          <div className="text-center mb-10">
            <p className="text-xs text-gold-600 font-semibold uppercase tracking-widest mb-3">Visit Us</p>
            <h2 className="font-serif text-3xl text-ink-800">Find a Boutique</h2>
            <p className="text-ink-400 mt-2">Multiple locations — never too far away</p>
          </div>

          {locations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map(loc=>(
                <div key={loc.id} className="card p-5 hover:shadow-md hover:border-gold-200 transition-all">
                  {loc.image_url && <img src={loc.image_url} alt={loc.name} className="w-full h-40 object-cover rounded-xl mb-4"/>}
                  <h3 className="font-semibold text-ink-700 mb-1">{loc.name}</h3>
                  {loc.area && <p className="text-xs text-gold-600 mb-2">{loc.area}</p>}
                  {loc.address && <p className="text-xs text-ink-400 mb-3 flex items-start gap-1.5"><MapPin size={11} className="flex-shrink-0 mt-0.5"/>{loc.address}</p>}
                  {loc.phone && <a href={`tel:${loc.phone}`} className="text-xs text-ink-500 hover:text-gold-600 flex items-center gap-1.5 mb-2"><Phone size={11}/>{loc.phone}</a>}
                  {loc.hours && <p className="text-xs text-ink-400">{loc.hours}</p>}
                  {loc.map_url && <a href={loc.map_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-2 block">Get directions →</a>}
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <MapPin size={32} className="mx-auto text-gold-300 mb-4"/>
              <p className="text-ink-500 mb-2">Dubai, UAE</p>
              <p className="text-sm text-ink-400">Contact us for boutique locations and directions</p>
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||''}`} target="_blank" rel="noreferrer" className="btn-gold mt-4 inline-flex">WhatsApp for directions</a>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="pb-16">
          <div className="bg-ink-900 rounded-3xl p-10 text-center">
            <h2 className="font-serif text-3xl text-white mb-4">Ready to Find Your Perfect Piece?</h2>
            <p className="text-ink-400 mb-8">Book a private appointment or browse our certified collection online.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/appointment" className="btn-gold px-8 py-4"><Calendar size={16}/>Book appointment</Link>
              <Link href="/jewellery" className="btn-outline-gold px-8 py-4 border-white text-white hover:bg-white hover:text-ink-800">Browse collection <ChevronRight size={16}/></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
