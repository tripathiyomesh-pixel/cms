'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, Heart, Search, ShoppingBag, ChevronDown } from 'lucide-react';
import CurrencySwitcher from '@/components/ui/CurrencySwitcher';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

const NAV = [
  { label:'High Jewellery', href:'/jewellery?is_featured=true', sub:[
    { label:'Rings',          href:'/jewellery?category=rings' },
    { label:'Necklaces',      href:'/jewellery?category=necklaces' },
    { label:'Earrings',       href:'/jewellery?category=earrings' },
    { label:'Bracelets',      href:'/jewellery?category=bracelets' },
    { label:'Bridal Sets',    href:'/jewellery?category=bridal' },
    { label:'All Collections',href:'/jewellery?is_featured=true' },
  ]},
  { label:'Jewellery', href:'/jewellery' },
  { label:'Lab Grown', href:'/diamonds?type=LAB_GROWN', sub:[
    { label:'High Jewellery',    href:'/jewellery?type=lab' },
    { label:'Jewellery',         href:'/jewellery' },
    { label:'Certified Diamond', href:'/diamonds?type=LAB_GROWN' },
  ]},
  { label:'Customisation', href:'/custom' },
  { label:'News', href:'/blog' },
  { label:'Our Heritage', href:'/about', sub:[
    { label:'About Us',               href:'/about' },
    { label:'Craftsmanship & Expertise', href:'/about#craftsmanship' },
    { label:'Jewellery Care Guide',   href:'/blog?cat=care' },
    { label:'Boutique Finder',        href:'/boutiques' },
    { label:'Book Appointment',       href:'/appointment' },
    { label:'Exhibitions',            href:'/exhibitions' },
  ]},
];

export default function Header({ template, config }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu,   setOpenMenu]   = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query,      setQuery]      = useState('');
  const headerRef = useRef();

  const accent    = template?.colors?.accent    || '#c9a84c';
  const navBg     = template?.colors?.navBg     || '#fff';
  const textColor = template?.colors?.text      || '#1a1a1a';
  const topBarBg  = config?.theme_topbar_bg     || template?.nav?.topBarBg  || '#1a1a1a';
  const topBarText= template?.nav?.topBarText   || '#fff';
  const topBarTxt = config?.theme_topbar_text   || 'Free shipping on orders above AED 500 · GIA & IGI Certified';
  const showTopBar= config?.theme_nav_topbar !== 'false' && template?.nav?.topBar !== false;
  const heading   = template?.fonts?.heading    || "'Playfair Display', Georgia, serif";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) window.location = `/search?q=${encodeURIComponent(query.trim())}`;
  };

  return (
    <header ref={headerRef} style={{ position:'sticky', top:0, zIndex:200, fontFamily: template?.fonts?.body }}>
      {/* Announcement bar */}
      {showTopBar && (
        <div style={{ background: topBarBg, color: topBarText, fontSize:11, fontWeight:500, letterSpacing:'0.08em', textAlign:'center', padding:'7px 16px' }}>
          {topBarTxt}
        </div>
      )}

      {/* Main nav */}
      <div style={{
        background: scrolled ? (navBg === 'rgba(10,10,10,0.95)' ? '#0a0a0a' : navBg) : navBg,
        borderBottom: `0.5px solid ${template?.colors?.border || '#e5e5e5'}`,
        transition: 'all .3s ease',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
      }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', height:64, gap:24 }}>
          
          {/* Mobile hamburger */}
          <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: textColor }}>
            {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>

          {/* Logo */}
          <Link href="/" style={{ display:'flex', alignItems:'center', textDecoration:'none', flexShrink:0 }}>
            <span style={{ fontFamily: heading, fontSize:22, fontWeight:400, color: textColor, letterSpacing:'0.05em' }}>
              TEJORI
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display:'flex', gap:4, flex:1, justifyContent:'center' }} className="hidden lg:flex">
            {NAV.map(item => (
              <div key={item.label} className="relative group"
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}>
                <Link href={item.href}
                  style={{ display:'flex', alignItems:'center', gap:4, padding:'8px 12px', fontSize:12, fontWeight:500, color: textColor, textDecoration:'none', letterSpacing:'0.03em', whiteSpace:'nowrap', transition:'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = accent}
                  onMouseLeave={e => e.currentTarget.style.color = textColor}>
                  {item.label}
                  {item.sub && <ChevronDown size={11} style={{ opacity:0.5 }}/>}
                </Link>

                {/* Dropdown */}
                {item.sub && openMenu === item.label && (
                  <div style={{
                    position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)',
                    background:'#fff', border:'1px solid #e5e5e5', borderRadius:12,
                    padding:'8px 0', minWidth:200, boxShadow:'0 8px 32px rgba(0,0,0,0.12)',
                    zIndex:300,
                  }}>
                    {item.sub.map(s => (
                      <Link key={s.label} href={s.href}
                        style={{ display:'block', padding:'9px 18px', fontSize:12, color:'#4a4a4a', textDecoration:'none', transition:'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = accent; e.currentTarget.style.background = '#fdf8f0'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#4a4a4a'; e.currentTarget.style.background = 'transparent'; }}>
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <div className="hidden sm:block"><CurrencySwitcher/></div>
            <div className="hidden sm:block"><LanguageSwitcher/></div>

            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)} style={{ padding:8, color: textColor, background:'transparent', border:'none', cursor:'pointer', display:'flex' }}>
              <Search size={18}/>
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" style={{ padding:8, color: textColor, display:'flex' }}>
              <Heart size={18}/>
            </Link>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div style={{ borderTop:'0.5px solid #e5e5e5', padding:'12px 24px', background:'#fafaf8' }}>
            <form onSubmit={handleSearch} style={{ maxWidth:600, margin:'0 auto', display:'flex', gap:8 }}>
              <input value={query} onChange={e=>setQuery(e.target.value)} autoFocus
                placeholder="Search diamonds, jewellery, gemstones…"
                style={{ flex:1, padding:'10px 16px', border:'1px solid #e5e5e5', borderRadius:30, fontSize:13, outline:'none' }}/>
              <button type="submit" style={{ padding:'10px 20px', background: accent, color:'#fff', border:'none', borderRadius:30, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:400 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={() => setMobileOpen(false)}/>
          <div style={{ position:'absolute', top:0, left:0, bottom:0, width:280, background:'#fff', overflowY:'auto', padding:'20px 0' }}>
            <div style={{ padding:'0 20px 16px', borderBottom:'1px solid #f0f0f0', marginBottom:8 }}>
              <span style={{ fontFamily: heading, fontSize:20 }}>TEJORI</span>
            </div>
            {NAV.map(item => (
              <div key={item.label}>
                <Link href={item.href} onClick={() => setMobileOpen(false)}
                  style={{ display:'block', padding:'12px 20px', fontSize:13, fontWeight:500, color:'#1a1a1a', textDecoration:'none', borderBottom:'1px solid #f8f8f8' }}>
                  {item.label}
                </Link>
                {item.sub?.map(s => (
                  <Link key={s.label} href={s.href} onClick={() => setMobileOpen(false)}
                    style={{ display:'block', padding:'9px 32px', fontSize:12, color:'#666', textDecoration:'none', borderBottom:'1px solid #f8f8f8' }}>
                    {s.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
