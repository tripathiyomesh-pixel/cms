'use client';
import { useEffect, useState } from 'react';
import { HeroSection, ProductsSection, CategoriesSection, TestimonialsSection } from '@/components/sections/SectionRenderer';
import StaticHomePage from '@/templates/luxury-dark/HomePage';

// ── STOREFRONT SECTION RENDERER ────────────────────────────────
// Reads JSON array from admin page builder → renders correct React component
// This is the "Page JSON → Renderer → Component Registry → React" pattern from spec

function SectionFromJSON({ section }) {
  const { type, props } = section;
  switch(type) {
    case 'hero':               return <HeroSection config={{ hero_type: props.type, ...props }}/>;
    case 'products_grid':      return <ProductsSection config={{ products_variant:`grid${props.cols||4}`, ...props }}/>;
    case 'products_carousel':  return <ProductsSection config={{ products_variant:'carousel', ...props }}/>;
    case 'categories_circles': return <CategoriesSection config={{ categories_variant:'circles', ...props }}/>;
    case 'categories_cards':   return <CategoriesSection config={{ categories_variant:'cards', ...props }}/>;
    case 'testimonials_carousel': return <TestimonialsSection config={{ testimonials_variant:'carousel', ...props }}/>;
    case 'testimonials_grid':  return <TestimonialsSection config={{ testimonials_variant:'grid', ...props }}/>;

    // Content sections — inline renders
    case 'brand_story':        return <BrandStorySection {...props}/>;
    case 'about_heritage':     return <AboutHeritageSection {...props}/>;
    case 'why_choose':         return <WhyChooseSection {...props}/>;
    case 'learning_center':    return <LearningCenterSection {...props}/>;
    case 'newsletter':         return <NewsletterSection {...props}/>;
    case 'whatsapp_cta':       return <WhatsAppCTASection {...props}/>;
    case 'editorial_banner':   return <EditorialBannerSection {...props}/>;
    case 'collection_banners': return <CollectionBannersSection {...props}/>;
    case 'promo_strip':        return <PromoStripSection {...props}/>;
    case 'cert_logos':         return <CertLogosSection {...props}/>;
    case 'spacer':             return <div style={{ height:props.height||80, background:props.bg||'#fff' }}/>;
    case 'divider':            return <DividerSection {...props}/>;
    default:                   return null;
  }
}

// ── INLINE SECTION COMPONENTS ─────────────────────────────────
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

function BrandStorySection({ label, heading, body, image, image_side='right', cta_text, cta_link, bg='#ffffff' }) {
  const textCol = (
    <div>
      {label && <p style={{ fontSize:10,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'#b8860b',marginBottom:16 }}>{label}</p>}
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(32px,4vw,52px)',fontWeight:300,color:'#1a1a1a',lineHeight:1.1,marginBottom:24 }}>{heading}</h2>
      <div style={{ width:40,height:1,background:'#b8860b',marginBottom:24 }}/>
      <p style={{ fontSize:13,color:'#6b6b6b',lineHeight:1.9,marginBottom:32 }}>{body}</p>
      {cta_text && <Link href={cta_link||'#'} style={{ fontSize:11,fontWeight:500,letterSpacing:'0.15em',textTransform:'uppercase',color:'#1a1a1a',borderBottom:'1px solid #1a1a1a',paddingBottom:2,display:'inline-flex',alignItems:'center',gap:8 }}>{cta_text} <ChevronRight size={13}/></Link>}
    </div>
  );
  const imgCol = image && <div style={{ overflow:'hidden' }}><img src={image} alt={heading} style={{ width:'100%',aspectRatio:'4/5',objectFit:'cover' }}/></div>;
  return (
    <section style={{ padding:'80px 0', background:bg }}>
      <div style={{ maxWidth:1280,margin:'0 auto',padding:'0 40px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center' }}>
        {image_side==='left' ? <>{imgCol}{textCol}</> : <>{textCol}{imgCol}</>}
      </div>
    </section>
  );
}

function AboutHeritageSection({ label, heading, body, image, legacy_number, legacy_label, cta_text, cta_link, bg='#ffffff' }) {
  return (
    <section style={{ padding:'80px 0', background:bg }}>
      <div style={{ maxWidth:1280,margin:'0 auto',padding:'0 40px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center' }}>
        <div style={{ position:'relative' }}>
          {image && <img src={image} alt={heading} style={{ width:'100%',aspectRatio:'4/5',objectFit:'cover' }}/>}
          {legacy_number && (
            <div style={{ position:'absolute',bottom:0,right:0,background:'#1a1a1a',padding:'20px 28px' }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:44,fontWeight:300,color:'#b8860b',lineHeight:1 }}>{legacy_number}</p>
              <p style={{ fontSize:9,color:'#888',letterSpacing:'0.12em',textTransform:'uppercase',marginTop:4 }}>{legacy_label}</p>
            </div>
          )}
        </div>
        <div>
          {label && <p style={{ fontSize:10,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'#b8860b',marginBottom:16 }}>{label}</p>}
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(32px,4vw,52px)',fontWeight:300,color:'#1a1a1a',marginBottom:24 }}>{heading}</h2>
          <div style={{ width:40,height:1,background:'#b8860b',marginBottom:24 }}/>
          <p style={{ fontSize:13,color:'#6b6b6b',lineHeight:1.9,marginBottom:32 }}>{body}</p>
          {cta_text && <Link href={cta_link||'#'} style={{ fontSize:11,fontWeight:500,letterSpacing:'0.15em',textTransform:'uppercase',color:'#1a1a1a',borderBottom:'1px solid #1a1a1a',paddingBottom:2,display:'inline-flex',alignItems:'center',gap:8 }}>{cta_text} <ChevronRight size={13}/></Link>}
        </div>
      </div>
    </section>
  );
}

function WhyChooseSection({ label, heading, bg='#fdf8f3', pillars }) {
  const items = pillars || [
    { icon:'🏆', title:'Authenticity Guaranteed', desc:'Every piece is handpicked and inspected.' },
    { icon:'💎', title:'Rare & Iconic Jewellery',  desc:'Our jewellery is a valuable investment.' },
    { icon:'✨', title:'Heritage of Craftsmanship',desc:'Creating masterpieces since 1964.' },
  ];
  return (
    <section style={{ padding:'80px 0', background:bg, textAlign:'center' }}>
      <div style={{ maxWidth:1000,margin:'0 auto',padding:'0 40px' }}>
        {label && <p style={{ fontSize:10,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'#b8860b',marginBottom:12 }}>{label}</p>}
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(32px,4vw,48px)',fontWeight:300,color:'#1a1a1a',marginBottom:56 }}>{heading}</h2>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:48 }}>
          {items.map((p,i)=>(
            <div key={i}>
              <div style={{ fontSize:40,marginBottom:20 }}>{p.icon}</div>
              <h3 style={{ fontSize:12,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'#1a1a1a',marginBottom:12 }}>{p.title}</h3>
              <p style={{ fontSize:13,color:'#6b6b6b',lineHeight:1.8 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LearningCenterSection({ label, heading, body, cta_text, cta_link, image }) {
  return (
    <div style={{ position:'relative', height:340, overflow:'hidden' }}>
      {image && <img src={image} alt={heading} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>}
      <div style={{ position:'absolute',inset:0,background:'rgba(10,10,10,0.58)' }}/>
      <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:40 }}>
        {label && <p style={{ fontSize:10,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'#b8860b',marginBottom:16 }}>{label}</p>}
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(28px,4vw,44px)',fontWeight:300,color:'#fff',marginBottom:16 }}>{heading}</h2>
        {body && <p style={{ fontSize:13,color:'rgba(255,255,255,0.65)',maxWidth:480,lineHeight:1.8,marginBottom:28 }}>{body}</p>}
        {cta_text && <Link href={cta_link||'#'} style={{ fontSize:10,fontWeight:500,letterSpacing:'0.18em',textTransform:'uppercase',color:'#fff',borderBottom:'1px solid rgba(255,255,255,0.4)',paddingBottom:2 }}>{cta_text}</Link>}
      </div>
    </div>
  );
}

function NewsletterSection({ label, heading, subtext, bg='#1a1a1a' }) {
  const [email, setEmail] = useState('');
  const [done, setDone]   = useState(false);
  return (
    <section style={{ padding:'64px 40px', background:bg, textAlign:'center' }}>
      {label && <p style={{ fontSize:10,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'#b8860b',marginBottom:12 }}>{label}</p>}
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(24px,3vw,40px)',fontWeight:300,color:'#fff',marginBottom:12 }}>{heading}</h2>
      {subtext && <p style={{ fontSize:12,color:'rgba(255,255,255,0.45)',marginBottom:32,letterSpacing:'0.05em' }}>{subtext}</p>}
      {done ? (
        <p style={{ color:'#4caf70',fontWeight:500,fontSize:13 }}>✓ Thank you! Check your inbox for your 10% discount.</p>
      ) : (
        <form onSubmit={e=>{e.preventDefault();setDone(true);}} style={{ display:'flex',maxWidth:420,margin:'0 auto',gap:0 }}>
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address"
            style={{ flex:1,padding:'14px 18px',border:'1px solid rgba(255,255,255,0.15)',borderRight:'none',background:'rgba(255,255,255,0.06)',color:'#fff',fontSize:12,outline:'none' }}/>
          <button type="submit" style={{ padding:'14px 24px',background:'#b8860b',color:'#fff',border:'none',cursor:'pointer',fontSize:10,fontWeight:500,letterSpacing:'0.15em',textTransform:'uppercase',whiteSpace:'nowrap' }}>Subscribe</button>
        </form>
      )}
    </section>
  );
}

function WhatsAppCTASection({ heading, body, button_text, bg='#f5ede2' }) {
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;
  return (
    <section style={{ padding:'64px 40px', background:bg, textAlign:'center' }}>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(24px,3vw,40px)',fontWeight:300,color:'#1a1a1a',marginBottom:12 }}>{heading}</h2>
      {body && <p style={{ fontSize:14,color:'#6b6b6b',marginBottom:32 }}>{body}</p>}
      {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
        style={{ display:'inline-flex',alignItems:'center',gap:12,padding:'14px 40px',background:'#1a7a35',color:'#fff',fontSize:11,fontWeight:500,letterSpacing:'0.15em',textTransform:'uppercase',textDecoration:'none' }}>
        💬 {button_text||'Chat on WhatsApp'}
      </a>}
    </section>
  );
}

function EditorialBannerSection({ heading, body, cta_text, cta_link, image, overlay=45, text_align='left' }) {
  return (
    <div style={{ position:'relative',height:'clamp(320px,45vh,560px)',overflow:'hidden' }}>
      {image && <img src={image} alt={heading} className="w-full h-full object-cover"/>}
      <div style={{ position:'absolute',inset:0,background:`rgba(0,0,0,${overlay/100})` }}/>
      <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'60px 80px',textAlign:text_align==='center'?'center':'left',alignItems:text_align==='center'?'center':'flex-start' }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(40px,6vw,80px)',fontWeight:300,color:'#fff',lineHeight:1,marginBottom:16 }}>{heading}</h2>
        {body && <p style={{ fontSize:14,color:'rgba(255,255,255,0.65)',maxWidth:440,lineHeight:1.7,marginBottom:32 }}>{body}</p>}
        {cta_text && <Link href={cta_link||'#'} style={{ fontSize:11,fontWeight:500,letterSpacing:'0.18em',textTransform:'uppercase',color:'#fff',borderBottom:'1px solid rgba(255,255,255,0.4)',paddingBottom:2 }}>{cta_text}</Link>}
      </div>
    </div>
  );
}

function CollectionBannersSection({ left_title, left_sub, left_href, left_image, right_title, right_sub, right_href, right_image }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {[{title:left_title,sub:left_sub,href:left_href,img:left_image},{title:right_title,sub:right_sub,href:right_href,img:right_image}].map((b,i)=>(
        <div key={i} style={{ position:'relative',height:400,overflow:'hidden' }}>
          {b.img && <img src={b.img} alt={b.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"/>}
          <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.4)' }}/>
          <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'40px' }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(24px,4vw,44px)',fontWeight:300,color:'#fff',marginBottom:12 }}>{b.title}</h3>
            {b.sub && <p style={{ fontSize:12,color:'rgba(255,255,255,0.7)',marginBottom:24 }}>{b.sub}</p>}
            {b.href && <Link href={b.href} style={{ fontSize:10,fontWeight:500,letterSpacing:'0.18em',textTransform:'uppercase',color:'#fff',borderBottom:'1px solid rgba(255,255,255,0.5)',paddingBottom:2 }}>Explore</Link>}
          </div>
        </div>
      ))}
    </div>
  );
}

function PromoStripSection({ b1_label, b1_link, b1_bg, b2_label, b2_link, b2_bg, b3_label, b3_link, b3_bg }) {
  const items = [
    { label:b1_label||'New Arrivals',   link:b1_link||'/jewellery?is_new=true',   bg:b1_bg||'#1a1a1a' },
    { label:b2_label||'Best Seller',   link:b2_link||'/jewellery?sort=featured', bg:b2_bg||'#b8860b' },
    { label:b3_label||'Clearance Sale',link:b3_link||'/jewellery?on_sale=true',  bg:b3_bg||'#3d2b1a' },
  ];
  return (
    <div className="grid grid-cols-3">
      {items.map((b,i)=>(
        <Link key={i} href={b.link} style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:'28px',background:b.bg,textDecoration:'none' }}>
          <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(16px,2vw,28px)',fontWeight:300,color:'#fff',letterSpacing:'0.03em' }}>{b.label}</span>
        </Link>
      ))}
    </div>
  );
}

function CertLogosSection({ label, bg='#ffffff' }) {
  return (
    <section style={{ padding:'28px 40px', background:bg, borderTop:'1px solid #f0ede8', borderBottom:'1px solid #f0ede8' }}>
      {label && <p style={{ textAlign:'center',fontSize:9,fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'#aaa',marginBottom:16 }}>{label}</p>}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:40,flexWrap:'wrap' }}>
        {['GIA Certified','IGI Certified','HRD Antwerp','AGS','GCAL'].map(c=>(
          <span key={c} style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:13,fontWeight:400,color:'rgba(0,0,0,0.18)',letterSpacing:'0.1em',textTransform:'uppercase' }}>{c}</span>
        ))}
      </div>
    </section>
  );
}

function DividerSection({ bg='#ffffff' }) {
  return (
    <div style={{ display:'flex',alignItems:'center',gap:20,padding:'32px 80px',background:bg }}>
      <div style={{ flex:1,height:'0.5px',background:'#e5e0d8' }}/><span style={{ fontSize:18,color:'#b8860b' }}>✦</span><div style={{ flex:1,height:'0.5px',background:'#e5e0d8' }}/>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function HomePage() {
  const [sections, setSections] = useState(null);
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    fetch(`${api}/settings/page/homepage`)
      .then(r=>r.json())
      .then(res => {
        const data = res.data;
        // New format: JSON array
        if (Array.isArray(data)) { setSections(data); return; }
        // Legacy format: {html, css} from GrapesJS
        if (data?.html) { setSections([{ id:'legacy', type:'__html__', props:{ html:data.html, css:data.css } }]); return; }
        // null → use static template
        setSections(null);
      })
      .catch(()=>setSections(null))
      .finally(()=>setLoaded(true));
  }, []);

  if (!loaded) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:28,height:28,border:'2px solid #b8860b',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // Legacy HTML content
  if (sections?.[0]?.type === '__html__') {
    const s = sections[0].props;
    return <><style dangerouslySetInnerHTML={{ __html:s.css||'' }}/><div dangerouslySetInnerHTML={{ __html:s.html }}/></>;
  }

  // JSON section array from new builder
  if (sections?.length) {
    return (
      <div style={{ fontFamily:"'Inter',system-ui,sans-serif" }}>
        {sections.map(section => <SectionFromJSON key={section.id} section={section}/>)}
      </div>
    );
  }

  // Static fallback
  return <StaticHomePage/>;
}
