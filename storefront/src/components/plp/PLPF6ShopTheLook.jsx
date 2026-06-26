'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Heart, X, ZoomIn } from 'lucide-react';
import useProducts from '@/lib/useProducts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const G   = 'var(--color-accent)';
const T   = 'var(--color-text)';
const M   = 'var(--color-text-muted)';

const HOTSPOT_STYLE_IMAGE = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80';

const DEFAULT_HOTSPOTS = [
  { id:1, top:'30%', left:'45%', label:'Necklace',  slug:null },
  { id:2, top:'55%', left:'25%', label:'Bracelet',  slug:null },
  { id:3, top:'65%', left:'55%', label:'Ring',      slug:null },
  { id:4, top:'20%', left:'70%', label:'Earrings',  slug:null },
];

function HotspotDot({ index, top, left, label, active, onClick }) {
  return (
    <button onClick={onClick} title={label}
      style={{ position:'absolute',top,left,transform:'translate(-50%,-50%)',border:'none',background:'none',padding:0,cursor:'pointer',zIndex:10 }}>
      <div style={{ position:'relative',width:32,height:32 }}>
        <div style={{ position:'absolute',inset:0,borderRadius:'50%',background:'rgba(255,255,255,0.15)',border:'1.5px solid rgba(255,255,255,0.6)',backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 200ms ease',boxShadow:active?`0 0 0 3px ${G}`:'' }}>
          <span style={{ fontFamily:'var(--font-heading)',fontSize:11,fontWeight:600,color:'#fff' }}>{index+1}</span>
        </div>
      </div>
    </button>
  );
}

export default function PLPF6ShopTheLook({ preFilter = {}, heading = 'Shop the Look', lookImage = HOTSPOT_STYLE_IMAGE, hotspots = DEFAULT_HOTSPOTS }) {
  const [waNum,   setWaNum]   = useState('');
  const [active,  setActive]  = useState(0);
  useEffect(() => {
    fetch(`${API}/settings/public`).then(r=>r.json()).then(d=>{
      const n=(d.data?.store_whatsapp||d.data?.whatsapp_number||'').replace(/\D/g,'');
      if(n) setWaNum(n);
    }).catch(()=>{});
  }, []);

  const { products, loading } = useProducts({ preFilter, pageSize: 12 });

  const formatPrice = (p) => {
    if (!p || Number(p) === 0) return null;
    return `AED ${Number(p).toLocaleString('en-AE')}`;
  };

  const activeProduct = products[active];
  const waMsg = activeProduct
    ? encodeURIComponent(`Hi Tejori, I am interested in ${activeProduct.name}${activeProduct.sku?` (SKU: ${activeProduct.sku})`:``}. Please share pricing and availability.`)
    : '';
  const waHref = activeProduct && waNum ? `https://wa.me/${waNum}?text=${waMsg}` : '/appointment';

  return (
    <div style={{ background:'var(--color-bg)',minHeight:'100vh' }}>
      <div style={{ maxWidth:1400,margin:'0 auto',padding:'48px 24px 80px' }}>
        <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'clamp(1.6rem,3vw,2.4rem)',fontWeight:400,color:T,letterSpacing:'0.06em',marginBottom:40,textAlign:'center' }}>{heading}</h1>

        <div style={{ display:'flex',gap:0,alignItems:'flex-start',flexWrap:'wrap' }}>
          {/* 55% image with hotspots */}
          <div style={{ flex:'0 0 55%',minWidth:280,position:'relative',background:'#1a1208' }}>
            <img src={lookImage} alt={heading} style={{ width:'100%',height:'auto',display:'block',minHeight:500,objectFit:'cover',opacity:0.95 }}/>
            {hotspots.map((h,i) => (
              <HotspotDot key={h.id} index={i} top={h.top} left={h.left} label={h.label} active={active===i} onClick={()=>setActive(i)}/>
            ))}
          </div>

          {/* 45% product list */}
          <div style={{ flex:'0 0 45%',minWidth:280,borderLeft:'1px solid var(--color-border)',background:'var(--color-bg)' }}>
            {/* Active highlight */}
            {activeProduct && !loading && (
              <div style={{ padding:32,borderBottom:'1px solid var(--color-border)',background:'#f9f5f0' }}>
                <div style={{ display:'flex',gap:20 }}>
                  <div style={{ width:120,height:120,overflow:'hidden',flexShrink:0,background:'#f0e8dc' }}>
                    {activeProduct.image_url || (activeProduct.images||[])[0] ? (
                      <img src={(activeProduct.images||[])[0]||activeProduct.image_url} alt={activeProduct.name} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                    ) : (
                      <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,fontFamily:'var(--font-heading)',color:G,opacity:0.6 }}>
                        {(activeProduct.name||'T')[0]}
                      </div>
                    )}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:10,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:G,marginBottom:6 }}>Featured</p>
                    <p style={{ fontFamily:'var(--font-heading)',fontSize:20,fontWeight:400,color:T,marginBottom:4,lineHeight:1.2 }}>{activeProduct.name}</p>
                    <p style={{ fontSize:13,color:M,marginBottom:12 }}>
                      {formatPrice(activeProduct.final_price) || 'Price on Request'}
                    </p>
                    <div style={{ display:'flex',gap:10 }}>
                      <a href={waHref} target="_blank" rel="noreferrer"
                        style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'9px 16px',background:'#25D366',color:'#fff',textDecoration:'none',fontSize:11,fontWeight:600,letterSpacing:'0.1em' }}>
                        <MessageCircle size={13}/>Enquire
                      </a>
                      <Link href={`/jewellery/${activeProduct.slug||activeProduct.id}`}
                        style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'9px 16px',border:`1px solid ${G}`,color:G,textDecoration:'none',fontSize:11,fontWeight:600,letterSpacing:'0.1em' }}>
                        <ZoomIn size={13}/>View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product list */}
            <div style={{ padding:'0 0 24px' }}>
              {loading
                ? Array(4).fill(0).map((_,i)=>(<div key={i} style={{ padding:'16px 24px',borderBottom:'1px solid var(--color-border)',display:'flex',gap:16,alignItems:'center' }}>
                    <div style={{ width:60,height:60,background:'linear-gradient(90deg,#f0ebe3 25%,#e8e0d4 50%,#f0ebe3 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.4s ease-in-out infinite' }}/>
                    <div style={{ flex:1 }}><div style={{ height:12,background:'#f0ebe3',marginBottom:8,width:'70%',animation:'shimmer 1.4s ease-in-out infinite' }}/><div style={{ height:10,background:'#f0ebe3',width:'40%',animation:'shimmer 1.4s ease-in-out infinite' }}/></div>
                  </div>))
                : products.map((p,i) => {
                    const price = formatPrice(p.final_price);
                    return (
                      <div key={p.id} onClick={()=>setActive(i)}
                        style={{ padding:'16px 24px',borderBottom:'1px solid var(--color-border)',display:'flex',gap:16,alignItems:'center',cursor:'pointer',background:active===i?'#f9f5f0':'transparent',transition:'background 150ms ease',borderLeft:active===i?`3px solid ${G}`:'' }}>
                        <div style={{ width:20,height:20,borderRadius:'50%',border:`2px solid ${active===i?G:'var(--color-border)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:active===i?G:'transparent',transition:'all 150ms ease' }}>
                          <span style={{ fontSize:9,fontWeight:700,color:active===i?'#fff':M }}>{i+1}</span>
                        </div>
                        <div style={{ width:52,height:52,overflow:'hidden',flexShrink:0,background:'#f0e8dc' }}>
                          {(p.images||[])[0]||p.image_url ? (
                            <img src={(p.images||[])[0]||p.image_url} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                          ) : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontFamily:'var(--font-heading)',color:G,opacity:0.5 }}>{(p.name||'T')[0]}</div>}
                        </div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <p style={{ fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{p.name}</p>
                          <p style={{ fontSize:12,color:price?T:M,fontStyle:price?'normal':'italic',marginTop:2 }}>{price||'Price on Request'}</p>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}