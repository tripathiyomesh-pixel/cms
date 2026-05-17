'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const DEFAULT_SLIDES = [
  { title:'Certified Natural Diamonds', subtitle:'GIA & IGI certified. Every stone graded for brilliance.', cta:'Search Diamonds', href:'/diamonds?type=NATURAL', bg:'from-ink-900 via-ink-800 to-ink-900', accent:'text-gold-400' },
  { title:'Lab-Grown Diamonds', subtitle:'Identical brilliance. 40% more accessible. IGI certified.', cta:'Explore Lab Diamonds', href:'/diamonds?type=LAB_GROWN', bg:'from-blue-950 via-blue-900 to-ink-900', accent:'text-blue-300' },
  { title:'Rare Coloured Gemstones', subtitle:'Burmese rubies, Kashmir sapphires, Colombian emeralds.', cta:'View Gemstones', href:'/gemstones', bg:'from-purple-950 via-purple-900 to-ink-900', accent:'text-purple-300' },
  { title:'Fine Jewellery', subtitle:'Handcrafted in 18K gold and platinum. Custom orders welcome.', cta:'Shop Jewellery', href:'/jewellery', bg:'from-amber-950 via-amber-900 to-ink-900', accent:'text-gold-300' },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const slides = DEFAULT_SLIDES;

  useEffect(()=>{
    const t = setInterval(()=> setCurrent(c=>(c+1)%slides.length), 5000);
    return ()=>clearInterval(t);
  },[]);

  const slide = slides[current];

  return (
    <div className={`relative min-h-[85vh] flex items-center bg-gradient-to-br ${slide.bg} transition-all duration-1000 overflow-hidden`}>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg width='80' height='92' viewBox='0 0 80 92' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='40,4 76,24 76,68 40,88 4,68 4,24' fill='none' stroke='%23c9a84c' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize:'80px 92px' }}/>

      {/* Glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gold-500 opacity-5 blur-3xl"/>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border mb-6 ${slide.accent} border-current border-opacity-30 bg-white bg-opacity-5`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"/>
            GCC Edition · Dubai
          </div>

          {/* Headline */}
          <h1 className="font-serif text-white text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4 animate-fade-in">
            {slide.title}
          </h1>

          <p className="text-ink-300 text-lg mb-8 leading-relaxed animate-fade-in">
            {slide.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 animate-fade-in">
            <Link href={slide.href} className="btn-gold text-base px-8 py-4">
              {slide.cta} <ChevronRight size={16}/>
            </Link>
            <Link href="/appointment" className="btn-outline-gold text-base px-8 py-4 border-white text-white hover:bg-white hover:text-ink-800">
              Book Appointment
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-16 pt-10 border-t border-white/10">
            {[['10,000+','Certified stones'],['GIA / IGI','Certified labs'],['Custom','Jewellery orders']].map(([n,l])=>(
              <div key={l}>
                <div className="text-2xl font-semibold text-white">{n}</div>
                <div className="text-xs text-ink-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_,i)=>(
          <button key={i} onClick={()=>setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i===current?'w-8 bg-gold-400':'w-1.5 bg-white/30'}`}/>
        ))}
      </div>
    </div>
  );
}
