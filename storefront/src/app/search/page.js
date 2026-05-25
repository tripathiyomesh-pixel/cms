'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, X } from 'lucide-react';


const METAL_OPTIONS  = ['Gold','Platinum','Silver','Rose Gold'];
const PURITY_OPTIONS = ['24K','22K','18K','14K','Platinum 950'];
const CAT_OPTIONS    = ['Necklaces','Earrings','Rings','Bracelets','Pendants','Bridal'];

function SearchInner() {
  const params  = useSearchParams();
  const [query,    setQuery]    = useState(params.get('q') || '');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [showFilt, setShowFilt] = useState(false);
  const [filters,  setFilters]  = useState({
    metal:'', purity:'', category:'', min_price:'', max_price:'', sort:'relevant'
  });
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP || '';
  const LIMIT = 12;

  const search = async (q=query, pg=1, filt=filters) => {
    if (!q?.trim()) return;
    setLoading(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || '/api';
      const p = new URLSearchParams({ q, limit:LIMIT, page:pg, ...Object.fromEntries(Object.entries(filt).filter(([,v])=>v)) });
      const res = await fetch(`${api}/storefront/search?${p}`);
      const data = await res.json();
      const items = data.data?.data || data.data || [];
      if (pg === 1) setResults(items);
      else setResults(prev => [...prev, ...items]);
      setTotal(data.data?.total || items.length);
      setPage(pg);
    } catch { setResults([]); }
    setLoading(false);
  };

  useEffect(() => {
    const q = params.get('q') || '';
    setQuery(q);
    if (q) search(q, 1);
  }, []);

  const handleSubmit = (e) => { e.preventDefault(); search(query, 1); };
  const setFilt = (k,v) => { const f = {...filters,[k]:v}; setFilters(f); search(query, 1, f); };
  const clearFilt = () => { const f={metal:'',purity:'',category:'',min_price:'',max_price:'',sort:'relevant'}; setFilters(f); search(query,1,f); };

  const activeFilters = Object.entries(filters).filter(([k,v]) => v && k !== 'sort');

  return (
    <div style={{ maxWidth:1280, margin:'0 auto', padding:'48px 32px' }}>
      {/* Search bar */}
      <form onSubmit={handleSubmit} style={{ display:'flex', gap:0, marginBottom:40, maxWidth:680, margin:'0 auto 48px' }}>
        <div style={{ flex:1, position:'relative' }}>
          <Search size={16} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }}/>
          <input value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="Search jewellery, diamonds, collections…"
            style={{ width:'100%', padding:'16px 16px 16px 48px', border:'2px solid #e5e0d8', fontSize:14, outline:'none', background:'#fff', boxSizing:'border-box', fontFamily:"'Inter',sans-serif" }}
            autoFocus/>
        </div>
        <button type="submit" style={{ padding:'0 28px', background:'#1a1a1a', color:'#fff', border:'none', cursor:'pointer', fontSize:11, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
          Search
        </button>
      </form>

      {query && (
        <>
          {/* Filters + results count */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <p style={{ fontSize:13, color:'#6b6b6b' }}>
                {loading ? 'Searching…' : `${total} results for "${query}"`}
              </p>
              {activeFilters.map(([k,v]) => (
                <span key={k} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', background:'#f5ede2', border:'1px solid #e5d5a0', borderRadius:20, fontSize:11, color:'#92600a' }}>
                  {v}
                  <button onClick={()=>setFilt(k,'')} style={{ background:'none', border:'none', cursor:'pointer', color:'#b8860b', display:'flex' }}><X size={11}/></button>
                </span>
              ))}
              {activeFilters.length > 0 && (
                <button onClick={clearFilt} style={{ fontSize:11, color:'#6b6b6b', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Clear all</button>
              )}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <select value={filters.sort} onChange={e=>setFilt('sort',e.target.value)}
                style={{ padding:'6px 10px', border:'1px solid #e5e0d8', fontSize:12, background:'#fff', cursor:'pointer', outline:'none' }}>
                <option value="relevant">Most Relevant</option>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
              <button onClick={()=>setShowFilt(!showFilt)}
                style={{ padding:'6px 12px', border:'1px solid #e5e0d8', background:showFilt?'#1a1a1a':'#fff', color:showFilt?'#fff':'#4a4a4a', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                <SlidersHorizontal size={13}/> Filters
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilt && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, padding:20, background:'#fdf8f3', border:'1px solid #e5d5a0', marginBottom:28 }}>
              <div>
                <label style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#6b6b6b', display:'block', marginBottom:8 }}>Category</label>
                <select value={filters.category} onChange={e=>setFilt('category',e.target.value)}
                  style={{ width:'100%', padding:'8px', border:'1px solid #e5e0d8', fontSize:12, background:'#fff', outline:'none' }}>
                  <option value="">All categories</option>
                  {CAT_OPTIONS.map(o=><option key={o} value={o.toLowerCase()}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#6b6b6b', display:'block', marginBottom:8 }}>Metal</label>
                <select value={filters.metal} onChange={e=>setFilt('metal',e.target.value)}
                  style={{ width:'100%', padding:'8px', border:'1px solid #e5e0d8', fontSize:12, background:'#fff', outline:'none' }}>
                  <option value="">All metals</option>
                  {METAL_OPTIONS.map(o=><option key={o} value={o.toLowerCase()}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#6b6b6b', display:'block', marginBottom:8 }}>Purity</label>
                <select value={filters.purity} onChange={e=>setFilt('purity',e.target.value)}
                  style={{ width:'100%', padding:'8px', border:'1px solid #e5e0d8', fontSize:12, background:'#fff', outline:'none' }}>
                  <option value="">All purities</option>
                  {PURITY_OPTIONS.map(o=><option key={o} value={o.toLowerCase()}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#6b6b6b', display:'block', marginBottom:8 }}>Price range (AED)</label>
                <div style={{ display:'flex', gap:8 }}>
                  <input type="number" placeholder="Min" value={filters.min_price} onChange={e=>setFilt('min_price',e.target.value)}
                    style={{ flex:1, padding:'8px', border:'1px solid #e5e0d8', fontSize:12, background:'#fff', outline:'none' }}/>
                  <input type="number" placeholder="Max" value={filters.max_price} onChange={e=>setFilt('max_price',e.target.value)}
                    style={{ flex:1, padding:'8px', border:'1px solid #e5e0d8', fontSize:12, background:'#fff', outline:'none' }}/>
                </div>
              </div>
            </div>
          )}

          {/* Results grid */}
          {loading && results.length === 0 ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:24 }}>
              {Array(8).fill(0).map((_,i)=>(
                <div key={i} style={{ background:'#f5ede2', aspectRatio:'1', borderRadius:0, animation:'pulse 1.5s infinite' }}/>
              ))}
            </div>
          ) : results.length === 0 && query ? (
            <div style={{ textAlign:'center', padding:'80px 0' }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:12 }}>No results found</p>
              <p style={{ fontSize:13, color:'#6b6b6b', marginBottom:24 }}>Try different keywords or browse our collections</p>
              <Link href="/jewellery" style={{ fontSize:11, fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase', color:'#1a1a1a', borderBottom:'1px solid #1a1a1a', paddingBottom:2 }}>
                Browse all jewellery →
              </Link>
            </div>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:24 }}>
                {results.map(p => {
                  const msg = encodeURIComponent(`Hi, I'm interested in: ${p.name}\nSKU: ${p.sku}\n${window?.location?.href || ''}`);
                  return (
                    <div key={p.id} className="group" style={{ border:'1px solid transparent', transition:'border-color .2s' }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='#e5e0d8'}
                      onMouseLeave={e=>e.currentTarget.style.borderColor='transparent'}>
                      <Link href={`/jewellery/${p.slug||p.id}`} style={{ display:'block', aspectRatio:'1', background:'#f5ede2', overflow:'hidden' }}>
                        {p.thumb_url
                          ? <img src={p.thumb_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .5s' }} className="group-hover:scale-105"/>
                          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>💎</div>
                        }
                      </Link>
                      <div style={{ padding:14, background:'#fff' }}>
                        <Link href={`/jewellery/${p.slug||p.id}`} style={{ textDecoration:'none' }}>
                          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontWeight:400, color:'#1a1a1a', marginBottom:4, lineHeight:1.3 }}>{p.name}</h3>
                        </Link>
                        {p.metal_type && <p style={{ fontSize:11, color:'#6b6b6b', marginBottom:8, textTransform:'capitalize' }}>{p.metal_type} · {p.purity}</p>}
                        {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer"
                          style={{ display:'block', width:'100%', padding:'10px', background:'#1a1a1a', color:'#fff', fontSize:9, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', textAlign:'center', textDecoration:'none', transition:'background .2s' }}
                          onMouseEnter={e=>e.currentTarget.style.background='#b8860b'}
                          onMouseLeave={e=>e.currentTarget.style.background='#1a1a1a'}>
                          Request Price
                        </a>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load more */}
              {results.length < total && (
                <div style={{ textAlign:'center', marginTop:40 }}>
                  <button onClick={()=>search(query, page+1)}
                    style={{ padding:'13px 40px', border:'1px solid #1a1a1a', background:'#fff', color:'#1a1a1a', fontSize:11, fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', transition:'all .2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='#1a1a1a';e.currentTarget.style.color='#fff';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#1a1a1a';}}>
                    {loading ? 'Loading…' : `Load more (${total - results.length} remaining)`}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Empty state — no query */}
      {!query && (
        <div style={{ textAlign:'center', padding:'40px 0' }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:12 }}>What are you looking for?</p>
          <p style={{ fontSize:13, color:'#6b6b6b', marginBottom:40 }}>Search our collection of diamonds, gemstones and luxury jewellery</p>
          <div style={{ display:'flex', justifyContent:'center', gap:24, flexWrap:'wrap' }}>
            {['Diamond Rings','Gold Necklaces','Pearl Earrings','Sapphire Bracelets','Lab Grown Diamonds','Custom Jewellery'].map(s=>(
              <button key={s} onClick={()=>{ setQuery(s); search(s,1); }}
                style={{ padding:'8px 16px', border:'1px solid #e5e0d8', background:'#fff', fontSize:12, cursor:'pointer', color:'#4a4a4a', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#b8860b';e.currentTarget.style.color='#b8860b';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#4a4a4a';}}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding:40, textAlign:'center', color:'#6b6b6b' }}>Loading search…</div>}>
      <SearchInner/>
    </Suspense>
  );
}
