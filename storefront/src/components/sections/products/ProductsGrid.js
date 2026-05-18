'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Eye } from 'lucide-react';
import { sfAPI } from '@/lib/api';

export default function ProductsGrid({ config = {}, cols = 4 }) {
  const [products, setProducts] = useState([]);
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const label   = config.featured_label   || 'Featured';
  const heading = config.featured_heading || 'Our Selection';
  const bg      = config.featured_bg      || '#fdf8f3';

  useEffect(() => {
    sfAPI.products({ status:'active', limit: cols * 2, is_featured:'true' })
      .then(r => setProducts(r.data.data || []))
      .catch(() => {});
  }, []);

  const placeholders = Array(cols).fill(0).map((_,i) => ({
    id:`p${i}`, slug:`p${i}`,
    name:['Croissant Dome Hoops','Diamond Celestial Studs','Medium Flat Hoops','Organic Pearl Hoops','Large Charlotte Hoops','Diamond Ring'][i] || 'Jewellery Piece',
    thumb_url:`https://images.unsplash.com/photo-${['1611652022419-a9419f74343d','1573408301185-9519f94ae069','1535632787350-4e68ef0ac584','1599643478518-a784e5dc4c8f','1605100804763-247f67b3557e','1515562141207-7a88fb7ce338'][i]}?w=500&q=80`,
    currency:'AED', final_price:2500+i*1400, badge:i<2?['-10%','-17%'][i]:'',
  }));

  const list = products.length ? products.slice(0,cols) : placeholders;

  return (
    <section style={{ padding:'80px 0', background:bg }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 40px' }}>
        <p style={{ fontSize:10,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'#b8860b',textAlign:'center',marginBottom:10 }}>{label}</p>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:44,fontWeight:300,color:'#1a1a1a',textAlign:'center',marginBottom:52 }}>{heading}</h2>
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:24 }}>
          {list.map(p => {
            const disc = p.compare_price ? Math.round((1-p.final_price/p.compare_price)*100) : 0;
            const badge = p.badge || (disc>0?`-${disc}%`:'') || (p.is_new?'New':'');
            const msg = encodeURIComponent(`Hi, I'm interested in: ${p.name}`);
            return (
              <div key={p.id} className="group" style={{ background:'#fff', border:'1px solid transparent', transition:'border-color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#e5e0d8'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='transparent'}>
                <Link href={`/jewellery/${p.slug||p.id}`} className="block relative overflow-hidden" style={{ aspectRatio:'1', background:'#f5ede2' }}>
                  <img src={p.thumb_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                  {badge && <span style={{ position:'absolute',top:12,left:12,background:'#1a1a1a',color:'#fff',fontSize:9,fontWeight:600,padding:'3px 8px',letterSpacing:'0.08em' }}>{badge}</span>}
                  <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'rgba(26,26,26,0.85)',padding:'10px',textAlign:'center',opacity:0,transition:'opacity .2s' }} className="group-hover:opacity-100">
                    <span style={{ fontSize:10,fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',color:'#fff' }}>Quick View</span>
                  </div>
                </Link>
                <div style={{ padding:16 }}>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:400,color:'#1a1a1a',marginBottom:12,lineHeight:1.3 }}>{p.name}</h3>
                  {p.final_price ? <p style={{ fontSize:13,color:'#6b6b6b',marginBottom:12 }}>{p.currency} {Number(p.final_price).toLocaleString()}</p> : null}
                  {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer"
                    style={{ display:'block',width:'100%',padding:'12px',background:'#1a1a1a',color:'#fff',fontSize:10,fontWeight:500,letterSpacing:'0.15em',textTransform:'uppercase',textAlign:'center',textDecoration:'none',transition:'background .2s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#b8860b'}
                    onMouseLeave={e=>e.currentTarget.style.background='#1a1a1a'}>
                    Inquiry Now
                  </a>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign:'center',marginTop:48 }}>
          <Link href="/jewellery" style={{ display:'inline-block',padding:'13px 40px',border:'1px solid #1a1a1a',color:'#1a1a1a',fontSize:11,fontWeight:500,letterSpacing:'0.15em',textTransform:'uppercase',transition:'all .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#1a1a1a';e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#1a1a1a';}}>
            View All Jewellery
          </Link>
        </div>
      </div>
    </section>
  );
}
