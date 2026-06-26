'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, Heart } from 'lucide-react';
import Link from 'next/link';
import useProducts from '@/lib/useProducts';
import FilterPanel from './FilterPanel';
import SortBar from './SortBar';
import { SkeletonCard } from './ProductCard';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/app/wishlist/page';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const G   = 'var(--color-accent)';
const T   = 'var(--color-text)';
const M   = 'var(--color-text-muted)';

function MasonryCard({ product, waNumber }) {
  const [hovered,    setHovered]    = useState(false);
  const [wishlisted, setWishlisted] = useState(() => isInWishlist(product.id));
  const images = Array.isArray(product.images) ? product.images : product.image_url ? [product.image_url] : [];
  const img    = images[0];
  const price  = product.final_price && Number(product.final_price) > 0 ? `AED ${Number(product.final_price).toLocaleString('en-AE')}` : null;
  const href   = `/jewellery/${product.slug||product.id}`;
  const waMsg  = encodeURIComponent(`Hi Tejori, I am interested in ${product.name}${product.sku?` (SKU: ${product.sku})`:``}. Please share pricing and availability.`);
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '/appointment';

  return (
    <div style={{ breakInside:'avoid',marginBottom:16,position:'relative',border:`1px solid ${hovered?G:'transparent'}`,transition:'border-color 200ms ease' }}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
      <Link href={href} style={{ display:'block',textDecoration:'none' }}>
        {img ? (
          <img src={img} alt={product.name} style={{ width:'100%',display:'block',objectFit:'cover',transition:'transform 400ms ease',transform:hovered?'scale(1.02)':'scale(1)' }}/>
        ) : (
          <div style={{ width:'100%',aspectRatio:'1',background:'linear-gradient(135deg,#1a1208 0%,#2d1f0e 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48,fontFamily:'var(--font-heading)',color:G,opacity:0.6 }}>
            {(product.name||'T')[0]}
          </div>
        )}
        <div style={{ padding:'10px 12px 14px' }}>
          <p style={{ fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,letterSpacing:'0.04em',marginBottom:2 }}>{product.name}</p>
          {(product.metal_type||product.stone_type) && (
            <p style={{ fontSize:11,color:M,marginBottom:4 }}>{[product.metal_type,product.stone_type].filter(Boolean).join(' · ')}</p>
          )}
          <p style={{ fontSize:13,fontWeight:price?600:400,color:price?T:M,fontStyle:price?'normal':'italic' }}>{price||'Price on Request'}</p>
        </div>
      </Link>
      {hovered && (
        <div style={{ position:'absolute',top:8,right:8,display:'flex',flexDirection:'column',gap:6 }}>
          <a href={waHref} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
            style={{ width:36,height:36,background:'#25D366',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none' }}>
            <MessageCircle size={14} color="#fff"/>
          </a>
          <button onClick={e=>{e.preventDefault();if(wishlisted){removeFromWishlist(product.id);setWishlisted(false);}else{addToWishlist(product);setWishlisted(true);}}}
            style={{ width:36,height:36,background:'rgba(255,255,255,0.95)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Heart size={14} fill={wishlisted?G:'none'} color={wishlisted?G:'#1a1208'}/>
          </button>
        </div>
      )}
    </div>
  );
}

export default function PLPF4Masonry({ preFilter = {}, heading = 'Jewellery' }) {
  const [waNum, setWaNum] = useState('');
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
            <SortBar sort={sort} onSort={setSort} total={total}/>
            {error && <p style={{ color:'#dc2626',fontSize:13,marginBottom:16 }}>{error}</p>}
            {/* CSS columns masonry */}
            <div style={{ columns:'4 220px',columnGap:16 }}>
              {loading && !products.length
                ? Array(12).fill(0).map((_,i)=>(
                    <div key={i} style={{ breakInside:'avoid',marginBottom:16 }}>
                      <div style={{ background:'linear-gradient(90deg,#f0ebe3 25%,#e8e0d4 50%,#f0ebe3 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.4s ease-in-out infinite',height:Math.random()>0.5?280:200,width:'100%' }}/>
                    </div>
                  ))
                : products.map(p=><MasonryCard key={p.id} product={p} waNumber={waNum}/>)
              }
            </div>
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