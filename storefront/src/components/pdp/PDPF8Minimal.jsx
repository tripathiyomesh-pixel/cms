'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import SpecsTable from './SpecsTable';
import ProductCard from '../plp/ProductCard';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/app/wishlist/page';

const G   = 'var(--color-accent)';
const T   = 'var(--color-text)';
const M   = 'var(--color-text-muted)';

export default function PDPF8Minimal({ product, related, goldRate, waNumber }) {
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
      <div style={{ maxWidth:700,margin:'0 auto',padding:'64px 24px 100px' }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize:11,color:M,letterSpacing:'0.08em',marginBottom:40,textAlign:'center' }}>
          <a href="/" style={{ color:M,textDecoration:'none' }}>Home</a>
          <span style={{ margin:'0 8px' }}>›</span>
          <a href="/jewellery" style={{ color:M,textDecoration:'none' }}>Jewellery</a>
          <span style={{ margin:'0 8px' }}>›</span>
          <span style={{ color:T }}>{product.name}</span>
        </nav>

        {/* Single centered image max 700px */}
        <div style={{ position:'relative',marginBottom:48,background:'#f5ede2',overflow:'hidden' }}>
          {images.length > 0 ? (
            <img src={images[active]} alt={product.name} style={{ width:'100%',display:'block',objectFit:'cover',maxHeight:640,transition:'opacity 200ms ease' }}/>
          ) : (
            <div style={{ height:520,display:'flex',alignItems:'center',justifyContent:'center',fontSize:120,fontFamily:'var(--font-heading)',color:G,opacity:0.18 }}>
              {(product.name||'T')[0]}
            </div>
          )}
          {images.length > 1 && (
            <>
              <button onClick={()=>setActive(i=>Math.max(0,i-1))}
                style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',width:36,height:36,background:'rgba(255,255,255,0.9)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <ChevronLeft size={16}/>
              </button>
              <button onClick={()=>setActive(i=>Math.min(images.length-1,i+1))}
                style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',width:36,height:36,background:'rgba(255,255,255,0.9)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <ChevronRight size={16}/>
              </button>
              <div style={{ position:'absolute',bottom:12,left:'50%',transform:'translateX(-50%)',display:'flex',gap:6 }}>
                {images.map((_,i)=><button key={i} onClick={()=>setActive(i)} style={{ width:active===i?20:6,height:6,borderRadius:3,background:active===i?G:'rgba(255,255,255,0.6)',border:'none',cursor:'pointer',transition:'all 150ms ease' }}/>)}
              </div>
            </>
          )}
        </div>

        {/* Generous whitespace, all centered */}
        <div style={{ textAlign:'center' }}>
          {product.collection_name && (
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.36em',textTransform:'uppercase',color:G,marginBottom:16 }}>{product.collection_name}</p>
          )}
          <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:300,color:T,letterSpacing:'0.06em',lineHeight:1.1,marginBottom:20 }}>{product.name}</h1>
          {product.sku && <p style={{ fontSize:11,color:M,marginBottom:20,letterSpacing:'0.1em' }}>SKU: {product.sku}</p>}
          <p style={{ fontSize:price?'1.4rem':'1rem',fontWeight:price?500:400,color:price?T:M,fontStyle:price?'normal':'italic',letterSpacing:price?'0.06em':'0.02em',marginBottom:40 }}>
            {price||'Price on Request'}
          </p>
          {product.description && (
            <p style={{ fontSize:15,color:M,lineHeight:1.9,marginBottom:48,maxWidth:560,marginLeft:'auto',marginRight:'auto' }}>{product.description}</p>
          )}
          <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:64 }}>
            <a href={waHref} target="_blank" rel="noreferrer" className="pdp-cta-primary">
              <MessageCircle size={16}/>Enquire on WhatsApp
            </a>
            <button onClick={toggleWish} className="pdp-cta-secondary">
              <Heart size={15} fill={wishlisted?G:'none'} color={wishlisted?G:'currentColor'}/>{wishlisted?'Saved':'Save to Wishlist'}
            </button>
          </div>
          <div style={{ textAlign:'left' }}>
            <SpecsTable product={product}/>
          </div>
        </div>
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
  );
}