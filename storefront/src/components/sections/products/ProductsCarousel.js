'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sfAPI } from '@/lib/api';

export default function ProductsCarousel({ config = {} }) {
  const [products, setProducts] = useState([]);
  const [start, setStart]       = useState(0);
  const PER = 4;
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;

  useEffect(() => {
    sfAPI.products({ status:'active', limit:12 })
      .then(r => setProducts(r.data.data || []))
      .catch(() => {});
  }, []);

  const placeholders = Array(8).fill(0).map((_,i) => ({
    id:`p${i}`, slug:`p${i}`,
    name:['Croissant Dome Hoops','Diamond Studs','Flat Hoops','Pearl Hoops','Charlotte Hoops','Solitaire Ring','Aurora Pendant','Vivid Earrings'][i],
    thumb_url:`https://images.unsplash.com/photo-${['1611652022419-a9419f74343d','1573408301185-9519f94ae069','1535632787350-4e68ef0ac584','1599643478518-a784e5dc4c8f','1605100804763-247f67b3557e','1515562141207-7a88fb7ce338','1602173574767-37ac01994b2a','1544376798-89aa6b0de868'][i]}?w=500&q=80`,
    currency:'AED', final_price:2500+i*1100,
  }));

  const list = products.length ? products : placeholders;
  const shown = list.slice(start, start+PER);

  return (
    <section style={{ padding:'80px 0', background:'#fdf8f3' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 40px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:48 }}>
          <div>
            <p style={{ fontSize:10,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'#b8860b',marginBottom:10 }}>
              {config.featured_label||'Featured'}
            </p>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:44,fontWeight:300,color:'#1a1a1a' }}>
              {config.featured_heading||'Our Selection'}
            </h2>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>setStart(s=>Math.max(0,s-PER))} disabled={start===0}
              style={{ width:40,height:40,border:'1px solid #e5e0d8',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:start===0?0.3:1,transition:'all .15s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#b8860b'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e0d8'}>
              <ChevronLeft size={16}/>
            </button>
            <button onClick={()=>setStart(s=>Math.min(list.length-PER,s+PER))} disabled={start+PER>=list.length}
              style={{ width:40,height:40,border:'1px solid #e5e0d8',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:start+PER>=list.length?0.3:1,transition:'all .15s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#b8860b'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e0d8'}>
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24 }}>
          {shown.map(p => {
            const msg = encodeURIComponent(`Hi, I'm interested in: ${p.name}`);
            return (
              <div key={p.id} className="group" style={{ background:'#fff', border:'1px solid #e5e0d8', transition:'border-color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#b8860b'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e0d8'}>
                <Link href={`/jewellery/${p.slug||p.id}`} className="block overflow-hidden" style={{ aspectRatio:'1', background:'#f5ede2' }}>
                  <img src={p.thumb_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                </Link>
                <div style={{ padding:16 }}>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:400,color:'#1a1a1a',marginBottom:12 }}>{p.name}</h3>
                  <div style={{ display:'flex', gap:8 }}>
                    {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer"
                      style={{ flex:1,padding:'10px',background:'#1a1a1a',color:'#fff',fontSize:9,fontWeight:500,letterSpacing:'0.15em',textTransform:'uppercase',textAlign:'center',textDecoration:'none',transition:'background .2s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#b8860b'}
                      onMouseLeave={e=>e.currentTarget.style.background='#1a1a1a'}>
                      Inquiry Now
                    </a>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
