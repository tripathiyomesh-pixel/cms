'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, Heart, Maximize2, X } from 'lucide-react';
import SpecsTable from './SpecsTable';
import ProductCard from '../plp/ProductCard';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/app/wishlist/page';

const G   = 'var(--color-accent)';
const T   = 'var(--color-text)';
const M   = 'var(--color-text-muted)';

export default function PDPF6Gallery({ product, related, goldRate, waNumber }) {
  const [lightbox,   setLightbox]   = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  useEffect(() => { if(product) setWishlisted(isInWishlist(product.id)); }, [product]);

  if (!product) return <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:M }}>Could not load. <button onClick={()=>window.location.reload()} style={{ marginLeft:8,color:G,background:'none',border:'none',cursor:'pointer',textDecoration:'underline' }}>Try again</button></div>;

  const images = Array.isArray(product.images) ? product.images : product.image_url ? [product.image_url] : [];
  const price  = product.final_price && Number(product.final_price)>0 ? `AED ${Number(product.final_price).toLocaleString('en-AE')}` : null;
  const waMsg  = encodeURIComponent(`Hi Tejori, I am interested in ${product.name}${product.sku?` (SKU: ${product.sku})`:``}. Please share pricing and availability.`);
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '/appointment';
  const toggleWish = () => { if(wishlisted){removeFromWishlist(product.id);setWishlisted(false);}else{addToWishlist(product);setWishlisted(true);} };

  return (
    <div style={{ background:'var(--color-bg)',minHeight:'100vh' }}>
      {/* Editorial image grid top */}
      {images.length === 0 && (
        <div style={{ maxWidth:1400,margin:'0 auto',padding:'48px 24px 0' }}>
          <div style={{ height:500,background:'#f5ede2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:120,fontFamily:'var(--font-heading)',color:G,opacity:0.2 }}>
            {(product.name||'T')[0]}
          </div>
        </div>
      )}
      {images.length === 1 && (
        <div style={{ maxWidth:1400,margin:'0 auto',padding:'48px 24px 0' }}>
          <div style={{ position:'relative',overflow:'hidden',background:'#f5ede2',cursor:'zoom-in' }} onClick={()=>setLightbox(0)}>
            <img src={images[0]} alt={product.name} style={{ width:'100%',maxHeight:640,objectFit:'cover',display:'block' }}/>
            <button style={{ position:'absolute',bottom:16,right:16,background:'rgba(255,255,255,0.88)',border:'none',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:11 }} onClick={e=>{e.stopPropagation();setLightbox(0);}}>
              <Maximize2 size={12}/>Zoom
            </button>
          </div>
        </div>
      )}
      {images.length >= 2 && (
        <div style={{ maxWidth:1400,margin:'0 auto',padding:'48px 24px 0' }}>
          <div style={{ display:'grid',gap:8,gridTemplateColumns:images.length>=3?'2fr 1fr':'1fr 1fr',gridTemplateRows:'auto auto' }}>
            {images.slice(0,images.length>=3?3:2).map((img,i) => (
              <div key={i} style={{ overflow:'hidden',background:'#f5ede2',cursor:'zoom-in',gridRow:i===0&&images.length>=3?'span 2':undefined,position:'relative' }}
                onClick={()=>setLightbox(i)}>
                <img src={img} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',minHeight:200,display:'block',transition:'transform 500ms ease' }}
                  onMouseEnter={e=>e.target.style.transform='scale(1.03)'}
                  onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                <button style={{ position:'absolute',top:10,right:10,background:'rgba(255,255,255,0.7)',border:'none',padding:'4px 6px',cursor:'pointer' }} onClick={e=>{e.stopPropagation();setLightbox(i);}}>
                  <Maximize2 size={12}/>
                </button>
              </div>
            ))}
          </div>
          {images.length > 3 && (
            <div className="thumb-strip" style={{ marginTop:8 }}>
              {images.slice(3).map((img,i)=>(
                <button key={i+3} onClick={()=>setLightbox(i+3)}>
                  <img src={img} alt=""/>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2-col info below */}
      <div style={{ maxWidth:1400,margin:'0 auto',padding:'48px 24px 80px',display:'flex',gap:64,flexWrap:'wrap' }}>
        <div style={{ flex:1,minWidth:280 }}>
          {product.collection_name && (
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.3em',textTransform:'uppercase',color:G,marginBottom:12 }}>{product.collection_name}</p>
          )}
          <h1 className="pdp-name">{product.name}</h1>
          {product.sku && <p style={{ fontSize:11,color:M,marginBottom:16 }}>SKU: {product.sku}</p>}
          <p className={`pdp-price${price?'':' on-request'}`} style={{ marginBottom:24 }}>{price||'Price on Request'}</p>
          {product.description && (
            <p style={{ fontSize:14,color:M,lineHeight:1.8 }}>{product.description}</p>
          )}
        </div>
        <div style={{ flex:1,minWidth:280 }}>
          <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:32 }}>
            <a href={waHref} target="_blank" rel="noreferrer" className="pdp-cta-primary">
              <MessageCircle size={16}/>Enquire on WhatsApp
            </a>
            <button onClick={toggleWish} className="pdp-cta-secondary">
              <Heart size={15} fill={wishlisted?G:'none'} color={wishlisted?G:'currentColor'}/>{wishlisted?'Saved':'Save to Wishlist'}
            </button>
          </div>
          <SpecsTable product={product}/>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <button onClick={()=>setLightbox(null)} style={{ position:'absolute',top:20,right:20,background:'none',border:'none',cursor:'pointer',color:'#fff' }}><X size={24}/></button>
          <img src={images[lightbox]} alt="" style={{ maxWidth:'90vw',maxHeight:'90vh',objectFit:'contain' }}/>
          <div style={{ position:'absolute',bottom:20,left:'50%',transform:'translateX(-50%)',display:'flex',gap:8 }}>
            {images.map((_,i)=>(<button key={i} onClick={()=>setLightbox(i)} style={{ width:lightbox===i?24:8,height:8,borderRadius:4,background:lightbox===i?G:'rgba(255,255,255,0.3)',border:'none',cursor:'pointer',transition:'all 150ms ease' }}/>))}
          </div>
        </div>
      )}

      {related?.length > 0 && (
        <div style={{ maxWidth:1400,margin:'0 auto',padding:'0 24px 80px' }}>
          <h2 style={{ fontFamily:'var(--font-heading)',fontSize:'clamp(1.2rem,2vw,1.8rem)',fontWeight:400,color:T,marginBottom:32 }}>Related Pieces</h2>
          <div className="plp-grid-4">
            {related.slice(0,4).map(p=><ProductCard key={p.id} product={p} waNumber={waNumber}/>)}
          </div>
        </div>
      )}
    </div>
  );
}