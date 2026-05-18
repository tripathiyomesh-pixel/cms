'use client';
import Link from 'next/link';
const CATS = [
  { name:'Bracelets',        href:'/jewellery?category=bracelets', img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=200&q=80' },
  { name:'Certified Diamond',href:'/diamonds',                     img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&q=80' },
  { name:'Earrings',         href:'/jewellery?category=earrings',  img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=200&q=80' },
  { name:'High Jewellery',   href:'/jewellery?type=high',          img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=200&q=80' },
  { name:'Jewellery',        href:'/jewellery',                    img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=200&q=80' },
  { name:'Lab Grown',        href:'/lab-grown',                    img:'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=200&q=80' },
  { name:'Necklaces',        href:'/jewellery?category=necklaces', img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&q=80' },
  { name:'Wedding & Bridal', href:'/jewellery?category=bridal',   img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&q=80' },
];
export default function CategoriesCircles({ config={} }) {
  return (
    <section style={{ padding:'60px 40px', background:'#fff', textAlign:'center' }}>
      <div style={{ maxWidth:1280,margin:'0 auto' }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:40,fontWeight:300,color:'#1a1a1a',marginBottom:48 }}>
          {config.categories_heading||'Top Categories'}
        </h2>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:20 }}>
          {CATS.map(c=>(
            <Link key={c.name} href={c.href} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:10,textDecoration:'none' }}
              onMouseEnter={e=>e.currentTarget.querySelector('div').style.borderColor='#b8860b'}
              onMouseLeave={e=>e.currentTarget.querySelector('div').style.borderColor='#e5e0d8'}>
              <div style={{ width:80,height:80,borderRadius:'50%',overflow:'hidden',border:'1.5px solid #e5e0d8',transition:'border-color .2s' }}>
                <img src={c.img} alt={c.name} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
              </div>
              <span style={{ fontSize:9,fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:'#4a4a4a' }}>{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
