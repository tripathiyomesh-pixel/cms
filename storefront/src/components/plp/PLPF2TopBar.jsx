'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import useProducts from '@/lib/useProducts';
import SortBar from './SortBar';
import ProductCard, { SkeletonCard } from './ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const G   = 'var(--color-accent)';
const T   = 'var(--color-text)';
const M   = 'var(--color-text-muted)';

const FILTER_OPTS = {
  Category:   ['Rings','Necklaces','Bracelets','Earrings','Sets','Bangles','Pendants'],
  Metal:      ['18K White Gold','18K Yellow Gold','18K Rose Gold','22K Gold','Platinum'],
  Price:      ['Under 5K','5K–15K','15K–50K','50K–100K','Over 100K'],
  Collection: ['Adamas','Frost','Mallika','High Jewellery','Farashat','Luluaat'],
};
const PRICE_MAP = { 'Under 5K':{min:0,max:5000},'5K–15K':{min:5000,max:15000},'15K–50K':{min:15000,max:50000},'50K–100K':{min:50000,max:100000},'Over 100K':{min:100000,max:null} };

function DropFilter({ label, options, filterKey, filters, onSet }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const fn = (e) => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return ()=>document.removeEventListener('mousedown',fn);
  }, []);

  const active = filterKey==='Price'
    ? (filters.price_min!==undefined||filters.price_max!==undefined)
    : !!filters[filterKey.toLowerCase()];

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',border:`1px solid ${active?G:M}`,background:active?G:'transparent',color:active?'#fff':T,cursor:'pointer',fontSize:11,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',transition:'all 150ms ease' }}>
        {label}{active&&<span style={{ background:'rgba(255,255,255,0.3)',borderRadius:10,padding:'1px 6px',fontSize:10 }}>✓</span>}
        <ChevronDown size={11} style={{ transform:open?'rotate(180deg)':'rotate(0)',transition:'transform 150ms ease' }}/>
      </button>
      {open && (
        <div style={{ position:'absolute',top:'100%',left:0,marginTop:4,background:'var(--color-bg)',border:'1px solid var(--color-border)',boxShadow:'0 12px 40px rgba(0,0,0,0.1)',minWidth:200,zIndex:50,padding:16 }}>
          {options.map(opt => {
            const k = filterKey.toLowerCase();
            const isActive = filterKey==='Price' ? false : filters[k]===opt;
            return (
              <label key={opt} style={{ display:'flex',alignItems:'center',gap:10,padding:'6px 0',cursor:'pointer',fontSize:13 }}>
                <input type="checkbox" checked={isActive} onChange={e=>{
                  if(filterKey==='Price') {
                    const r = PRICE_MAP[opt];
                    onSet({price_min:r?.min,price_max:r?.max});
                  } else {
                    onSet({ [k]: isActive ? undefined : opt });
                  }
                  setOpen(false);
                }} style={{ accentColor:G }}/>
                {opt}
              </label>
            );
          })}
          <button onClick={()=>{
            if(filterKey==='Price') onSet({price_min:undefined,price_max:undefined});
            else onSet({ [filterKey.toLowerCase()]: undefined });
            setOpen(false);
          }} style={{ marginTop:10,fontSize:11,color:G,background:'none',border:'none',cursor:'pointer',textDecoration:'underline' }}>Clear</button>
        </div>
      )}
    </div>
  );
}

export default function PLPF2TopBar({ preFilter = {}, heading = 'Jewellery' }) {
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
      {/* Sticky top filter bar */}
      <div style={{ position:'sticky',top:0,zIndex:50,background:'var(--color-bg)',borderBottom:'1px solid var(--color-border)',padding:'12px 24px',backdropFilter:'blur(8px)' }}>
        <div style={{ maxWidth:1400,margin:'0 auto',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap' }}>
          <span style={{ fontFamily:'var(--font-heading)',fontSize:16,fontWeight:400,color:T,marginRight:8,whiteSpace:'nowrap' }}>{heading} {total>0&&`(${total})`}</span>
          {Object.entries(FILTER_OPTS).map(([label,opts])=>(
            <DropFilter key={label} label={label} options={opts} filterKey={label} filters={filters} onSet={setFilters}/>
          ))}
          <div style={{ marginLeft:'auto',display:'flex',gap:8,alignItems:'center' }}>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{ padding:'8px 12px',border:'1px solid var(--color-border)',fontSize:11,background:'var(--color-bg)',cursor:'pointer',outline:'none',letterSpacing:'0.06em' }}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </div>
        </div>
      </div>

      <div className="plp-container" style={{ paddingTop:32,paddingBottom:80 }}>
        {error && <p style={{ color:'#dc2626',padding:'20px 0',fontSize:13 }}>{error}</p>}
        <div className="plp-grid-4">
          {loading && !products.length ? Array(16).fill(0).map((_,i)=><SkeletonCard key={i}/>) : products.map(p=><ProductCard key={p.id} product={p} waNumber={waNum}/>)}
        </div>
        {!loading && products.length===0 && (
          <div style={{ textAlign:'center',padding:'60px 0' }}>
            <p style={{ fontFamily:'var(--font-heading)',fontSize:22,color:T,marginBottom:12 }}>No products found</p>
            <button onClick={clearFilters} style={{ fontSize:11,fontWeight:600,letterSpacing:'0.14em',color:G,background:'none',border:`1px solid ${G}`,padding:'10px 24px',cursor:'pointer' }}>Clear Filters</button>
          </div>
        )}
        {hasMore && (
          <div style={{ textAlign:'center',marginTop:40 }}>
            <button onClick={loadMore} disabled={loading}
              style={{ padding:'13px 40px',border:`1px solid ${G}`,background:'none',color:G,fontSize:11,fontWeight:600,letterSpacing:'0.16em',cursor:'pointer',opacity:loading?0.5:1 }}>
              {loading?'Loading…':'Load More'}
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}