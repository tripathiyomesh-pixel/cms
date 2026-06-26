'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Heart, ChevronDown } from 'lucide-react';
import SpecsTable from './SpecsTable';
import ProductCard from '../plp/ProductCard';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/app/wishlist/page';

const G   = 'var(--color-accent)';
const T   = 'var(--color-text)';
const M   = 'var(--color-text-muted)';

export default function PDPF3Graff({ product, related, goldRate, waNumber }) {
  const [wishlisted, setWishlisted] = useState(false);
  const detailRef   = useRef(null);
  useEffect(() => { if(product) setWishlisted(isInWishlist(product.id)); }, [product]);

  if (!product) return <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:M }}>Could not load. <button onClick={()=>window.location.reload()} style={{ marginLeft:8,color:G,background:'none',border:'none',cursor:'pointer',textDecoration:'underline' }}>Try again</button></div>;

  const images = Array.isArray(product.images) ? product.images : product.image_url ? [product.image_url] : [];
  const img    = images[0];
  const price  = product.final_price && Number(product.final_price)>0 ? `AED ${Number(product.final_price).toLocaleString('en-AE')}` : null;
  const waMsg  = encodeURIComponent(`Hi Tejori, I am interested in ${product.name}${product.sku?` (SKU: ${product.sku})`:``}. Please share pricing and availability.`);
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '/appointment';
  const toggleWish = () => { if(wishlisted){removeFromWishlist(product.id);setWishlisted(false);}else{addToWishlist(product);setWishlisted(true);} };

  const scrollToDetail = () => detailRef.current?.scrollIntoView({ behavior:'smooth', block:'start' });

  return (
    <div style={{ background:'#0a0804' }}>
      {/* 100vh dark hero with overlay info */}
      <div style={{ position:'relative',height:'100vh',overflow:'hidden' }}>
        {img ? (
          <img src={img} alt={product.name} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',opacity:0.7 }}/>
        ) : (
          <div style={{ width:'100%',height:'100%',background:'linear-gradient(135deg,#1a1208 0%,#2d1f0e 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:160,fontFamily:'var(--font-heading)',color:G,opacity:0.12 }}>
            {(product.name||'T')[0]}
          </div>
        )}
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.7) 80%)' }}/>

        {/* Center overlay info */}
        <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40,textAlign:'center' }}>
          {product.collection_name && (
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.4em',textTransform:'uppercase',color:G,marginBottom:16 }}>{product.collection_name}</p>
          )}
          <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'clamp(2.4rem,6vw,5rem)',fontWeight:300,color:'#fff',letterSpacing:'0.08em',lineHeight:1.05,marginBottom:20,maxWidth:800 }}>{product.name}</h1>
          <p className={`pdp-price${price?'':' on-request'}`} style={{ color:price?G:'rgba(255,255,255,0.5)',fontSize:'clamp(1rem,2vw,1.4rem)',marginBottom:40 }}>{price||'Price on Request'}</p>
          <div style={{ display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center' }}>
            <a href={waHref} target="_blank" rel="noreferrer"
              style={{ display:'inline-flex',alignItems:'center',gap:10,padding:'14px 32px',background:'#25D366',color:'#fff',textDecoration:'none',fontSize:11,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase' }}>
              <MessageCircle size={15}/>Enquire
            </a>
            <button onClick={toggleWish}
              style={{ display:'inline-flex',alignItems:'center',gap:10,padding:'14px 32px',border:'1px solid rgba(255,255,255,0.5)',background:'none',color:'#fff',fontSize:11,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',cursor:'pointer' }}>
              <Heart size={15} fill={wishlisted?G:'none'} color={wishlisted?G:'#fff'}/>{wishlisted?'Saved':'Wishlist'}
            </button>
          </div>
        </div>

        {/* Scroll down arrow */}
        <button onClick={scrollToDetail}
          style={{ position:'absolute',bottom:32,left:'50%',transform:'translateX(-50%)',background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:6 }}>
          <span style={{ fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',color:'rgba(255,255,255,0.5)' }}>Discover</span>
          <ChevronDown size={18} color="rgba(255,255,255,0.5)" style={{ animation:'scrollBounce 1.5s ease infinite' }}/>
        </button>
      </div>

      {/* Details below hero */}
      <div ref={detailRef} style={{ background:'var(--color-bg)' }}>
        <div style={{ maxWidth:960,margin:'0 auto',padding:'80px 24px' }}>
          {product.description && (
            <p style={{ fontSize:17,color:M,lineHeight:1.9,marginBottom:48,textAlign:'center',maxWidth:700,marginLeft:'auto',marginRight:'auto' }}>{product.description}</p>
          )}
          <div style={{ display:'flex',gap:40,flexWrap:'wrap',justifyContent:'center',marginBottom:48 }}>
            <a href={waHref} target="_blank" rel="noreferrer" className="pdp-cta-primary"><MessageCircle size={16}/>Enquire on WhatsApp</a>
            <button onClick={toggleWish} className="pdp-cta-secondary"><Heart size={15}/>{wishlisted?'Saved':'Wishlist'}</button>
          </div>
          <SpecsTable product={product}/>
        </div>

        {related?.length > 0 && (
          <div style={{ maxWidth:1400,margin:'0 auto',padding:'0 24px 80px' }}>
            <h2 style={{ fontFamily:'var(--font-heading)',fontSize:'clamp(1.2rem,2vw,1.8rem)',fontWeight:400,color:T,marginBottom:32,textAlign:'center' }}>Related Pieces</h2>
            <div className="plp-grid-4">
              {related.slice(0,4).map(p=><ProductCard key={p.id} product={p} waNumber={waNumber}/>)}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes scrollBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}`}</style>
    </div>
  );
}