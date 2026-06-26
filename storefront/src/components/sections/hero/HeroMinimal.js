'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function HeroMinimal({ config = {} }) {
  const {
    hero_headline = 'Fine Jewellery',
    hero_subtext  = 'Certified diamonds, precious gemstones and bespoke creations.',
    hero_cta_text = 'Explore Collection',
    hero_cta_link = '/jewellery',
    hero_label    = 'TEJORI',
    hero_bg       = 'var(--color-bg)',
  } = config;

  return (
    <div className="flex flex-col items-center justify-center text-center py-28 px-6" style={{ background: hero_bg, minHeight:480 }}>
      {hero_label && <p style={{ fontSize:9,fontWeight:600,letterSpacing:'0.35em',textTransform:'uppercase',color:'var(--color-accent)',marginBottom:24 }}>{hero_label}</p>}
      <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'clamp(52px,8vw,96px)',fontWeight:300,color:'var(--color-text)',lineHeight:0.95,marginBottom:20 }}>{hero_headline}</h1>
      <div style={{ width:48,height:1,background:'var(--color-accent)',margin:'0 auto 24px' }}/>
      <p style={{ fontSize:16,color:'#6b6b6b',maxWidth:500,lineHeight:1.8,marginBottom:40 }}>{hero_subtext}</p>
      <Link href={hero_cta_link} style={{ fontSize:11,fontWeight:500,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--color-text)',borderBottom:'1px solid #1a1a1a',paddingBottom:2,display:'inline-flex',alignItems:'center',gap:8 }}>
        {hero_cta_text} <ChevronRight size={13}/>
      </Link>
    </div>
  );
}
