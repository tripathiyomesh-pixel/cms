'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { sfAPI } from '@/lib/api';
import { Heart, MessageCircle, ChevronRight } from 'lucide-react';

function ProductCard({ product }) {
  const img = product.primary_image || product.media?.[0]?.file_url || product.thumb_url || null;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const msg = `Hi Tejori, I am interested in ${product.name} (${product.sku}). Please share pricing and availability.`;

  return (
    <div className="card group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-ink-50">
        {img ? (
          <img src={img} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">💍</div>
        )}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-ink-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
          <Heart size={15}/>
        </button>
        {product.is_featured && <span className="absolute top-3 left-3 badge badge-gold text-[10px]">Featured</span>}
      </div>
      <div className="p-4">
        <p className="text-[10px] text-ink-400 uppercase tracking-wide mb-1">{product.metal_type||product.inventory_type?.replace('_',' ')}</p>
        <h3 className="text-sm font-medium text-ink-700 mb-2 line-clamp-2 leading-tight">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div>
            {product.base_price && Number(product.base_price) > 0
              ? <div className="text-base font-semibold text-ink-800">{product.currency || 'AED'} {Number(product.base_price).toLocaleString()}</div>
              : <div className="text-sm font-medium" style={{ color:'var(--color-accent)' }}>Price on Request</div>}
          </div>
          <div className="flex gap-1.5">
            <Link href={`/jewellery/${product.slug||product.id}`}
              className="text-[11px] px-3 py-1.5 rounded-full border border-ink-200 text-ink-500 hover:border-gold-400 hover:text-gold-600 transition-colors">
              View
            </Link>
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`}
                target="_blank" rel="noreferrer"
                className="text-[11px] px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors flex items-center gap-1">
                <MessageCircle size={11}/> Enquire
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts({ title='Featured Products', type='JEWELLERY', limit=8 }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(()=>{
    sfAPI.products({ inventory_type:type, limit, status:'active' })
      .then(r=>setProducts(r.data.data||[]))
      .catch(()=>setProducts([]))
      .finally(()=>setLoading(false));
  },[type]);

  if (!loading && products.length===0) return null;

  const typeHref = {
    JEWELLERY:'/jewellery', NATURAL_DIAMOND:'/diamonds?type=NATURAL',
    LAB_GROWN_DIAMOND:'/diamonds?type=LAB_GROWN', GEMSTONE:'/gemstones',
    PEARL:'/pearls', MOUNTING:'/mountings',
  }[type] || '/jewellery';

  return (
    <section className="section">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="text-ink-400 text-sm mt-1">Handpicked from our inventory</p>
        </div>
        <Link href={typeHref} className="text-sm text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1">
          View all <ChevronRight size={14}/>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_,i)=>(
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-ink-100 rounded-t-2xl"/>
              <div className="p-4 space-y-2"><div className="h-3 bg-ink-100 rounded w-3/4"/><div className="h-4 bg-ink-100 rounded"/><div className="h-5 bg-ink-100 rounded w-1/2"/></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p=><ProductCard key={p.id} product={p}/>)}
        </div>
      )}
    </section>
  );
}
