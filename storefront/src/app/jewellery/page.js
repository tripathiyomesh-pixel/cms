'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, X, SlidersHorizontal, Heart } from 'lucide-react';

const COLLECTIONS = ['Aurora','Frost','Vivid','Ice Deco','Mallika','Classics','Circle of Life','Nectar','Bloom','Malachite and Coral','Pearls'];
const CATEGORIES  = ['Bracelets','Earrings','Necklaces','Pendants','Rings','Engagement Rings'];
const SORTS       = [['recommended','Recommended'],['price_asc','Price: Low to High'],['price_desc','Price: High to Low'],['newest','Newest']];

function FilterSidebar({ filters, set, onClose }) {
  return (
    <div className="h-full overflow-y-auto pb-10" style={{ fontFamily:"'Inter', system-ui" }}>
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor:'#e5e0d8' }}>
        <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'#1a1a1a' }}>Filter</p>
        {onClose && <button onClick={onClose}><X size={16}/></button>}
      </div>

      {/* Availability */}
      <div className="px-6 py-5 border-b" style={{ borderColor:'#f0ede8' }}>
        <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'#1a1a1a', marginBottom:14 }}>Availability</p>
        {[['','Available Online'],['new','New'],['featured','Must Have']].map(([v,l])=>(
          <label key={l} className="flex items-center gap-3 mb-3 cursor-pointer">
            <input type="radio" name="avail" checked={filters.avail===v} onChange={()=>set('avail',v)}
              style={{ accentColor:'#b8860b', width:14, height:14 }}/>
            <span style={{ fontSize:12, color:'#4a4a4a' }}>{l}</span>
          </label>
        ))}
      </div>

      {/* Category */}
      <div className="px-6 py-5 border-b" style={{ borderColor:'#f0ede8' }}>
        <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'#1a1a1a', marginBottom:14 }}>Category</p>
        {CATEGORIES.map(c=>(
          <label key={c} className="flex items-center gap-3 mb-3 cursor-pointer">
            <input type="checkbox"
              checked={filters.categories?.includes(c)||false}
              onChange={()=>{
                const cur = filters.categories||[];
                set('categories', cur.includes(c) ? cur.filter(x=>x!==c) : [...cur,c]);
              }}
              style={{ accentColor:'#b8860b', width:14, height:14 }}/>
            <span style={{ fontSize:12, color:'#4a4a4a' }}>{c}</span>
          </label>
        ))}
      </div>

      {/* Collections */}
      <div className="px-6 py-5">
        <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'#1a1a1a', marginBottom:14 }}>Collections</p>
        {COLLECTIONS.map(c=>(
          <label key={c} className="flex items-center gap-3 mb-3 cursor-pointer">
            <input type="checkbox"
              checked={filters.collections?.includes(c)||false}
              onChange={()=>{
                const cur = filters.collections||[];
                set('collections', cur.includes(c) ? cur.filter(x=>x!==c) : [...cur,c]);
              }}
              style={{ accentColor:'#b8860b', width:14, height:14 }}/>
            <span style={{ fontSize:12, color:'#4a4a4a' }}>{c}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function JewelleryContent() {
  const sp     = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;

  const [filters, setFilters] = useState({
    sort:        sp.get('sort')       || 'recommended',
    avail:       sp.get('avail')      || '',
    categories:  sp.get('category')   ? [sp.get('category')] : [],
    collections: sp.get('collection') ? [sp.get('collection')] : [],
  });

  const setFilter = (k,v) => { setFilters(f=>({...f,[k]:v})); setPage(1); };
  const activeCount = (filters.categories?.length||0) + (filters.collections?.length||0) + (filters.avail?1:0);

  useEffect(()=>{
    setLoading(true);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
    const params = new URLSearchParams({ status:'active', limit:24, page, inventory_type:'JEWELLERY' });
    if (filters.sort && filters.sort!=='recommended') params.set('sort',filters.sort);
    if (filters.avail==='new')      params.set('is_new','true');
    if (filters.avail==='featured') params.set('is_featured','true');
    if (filters.categories?.length) params.set('category',filters.categories[0]);
    if (filters.collections?.length) params.set('collection',filters.collections[0]);

    fetch(`${apiBase}/storefront/products?${params}`)
      .then(r=>r.json())
      .then(r=>{ setProducts(r.data?.data||[]); setTotal(r.data?.pagination?.total||r.data?.total||0); })
      .catch(()=>setProducts([]))
      .finally(()=>setLoading(false));
  },[filters, page]);

  // Placeholder products for demo
  const placeholders = Array(12).fill(0).map((_,i)=>({
    id:`p${i}`, name:['Croissant Dome Hoops','Diamond Celestial Studs','Medium Flat Hoops','Organic Pearl Hoops','Large Charlotte Hoops','Diamond Solitaire Ring','Frost Collection Ring','Aurora Pendant','Vivid Earrings','Ice Deco Bracelet','Mallika Necklace','Classic Tennis Bracelet'][i],
    thumb_url:`https://images.unsplash.com/photo-${['1611652022419-a9419f74343d','1573408301185-9519f94ae069','1535632787350-4e68ef0ac584','1599643478518-a784e5dc4c8f','1605100804763-247f67b3557e','1515562141207-7a88fb7ce338','1602173574767-37ac01994b2a','1544376798-89aa6b0de868','1611652022419-a9419f74343d','1573408301185-9519f94ae069','1599643478518-a784e5dc4c8f','1605100804763-247f67b3557e'][i]}?w=600&q=80`,
    currency:'AED', base_price: 2500+(i*1200), slug:`product-${i}`,
    is_new: i<3, badge: i===1?'-17%':i===0?'-10%':'',
  }));

  const list = products.length ? products : placeholders;

  return (
    <div style={{ fontFamily:"'Inter', system-ui, sans-serif" }}>
      {/* Page header */}
      <div className="border-b" style={{ borderColor:'#e5e0d8', background:'#fff' }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-10">
          <nav className="flex items-center gap-2 mb-4" style={{ fontSize:11, color:'#6b6b6b' }}>
            <Link href="/" className="hover:text-yellow-700 transition-colors">Home</Link>
            <ChevronDown size={11} className="-rotate-90"/>
            <span style={{ color:'#1a1a1a' }}>Jewellery</span>
          </nav>
          <h1 className="font-cormorant font-light" style={{ fontSize:48, color:'#1a1a1a', letterSpacing:'0.02em' }}>
            {filters.collections?.length ? filters.collections[0] : filters.categories?.length ? filters.categories[0] : 'Jewellery'}
          </h1>
          <p style={{ fontSize:12, color:'#6b6b6b', marginTop:8 }}>{total || list.length} pieces</p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-8 flex gap-10">

        {/* Sidebar filter — desktop */}
        <div className="hidden lg:block flex-shrink-0" style={{ width:220 }}>
          <FilterSidebar filters={filters} set={setFilter}/>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            {/* Mobile filter */}
            <button onClick={()=>setFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 py-2.5 px-4 border border-ink-200"
              style={{ fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              <SlidersHorizontal size={13}/>
              Filter{activeCount>0?` (${activeCount})`:''}
            </button>

            {/* Active filter tags */}
            <div className="flex flex-wrap gap-2">
              {filters.categories?.map(c=>(
                <span key={c} className="flex items-center gap-1.5 px-3 py-1 text-xs"
                  style={{ background:'#1a1a1a', color:'#fff', letterSpacing:'0.05em' }}>
                  {c}
                  <button onClick={()=>setFilter('categories',filters.categories.filter(x=>x!==c))}><X size={10}/></button>
                </span>
              ))}
              {filters.collections?.map(c=>(
                <span key={c} className="flex items-center gap-1.5 px-3 py-1 text-xs"
                  style={{ background:'#f5ede2', color:'#b8860b', letterSpacing:'0.05em' }}>
                  {c}
                  <button onClick={()=>setFilter('collections',filters.collections.filter(x=>x!==c))}><X size={10}/></button>
                </span>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3 ml-auto">
              <span style={{ fontSize:11, color:'#6b6b6b', letterSpacing:'0.05em' }}>Sort by:</span>
              <select value={filters.sort} onChange={e=>setFilter('sort',e.target.value)}
                className="border-b bg-transparent outline-none cursor-pointer"
                style={{ fontSize:11, color:'#1a1a1a', borderColor:'#e5e0d8', paddingBottom:2, letterSpacing:'0.03em' }}>
                {SORTS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_,i)=>(
                <div key={i} className="animate-pulse">
                  <div style={{ aspectRatio:'1', background:'#f0ede8' }}/>
                  <div style={{ height:14, background:'#f0ede8', marginTop:12, width:'70%' }}/>
                  <div style={{ height:10, background:'#f0ede8', marginTop:8, width:'40%' }}/>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10">
              {list.map(p => {
                const priceVal = p.base_price || p.final_price;
                const hasDiscount = p.compare_price && priceVal && parseFloat(p.compare_price)>parseFloat(priceVal);
                const disc = hasDiscount?Math.round((1-parseFloat(priceVal)/parseFloat(p.compare_price))*100):0;
                const badge = p.badge||(hasDiscount?`-${disc}%`:p.is_new?'New':'');
                const msg = encodeURIComponent(`Hi Tejori, I am interested in ${p.name} (SKU: ${p.sku || 'N/A'}). Please share pricing and availability.`);
                return (
                  <div key={p.id} className="group">
                    {/* Image */}
                    <Link href={`/jewellery/${p.slug||p.id}`}
                      className="block relative overflow-hidden mb-4"
                      style={{ aspectRatio:'1', background:'#f5f0e8' }}>
                      {p.thumb_url
                        ? <img src={p.thumb_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                        : <div className="w-full h-full flex items-center justify-center text-5xl">💍</div>}
                      {badge && (
                        <span className="absolute top-3 left-3 text-white"
                          style={{ fontSize:9, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', background:'#1a1a1a', padding:'4px 8px' }}>
                          {badge}
                        </span>
                      )}
                      {/* Quick hover — WhatsApp + Wishlist */}
                      <div className="absolute bottom-0 left-0 right-0 flex opacity-0 group-hover:opacity-100 transition-all duration-200">
                        {wapp && (
                          <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`}
                            target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                            className="flex-1 py-3 text-white text-center transition-colors"
                            style={{ background:'rgba(26,26,26,0.92)', fontSize:10, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase' }}>
                            Inquiry Now
                          </a>
                        )}
                        <button onClick={e=>{e.preventDefault();}}
                          className="w-12 flex items-center justify-center"
                          style={{ background:'rgba(26,26,26,0.92)' }}>
                          <Heart size={14} color="white"/>
                        </button>
                      </div>
                    </Link>

                    {/* Info */}
                    <h3 className="font-cormorant font-light mb-1.5" style={{ fontSize:18, color:'#1a1a1a', lineHeight:1.2 }}>
                      <Link href={`/jewellery/${p.slug||p.id}`} className="hover:text-yellow-700 transition-colors">{p.name}</Link>
                    </h3>
                    {p.metal_type && (
                      <p style={{ fontSize:10, color:'#aaa', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>
                        {p.metal_type.replace('_',' ')} {p.purity||''}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {priceVal && Number(priceVal) > 0
                        ? <span style={{ fontSize:13, color:'#6b6b6b' }}>{p.currency || 'AED'} {Number(priceVal).toLocaleString()}</span>
                        : <span style={{ fontSize:12, color:'#b8860b', letterSpacing:'0.05em' }}>Price on Request</span>}
                      {hasDiscount && <span style={{ fontSize:12, color:'#ccc', textDecoration:'line-through' }}>{p.currency || 'AED'} {Number(p.compare_price).toLocaleString()}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {total > 24 && (
            <div className="flex justify-center items-center gap-6 mt-16">
              <button onClick={()=>setPage(p=>p-1)} disabled={page===1}
                className="disabled:opacity-30 transition-opacity"
                style={{ fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'#1a1a1a', borderBottom:'1px solid #1a1a1a', paddingBottom:1 }}>
                ← Previous
              </button>
              <span style={{ fontSize:12, color:'#6b6b6b' }}>Page {page} of {Math.ceil(total/24)}</span>
              <button onClick={()=>setPage(p=>p+1)} disabled={page>=Math.ceil(total/24)}
                className="disabled:opacity-30 transition-opacity"
                style={{ fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'#1a1a1a', borderBottom:'1px solid #1a1a1a', paddingBottom:1 }}>
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setFilterOpen(false)}/>
          <div className="absolute top-0 left-0 bottom-0 w-80 bg-white shadow-2xl overflow-hidden">
            <FilterSidebar filters={filters} set={setFilter} onClose={()=>setFilterOpen(false)}/>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JewelleryPage() {
  return <Suspense fallback={<div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}><p style={{color:'#6b6b6b',fontSize:13,letterSpacing:'0.1em',textTransform:'uppercase'}}>Loading…</p></div>}><JewelleryContent/></Suspense>;
}
