'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function HeroVideo({ config = {} }) {
  const {
    hero_headline  = 'Frost Yourself',
    hero_subtext   = 'Dazzling pear and marquise diamonds.',
    hero_cta_text  = 'Discover the selection',
    hero_cta_link  = '/jewellery',
    hero_video_url = '',
    hero_image     = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80',
    hero_overlay   = '60',
  } = config;

  return (
    <div className="relative overflow-hidden" style={{ height:'clamp(500px,80vh,900px)' }}>
      {hero_video_url ? (
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={hero_video_url} type="video/mp4"/>
          <img src={hero_image} alt="" className="w-full h-full object-cover"/>
        </video>
      ) : (
        <img src={hero_image} alt={hero_headline} className="absolute inset-0 w-full h-full object-cover"/>
      )}
      <div className="absolute inset-0" style={{ background:`rgba(0,0,0,${parseInt(hero_overlay)/100})` }}/>
      <div className="absolute inset-0 flex items-center justify-center text-center">
        <div className="px-6" style={{ maxWidth:700 }}>
          <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'clamp(52px,8vw,96px)',fontWeight:300,color:'#fff',lineHeight:0.95,marginBottom:24 }}>{hero_headline}</h1>
          <p style={{ fontSize:16,color:'rgba(255,255,255,0.7)',lineHeight:1.7,marginBottom:40 }}>{hero_subtext}</p>
          <Link href={hero_cta_link} style={{ fontSize:11,fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'#fff',border:'1px solid rgba(255,255,255,0.5)',padding:'14px 40px',display:'inline-block',transition:'all .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}>
            {hero_cta_text}
          </Link>
        </div>
      </div>
    </div>
  );
}
