'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function HeroSplit({ config = {} }) {
  const {
    hero_headline  = 'Fine Jewellery',
    hero_subtext   = 'Discover our curated collection of certified diamonds and precious gemstones.',
    hero_cta_text  = 'Explore Collection',
    hero_cta_link  = '/jewellery',
    hero_image     = 'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=900&q=80',
    hero_label     = 'New Collection',
    hero_image_side = 'right',
  } = config;

  const textBlock = (
    <div className="flex flex-col justify-center px-12 lg:px-20 py-20" style={{ background:'#f5ede2' }}>
      {hero_label && <p style={{ fontSize:10,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--color-accent)',marginBottom:16 }}>{hero_label}</p>}
      <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'clamp(42px,5vw,72px)',fontWeight:300,color:'var(--color-text)',lineHeight:1.05,marginBottom:20 }}>{hero_headline}</h1>
      <div style={{ width:40,height:1,background:'var(--color-accent)',marginBottom:24 }}/>
      <p style={{ fontSize:14,color:'#6b6b6b',lineHeight:1.8,maxWidth:420,marginBottom:36 }}>{hero_subtext}</p>
      <Link href={hero_cta_link} style={{ fontSize:11,fontWeight:600,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--color-text)',borderBottom:'1px solid #1a1a1a',paddingBottom:2,display:'inline-flex',alignItems:'center',gap:8,width:'fit-content' }}>
        {hero_cta_text} <ChevronRight size={13}/>
      </Link>
    </div>
  );

  const imageBlock = (
    <div className="overflow-hidden" style={{ minHeight:600 }}>
      <img src={hero_image} alt={hero_headline} className="w-full h-full object-cover" style={{ minHeight:600 }}/>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight:'clamp(500px,70vh,800px)' }}>
      {hero_image_side === 'right' ? <>{textBlock}{imageBlock}</> : <>{imageBlock}{textBlock}</>}
    </div>
  );
}
