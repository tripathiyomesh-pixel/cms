'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, Heart } from 'lucide-react';
import SpecsTable from './SpecsTable';
import ProductCard from '../plp/ProductCard';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/app/wishlist/page';

const G   = 'var(--color-accent)';
const T   = 'var(--color-text)';
const M   = 'var(--color-text-muted)';

export default function PDPF4Magazine({ product, related, goldRate, waNumber }) {
  const [wishlisted, setWishlisted] = useState(false);
  useEffect(() => { if(product) setWishlisted(isInWishlist(product.id)); }, [product]);

  if (!product) return <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:M }}>Could not load. <button onClick={()=>window.location.reload()} style={{ marginLeft:8,color:G,background:'none',border:'none',cursor:'pointer',textDecoration:'underline' }}>Try again</button></div>;

  const images = Array.isArray(product.images) ? product.images : product.image_url ? [product.image_url] : [];
  const price  = product.final_price && Number(product.final_price)>0 ? `AED ${Number(product.final_price).toLocaleString('en-AE')}` : null;
  const waMsg  = encodeURIComponent(`Hi Tejori, I am interested in ${product.name}${product.sku?` (SKU: ${product.sku})`:``}. Please share pricing and availability.`);
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '/appointment';
  const toggleWish = () => { if(wishlisted){removeFromWishlist(product.id);setWishlisted(false);}else{addToWishlist(product);setWishlisted(true);} };

  const cols = images.length;
  const hasMulti = cols > 1;

  return (
    <div style={{ background:'var(--color-bg)',minHeight:'100vh' }}>
      <div style={{ maxWidth:1400,margin:'0 auto',display:'flex',gap:0,alignItems:'flex-start',flexWrap:'wrap' }}>
        {/* Tall stacked images left 60% */}
        <div style={{ flex:'0 0 60%',minWidth:300 }}>
          {images.length === 0 && (
            <div style={{ height:'90vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5ede2',fontSize:120,fontFamily:'var(--font-heading)',color:G,opacity:0.25 }}>
              {(product.name||'T')[0]}
            </div>
          )}
          {images.map((img,i) => (
            <div key={i} style={{ overflow:'hidden',background:'#f5ede2' }}>
              <img src={img} alt={product.name} style={{ width:'100%',display:'block',objectFit:'cover',height:hasMulti?'70vh':'85vh',transition:'transform 600ms ease' }}
                onMouseEnter={e=>e.target.style.transform='scale(1.03)'}
                onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
            </div>
          ))}
        </div>

        {/* Sticky info right 40% */}
        <div style={{ flex:'0 0 40%',minWidth:280,padding:'64px 40px',position:'sticky',top:0,height:'100vh',overflowY:'auto',display:'flex',flexDirection:'column',justifyContent:'center' }} className="hide-scrollbar">
          {product.collection_name && (
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.3em',textTransform:'uppercase',color:G,marginBottom:12 }}>{product.collection_name}</p>
          )}
          <h1 className="pdp-name">{product.name}</h1>
          {product.sku && <p style={{ fontSize:11,color:M,marginBottom:16 }}>SKU: {product.sku}</p>}
          <p className={`pdp-price${price?'':' on-request'}`} style={{ marginBottom:24 }}>{price||'Price on Request'}</p>
          {product.description && (
            <p style={{ fontSize:14,color:M,lineHeight:1.8,marginBottom:32 }}>{product.description}</p>
          )}
          <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:36 }}>
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