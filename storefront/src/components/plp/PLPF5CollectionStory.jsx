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

const FILTER_CHIPS = ['All','Rings','Necklaces','Bracelets','Earrings','Sets','Bangles','Pendants'];

export default function PLPF5CollectionStory({ preFilter = {}, heading = 'Collection', heroImage = '', heroTag = '', heroDesc = '' }) {
  const [waNum,   setWaNum]   = useState('');
  const [catChip, setCatChip] = useState('All');
  useEffect(() => {
    fetch(`${API}/settings/public`).then(r=>r.json()).then(d=>{
      const n=(d.data?.store_whatsapp||d.data?.whatsapp_number||'').replace(/\D/g,'');
      if(n) setWaNum(n);
    }).catch(()=>{});
  }, []);

  const effectiveFilter = { ...preFilter, ...(catChip !== 'All' ? { category: catChip } : {}) };
  const { products, loading, error, total, hasMore, filters, setFilters, clearFilters, sort, setSort, loadMore } = useProducts({ preFilter: effectiveFilter });

  return (
    <div style={{ background:'var(--color-bg)',minHeight:'100vh' }}>
      {/* Hero banner */}
      <div style={{ position:'relative',height:'60vh',minHeight:400,overflow:'hidden' }}>
        {heroImage && <img src={heroImage} alt={heading} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'center' }}/>}
        {!heroImage && <div style={{ width:'100%',height:'100%',background:'linear-gradient(135deg,#1a1208 0%,#2d1f0e 60%,#3d2a14 100%)' }}/>}
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.55) 100%)' }}/>
        <div style={{ position:'absolute',bottom:0,left:0,right:0,padding:'48px 48px 56px',maxWidth:1400,margin:'0 auto' }}>
          {heroTag && <p style={{ fontSize:10,fontWeight:700,letterSpacing:'0.3em',textTransform:'uppercase',color:G,marginBottom:12 }}>{heroTag}</p>}
          <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'clamp(2rem,5vw,4rem)',fontWeight:400,color:'#fff',letterSpacing:'0.06em',lineHeight:1.1,marginBottom:heroDesc?16:0 }}>{heading}</h1>
          {heroDesc && <p style={{ fontSize:15,color:'rgba(255,255,255,0.75)',maxWidth:560,lineHeight:1.7 }}>{heroDesc}</p>}
        </div>
      </div>

      {/* Sticky filter chips */}
      <div style={{ position:'sticky',top:0,zIndex:40,background:'var(--color-bg)',borderBottom:'1px solid var(--color-border)',backdropFilter:'blur(8px)' }}>
        <div style={{ maxWidth:1400,margin:'0 auto',padding:'0 24px',display:'flex',alignItems:'center',gap:8,overflowX:'auto',height:52 }} className="hide-scrollbar">
          {FILTER_CHIPS.map(chip=>(
            <button key={chip} onClick={()=>{ setCatChip(chip); clearFilters(); }}
              style={{ flexShrink:0,padding:'6px 16px',border:`1px solid ${catChip===chip?G:'var(--color-border)'}`,background:catChip===chip?G:'transparent',color:catChip===chip?'#fff':T,fontSize:11,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',cursor:'pointer',transition:'all 150ms ease',whiteSpace:'nowrap' }}>
              {chip}
            </button>
          ))}
          <div style={{ marginLeft:'auto',flexShrink:0 }}>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{ padding:'6px 12px',border:'1px solid var(--color-border)',fontSize:11,background:'var(--color-bg)',cursor:'pointer',outline:'none',letterSpacing:'0.06em' }}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </div>
        </div>
      </div>

      <div className="plp-container" style={{ paddingTop:40,paddingBottom:80 }}>
        {total > 0 && <p style={{ fontSize:12,color:M,marginBottom:24 }}>{total} pieces</p>}
        {error && <p style={{ color:'#dc2626',fontSize:13,marginBottom:16 }}>{error}</p>}
        <div className="plp-grid-3">
          {loading && !products.length ? Array(9).fill(0).map((_,i)=><SkeletonCard key={i}/>) : products.map(p=><ProductCard key={p.id} product={p} waNumber={waNum}/>)}
        </div>
        {!loading && products.length===0 && (
          <div style={{ textAlign:'center',padding:'60px 0' }}>
            <p style={{ fontFamily:'var(--font-heading)',fontSize:22,color:T,marginBottom:16 }}>No pieces found in this category</p>
            <button onClick={()=>setCatChip('All')} style={{ fontSize:11,fontWeight:600,letterSpacing:'0.14em',color:G,background:'none',border:`1px solid ${G}`,padding:'10px 24px',cursor:'pointer' }}>View All</button>
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
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}