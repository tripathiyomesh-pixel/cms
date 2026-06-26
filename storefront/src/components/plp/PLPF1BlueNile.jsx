'use client';
import { useState, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import useProducts from '@/lib/useProducts';
import FilterPanel from './FilterPanel';
import SortBar from './SortBar';
import ProductCard, { SkeletonCard } from './ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const G   = 'var(--color-accent)';
const T   = 'var(--color-text)';
const M   = 'var(--color-text-muted)';

export default function PLPF1BlueNile({ preFilter = {}, heading = 'Jewellery' }) {
  const [waNum,       setWaNum]       = useState('');
  const [mobileFilter,setMobileFilter]= useState(false);
  const [view,        setView]        = useState('grid');

  useEffect(() => {
    fetch(`${API}/settings/public`).then(r=>r.json()).then(d=>{
      const n=(d.data?.store_whatsapp||d.data?.whatsapp_number||'').replace(/\D/g,'');
      if(n) setWaNum(n);
    }).catch(()=>{});
  }, []);

  const { products, loading, error, total, hasMore, filters, setFilters, clearFilters, sort, setSort, loadMore } = useProducts({ preFilter });

  const activeCount = Object.values(filters).filter(v=>v!==undefined&&v!==''&&v!==null).length;
  const h1 = filters.category ? `${filters.category}` : heading;

  return (
    <div style={{ background:'var(--color-bg)',minHeight:'100vh' }}>
      {/* Page heading */}
      <div style={{ borderBottom:'1px solid var(--color-border)',padding:'32px 24px 24px',maxWidth:1400,margin:'0 auto' }}>
        <nav style={{ fontSize:11,color:M,letterSpacing:'0.1em',marginBottom:12 }}>
          <Link href="/" style={{ color:M,textDecoration:'none' }}>Home</Link>
          <span style={{ margin:'0 8px' }}>›</span>
          <span style={{ color:T }}>{h1}</span>
        </nav>
        <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'clamp(1.6rem,3vw,2.4rem)',fontWeight:400,color:T,letterSpacing:'0.06em' }}>
          {h1}{total > 0 ? ` (${total})` : ''}
        </h1>
      </div>

      <div className="plp-container" style={{ paddingTop:32,paddingBottom:80 }}>
        <div style={{ display:'flex',gap:40,alignItems:'flex-start' }}>
          {/* Desktop sidebar */}
          <div className="hide-mobile">
            <FilterPanel filters={filters} onChange={setFilters} onClear={clearFilters} layout="sidebar"/>
          </div>

          {/* Main content */}
          <div style={{ flex:1,minWidth:0 }}>
            {/* Mobile filter bar */}
            <div className="show-mobile" style={{ display:'flex',gap:10,marginBottom:16 }}>
              <button onClick={()=>setMobileFilter(true)}
                style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 16px',border:'1px solid var(--color-border)',background:'none',cursor:'pointer',fontSize:12,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',flex:1,justifyContent:'center' }}>
                <SlidersHorizontal size={14}/>Filters{activeCount>0?` (${activeCount})`:''}
              </button>
            </div>

            <SortBar sort={sort} onSort={setSort} total={total} view={view} onViewChange={setView}/>

            {error && <p style={{ color:'#dc2626',padding:'20px 0',fontSize:13 }}>{error}</p>}

            {view==='list' ? (
              <div>
                {loading && !products.length ? Array(6).fill(0).map((_,i)=><SkeletonCard key={i}/>) : products.map(p=><ProductCard key={p.id} product={p} waNumber={waNum} variant="list"/>)}
              </div>
            ) : (
              <div className="plp-grid-3">
                {loading && !products.length ? Array(12).fill(0).map((_,i)=><SkeletonCard key={i}/>) : products.map(p=><ProductCard key={p.id} product={p} waNumber={waNum}/>)}
              </div>
            )}

            {!loading && !error && products.length===0 && (
              <div style={{ textAlign:'center',padding:'80px 24px' }}>
                <p style={{ fontFamily:'var(--font-heading)',fontSize:24,color:T,marginBottom:12 }}>No products found</p>
                <p style={{ fontSize:13,color:M,marginBottom:24 }}>Try adjusting your filters</p>
                <button onClick={clearFilters} style={{ fontSize:11,fontWeight:600,letterSpacing:'0.14em',textTransform:'uppercase',color:G,background:'none',border:`1px solid ${G}`,padding:'11px 24px',cursor:'pointer' }}>Clear Filters</button>
              </div>
            )}

            {hasMore && (
              <div style={{ textAlign:'center',marginTop:40 }}>
                <p style={{ fontSize:12,color:M,marginBottom:16 }}>Showing {products.length} of {total} products</p>
                <button onClick={loadMore} disabled={loading}
                  style={{ padding:'13px 40px',border:`1px solid ${G}`,background:'none',color:G,fontSize:11,fontWeight:600,letterSpacing:'0.16em',textTransform:'uppercase',cursor:'pointer',opacity:loading?0.5:1 }}>
                  {loading?'Loading…':'Load More'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
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
                Show {total} Results
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} @media(max-width:900px){.hide-mobile{display:none!important}.show-mobile{display:flex!important}} @media(min-width:901px){.show-mobile{display:none!important}}`}</style>
    </div>
  );
}