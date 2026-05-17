'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, MessageCircle, Share2 } from 'lucide-react';

const WL_KEY = 'jcms_wishlist';

function getWishlist() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(WL_KEY)||'[]'); } catch { return []; }
}

function saveWishlist(items) {
  localStorage.setItem(WL_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('wishlist-updated'));
}

export function addToWishlist(product) {
  const wl = getWishlist();
  if (!wl.find(p=>p.id===product.id)) {
    saveWishlist([...wl, { id:product.id, name:product.name, slug:product.slug, sku:product.sku, final_price:product.final_price, compare_price:product.compare_price, currency:product.currency, thumb_url:product.thumb_url, metal_type:product.metal_type, inventory_type:product.inventory_type }]);
  }
}

export function removeFromWishlist(id) {
  saveWishlist(getWishlist().filter(p=>p.id!==id));
}

export function isInWishlist(id) {
  return getWishlist().some(p=>p.id===id);
}

export default function WishlistPage() {
  const [items, setItems]   = useState([]);
  const [loaded, setLoaded] = useState(false);
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;

  useEffect(()=>{
    setItems(getWishlist());
    setLoaded(true);
    const fn=()=>setItems(getWishlist());
    window.addEventListener('wishlist-updated',fn);
    return()=>window.removeEventListener('wishlist-updated',fn);
  },[]);

  const remove = (id) => { removeFromWishlist(id); setItems(getWishlist()); };

  const shareWishlist = () => {
    const text = `My wishlist:\n${items.map(p=>`• ${p.name} — ${p.currency} ${Number(p.final_price||0).toLocaleString()}`).join('\n')}`;
    if(wapp) window.open(`https://wa.me/${wapp.replace(/\D/g,'')}?text=${encodeURIComponent(text)}`,'_blank');
  };

  if (!loaded) return <div className="pt-32 text-center py-20 text-ink-400">Loading…</div>;

  return (
    <div className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-ink-800 mb-1">My Wishlist</h1>
          <p className="text-ink-400 text-sm">{items.length} saved {items.length===1?'item':'items'}</p>
        </div>
        {items.length>0 && (
          <button onClick={shareWishlist} className="btn-outline-gold text-sm flex items-center gap-2">
            <Share2 size={14}/> Share via WhatsApp
          </button>
        )}
      </div>

      {items.length===0 ? (
        <div className="card p-20 text-center">
          <Heart size={48} className="mx-auto text-ink-200 mb-6"/>
          <h2 className="font-serif text-2xl text-ink-700 mb-3">Your wishlist is empty</h2>
          <p className="text-ink-400 mb-8">Save pieces you love by clicking the heart icon on any product</p>
          <Link href="/jewellery" className="btn-gold px-8 py-4">Browse jewellery</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(p => {
            const hasDiscount = p.compare_price && parseFloat(p.compare_price) > parseFloat(p.final_price);
            const discountPct = hasDiscount ? Math.round((1-parseFloat(p.final_price)/parseFloat(p.compare_price))*100) : 0;
            const href = p.inventory_type==='NATURAL_DIAMOND'||p.inventory_type==='LAB_GROWN_DIAMOND' ? `/diamonds/${p.id}` : p.inventory_type==='GEMSTONE' ? `/gemstones/${p.id}` : `/jewellery/${p.slug||p.id}`;
            const msg = encodeURIComponent(`Hi, I'm interested in: ${p.name} — ${p.currency} ${Number(p.final_price||0).toLocaleString()}`);

            return (
              <div key={p.id} className="card overflow-hidden hover:shadow-md transition-all group">
                <div className="relative aspect-square bg-ink-50 overflow-hidden">
                  {p.thumb_url
                    ? <img src={p.thumb_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    : <div className="w-full h-full flex items-center justify-center text-5xl">💍</div>}
                  {hasDiscount && <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">-{discountPct}%</span>}
                  <button onClick={()=>remove(p.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={14}/>
                  </button>
                </div>
                <div className="p-4">
                  {p.metal_type && <p className="text-[10px] text-ink-400 uppercase tracking-wide mb-1">{p.metal_type.replace('_',' ')}</p>}
                  <h3 className="text-sm font-medium text-ink-700 mb-2 line-clamp-2">{p.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-ink-800">{p.currency} {Number(p.final_price||0).toLocaleString()}</span>
                    {hasDiscount && <span className="text-xs text-ink-400 line-through">{p.currency} {Number(p.compare_price).toLocaleString()}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Link href={href} className="flex-1 text-center text-[11px] py-2 rounded-lg border border-ink-200 text-ink-500 hover:border-gold-400 hover:text-gold-600 transition-colors">View details</Link>
                    {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] px-2.5 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors"><MessageCircle size={11}/></a>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
