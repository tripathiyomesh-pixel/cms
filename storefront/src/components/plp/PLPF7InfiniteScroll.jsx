'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import useProducts from '@/lib/useProducts';
import FilterPanel from './FilterPanel';
import SortBar from './SortBar';
import ProductCard, { SkeletonCard } from './ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const G   = 'var(--color-accent)';
const T   = 'var(--color-text)';
const M   = 'var(--color-text-muted)';

export default function PLPF7InfiniteScroll({ preFilter = {}, heading = 'Jewellery' }) {
  const [waNum,       setWaNum]       = useState('');
  const [mobileFilter,setMobileFilter]= useState(false);
  const sentinel   = useRef(null);
  const firstRender= useRef(true);

  useEffect(() => {
    fetch(`${API}/settings/public`).then(r=>r.json()).then(d=>{
      const n=(d.data?.store_whatsapp||d.data?.whatsapp_number||'').replace(/\D/g,'');
      if(n) setWaNum(n);
    }).catch(()=>{});
  }, []);

  const { products, loading, error, total, hasMore, filters, setFilters, clearFilters, sort, setSort, loadMore } = useProducts({ preFilter });

  // Auto-load on sentinel visibility
  useEffect(() => {
    if (!sentinel.current || !hasMore || loading) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !loading && hasMore) loadMore(); },
      { rootMargin:'400px' }
    );
    obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [hasMore, loading, loadMore]);

  const activeCount = Object.values(filters).filter(v=>v!==undefined&&v!==''&&v!==null).length;

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
            {/* Mobile filter */}
            <div className="show-mobile" style={{ display:'flex',marginBottom:16 }}>
              <button onClick={()=>setMobileFilter(true)}
                style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 16px',border:'1px solid var(--color-border)',background:'none',cursor:'pointer',fontSize:12,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',flex:1,justifyContent:'center' }}>
                <SlidersHorizontal size={14}/>Filters{activeCount>0?` (${activeCount})`:''}
              </button>
            </div>

            <SortBar sort={sort} onSort={setSort} total={total}/>
            {error && <p style={{ color:'#dc2626',fontSize:13,marginBottom:16 }}>{error}</p>}

            {/* Products with fade-in animation */}
            <div className="plp-grid-3" style={{ position:'relative' }}>
              {loading && !products.length
                ? Array(12).fill(0).map((_,i)=><SkeletonCard key={i}/>)
                : products.map((p,i) => (
                    <div key={p.id} style={{ animation:`fadeIn 400ms ease ${Math.min(i%12*30,200)}ms both` }}>
                      <ProductCard product={p} waNumber={waNum}/>
                    </div>
                  ))
              }
            </div>

            {/* Sentinel + loader */}
            <div ref={sentinel} style={{ height:8 }}/>
            {loading && products.length > 0 && (
              <div style={{ textAlign:'center',padding:'32px 0',display:'flex',flexDirection:'column',alignItems:'center',gap:12 }}>
                <div style={{ display:'flex',gap:6 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:8,height:8,borderRadius:'50%',background:G,animation:`loadDot 800ms ease ${i*150}ms infinite alternate` }}/>
                  ))}
                </div>
                <span style={{ fontSize:11,color:M,letterSpacing:'0.1em',textTransform:'uppercase' }}>Loading more</span>
              </div>
            )}
            {!loading && !hasMore && products.length > 0 && (
              <p style={{ textAlign:'center',padding:'32px 0',fontSize:12,color:M,letterSpacing:'0.08em' }}>— All {total} pieces shown —</p>
            )}
            {!loading && products.length === 0 && !error && (
              <div style={{ textAlign:'center',padding:'60px 0' }}>
                <p style={{ fontFamily:'var(--font-heading)',fontSize:22,color:T,marginBottom:16 }}>No products found</p>
                <button onClick={clearFilters} style={{ fontSize:11,fontWeight:600,letterSpacing:'0.14em',color:G,background:'none',border:`1px solid ${G}`,padding:'10px 24px',cursor:'pointer' }}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilter && (
        <>
          <div onClick={()=>setMobileFilter(false)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:300 }}/>
          <div style={{ position:'fixed',bottom:0,left:0,right:0,background:'var(--color-bg)',zIndex:301,maxHeight:'85vh',overflowY:'auto',padding:'0 0 80px' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',borderBottom:'1px solid var(--color-border)',position:'sticky',top:0,background:'var(--color-bg)' }}>
              <span style={{ fontSize:14,fontWeight:600 }}>Filters</span>
              <button onClick={()=>setMobileFilter(false)} style={{ background:'none',border:'none',cursor:'pointer' }}><X size={18}/></button>
            </div>
            <FilterPanel filters={filters} onChange={setFilters} onClear={clearFilters} layout="drawer"/>
            <div style={{ position:'fixed',bottom:0,left:0,right:0,padding:'12px 24px',background:'var(--color-bg)',borderTop:'1px solid var(--color-border)' }}>
              <button onClick={()=>setMobileFilter(false)}
                style={{ width:'100%',padding:'14px',background:G,color:'#fff',border:'none',cursor:'pointer',fontSize:12,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase' }}>
                View Results
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes loadDot{from{opacity:0.3;transform:scale(0.8)}to{opacity:1;transform:scale(1.2)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @media(max-width:900px){.hide-mobile{display:none!important}.show-mobile{display:flex!important}}
        @media(min-width:901px){.show-mobile{display:none!important}}
      `}</style>
    </div>
  );
}