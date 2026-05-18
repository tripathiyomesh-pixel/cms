'use client';
import DynamicPage from '@/components/builder/DynamicPage';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

function StaticLabGrown() {
  return (
    <div style={{ fontFamily:"'Inter', system-ui, sans-serif" }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height:'60vh', background:'#0f1a2e' }}>
        <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1800&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-40"/>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="tejori-label mb-4">Tejori</p>
          <h1 className="font-cormorant text-6xl lg:text-8xl font-light text-white mb-6" style={{ letterSpacing:'0.02em' }}>
            Lab-Diamond
          </h1>
          <p className="text-white/60 text-base max-w-xl leading-relaxed mb-10">
            Chemically, physically, and optically identical to mined diamonds. Created sustainably. Certified by GIA and IGI.
          </p>
          <Link href="/lab-grown/jewellery" className="btn-tejori">Explore Lab-Diamond</Link>
        </div>
      </div>

      {/* What are Lab Grown Diamonds */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="tejori-label mb-4">Education</p>
            <h2 className="font-cormorant text-5xl font-light mb-6" style={{ color:'#1a1a1a' }}>
              What are Lab Grown Diamonds?
            </h2>
            <div style={{ width:40, height:1, background:'#b8860b', marginBottom:28 }}/>
            <div className="space-y-4" style={{ fontSize:13, color:'#6b6b6b', lineHeight:1.9 }}>
              <p>Lab grown diamonds are created using advanced technological processes that replicate the conditions under which natural diamonds form in the Earth's mantle.</p>
              <p>They are <strong style={{ color:'#1a1a1a' }}>chemically, physically, and optically identical</strong> to mined diamonds — the only difference is their origin.</p>
              <p>Every lab grown diamond at Tejori is certified by GIA or IGI, ensuring you receive the same quality guarantee as a natural diamond.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title:'Identical to Natural', desc:'Same crystal structure, hardness (10 on Mohs scale), and optical properties.' },
              { title:'GIA & IGI Certified', desc:'Every stone comes with a grading certificate from a leading laboratory.' },
              { title:'Sustainable',          desc:'Created without mining, reducing environmental impact significantly.' },
              { title:'Better Value',         desc:'Typically 40-60% less than an equivalent natural diamond.' },
            ].map(f => (
              <div key={f.title} className="p-5 border" style={{ borderColor:'#e5e0d8' }}>
                <h3 className="font-medium mb-2" style={{ fontSize:12, color:'#1a1a1a', letterSpacing:'0.05em' }}>{f.title}</h3>
                <p style={{ fontSize:12, color:'#6b6b6b', lineHeight:1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Type */}
      <section className="py-16" style={{ background:'#fdf8f3' }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <p className="tejori-label text-center mb-3">Shop</p>
          <h2 className="font-cormorant text-4xl font-light text-center mb-12" style={{ color:'#1a1a1a' }}>Lab-Diamond Jewellery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { name:'Necklaces', href:'/lab-grown?category=necklaces', img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' },
              { name:'Earrings',  href:'/lab-grown?category=earrings',  img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=80' },
              { name:'Bracelets', href:'/lab-grown?category=bracelets', img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=400&q=80' },
              { name:'Rings',     href:'/lab-grown?category=rings',     img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80' },
              { name:'Pendants',  href:'/lab-grown?category=pendants',  img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80' },
            ].map(c => (
              <Link key={c.name} href={c.href} className="group">
                <div className="aspect-square overflow-hidden mb-3" style={{ background:'#f5ede2' }}>
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                </div>
                <p className="text-center" style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'#4a4a4a', fontWeight:500 }}>
                  {c.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-12 bg-white border-t" style={{ borderColor:'#e5e0d8' }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm" style={{ color:'#6b6b6b', maxWidth:500 }}>
            <strong style={{ color:'#1a1a1a' }}>Important:</strong> Lab Grown jewellery and natural jewellery are shown on separate pages. 
            Our lab-grown pieces are clearly marked and never mixed with natural collections.
          </p>
          <Link href="/jewellery" className="btn-tejori whitespace-nowrap" style={{ background:'transparent', color:'#1a1a1a', border:'1px solid #1a1a1a', padding:'12px 28px' }}>
            View Natural Jewellery
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function LabGrownPage() {
  return <DynamicPage page="lab-grown" fallback={<StaticLabGrown/>}/>;
}
