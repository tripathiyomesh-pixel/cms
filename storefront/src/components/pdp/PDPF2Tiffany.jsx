'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import SpecsTable from './SpecsTable';
import ProductCard from '../plp/ProductCard';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/app/wishlist/page';

const G   = 'var(--color-accent)';
const T   = 'var(--color-text)';
const M   = 'var(--color-text-muted)';

export default function PDPF2Tiffany({ product, related, goldRate, waNumber }) {
  const [active,      setActive]      = useState(0);
  const [wishlisted,  setWishlisted]  = useState(false);
  useEffect(() => { if(product) setWishlisted(isInWishlist(product.id)); }, [product]);

  if (!product) return <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:M }}>Could not load. <button onClick={()=>window.location.reload()} style={{ marginLeft:8,color:G,background:'none',border:'none',cursor:'pointer',textDecoration:'underline' }}>Try again</button></div>;

  const images = Array.isArray(product.images) ? product.images : product.image_url ? [product.image_url] : [];
  const price  = product.final_price && Number(product.final_price)>0 ? `AED ${Number(product.final_price).toLocaleString('en-AE')}` : null;
  const waMsg  = encodeURIComponent(`Hi Tejori, I am interested in ${product.name}${product.sku?` (SKU: ${product.sku})`:``}. Please share pricing and availability.`);
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '/appointment';
  const toggleWish = () => { if(wishlisted){removeFromWishlist(product.id);setWishlisted(false);}else{addToWishlist(product);setWishlisted(true);} };

  return (
    <div style={{ background:'var(--color-bg)',minHeight:'100vh' }}>
      {/* Full-width hero image */}
      <div style={{ position:'relative',height:'72vh',minHeight:500,overflow:'hidden',background:'#f5ede2' }}>
        {images.length > 0 ? (
          <img src={images[active]} alt={product.name} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'center' }}/>
        ) : (
          <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:96,fontFamily:'var(--font-heading)',color:G,opacity:0.3 }}>
            {(product.name||'T')[0]}
          </div>
        )}
        {images.length > 1 && (
          <>
            <button onClick={()=>setActive(i=>Math.max(0,i-1))}
              style={{ position:'absolute',left:24,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.9)',border:'none',width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
              <ChevronLeft size={18}/>
            </button>
            <button onClick={()=>setActive(i=>Math.min(images.length-1,i+1))}
              style={{ position:'absolute',right:24,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.9)',border:'none',width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
              <ChevronRight size={18}/>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="thumb-strip" style={{ justifyContent:'center',padding:'12px 24px' }}>
          {images.map((img,i) => (
            <button key={i} onClick={()=>setActive(i)} className={active===i?'active':''}>
              <img src={img} alt=""/>
            </button>
          ))}
        </div>
      )}

      {/* Centered info below */}
      <div style={{ maxWidth:680,margin:'0 auto',padding:'48px 24px 80px',textAlign:'center' }}>
        {product.collection_name && (
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.3em',textTransform:'uppercase',color:G,marginBottom:12 }}>{product.collection_name}</p>
        )}
        <h1 className="pdp-name" style={{ textAlign:'center' }}>{product.name}</h1>
        {product.sku && <p style={{ fontSize:11,color:M,marginBottom:16 }}>SKU: {product.sku}</p>}
        <p className={`pdp-price${price?'':' on-request'}`} style={{ textAlign:'center',marginBottom:24 }}>{price||'Price on Request'}</p>
        {product.description && (
          <p style={{ fontSize:14,color:M,lineHeight:1.8,marginBottom:32 }}>{product.description}</p>
        )}
        <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:40 }}>
          <a href={waHref} target="_blank" rel="noreferrer" className="pdp-cta-primary">
            <MessageCircle size={16}/>Enquire on WhatsApp
          </a>
          <button onClick={toggleWish} className="pdp-cta-secondary">
            <Heart size={15} fill={wishlisted?G:'none'} color={wishlisted?G:'currentColor'}/> {wishlisted?'Saved':'Save to Wishlist'}
          </button>
        </div>
        <div style={{ textAlign:'left' }}>
          <SpecsTable product={product}/>
        </div>
      </div>

      {related?.length > 0 && (
        <div style={{ maxWidth:1400,margin:'0 auto',padding:'0 24px 80px' }}>
          <h2 style={{ fontFamily:'var(--font-heading)',fontSize:'clamp(1.2rem,2vw,1.8rem)',fontWeight:400,color:T,marginBottom:32,textAlign:'center' }}>You May Also Love</h2>
          <div className="plp-grid-4">
            {related.slice(0,4).map(p=><ProductCard key={p.id} product={p} waNumber={waNumber}/>)}
          </div>
        </div>
      )}
    </div>
  );
}