'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const DEFAULT_SLIDES = [
  { headline:'Frost Yourself',       subtext:'Dazzling pear and marquise diamonds, sculpted to mirror wild beauty.',    cta:'Discover the selection', link:'/jewellery?collection=frost',   image:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80', label:'New Collection' },
  { headline:'Classics Collection',  subtext:'Timeless and elegant jewellery that never goes out of style.',             cta:'Explore Classics',        link:'/jewellery?collection=classics', image:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=1800&q=80', label:'Timeless' },
  { headline:'The Circle of Life',   subtext:'Our newest and most technologically advanced collection.',                  cta:'View Collection',          link:'/jewellery?collection=circle',  image:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1800&q=80', label:'Exclusive' },
];

export default function HeroSlider({ config = {} }) {
  const {
    slide_transition = 'fade',
    hero_overlay     = '60',
    slides           = DEFAULT_SLIDES,
  } = config;

  const [cur,      setCur]      = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('next');

  const go = useCallback((dir) => {
    if (animating) return;
    setAnimating(true);
    setDirection(dir > 0 ? 'next' : 'prev');
    setTimeout(() => {
      setCur(c => (c + dir + slides.length) % slides.length);
      setAnimating(false);
    }, 400);
  }, [animating, slides.length]);

  useEffect(() => {
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [go]);

  const s = slides[cur];
  const overlay = parseInt(hero_overlay) / 100;

  const transitions = {
    fade:  { entering:'opacity-0', active:'opacity-100 transition-opacity duration-700' },
    slide: { entering: direction==='next'?'translate-x-full':'-translate-x-full', active:'translate-x-0 transition-transform duration-500' },
    zoom:  { entering:'scale-110 opacity-0', active:'scale-100 opacity-100 transition-all duration-700' },
  };

  return (
    <div className="relative overflow-hidden" style={{ height:'clamp(500px,80vh,900px)' }}>
      {/* Slides */}
      {slides.map((slide, i) => (
        <div key={i} className={`absolute inset-0 transition-all duration-700 ${i===cur?'opacity-100 z-10':'opacity-0 z-0'}`}>
          <img src={slide.image} alt={slide.headline} className="w-full h-full object-cover"/>
          <div className="absolute inset-0" style={{ background:`rgba(0,0,0,${overlay})` }}/>
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-screen-xl mx-auto px-8 lg:px-16 w-full">
          <div style={{ maxWidth:640 }}>
            <p className={`transition-all duration-500 ${animating?'opacity-0 translate-y-4':'opacity-100 translate-y-0'}`}
              style={{ fontSize:10,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'#b8860b',marginBottom:16 }}>
              {s.label}
            </p>
            <h1 className={`transition-all duration-500 delay-100 ${animating?'opacity-0 translate-y-4':'opacity-100 translate-y-0'}`}
              style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'clamp(48px,7vw,88px)',fontWeight:300,color:'#fff',lineHeight:1,marginBottom:20 }}>
              {s.headline}
            </h1>
            <p className={`transition-all duration-500 delay-200 ${animating?'opacity-0 translate-y-4':'opacity-100 translate-y-0'}`}
              style={{ fontSize:'clamp(14px,1.5vw,18px)',color:'rgba(255,255,255,0.7)',maxWidth:440,lineHeight:1.7,marginBottom:36 }}>
              {s.subtext}
            </p>
            <Link href={s.link}
              className={`transition-all duration-500 delay-300 ${animating?'opacity-0':'opacity-100'}`}
              style={{ fontSize:11,fontWeight:500,letterSpacing:'0.18em',textTransform:'uppercase',color:'#fff',borderBottom:'1px solid rgba(255,255,255,0.5)',paddingBottom:3,display:'inline-flex',alignItems:'center',gap:8 }}>
              {s.cta} <ChevronRight size={14}/>
            </Link>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button onClick={() => go(-1)} className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-all"><ChevronLeft size={18} color="white"/></button>
      <button onClick={() => go(1)}  className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-all"><ChevronRight size={18} color="white"/></button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_,i) => (
          <button key={i} onClick={() => { setDirection('next'); setCur(i); }}
            className="transition-all duration-300"
            style={{ height:2, width: i===cur?32:12, background: i===cur?'#fff':'rgba(255,255,255,0.4)' }}/>
        ))}
      </div>

      {/* Progress line */}
      <div className="absolute bottom-0 left-0 z-30 h-0.5 bg-gold-500" style={{ width:`${((cur+1)/slides.length)*100}%`, transition:'width .5s ease' }}/>
    </div>
  );
}
