'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, Heart, Phone } from 'lucide-react';

const NAV = [
  { label:'Diamonds',   href:'/diamonds',  sub:[
    { label:'Natural Diamonds',   href:'/diamonds?type=NATURAL' },
    { label:'Lab-Grown Diamonds', href:'/diamonds?type=LAB_GROWN' },
    { label:'Diamond Jewellery',  href:'/jewellery?stone=diamond' },
  ]},
  { label:'Gemstones',  href:'/gemstones', sub:[
    { label:'Ruby',      href:'/gemstones?type=Ruby' },
    { label:'Sapphire',  href:'/gemstones?type=Sapphire' },
    { label:'Emerald',   href:'/gemstones?type=Emerald' },
    { label:'All Stones',href:'/gemstones' },
  ]},
  { label:'Pearls',     href:'/pearls',    sub:[
    { label:'South Sea', href:'/pearls?type=South+Sea' },
    { label:'Tahitian',  href:'/pearls?type=Tahitian' },
    { label:'Akoya',     href:'/pearls?type=Akoya' },
    { label:'Freshwater',href:'/pearls?type=Freshwater' },
  ]},
  { label:'Jewellery',  href:'/jewellery', sub:[
    { label:'Rings',         href:'/jewellery?category=rings' },
    { label:'Necklaces',     href:'/jewellery?category=necklaces' },
    { label:'Earrings',      href:'/jewellery?category=earrings' },
    { label:'Bracelets',     href:'/jewellery?category=bracelets' },
    { label:'Bridal Sets',   href:'/jewellery?category=bridal' },
  ]},
  { label:'Mountings',  href:'/mountings' },
  { label:'Custom',     href:'/custom' },
];

export default function Header() {
  const [open,   setOpen]   = useState(false);
  const [active, setActive] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(()=>{
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return ()=>window.removeEventListener('scroll', onScroll);
  },[]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled?'bg-white shadow-md':'bg-white/95 backdrop-blur-sm'}`}>
      {/* Top bar */}
      <div className="bg-ink-800 text-white text-center py-1.5 text-xs tracking-wide">
        Free shipping on orders above AED 500 · Certified Diamonds · GIA & IGI · WhatsApp us anytime
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.5"/>
                <polyline points="1,5 8,9 15,5" fill="none" stroke="#fff" strokeWidth="1"/>
                <line x1="8" y1="9" x2="8" y2="15" stroke="#fff" strokeWidth="1"/>
              </svg>
            </div>
            <span className="font-serif text-xl text-ink-800">
              {process.env.NEXT_PUBLIC_STORE_NAME || 'JewelCMS'}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(item=>(
              <div key={item.label} className="relative group"
                onMouseEnter={()=>setActive(item.label)}
                onMouseLeave={()=>setActive(null)}>
                <Link href={item.href}
                  className="px-4 py-2 text-sm font-medium text-ink-600 hover:text-gold-600 transition-colors rounded-lg hover:bg-gold-50 flex items-center gap-1">
                  {item.label}
                  {item.sub && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                </Link>

                {item.sub && active===item.label && (
                  <div className="absolute top-full left-0 pt-2 min-w-[180px]">
                    <div className="bg-white rounded-xl shadow-xl border border-ink-100 py-2 overflow-hidden">
                      {item.sub.map(s=>(
                        <Link key={s.label} href={s.href}
                          className="block px-4 py-2 text-sm text-ink-600 hover:bg-gold-50 hover:text-gold-700 transition-colors">
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`} target="_blank" rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-full transition-colors font-medium">
              <Phone size={12}/> WhatsApp
            </a>
            <Link href="/wishlist" className="p-2 rounded-full hover:bg-ink-50 text-ink-500 hover:text-gold-600 transition-colors">
              <Heart size={18}/>
            </Link>
            <button className="lg:hidden p-2 rounded-full hover:bg-ink-50 text-ink-500" onClick={()=>setOpen(!open)}>
              {open ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-ink-100 px-4 py-4 space-y-1">
          {NAV.map(item=>(
            <div key={item.label}>
              <Link href={item.href} onClick={()=>setOpen(false)}
                className="block py-2.5 text-sm font-medium text-ink-700 hover:text-gold-600 border-b border-ink-50 transition-colors">
                {item.label}
              </Link>
              {item.sub && (
                <div className="pl-4 py-1 space-y-1">
                  {item.sub.map(s=>(
                    <Link key={s.label} href={s.href} onClick={()=>setOpen(false)}
                      className="block py-1.5 text-xs text-ink-500 hover:text-gold-600">
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
