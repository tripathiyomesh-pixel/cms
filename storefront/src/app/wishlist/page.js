'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, MessageCircle, Share2 } from 'lucide-react';

const WL_KEY = 'jcms_wishlist';
const GOLD   = 'var(--color-accent)';

function getWL() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(WL_KEY)||'[]'); } catch { return []; }
}
function saveWL(items) {
  localStorage.setItem(WL_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('wishlist-updated'));
}
export function addToWishlist(product) {
  const wl = getWL();
  if (!wl.find(p=>p.id===product.id)) {
    saveWL([...wl, { id:product.id, name:product.name, slug:product.slug, sku:product.sku, final_price:product.final_price, compare_price:product.compare_price, currency:product.currency, thumb_url:product.thumb_url, metal_type:product.metal_type, inventory_type:product.inventory_type }]);
  }
}
export function removeFromWishlist(id) {
  saveWL(getWL().filter(p=>p.id!==id));
}
export function isInWishlist(id) {
  return getWL().some(p=>p.id===id);
}

export default function WishlistPage() {
  const [items,   setItems]   = useState([]);
  const [loaded,  setLoaded]  = useState(false);
  const [waNum,   setWaNum]   = useState('');

  useEffect(() => {
    setItems(getWL()); setLoaded(true);
    const fn = () => setItems(getWL());
    window.addEventListener('wishlist-updated', fn);
    // Fetch WA number
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    fetch(`${api}/settings/public`).then(r=>r.json()).then(d=>{
      const n=(d.data?.store_whatsapp||d.data?.whatsapp_number||'').replace(/\D/g,'');
      if(n) setWaNum(n);
    }).catch(()=>{});
    return () => window.removeEventListener('wishlist-updated', fn);
  }, []);

  const remove = (id) => { removeFromWishlist(id); setItems(getWL()); };
  const shareWishlist = () => {
    if (!waNum) return;
    const text = `Hi Tejori, here is my wishlist:\n${items.map(p=>`• ${p.name}`).join('\n')}`;
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!loaded) return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-heading)', fontSize:18, color:'var(--color-text-muted)' }}>Loading…</div>
  );

  return (
    <div style={{ background:'var(--color-bg)', minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:'var(--color-text)', color:'#fff', textAlign:'center', padding:'64px 24px 48px', position:'relative' }}>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:GOLD, marginBottom:14 }}>Tejori</p>
        <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:400, color:'#fff', letterSpacing:'0.06em', marginBottom:12 }}>My Wishlist</h1>
        <div style={{ width:40, height:1, background:GOLD, margin:'0 auto' }}/>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 32px 80px' }}>
        {/* Toolbar */}
        {items.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:12 }}>
            <p style={{ fontSize:13, color:'var(--color-text-muted)' }}>{items.length} saved {items.length===1?'piece':'pieces'}</p>
            {waNum && (
              <button onClick={shareWishlist}
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px', border:`1px solid ${GOLD}`, background:'none', color:GOLD, cursor:'pointer', fontSize:11, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase' }}>
                <Share2 size={13}/> Share via WhatsApp
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 24px', border:'1px solid #e5e0d8' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:72, height:72, border:'1px solid #e5e0d8', margin:'0 auto 24px' }}>
              <Heart size={28} color="#e5e0d8"/>
            </div>
            <p style={{ fontFamily:'var(--font-heading)', fontSize:26, color:'var(--color-text)', marginBottom:10 }}>Your wishlist is empty</p>
            <p style={{ fontSize:13, color:'var(--color-text-muted)', marginBottom:28 }}>
              Save pieces you love by clicking the heart icon on any product
            </p>
            <Link href="/jewellery" style={{ fontSize:11, fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:GOLD, textDecoration:'none', border:`1px solid ${GOLD}`, padding:'13px 28px' }}>
              Browse Jewellery
            </Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:24 }}>
            {items.map(p => {
              const hasDiscount = p.compare_price && parseFloat(p.compare_price) > parseFloat(p.final_price||0);
              const discPct     = hasDiscount ? Math.round((1-parseFloat(p.final_price)/parseFloat(p.compare_price))*100) : 0;
              const isPOR       = !p.final_price || Number(p.final_price) === 0;
              const price       = isPOR ? 'Price on Request' : `${p.currency||'AED'} ${Number(p.final_price).toLocaleString()}`;
              const href        = p.inventory_type==='NATURAL_DIAMOND' ? `/diamonds/${p.id}` : p.inventory_type==='LAB_GROWN_DIAMOND' ? `/lab-grown/${p.id}` : p.inventory_type==='GEMSTONE' ? `/gemstones/${p.id}` : `/jewellery/${p.slug||p.id}`;
              const msg         = encodeURIComponent(`Hi Tejori, I am interested in ${p.name}. Please share pricing and availability.`);

              return (
                <div key={p.id} style={{ border:'1px solid #e5e0d8', background:'var(--color-bg)', overflow:'hidden', position:'relative', transition:'box-shadow 200ms ease' }}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.08)'}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
                >
                  {/* Image */}
                  <div style={{ position:'relative', aspectRatio:'1', background:'#f5f0e8', overflow:'hidden' }}>
                    {p.thumb_url
                      ? <img src={p.thumb_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 400ms ease' }} onMouseOver={e=>e.target.style.transform='scale(1.04)'} onMouseOut={e=>e.target.style.transform='scale(1)'}/>
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, opacity:0.2 }}>💍</div>
                    }
                    {hasDiscount && <span style={{ position:'absolute', top:10, left:10, fontSize:9, fontWeight:700, padding:'3px 8px', background:'#dc2626', color:'#fff' }}>-{discPct}%</span>}
                    {/* Remove button */}
                    <button onClick={() => remove(p.id)}
                      style={{ position:'absolute', top:10, right:10, width:32, height:32, border:'none', background:'rgba(255,255,255,0.9)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#dc2626', transition:'background 150ms ease' }}
                      onMouseOver={e=>e.currentTarget.style.background='#fff'}
                      onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.9)'}>
                      <Trash2 size={13}/>
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding:'16px 16px 20px' }}>
                    {p.metal_type && <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--color-text-muted)', marginBottom:6 }}>{p.metal_type.replace(/_/g,' ')}</p>}
                    <p style={{ fontFamily:'var(--font-heading)', fontSize:15, fontWeight:400, color:'var(--color-text)', marginBottom:8, lineHeight:1.3 }}>{p.name}</p>
                    <p style={{ fontSize:13, fontWeight:600, color:isPOR?GOLD:'var(--color-text)', marginBottom:14 }}>{price}</p>
                    <div style={{ display:'flex', gap:8 }}>
                      <Link href={href} style={{ flex:1, textAlign:'center', fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', padding:'9px', border:'1px solid #e5e0d8', color:'var(--color-text)', textDecoration:'none', transition:'border-color 150ms ease' }}
                        onMouseOver={e=>e.currentTarget.style.borderColor=GOLD} onMouseOut={e=>e.currentTarget.style.borderColor='#e5e0d8'}>
                        View
                      </Link>
                      {waNum && (
                        <a href={`https://wa.me/${waNum}?text=${msg}`} target="_blank" rel="noreferrer"
                          style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'9px 12px', background:'#25D366', color:'#fff', textDecoration:'none' }}>
                          <MessageCircle size={13}/>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}