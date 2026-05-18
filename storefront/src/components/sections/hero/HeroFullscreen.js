'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function HeroFullscreen({ config = {} }) {
  const {
    hero_headline    = 'Frost Yourself',
    hero_subtext     = 'Dazzling pear and marquise diamonds, sculpted to mirror the wild beauty of ice crystals.',
    hero_cta_text    = 'Discover the selection',
    hero_cta_link    = '/jewellery',
    hero_image       = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80',
    hero_label       = 'New Collection',
    hero_overlay     = '65',
    hero_text_align  = 'left',
  } = config;

  return (
    <div className="relative w-full overflow-hidden" style={{ height:'clamp(500px,80vh,900px)' }}>
      <img src={hero_image} alt={hero_headline} className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-0" style={{ background:`rgba(0,0,0,${parseInt(hero_overlay)/100})` }}/>
      <div className={`absolute inset-0 flex items-center ${hero_text_align==='center'?'justify-center text-center':''}`}>
        <div className="max-w-screen-xl mx-auto px-8 lg:px-16 w-full">
          <div style={{ maxWidth: hero_text_align==='center'?'none':640 }}>
            {hero_label && <p style={{ fontSize:10,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'#b8860b',marginBottom:16 }}>{hero_label}</p>}
            <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'clamp(48px,7vw,88px)',fontWeight:300,color:'#fff',lineHeight:1,marginBottom:20 }}>{hero_headline}</h1>
            <p style={{ fontSize:'clamp(14px,1.5vw,18px)',color:'rgba(255,255,255,0.7)',maxWidth:480,lineHeight:1.7,marginBottom:36,margin: hero_text_align==='center'?'0 auto 36px':'0 0 36px' }}>{hero_subtext}</p>
            <Link href={hero_cta_link} style={{ fontSize:11,fontWeight:500,letterSpacing:'0.18em',textTransform:'uppercase',color:'#fff',borderBottom:'1px solid rgba(255,255,255,0.5)',paddingBottom:3,display:'inline-flex',alignItems:'center',gap:8 }}>
              {hero_cta_text} <ChevronRight size={14}/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
