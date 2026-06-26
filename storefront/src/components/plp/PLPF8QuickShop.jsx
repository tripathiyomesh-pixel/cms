'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Eye, Heart } from 'lucide-react';
import useProducts from '@/lib/useProducts';
import FilterPanel from './FilterPanel';
import SortBar from './SortBar';
import { SkeletonCard } from './ProductCard';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/app/wishlist/page';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const G   = 'var(--color-accent)';
const T   = 'var(--color-text)';
const M   = 'var(--color-text-muted)';

function QuickShopCard({ product, waNumber }) {
  const [hovered,    setHovered]    = useState(false);
  const [wishlisted, setWishlisted] = useState(() => isInWishlist(product.id));
  const images = Array.isArray(product.images) ? product.images : product.image_url ? [product.image_url] : [];
  const img1   = images[0];
  const img2   = images[1] || img1;
  const price  = product.final_price && Number(product.final_price) > 0 ? `AED ${Number(product.final_price).toLocaleString('en-AE')}` : null;
  const href   = `/jewellery/${product.slug||product.id}`;
  const waMsg  = encodeURIComponent(`Hi Tejori, I am interested in ${product.name}${product.sku?` (SKU: ${product.sku})`:``}. Please share pricing and availability.`);
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '/appointment';

  return (
    <div className="product-card" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
      <div className="product-card-image" style={{ position:'relative' }}>
        {img1 ? (
          <>
            <img src={img1} alt={product.name} style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:hovered&&img2!==img1?0:1,transition:'opacity 300ms ease' }}/>
            {img2&&img2!==img1&&<img src={img2} alt="" style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:hovered?1:0,transition:'opacity 300ms ease' }}/>}
          </>
        ) : (
          <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1a1208 0%,#2d1f0e 100%)',fontSize:48,fontFamily:'var(--font-heading)',color:G,opacity:0.6 }}>
            {(product.name||'T')[0]}
          </div>
        )}
        {product.collection_name && (
          <span style={{ position:'absolute',top:10,left:10,fontSize:9,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',padding:'3px 8px',background:G,color:'#fff' }}>{product.collection_name}</span>
        )}

        {/* Quick shop panel slides up on hover */}
        <div style={{
          position:'absolute',bottom:0,left:0,right:0,
          background:'rgba(26,18,8,0.94)',
          transform:hovered?'translateY(0)':'translateY(100%)',
          transition:'transform 250ms ease',
          padding:'14px 16px',
          display:'flex',flexDirection:'column',gap:10
        }}>
          <p style={{ fontFamily:'var(--font-heading)',fontSize:14,color:'#fff',lineHeight:1.2,marginBottom:4 }}>{product.name}</p>
          <p style={{ fontSize:12,fontWeight:600,color:price?G:'rgba(255,255,255,0.5)',fontStyle:price?'normal':'italic',marginBottom:8 }}>
            {price||'Price on Request'}
          </p>
          <div style={{ display:'flex',gap:8 }}>
            <a href={waHref} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
              style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:7,padding:'9px 12px',background:'#25D366',color:'#fff',textDecoration:'none',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase' }}>
              <MessageCircle size={12}/>WhatsApp
            </a>
            <Link href={href}
              style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:7,padding:'9px 14px',border:'1px solid rgba(255,255,255,0.3)',color:'#fff',textDecoration:'none',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase' }}>
              <Eye size={12}/>View
            </Link>
          </div>
        </div>

        {/* Wishlist corner button — always visible */}
        <button onClick={e=>{ e.preventDefault(); if(wishlisted){removeFromWishlist(product.id);setWishlisted(false);}else{addToWishlist(product);setWishlisted(true);} }}
          style={{ position:'absolute',top:10,right:10,width:32,height:32,background:'rgba(255,255,255,0.9)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'opacity 200ms ease',opacity:hovered?1:0.7 }}>
          <Heart size={14} fill={wishlisted?G:'none'} color={wishlisted?G:'#1a1208'}/>
        </button>
      </div>

      <div className="product-card-info">
        <Link href={href} style={{ textDecoration:'none' }}>
          <p className="product-card-name">{product.name}</p>
        </Link>
        {(product.metal_type||product.stone_type) && (
          <p className="product-card-meta">{[product.metal_type,product.stone_type].filter(Boolean).join(' · ')}</p>
        )}
        <p className={`product-card-price${price?'':' on-request'}`}>{price||'Price on Request'}</p>
      </div>
    </div>
  );
}

export default function PLPF8QuickShop({ preFilter = {}, heading = 'Jewellery' }) {
  const [waNum, setWaNum] = useState('');
  const [view,  setView]  = useState('grid');
  useEffect(() => {
    fetch(`${API}/settings/public`).then(r=>r.json()).then(d=>{
      const n=(d.data?.store_whatsapp||d.data?.whatsapp_number||'').replace(/\D/g,'');
      if(n) setWaNum(n);
    }).catch(()=>{});
  }, []);

  const { products, loading, error, total, hasMore, filters, setFilters, clearFilters, sort, setSort, loadMore } = useProducts({ preFilter });

  return (
    <div style={{ background:'var(--color-bg)',minHeight:'100vh' }}>
      <div className="plp-container" style={{ paddingTop:32,paddingBottom:80 }}>
        <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'clamp(1.6rem,3vw,2.4rem)',fontWeight:400,color:T,letterSpacing:'0.06em',marginBottom:32 }}>
          {heading}{total>0&&` (${total})`}
        </h1>
        <div style={{ display:'flex',gap:40,alignItems:'flex-start' }}>
          <div className="hide-mobile">
            <FilterPanel filters={filters} onChange={setFilters} onClear={clearFilters} layout="sidebar"/>
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <SortBar sort={sort} onSort={setSort} total={total} view={view} onViewChange={setView}/>
            {error && <p style={{ color:'#dc2626',fontSize:13,marginBottom:16 }}>{error}</p>}
            <div className="plp-grid-3">
              {loading && !products.length
                ? Array(12).fill(0).map((_,i)=><SkeletonCard key={i}/>)
                : products.map(p=><QuickShopCard key={p.id} product={p} waNumber={waNum}/>)
              }
            </div>
            {!loading && products.length===0 && !error && (
              <div style={{ textAlign:'center',padding:'60px 0' }}>
                <p style={{ fontFamily:'var(--font-heading)',fontSize:22,color:T,marginBottom:16 }}>No products found</p>
                <button onClick={clearFilters} style={{ fontSize:11,fontWeight:600,letterSpacing:'0.14em',color:G,background:'none',border:`1px solid ${G}`,padding:'10px 24px',cursor:'pointer' }}>Clear Filters</button>
              </div>
            )}
            {hasMore && (
              <div style={{ textAlign:'center',marginTop:40 }}>
                <button onClick={loadMore} disabled={loading} style={{ padding:'13px 40px',border:`1px solid ${G}`,background:'none',color:G,fontSize:11,fontWeight:600,letterSpacing:'0.16em',cursor:'pointer',opacity:loading?0.5:1 }}>
                  {loading?'Loading…':'Load More'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} @media(max-width:900px){.hide-mobile{display:none!important}}`}</style>
    </div>
  );
}