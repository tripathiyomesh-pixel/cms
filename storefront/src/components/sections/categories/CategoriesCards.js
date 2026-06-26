'use client';
import Link from 'next/link';
const CATS = [
  { name:'High Jewellery', href:'/jewellery?type=high',         img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
  { name:'Rings',          href:'/jewellery?category=rings',    img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
  { name:'Necklaces',      href:'/jewellery?category=necklaces',img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
  { name:'Lab Grown',      href:'/lab-grown',                   img:'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=600&q=80' },
];
export default function CategoriesCards({ config={} }) {
  return (
    <section style={{ padding:'60px 40px', background:'var(--color-bg)' }}>
      <div style={{ maxWidth:1280,margin:'0 auto' }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:40,fontWeight:300,color:'var(--color-text)',textAlign:'center',marginBottom:48 }}>
          {config.categories_heading||'Shop by Category'}
        </h2>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20 }}>
          {CATS.map(c=>(
            <Link key={c.name} href={c.href} className="group" style={{ display:'block',textDecoration:'none',position:'relative',overflow:'hidden' }}>
              <div style={{ aspectRatio:'3/4',overflow:'hidden',background:'#f5ede2' }}>
                <img src={c.img} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
              </div>
              <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.3)',display:'flex',alignItems:'flex-end',padding:24 }}>
                <div>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:300,color:'#fff',marginBottom:8 }}>{c.name}</h3>
                  <span style={{ fontSize:10,fontWeight:500,letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(255,255,255,0.7)',borderBottom:'1px solid rgba(255,255,255,0.4)',paddingBottom:1 }}>Explore →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
