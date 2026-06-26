'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useProducts from '@/lib/useProducts';
import SortBar from './SortBar';
import ProductCard, { SkeletonCard } from './ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const G   = 'var(--color-accent)';
const T   = 'var(--color-text)';
const M   = 'var(--color-text-muted)';

const CAT_IMAGES = {
  Rings:       'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120&q=80',
  Necklaces:   'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=120&q=80',
  Bracelets:   'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=120&q=80',
  Earrings:    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=120&q=80',
  Sets:        'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=120&q=80',
  Bangles:     'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=120&q=80',
  Pendants:    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=120&q=80',
};
const COL_IMAGES = {
  Adamas:         'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120&q=80',
  Mallika:        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=120&q=80',
  Frost:          'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=120&q=80',
  'High Jewellery':'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=120&q=80',
  Farashat:       'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=120&q=80',
  Luluaat:        'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=120&q=80',
};
const METALS = ['18K White Gold','18K Yellow Gold','18K Rose Gold','22K Gold','Platinum'];

export default function PLPF3EditorialSidebar({ preFilter = {}, heading = 'Jewellery' }) {
  const [waNum, setWaNum] = useState('');
  useEffect(() => {
    fetch(`${API}/settings/public`).then(r=>r.json()).then(d=>{
      const n=(d.data?.store_whatsapp||d.data?.whatsapp_number||'').replace(/\D/g,'');
      if(n) setWaNum(n);
    }).catch(()=>{});
  }, []);

  const { products, loading, error, total, hasMore, filters, setFilters, clearFilters, sort, setSort, loadMore } = useProducts({ preFilter });

  const NavItem = ({ label, img, active, onClick }) => (
    <button onClick={onClick}
      style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:'8px 12px',background:active?'#f5ede2':'none',border:active?`1px solid ${G}`:'1px solid transparent',cursor:'pointer',textAlign:'left',transition:'all 150ms ease',marginBottom:4 }}>
      <div style={{ width:52,height:52,overflow:'hidden',flexShrink:0,background:'#f0e8dc' }}>
        {img && <img src={img} alt={label} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>}
        {!img && <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontFamily:'var(--font-heading)',color:G }}>{label[0]}</div>}
      </div>
      <span style={{ flex:1,fontSize:13,fontFamily:'var(--font-heading)',fontWeight:active?600:400,color:active?G:T,letterSpacing:'0.04em' }}>{label}</span>
      <span style={{ fontSize:10,color:M }}>›</span>
    </button>
  );

  return (
    <div style={{ background:'var(--color-bg)',minHeight:'100vh' }}>
      <div className="plp-container" style={{ paddingTop:32,paddingBottom:80 }}>
        <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'clamp(1.6rem,3vw,2.4rem)',fontWeight:400,color:T,letterSpacing:'0.06em',marginBottom:32 }}>
          {filters.category || filters.collection || heading}{total>0&&` (${total})`}
        </h1>
        <div style={{ display:'flex',gap:40,alignItems:'flex-start' }}>
          {/* Editorial sidebar */}
          <aside style={{ width:300,flexShrink:0,position:'sticky',top:80,height:'calc(100vh - 80px)',overflowY:'auto',paddingRight:12,paddingBottom:40 }}>
            {/* Categories */}
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:M,marginBottom:12,paddingBottom:8,borderBottom:'1px solid var(--color-border)' }}>Shop by Type</p>
            <NavItem label="All Jewellery" img={null} active={!filters.category&&!filters.collection} onClick={()=>clearFilters()}/>
            {Object.entries(CAT_IMAGES).map(([cat,img])=>(
              <NavItem key={cat} label={cat} img={img} active={filters.category===cat}
                onClick={()=>setFilters({category: filters.category===cat ? undefined : cat, collection:undefined})}/>
            ))}

            {/* Collections */}
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:M,margin:'20px 0 12px',paddingBottom:8,borderBottom:'1px solid var(--color-border)' }}>Collections</p>
            {Object.entries(COL_IMAGES).map(([col,img])=>(
              <NavItem key={col} label={col} img={img} active={filters.collection===col}
                onClick={()=>setFilters({collection: filters.collection===col ? undefined : col, category:undefined})}/>
            ))}

            {/* Metal type pills */}
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:M,margin:'20px 0 10px',paddingBottom:8,borderBottom:'1px solid var(--color-border)' }}>Metal Type</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
              {METALS.map(m=>(
                <button key={m} onClick={()=>setFilters({metal_type: filters.metal_type===m ? undefined : m})}
                  style={{ padding:'5px 10px',fontSize:10,border:`1px solid ${filters.metal_type===m?G:'var(--color-border)'}`,background:filters.metal_type===m?G:'none',color:filters.metal_type===m?'#fff':T,cursor:'pointer',letterSpacing:'0.06em',transition:'all 150ms ease' }}>
                  {m}
                </button>
              ))}
            </div>
          </aside>

          <div style={{ flex:1,minWidth:0 }}>
            <SortBar sort={sort} onSort={setSort} total={total}/>
            {error && <p style={{ color:'#dc2626',fontSize:13,marginBottom:16 }}>{error}</p>}
            <div className="plp-grid-3">
              {loading && !products.length ? Array(9).fill(0).map((_,i)=><SkeletonCard key={i}/>) : products.map(p=><ProductCard key={p.id} product={p} waNumber={waNum}/>)}
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
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}