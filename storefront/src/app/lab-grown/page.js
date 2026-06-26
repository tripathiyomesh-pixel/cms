'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { diamondAPI } from '@/lib/api';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const GOLD      = 'var(--color-accent)';
const SHAPES    = ['Round','Oval','Princess','Cushion','Pear','Emerald','Marquise','Asscher','Radiant'];
const COLORS    = ['D','E','F','G','H','I','J','K'];
const CLARITIES = ['FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2'];
const LABS      = ['GIA','IGI'];
const INP       = { width:'100%', padding:'8px 10px', border:'1px solid #e5e0d8', fontSize:12, outline:'none', background:'#fff', boxSizing:'border-box' };
const EMPTY     = { shape:'', color:'', clarity:'', min_carat:'', max_carat:'', min_price:'', max_price:'', cert_lab:'' };

function LabBadge() {
  return <span style={{ display:'inline-block', background:'#e0f7fa', color:'#00796b', fontSize:9, fontWeight:700, letterSpacing:'0.18em', padding:'3px 8px', textTransform:'uppercase', border:'1px solid #b2ebf2' }}>Lab Grown</span>;
}

function Card({ d }) {
  const name  = d.name || `Lab-Grown ${d.shape||''} ${d.carat?Number(d.carat).toFixed(2):''}ct ${d.color||''} ${d.clarity||''}`.trim();
  const price = d.final_price && Number(d.final_price) > 0 ? `${d.currency||'AED'} ${Number(d.final_price).toLocaleString()}` : 'Price on Request';
  const isPOR = !d.final_price || Number(d.final_price) === 0;
  const msg   = encodeURIComponent(`Hi Tejori, I am interested in ${name}. Please share pricing and availability.`);
  return (
    <div style={{ background:'var(--color-bg)', border:'1px solid #e5e0d8', padding:20 }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.1)';e.currentTarget.style.borderColor='#00796b';}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor='#e5e0d8';}}
    >
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
        <LabBadge/>
        {!d.is_available&&<span style={{ fontSize:9, padding:'3px 8px', background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca' }}>On Hold</span>}
      </div>
      <h3 style={{ fontFamily:'var(--font-heading)', fontSize:15, fontWeight:400, color:'var(--color-text)', marginBottom:4 }}>{name}</h3>
      {d.sku&&<p style={{ fontSize:10, color:'var(--color-text-muted)', marginBottom:12 }}>{d.sku}</p>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:12 }}>
        {[['Shape',d.shape],['Carat',d.carat?Number(d.carat).toFixed(2):'—'],['Color',d.color||'—'],['Clarity',d.clarity||'—']].map(([k,v])=>(
          <div key={k} style={{ textAlign:'center', background:'#f9f7f4', border:'1px solid #e5e0d8', padding:'6px 2px' }}>
            <div style={{ fontSize:9, color:'var(--color-text-muted)', textTransform:'uppercase', marginBottom:2 }}>{k}</div>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--color-text)' }}>{v}</div>
          </div>
        ))}
      </div>
      {d.primary_cert_no&&(
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#e0f7fa', padding:'7px 10px', marginBottom:12 }}>
          <span style={{ fontSize:11, color:'#00796b', fontWeight:500 }}>{d.primary_cert_lab} {d.primary_cert_no}</span>
          <Link href={`/verify/${d.primary_cert_no}`} style={{ fontSize:10, color:'#00796b', textDecoration:'none', fontWeight:600 }}>Verify</Link>
        </div>
      )}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid #e5e0d8' }}>
        <p style={{ fontSize:isPOR?13:16, fontWeight:700, color:isPOR?GOLD:'var(--color-text)' }}>{price}</p>
        <div style={{ display:'flex', gap:8 }}>
          <Link href={`/lab-grown/${d.id}`} style={{ fontSize:10, fontWeight:600, padding:'7px 12px', border:'1px solid #e5e0d8', color:'var(--color-text)', textDecoration:'none' }}>Details</Link>
          <a href={`https://wa.me/?text=${msg}`} target="_blank" rel="noreferrer" style={{ fontSize:10, fontWeight:600, padding:'7px 12px', background:'#25D366', color:'#fff', textDecoration:'none' }}>Enquire</a>
        </div>
      </div>
    </div>
  );
}

function Content() {
  const [diamonds, setDiamonds] = React.useState([]);
  const [total,    setTotal]    = React.useState(0);
  const [page,     setPage]     = React.useState(1);
  const [loading,  setLoading]  = React.useState(true);
  const [filters,  setFilters]  = React.useState(EMPTY);
  const limit = 24;
  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  React.useEffect(() => {
    setLoading(true);
    diamondAPI.search({ page:1, limit, diamond_type:'LAB_GROWN', is_available:'true', ...Object.fromEntries(Object.entries(filters).filter(([,v])=>v)) })
      .then(r => { setDiamonds(r.data.data?.data||[]); setTotal(r.data.data?.total||0); })
      .catch(() => setDiamonds([]))
      .finally(() => setLoading(false));
    setPage(1);
  }, [JSON.stringify(filters)]);

  const totalPages = Math.ceil(total / limit);
  const active     = Object.entries(filters).filter(([,v]) => v);

  return (
    <div style={{ background:'var(--color-bg)', minHeight:'100vh' }}>
      <div style={{ background:'var(--color-text)', textAlign:'center', padding:'72px 24px 56px', position:'relative' }}>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'#4dd0e1', marginBottom:14 }}>Tejori · Adamas Collection</p>
        <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:400, color:'#fff', letterSpacing:'0.06em', marginBottom:14 }}>Lab-Grown Diamonds</h1>
        <div style={{ width:40, height:1, background:'#4dd0e1', margin:'0 auto 16px' }}/>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', maxWidth:520, margin:'0 auto', lineHeight:1.8 }}>
          Ethically grown. Chemically identical to mined diamonds. GIA and IGI certified.
        </p>
      </div>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'40px 32px 80px', display:'flex', gap:40 }}>
        <aside style={{ width:200, flexShrink:0 }}>
          {[['Shape',SHAPES,'shape',false],['Color',COLORS,'color',true],['Clarity',CLARITIES,'clarity',true],['Certificate',LABS,'cert_lab',false]].map(([lbl,opts,key,mono])=>(
            <div key={key} style={{ marginBottom:24 }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--color-text)', marginBottom:10 }}>{lbl}</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {opts.map(o=>(
                  <button key={o} onClick={()=>set(key,filters[key]===o?'':o)}
                    style={{ fontSize:10, padding:'4px 8px', border:`1px solid ${filters[key]===o?'#00796b':'#e5e0d8'}`, background:filters[key]===o?'#00796b':'#fff', color:filters[key]===o?'#fff':'var(--color-text)', cursor:'pointer', ...(mono?{fontFamily:"'Courier New',monospace"}:{}) }}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {[['Carat','min_carat','max_carat','0.1'],['Price','min_price','max_price','1']].map(([lbl,mk,xk,stp])=>(
            <div key={lbl} style={{ marginBottom:24 }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--color-text)', marginBottom:10 }}>{lbl}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <input type="number" step={stp} value={filters[mk]} onChange={e=>set(mk,e.target.value)} placeholder="Min" style={INP}/>
                <input type="number" step={stp} value={filters[xk]} onChange={e=>set(xk,e.target.value)} placeholder="Max" style={INP}/>
              </div>
            </div>
          ))}
          {active.length>0&&<button onClick={()=>setFilters(EMPTY)} style={{ fontSize:11, color:'#dc2626', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Clear all</button>}
        </aside>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', marginBottom:24 }}>
            <p style={{ fontSize:13, color:'var(--color-text-muted)' }}>{loading?'Searching…':`${total} lab-grown diamond${total!==1?'s':''} available`}</p>
            {active.map(([k,v])=>(
              <span key={k} onClick={()=>set(k,'')} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', background:'#e0f7fa', border:'1px solid #b2ebf2', fontSize:11, color:'#00796b', cursor:'pointer' }}>
                {v}<X size={10}/>
              </span>
            ))}
          </div>
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
              {[...Array(6)].map((_,i)=><div key={i} style={{ height:280, background:'#f0ebe3', animation:'pulse 1.5s ease-in-out infinite' }}/>)}
            </div>
          ) : diamonds.length===0 ? (
            <div style={{ textAlign:'center', padding:'80px 24px' }}>
              <p style={{ fontFamily:'var(--font-heading)', fontSize:22, color:'var(--color-text)', marginBottom:8 }}>No lab-grown diamonds match your filters</p>
              <p style={{ fontSize:13, color:'var(--color-text-muted)', marginBottom:24 }}>Try adjusting carat range or clarity grade</p>
              <Link href="/appointment" style={{ fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:GOLD, textDecoration:'none', border:`1px solid ${GOLD}`, padding:'12px 24px' }}>Speak to an Expert</Link>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
              {diamonds.map(d=><Card key={d.id} d={d}/>)}
            </div>
          )}
          {totalPages>1&&(
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:40 }}>
              <button onClick={()=>{const p=page-1;setPage(p);}} disabled={page===1} style={{ padding:'8px', border:'1px solid #e5e0d8', background:'#fff', cursor:'pointer', display:'flex', opacity:page===1?0.3:1 }}><ChevronLeft size={16}/></button>
              <span style={{ fontSize:13, color:'var(--color-text-muted)' }}>Page {page} of {totalPages}</span>
              <button onClick={()=>{const p=page+1;setPage(p);}} disabled={page>=totalPages} style={{ padding:'8px', border:'1px solid #e5e0d8', background:'#fff', cursor:'pointer', display:'flex', opacity:page>=totalPages?0.3:1 }}><ChevronRight size={16}/></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
export default function LabGrownPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-heading)', fontSize:18, color:'var(--color-text-muted)' }}>Loading…</div>}>
      <Content/>
    </Suspense>
  );
}