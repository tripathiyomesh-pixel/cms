'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle } from 'lucide-react';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/app/wishlist/page';

const G = 'var(--color-accent)';
const T = 'var(--color-text)';
const M = 'var(--color-text-muted)';

function formatPrice(p) {
  if (!p || Number(p) === 0) return null;
  return `AED ${Number(p).toLocaleString('en-AE')}`;
}

function Placeholder({ name = '' }) {
  const letter = (name[0] || 'T').toUpperCase();
  return (
    <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1a1208 0%,#2d1f0e 100%)' }}>
      <span style={{ fontFamily:'var(--font-heading)',fontSize:48,color:'var(--color-accent)',opacity:0.6,letterSpacing:4 }}>{letter}</span>
    </div>
  );
}

// Grid card
function GridCard({ product, waNumber }) {
  const [hovered,    setHovered]    = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  useEffect(() => { setWishlisted(isInWishlist(product.id)); }, [product.id]);

  const images = Array.isArray(product.images) ? product.images : product.image_url ? [product.image_url] : [];
  const img1   = images[0];
  const img2   = images[1] || img1;
  const price  = formatPrice(product.final_price);
  const href   = `/jewellery/${product.slug || product.id}`;
  const waMsg  = encodeURIComponent(`Hi Tejori, I am interested in ${product.name}${product.sku?` (SKU: ${product.sku})`:``}. Please share pricing and availability.`);
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '/appointment';

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (wishlisted) { removeFromWishlist(product.id); setWishlisted(false); }
    else { addToWishlist(product); setWishlisted(true); }
  };

  return (
    <div className="product-card" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
      <Link href={href} style={{ display:'block',textDecoration:'none' }}>
        <div className="product-card-image">
          {img1 ? (
            <>
              <img src={img1} alt={product.name} style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:hovered&&img2!==img1?0:1,transition:'opacity 300ms ease' }}/>
              {img2 && img2!==img1 && (
                <img src={img2} alt="" style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:hovered?1:0,transition:'opacity 300ms ease' }}/>
              )}
            </>
          ) : <Placeholder name={product.name}/>}

          {/* badges */}
          {product.collection_name && (
            <span style={{ position:'absolute',top:10,left:10,fontSize:9,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',padding:'3px 8px',background:G,color:'#fff' }}>{product.collection_name}</span>
          )}
          {product.is_new_arrival && (
            <span style={{ position:'absolute',top:product.collection_name?32:10,left:10,fontSize:9,fontWeight:700,letterSpacing:'0.12em',padding:'3px 8px',background:'#1a1208',color:'#fff' }}>New</span>
          )}

          {/* Hover overlay */}
          <div className="product-card-overlay">
            <a href={waHref} target="_blank" rel="noreferrer"
              onClick={e=>e.stopPropagation()}
              style={{ width:40,height:40,background:'#25D366',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none' }}
              title="Enquire on WhatsApp">
              <MessageCircle size={16} color="#fff"/>
            </a>
            <button onClick={toggleWishlist}
              style={{ width:40,height:40,background:'rgba(255,255,255,0.95)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}
              title="Save to Wishlist">
              <Heart size={16} fill={wishlisted?G:'none'} color={wishlisted?G:'#1a1208'}/>
            </button>
          </div>
        </div>

        <div className="product-card-info">
          <p className="product-card-name">{product.name}</p>
          {(product.metal_type||product.stone_type) && (
            <p className="product-card-meta">{[product.metal_type,product.stone_type].filter(Boolean).join(' · ')}</p>
          )}
          <p className={`product-card-price${price?'':' on-request'}`}>
            {price || 'Price on Request'}
          </p>
        </div>
      </Link>
    </div>
  );
}

// List card
function ListCard({ product, waNumber }) {
  const images = Array.isArray(product.images) ? product.images : product.image_url ? [product.image_url] : [];
  const img1   = images[0];
  const price  = formatPrice(product.final_price);
  const href   = `/jewellery/${product.slug || product.id}`;
  const waMsg  = encodeURIComponent(`Hi Tejori, I am interested in ${product.name}${product.sku?` (SKU: ${product.sku})`:``}. Please share pricing and availability.`);
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '/appointment';

  return (
    <div style={{ display:'flex',gap:20,padding:'16px 0',borderBottom:'1px solid var(--color-border)',transition:'background 150ms ease' }}
      onMouseEnter={e=>e.currentTarget.style.background='#f9f5f0'}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      <Link href={href} style={{ flexShrink:0,textDecoration:'none' }}>
        <div style={{ width:160,height:160,overflow:'hidden',background:'#f5ede2',flexShrink:0 }}>
          {img1 ? <img src={img1} alt={product.name} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 400ms ease' }}
            onMouseEnter={e=>e.target.style.transform='scale(1.04)'}
            onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
          : <Placeholder name={product.name}/>}
        </div>
      </Link>
      <div style={{ flex:1,minWidth:0 }}>
        <Link href={href} style={{ textDecoration:'none' }}>
          <p style={{ fontFamily:'var(--font-heading)',fontSize:18,fontWeight:400,color:T,marginBottom:4,letterSpacing:'0.04em' }}>{product.name}</p>
        </Link>
        {product.sku && <p style={{ fontSize:11,color:M,marginBottom:6 }}>SKU: {product.sku}</p>}
        {(product.metal_type||product.stone_type) && (
          <p style={{ fontSize:12,color:M,marginBottom:8 }}>{[product.metal_type,product.stone_type].filter(Boolean).join(' · ')}</p>
        )}
        {product.description && (
          <p style={{ fontSize:13,color:M,lineHeight:1.6,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>{product.description}</p>
        )}
      </div>
      <div style={{ flexShrink:0,display:'flex',flexDirection:'column',alignItems:'flex-end',justifyContent:'center',gap:12,minWidth:140 }}>
        <p style={{ fontSize:16,fontWeight:600,color:price?T:M,fontStyle:price?'normal':'italic' }}>{price||'Price on Request'}</p>
        <a href={waHref} target="_blank" rel="noreferrer"
          style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'9px 16px',background:'#25D366',color:'#fff',textDecoration:'none',fontSize:11,fontWeight:600,letterSpacing:'0.1em' }}>
          <MessageCircle size={13}/>WhatsApp
        </a>
      </div>
    </div>
  );
}

// Skeleton
export function SkeletonCard() {
  return (
    <div>
      <div style={{ aspectRatio:'1',background:'linear-gradient(90deg,#f0ebe3 25%,#e8e0d4 50%,#f0ebe3 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.4s ease-in-out infinite' }}/>
      <div style={{ padding:'12px 0' }}>
        <div style={{ height:13,background:'#f0ebe3',width:'72%',marginBottom:7,animation:'shimmer 1.4s ease-in-out infinite' }}/>
        <div style={{ height:11,background:'#f0ebe3',width:'45%',marginBottom:6,animation:'shimmer 1.4s ease-in-out infinite' }}/>
        <div style={{ height:13,background:'#f0ebe3',width:'30%',animation:'shimmer 1.4s ease-in-out infinite' }}/>
      </div>
    </div>
  );
}

export default function ProductCard({ product, waNumber, variant = 'grid', expectedType }) {
  if (process.env.NODE_ENV === 'development' &&
      product?.diamond_type &&
      expectedType &&
      product.diamond_type !== expectedType) {
    console.warn('Diamond type mismatch in ProductCard', product.sku, product.diamond_type, expectedType);
  }
  if (variant === 'list') return <ListCard product={product} waNumber={waNumber}/>;
  return <GridCard product={product} waNumber={waNumber}/>;
}