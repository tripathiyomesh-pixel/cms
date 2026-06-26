'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MessageCircle, Heart, ChevronDown, Share2 } from 'lucide-react';
import MediaViewer from './MediaViewer';
import SpecsTable from './SpecsTable';
import ProductCard from '../plp/ProductCard';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/app/wishlist/page';

const G   = 'var(--color-accent)';
const T   = 'var(--color-text)';
const M   = 'var(--color-text-muted)';

export default function PDPF1Cartier({ product, related, goldRate, waNumber }) {
  const [wishlisted,  setWishlisted]  = useState(false);
  const [specOpen,    setSpecOpen]    = useState(true);
  const infoRef = useRef(null);

  useEffect(() => { if(product) setWishlisted(isInWishlist(product.id)); }, [product]);

  if (!product) return <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:M }}>Could not load. <button onClick={()=>window.location.reload()} style={{ marginLeft:8,color:G,background:'none',border:'none',cursor:'pointer',textDecoration:'underline' }}>Try again</button></div>;

  const images  = Array.isArray(product.images) ? product.images : product.image_url ? [product.image_url] : [];
  const price   = product.final_price && Number(product.final_price)>0 ? `AED ${Number(product.final_price).toLocaleString('en-AE')}` : null;
  const waMsg   = encodeURIComponent(`Hi Tejori, I am interested in ${product.name}${product.sku?` (SKU: ${product.sku})`:``}. Please share pricing and availability.`);
  const waHref  = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '/appointment';

  const toggleWish = () => {
    if(wishlisted){removeFromWishlist(product.id);setWishlisted(false);}
    else{addToWishlist(product);setWishlisted(true);}
  };

  return (
    <div style={{ background:'var(--color-bg)',minHeight:'100vh' }}>
      <div style={{ maxWidth:1400,margin:'0 auto',padding:'24px',display:'flex',gap:0,alignItems:'flex-start',flexWrap:'wrap' }}>
        {/* 55% media */}
        <div style={{ flex:'0 0 55%',minWidth:300,padding:'0 32px 40px 0' }}>
          <MediaViewer images={images} videoUrl={product.video_url} frames={Array.isArray(product.frames_360)?product.frames_360:[]}/>
        </div>

        {/* 45% sticky info */}
        <div ref={infoRef} style={{ flex:'0 0 45%',minWidth:300,position:'sticky',top:80,maxHeight:'calc(100vh - 80px)',overflowY:'auto',paddingBottom:40 }} className="hide-scrollbar">
          {/* Breadcrumb */}
          <nav style={{ fontSize:11,color:M,letterSpacing:'0.08em',marginBottom:16 }}>
            <Link href="/" style={{ color:M,textDecoration:'none' }}>Home</Link>
            <span style={{ margin:'0 6px' }}>›</span>
            <Link href="/jewellery" style={{ color:M,textDecoration:'none' }}>Jewellery</Link>
            {product.category_name && <><span style={{ margin:'0 6px' }}>›</span><Link href={`/jewellery?category=${product.category_name}`} style={{ color:M,textDecoration:'none' }}>{product.category_name}</Link></>}
            <span style={{ margin:'0 6px' }}>›</span>
            <span style={{ color:T }}>{product.name}</span>
          </nav>

          {product.collection_name && (
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.3em',textTransform:'uppercase',color:G,marginBottom:10 }}>{product.collection_name}</p>
          )}
          <h1 className="pdp-name">{product.name}</h1>
          {product.sku && <p style={{ fontSize:11,color:M,marginBottom:16 }}>SKU: {product.sku}</p>}

          <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:24 }}>
            <p className={`pdp-price${price?'':' on-request'}`}>{price||'Price on Request'}</p>
            {goldRate && <p style={{ fontSize:11,color:M }}>Gold: AED {Number(goldRate).toLocaleString('en-AE')}/g</p>}
          </div>

          {product.description && (
            <p style={{ fontSize:14,color:M,lineHeight:1.8,marginBottom:28 }}>{product.description}</p>
          )}

          {/* CTAs */}
          <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:32 }}>
            <a href={waHref} target="_blank" rel="noreferrer" className="pdp-cta-primary">
              <MessageCircle size={16}/>Enquire on WhatsApp
            </a>
            <button onClick={toggleWish} className="pdp-cta-secondary">
              <Heart size={15} fill={wishlisted?G:'none'} color={wishlisted?G:'currentColor'}/> {wishlisted?'Saved to Wishlist':'Save to Wishlist'}
            </button>
          </div>

          {/* Specs accordion */}
          <div style={{ borderTop:'1px solid var(--color-border)',paddingTop:20 }}>
            <button onClick={()=>setSpecOpen(o=>!o)}
              style={{ display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',background:'none',border:'none',cursor:'pointer',paddingBottom:12 }}>
              <span style={{ fontSize:11,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:T }}>Product Details</span>
              <ChevronDown size={14} style={{ transform:specOpen?'rotate(180deg)':'rotate(0)',transition:'transform 200ms ease',color:M }}/>
            </button>
            {specOpen && <SpecsTable product={product}/>}
          </div>

          {/* Share */}
          <button onClick={()=>navigator.share&&navigator.share({title:product.name,url:window.location.href})}
            style={{ marginTop:20,display:'flex',alignItems:'center',gap:8,fontSize:11,color:M,background:'none',border:'none',cursor:'pointer',letterSpacing:'0.1em' }}>
            <Share2 size={13}/>Share this piece
          </button>
        </div>
      </div>

      {/* Related */}
      {related?.length > 0 && (
        <div style={{ maxWidth:1400,margin:'0 auto',padding:'0 24px 80px' }}>
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.3em',textTransform:'uppercase',color:G,marginBottom:8 }}>You May Also Love</p>
          <h2 style={{ fontFamily:'var(--font-heading)',fontSize:'clamp(1.2rem,2vw,1.8rem)',fontWeight:400,color:T,marginBottom:32 }}>Related Pieces</h2>
          <div className="plp-grid-4">
            {related.slice(0,4).map(p=><ProductCard key={p.id} product={p} waNumber={waNumber}/>)}
          </div>
        </div>
      )}

      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}