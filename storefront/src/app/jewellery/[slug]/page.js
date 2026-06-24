'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Heart, ZoomIn, ChevronLeft } from 'lucide-react';

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    fetch(`${api}/storefront/products/${params.slug}`)
      .then(r => r.json())
      .then(r => { setProduct(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.slug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div style={{ width:32,height:32,border:'2px solid #b8860b',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="font-cormorant text-3xl" style={{ color:'#1a1a1a' }}>Product not found</p>
      <Link href="/jewellery" className="btn-tejori">Back to Jewellery</Link>
    </div>
  );

  const images = product.media?.length
    ? product.media.map(m => m.file_url).filter(Boolean)
    : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80'];

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappMsg = encodeURIComponent(
    `Hi Tejori, I am interested in ${product.name} (SKU: ${product.sku || 'N/A'}).\nPlease share pricing and availability.\nLink: ${pageUrl}`
  );

  const specs = [
    product.metal_type   && ['Metal',         product.metal_type.replace('_',' ')],
    product.purity       && ['Purity',         product.purity],
    product.gross_weight && ['Gross weight',   `${product.gross_weight}g`],
    product.net_weight   && ['Net weight',     `${product.net_weight}g`],
    product.gender       && ['Gender',         product.gender],
    product.occasion     && ['Occasion',       product.occasion],
    product.style        && ['Style',          product.style],
    product.sku          && ['SKU',            product.sku],
  ].filter(Boolean);

  const isLabGrown = product.inventory_type === 'LAB_GROWN_DIAMOND';

  return (
    <div style={{ fontFamily:"'Inter', system-ui, sans-serif", background:'#fff' }}>
      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-4">
        <nav className="flex items-center gap-2" style={{ fontSize:11, color:'#6b6b6b', letterSpacing:'0.05em' }}>
          <Link href="/" className="hover:text-yellow-700 transition-colors">Home</Link>
          <ChevronRight size={11}/>
          {isLabGrown
            ? <Link href="/lab-grown" className="hover:text-yellow-700 transition-colors">Lab-Diamond</Link>
            : <Link href="/jewellery" className="hover:text-yellow-700 transition-colors">Jewellery</Link>}
          <ChevronRight size={11}/>
          <span style={{ color:'#1a1a1a' }}>{product.name}</span>
        </nav>
      </div>

      {/* Main product layout */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LEFT — Image grid (70% width = 8 cols, Cartier-style 2-col grid) */}
          <div className="lg:col-span-8">
            {/* Main image */}
            <div className="relative overflow-hidden mb-3 cursor-zoom-in group"
              style={{ background:'#f5f0e8', aspectRatio:'1' }}
              onClick={() => setZoomed(true)}>
              <img src={images[activeImg]} alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
              <button className="absolute top-4 right-4 w-8 h-8 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={14}/>
              </button>
              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); setActiveImg(i => Math.max(0,i-1)); }}
                    disabled={activeImg===0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 flex items-center justify-center disabled:opacity-30 hover:bg-white transition-colors">
                    <ChevronLeft size={16}/>
                  </button>
                  <button onClick={e => { e.stopPropagation(); setActiveImg(i => Math.min(images.length-1,i+1)); }}
                    disabled={activeImg===images.length-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 flex items-center justify-center disabled:opacity-30 hover:bg-white transition-colors">
                    <ChevronRight size={16}/>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip — 2 wide per client spec */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img,i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className="overflow-hidden transition-all"
                    style={{ border: i===activeImg ? '1px solid #b8860b' : '1px solid #e5e0d8', aspectRatio:'1', background:'#f5f0e8' }}>
                    <img src={img} alt={`View ${i+1}`} className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}

            {/* Bottom educational links (client spec) */}
            <div className="grid grid-cols-2 gap-4 mt-12">
              <Link href="/blog?cat=care"
                className="flex items-center gap-4 p-5 border border-ink-100 hover:border-yellow-600 transition-colors group">
                <span className="text-2xl">🔍</span>
                <div>
                  <p className="font-medium mb-1" style={{ fontSize:12, color:'#1a1a1a', letterSpacing:'0.05em' }}>Jewellery Care Guide</p>
                  <p style={{ fontSize:11, color:'#6b6b6b' }}>Simple steps to care for your TEJORI creation.</p>
                </div>
                <ChevronRight size={14} className="ml-auto text-ink-300 group-hover:text-yellow-600 transition-colors"/>
              </Link>
              <Link href={isLabGrown ? '/lab-grown' : '/blog?cat=diamonds'}
                className="flex items-center gap-4 p-5 border border-ink-100 hover:border-yellow-600 transition-colors group">
                <span className="text-2xl">💎</span>
                <div>
                  <p className="font-medium mb-1" style={{ fontSize:12, color:'#1a1a1a', letterSpacing:'0.05em' }}>
                    {isLabGrown ? 'What are Lab Grown Diamonds?' : 'How to buy diamonds & jewellery'}
                  </p>
                  <p style={{ fontSize:11, color:'#6b6b6b' }}>
                    {isLabGrown ? 'Learn about lab-grown diamond technology.' : 'A guide to choosing your perfect piece.'}
                  </p>
                </div>
                <ChevronRight size={14} className="ml-auto text-ink-300 group-hover:text-yellow-600 transition-colors"/>
              </Link>
            </div>
          </div>

          {/* RIGHT — Product info (4 cols, sticky) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              {/* Badges */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {product.is_new && (
                  <span style={{ fontSize:9, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', background:'#1a1a1a', color:'#fff', padding:'4px 10px' }}>New</span>
                )}
                {isLabGrown && (
                  <span style={{ fontSize:9, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', background:'#0f2a5e', color:'#fff', padding:'4px 10px' }}>Lab-Diamond</span>
                )}
                {product.has_certificate && (
                  <span style={{ fontSize:9, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', background:'#f5ede2', color:'#b8860b', padding:'4px 10px' }}>
                    {product.cert_lab || 'Certified'}
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="font-cormorant font-light mb-3" style={{ fontSize:36, color:'#1a1a1a', lineHeight:1.1, letterSpacing:'0.01em' }}>
                {product.name}
              </h1>

              {/* SKU */}
              {product.sku && (
                <p style={{ fontSize:10, color:'#aaa', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:20 }}>
                  Ref. {product.sku}
                </p>
              )}

              {/* Divider */}
              <div style={{ width:40, height:1, background:'#b8860b', marginBottom:24 }}/>

              {/* Description */}
              {product.description && (
                <p style={{ fontSize:13, color:'#6b6b6b', lineHeight:1.9, marginBottom:28 }}>
                  {product.description}
                </p>
              )}

              {/* Specs */}
              {specs.length > 0 && (
                <div className="mb-8">
                  {specs.map(([k,v]) => (
                    <div key={k} className="flex justify-between py-2.5 border-b" style={{ borderColor:'#f0ede8', fontSize:12 }}>
                      <span style={{ color:'#6b6b6b' }}>{k}</span>
                      <span style={{ color:'#1a1a1a', fontWeight:500, textTransform:'capitalize' }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Price — show only if available, never AED 0 */}
              <div className="mb-6">
                {product.base_price && Number(product.base_price) > 0 ? (
                  <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:28, fontWeight:300, color:'#1a1208', letterSpacing:'0.02em' }}>
                    AED {Number(product.base_price).toLocaleString()}
                  </p>
                ) : (
                  <p style={{ fontSize:13, color:'#b8860b', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:500 }}>
                    Price on Request
                  </p>
                )}
              </div>

              {/* REQUEST PRICE — WhatsApp CTA (client spec: no buy button) */}
              <div className="space-y-3">
                <a href={`https://wa.me/${(wapp||'').replace(/\D/g,'')}?text=${whatsappMsg}`}
                  target="_blank" rel="noreferrer"
                  className="btn-whatsapp">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.523 5.847L.057 23.885l6.197-1.625A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.003-1.367l-.358-.214-3.724.977.994-3.634-.234-.373A9.818 9.818 0 1112 21.818z"/>
                  </svg>
                  Request Price
                </a>

                <button onClick={() => setWishlist(!wishlist)}
                  className="w-full flex items-center justify-center gap-2 py-3 border transition-colors"
                  style={{ borderColor: wishlist ? '#b8860b' : '#e5e0d8', color: wishlist ? '#b8860b' : '#6b6b6b', fontSize:11, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase' }}>
                  <Heart size={15} fill={wishlist ? '#b8860b' : 'none'}/>
                  {wishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
                </button>

                <Link href="/appointment"
                  className="w-full flex items-center justify-center py-3 border border-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                  style={{ fontSize:11, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:'#1a1a1a' }}>
                  Book a Consultation
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-8 pt-6 border-t space-y-3" style={{ borderColor:'#f0ede8' }}>
                {[
                  ['🛡️', 'Authenticity Guaranteed', 'Every piece is certified and inspected'],
                  ['📦', 'Insured Delivery',         'Complimentary shipping on all orders'],
                  ['↩️', 'Easy Returns',              '14-day return policy'],
                ].map(([icon,title,desc]) => (
                  <div key={title} className="flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    <div>
                      <p style={{ fontSize:11, fontWeight:600, color:'#1a1a1a', letterSpacing:'0.05em' }}>{title}</p>
                      <p style={{ fontSize:10, color:'#6b6b6b' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar pieces section (client spec) */}
      <SimilarPieces product={product}/>

      {/* Newsletter at base of every product page (client spec) */}
      <NewsletterSection/>

      {/* Zoom modal */}
      {zoomed && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}>
          <img src={images[activeImg]} alt={product.name}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight:'90vh' }}/>
          <button className="absolute top-6 right-6 text-white text-3xl font-light" onClick={() => setZoomed(false)}>✕</button>
        </div>
      )}
    </div>
  );
}

function SimilarPieces({ product }) {
  const [similar, setSimilar] = useState([]);
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;

  useEffect(() => {
    if (!product) return;
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    const params = new URLSearchParams({ status:'active', limit:4, inventory_type: product.inventory_type || 'JEWELLERY' });
    fetch(`${api}/storefront/products?${params}`)
      .then(r=>r.json())
      .then(r => setSimilar((r.data?.data||[]).filter(p=>p.id!==product.id).slice(0,4)))
      .catch(()=>{});
  }, [product]);

  if (!similar.length) return null;

  return (
    <section className="py-16 border-t" style={{ borderColor:'#e5e0d8', background:'#fdf8f3' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <p className="tejori-label text-center mb-3">You may also like</p>
        <h2 className="font-cormorant text-4xl font-light text-center mb-10" style={{ color:'#1a1a1a' }}>Similar Pieces</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {similar.map(p => {
            const msg = encodeURIComponent(`Hi Tejori, I am interested in ${p.name} (SKU: ${p.sku || 'N/A'}). Please share pricing and availability.`);
            return (
              <div key={p.id} className="group bg-white border transition-colors" style={{ borderColor:'#e5e0d8' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#b8860b'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e0d8'}>
                <div className="overflow-hidden" style={{ aspectRatio:'1', background:'#f5ede2' }}>
                  {p.thumb_url
                    ? <img src={p.thumb_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    : <div className="w-full h-full flex items-center justify-center text-4xl">💍</div>}
                </div>
                <div className="p-4">
                  <h3 className="font-cormorant font-light mb-3" style={{ fontSize:16, color:'#1a1a1a', lineHeight:1.3 }}>{p.name}</h3>
                  <div className="flex gap-2">
                    <Link href={`/jewellery/${p.slug||p.id}`}
                      className="flex-1 text-center py-2.5 border transition-colors"
                      style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'#1a1a1a', borderColor:'#e5e0d8', fontWeight:500 }}
                      onMouseEnter={e=>{e.currentTarget.style.background='#1a1a1a';e.currentTarget.style.color='#fff';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#1a1a1a';}}>
                      View
                    </Link>
                    {wapp && (
                      <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`}
                        target="_blank" rel="noreferrer"
                        className="w-10 flex items-center justify-center border transition-colors"
                        style={{ borderColor:'#e5e0d8' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#25d366'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#4a4a4a">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.523 5.847L.057 23.885l6.197-1.625A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.003-1.367l-.358-.214-3.724.977.994-3.634-.234-.373A9.818 9.818 0 1112 21.818z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [done, setDone]   = useState(false);
  return (
    <section className="py-14 text-center" style={{ background:'#1a1a1a' }}>
      <div className="max-w-lg mx-auto px-6">
        <p className="tejori-label mb-3">Stay Connected</p>
        <h3 className="font-cormorant text-3xl font-light text-white mb-3">Stay in the world of Tejori</h3>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:24, letterSpacing:'0.05em' }}>
          Subscribe for 10% off your first purchase.
        </p>
        {done ? (
          <p style={{ color:'#4caf70', fontWeight:500, fontSize:13 }}>✓ Thank you! Check your inbox for your 10% discount.</p>
        ) : (
          <form onSubmit={e=>{e.preventDefault();setDone(true);}} className="flex gap-0 max-w-sm mx-auto">
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="Your email address"
              style={{ flex:1, padding:'13px 16px', border:'1px solid rgba(255,255,255,0.15)', borderRight:'none', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:12, outline:'none' }}/>
            <button type="submit"
              style={{ padding:'13px 20px', background:'#b8860b', color:'#fff', border:'none', cursor:'pointer', fontSize:10, fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}