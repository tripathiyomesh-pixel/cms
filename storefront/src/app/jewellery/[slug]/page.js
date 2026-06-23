'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Heart, ZoomIn, ChevronLeft, MessageCircle } from 'lucide-react';
import { useTemplateContext } from '@/components/layout/TemplateLayout';

// ── SHARED HELPERS ─────────────────────────────────────────────
function useProduct(slug) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    fetch(`${api}/storefront/products/${slug}`)
      .then(r => r.json())
      .then(r => { setProduct(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);
  return { product, loading };
}

function buildWhatsAppUrl(product) {
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;
  if (!wapp) return null;
  const msg = encodeURIComponent(
    `Hi, I'm interested in: ${product.name}${product.sku ? ` (${product.sku})` : ''}.\n\nCould you share the price and availability?\n\n${typeof window !== 'undefined' ? window.location.href : ''}`
  );
  return `https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`;
}

function buildSpecs(product) {
  return [
    product.metal_type   && ['Metal',        product.metal_type.replace(/_/g,' ')],
    product.purity       && ['Purity',        product.purity],
    product.gross_weight && ['Gross weight',  `${product.gross_weight}g`],
    product.net_weight   && ['Net weight',    `${product.net_weight}g`],
    product.gender       && ['Gender',        product.gender],
    product.occasion     && ['Occasion',      product.occasion],
    product.style        && ['Style',         product.style],
    product.sku          && ['SKU',           product.sku],
  ].filter(Boolean);
}

function ImageGallery({ images, activeImg, setActiveImg, setZoomed }) {
  return (
    <div style={{ position:'relative' }}>
      <div style={{ position:'relative', aspectRatio:'1', overflow:'hidden', background:'var(--color-bg-secondary,#fafaf8)', cursor:'zoom-in' }}
        onClick={() => setZoomed(true)}>
        <img src={images[activeImg]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .3s' }}
          onMouseEnter={e=>e.target.style.transform='scale(1.04)'}
          onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
        <button style={{ position:'absolute', bottom:12, right:12, background:'rgba(255,255,255,0.9)', border:'none', borderRadius:4, padding:'6px 8px', cursor:'pointer', display:'flex' }}>
          <ZoomIn size={14}/>
        </button>
        {images.length > 1 && (
          <>
            <button onClick={e=>{e.stopPropagation();setActiveImg(i=>Math.max(0,i-1));}} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.9)', border:'none', borderRadius:'50%', width:36, height:36, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity: activeImg===0?0.3:1 }}>
              <ChevronLeft size={16}/>
            </button>
            <button onClick={e=>{e.stopPropagation();setActiveImg(i=>Math.min(images.length-1,i+1));}} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.9)', border:'none', borderRadius:'50%', width:36, height:36, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity: activeImg===images.length-1?0.3:1 }}>
              <ChevronRight size={16}/>
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div style={{ display:'flex', gap:6, marginTop:8, overflowX:'auto' }}>
          {images.map((img,i) => (
            <button key={i} onClick={() => setActiveImg(i)}
              style={{ width:64, height:64, flexShrink:0, border:`2px solid ${activeImg===i?'var(--color-accent,#c9a84c)':'transparent'}`, padding:2, background:'var(--color-bg-secondary,#fafaf8)', cursor:'pointer' }}>
              <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductInfo({ product, specs, waUrl, wishlist, setWishlist, layout }) {
  const isLabGrown = product.inventory_type === 'LAB_GROWN_DIAMOND';
  const compact = layout === 'minimal' || layout === 'fullscreen';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap: compact?16:24 }}>
      <div>
        {isLabGrown && (
          <div style={{ display:'inline-block', fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--color-accent,#c9a84c)', marginBottom:8, border:'1px solid var(--color-accent,#c9a84c)', padding:'3px 10px' }}>
            Lab-Grown Diamond
          </div>
        )}
        <h1 style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize: compact?28:36, fontWeight:'var(--font-heading-weight,400)', color:'var(--color-text,#1a1a1a)', lineHeight:1.15, marginBottom:8 }}>
          {product.name}
        </h1>
        {product.collection_name && (
          <p style={{ fontSize:11, color:'var(--color-text-muted,#6b6b6b)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
            {product.collection_name} Collection
          </p>
        )}
      </div>

      {product.price && (
        <div style={{ display:'flex', alignItems:'baseline', gap:12 }}>
          <span style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:28, fontWeight:600, color:'var(--color-text,#1a1a1a)' }}>
            AED {parseFloat(product.price).toLocaleString('en-AE')}
          </span>
          {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
            <span style={{ fontSize:16, color:'var(--color-text-muted,#6b6b6b)', textDecoration:'line-through' }}>
              AED {parseFloat(product.compare_price).toLocaleString('en-AE')}
            </span>
          )}
        </div>
      )}

      {product.description && (
        <p style={{ fontSize:13, color:'var(--color-text-muted,#6b6b6b)', lineHeight:1.85, maxWidth: compact?'none':520 }}>
          {product.description}
        </p>
      )}

      {specs.length > 0 && (
        <div style={{ borderTop:'1px solid var(--color-border,#e5e5e5)', paddingTop:20 }}>
          <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--color-text-muted,#6b6b6b)', marginBottom:14 }}>Specifications</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 16px' }}>
            {specs.map(([k,v]) => (
              <div key={k}>
                <span style={{ fontSize:10, color:'var(--color-text-muted,#6b6b6b)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{k}</span>
                <span style={{ display:'block', fontSize:12, color:'var(--color-text,#1a1a1a)', fontWeight:500, marginTop:1 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, paddingTop:4 }}>
        {waUrl ? (
          <a href={waUrl} target="_blank" rel="noreferrer"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'16px 24px', background:'var(--color-accent,#c9a84c)', color:'var(--color-button-text,#fff)', fontSize:12, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none', borderRadius:'var(--btn-radius,8px)', transition:'opacity .2s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.9'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <MessageCircle size={16}/>
            Enquire on WhatsApp
          </a>
        ) : (
          <Link href="/contact"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'16px 24px', background:'var(--color-accent,#c9a84c)', color:'var(--color-button-text,#fff)', fontSize:12, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none', borderRadius:'var(--btn-radius,8px)' }}>
            Enquire Now
          </Link>
        )}
        <div style={{ display:'flex', gap:8 }}>
          <Link href="/appointment"
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'13px 16px', border:'1px solid var(--color-border,#e5e5e5)', color:'var(--color-text,#1a1a1a)', fontSize:11, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', textDecoration:'none', borderRadius:'var(--btn-radius,8px)', transition:'border-color .2s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--color-accent,#c9a84c)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--color-border,#e5e5e5)'}>
            Book Appointment
          </Link>
          <button onClick={() => setWishlist(v=>!v)}
            style={{ width:48, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--color-border,#e5e5e5)', background:'none', cursor:'pointer', borderRadius:'var(--btn-radius,8px)', transition:'all .2s', color: wishlist?'#ef4444':'var(--color-text,#1a1a1a)' }}>
            <Heart size={16} fill={wishlist?'#ef4444':'none'}/>
          </button>
        </div>
      </div>

      {/* Trust badges */}
      <div style={{ display:'flex', gap:20, paddingTop:8, borderTop:'1px solid var(--color-border,#e5e5e5)', flexWrap:'wrap' }}>
        {[['💎','GIA & IGI Certified'],['🔒','Secure Packaging'],['📦','Free Delivery']].map(([icon,text]) => (
          <div key={text} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:14 }}>{icon}</span>
            <span style={{ fontSize:10, color:'var(--color-text-muted,#6b6b6b)', letterSpacing:'0.04em' }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Breadcrumb({ product }) {
  const isLabGrown = product.inventory_type === 'LAB_GROWN_DIAMOND';
  return (
    <nav style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--color-text-muted,#6b6b6b)', marginBottom:28 }}>
      <Link href="/" style={{ color:'inherit', textDecoration:'none' }}>Home</Link>
      <ChevronRight size={11}/>
      <Link href={isLabGrown ? '/lab-grown' : '/jewellery'} style={{ color:'inherit', textDecoration:'none' }}>
        {isLabGrown ? 'Lab-Grown' : 'Jewellery'}
      </Link>
      {product.category_name && (
        <>
          <ChevronRight size={11}/>
          <Link href={`/jewellery?category=${product.category_slug || ''}`} style={{ color:'inherit', textDecoration:'none' }}>
            {product.category_name}
          </Link>
        </>
      )}
      <ChevronRight size={11}/>
      <span style={{ color:'var(--color-text,#1a1a1a)' }}>{product.name}</span>
    </nav>
  );
}

// ── LAYOUT: CARTIER (full-width hero, specs below, sticky CTA) ─
function LayoutCartier({ product, images, activeImg, setActiveImg, setZoomed, specs, waUrl, wishlist, setWishlist }) {
  return (
    <div style={{ background:'var(--color-bg,#fff)' }}>
      <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'32px 32px 0' }}>
        <Breadcrumb product={product}/>
      </div>
      {/* Full-width hero image */}
      <div style={{ position:'relative', height:'70vh', overflow:'hidden', background:'var(--color-bg-secondary,#fafaf8)', marginBottom:48 }}>
        <img src={images[activeImg]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        {images.length > 1 && (
          <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8 }}>
            {images.map((_,i) => (
              <button key={i} onClick={() => setActiveImg(i)} style={{ width: activeImg===i?24:8, height:8, borderRadius:4, background: activeImg===i?'#fff':'rgba(255,255,255,0.5)', border:'none', cursor:'pointer', transition:'width .2s' }}/>
            ))}
          </div>
        )}
      </div>
      <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'0 32px 80px', display:'grid', gridTemplateColumns:'1fr 380px', gap:80, alignItems:'start' }}>
        {/* Left: specs + description */}
        <div>
          <h1 style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:44, fontWeight:'var(--font-heading-weight,400)', color:'var(--color-text,#1a1a1a)', lineHeight:1.1, marginBottom:16 }}>
            {product.name}
          </h1>
          {product.price && (
            <p style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:28, color:'var(--color-text,#1a1a1a)', marginBottom:28 }}>
              AED {parseFloat(product.price).toLocaleString('en-AE')}
            </p>
          )}
          {product.description && (
            <p style={{ fontSize:14, color:'var(--color-text-muted,#6b6b6b)', lineHeight:1.9, maxWidth:520, marginBottom:40 }}>{product.description}</p>
          )}
          {specs.length > 0 && (
            <div style={{ borderTop:'1px solid var(--color-border,#e5e5e5)', paddingTop:32 }}>
              <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--color-text-muted,#6b6b6b)', marginBottom:20 }}>Specifications</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px 32px' }}>
                {specs.map(([k,v]) => (
                  <div key={k}>
                    <span style={{ fontSize:9, color:'var(--color-text-muted,#6b6b6b)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{k}</span>
                    <span style={{ display:'block', fontSize:14, color:'var(--color-text,#1a1a1a)', fontWeight:500, marginTop:3 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Right: sticky CTA panel */}
        <div style={{ position:'sticky', top: 'calc(var(--nav-height,72px) + 24px)', background:'var(--color-bg-card,#fff)', border:'1px solid var(--color-border,#e5e5e5)', padding:32 }}>
          <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.2em', color:'var(--color-accent,#c9a84c)', textTransform:'uppercase', marginBottom:8 }}>
            {product.collection_name || 'Fine Jewellery'}
          </p>
          <p style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:22, color:'var(--color-text,#1a1a1a)', marginBottom:16, lineHeight:1.3 }}>{product.name}</p>
          {product.price && <p style={{ fontSize:20, fontWeight:600, color:'var(--color-text,#1a1a1a)', marginBottom:28 }}>AED {parseFloat(product.price).toLocaleString('en-AE')}</p>}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {waUrl && <a href={waUrl} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px', background:'var(--color-accent,#c9a84c)', color:'#fff', fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', borderRadius:'var(--btn-radius,2px)' }}>💬 Enquire on WhatsApp</a>}
            <Link href="/appointment" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'13px', border:'1px solid var(--color-border,#e5e5e5)', color:'var(--color-text,#1a1a1a)', fontSize:11, textDecoration:'none', borderRadius:'var(--btn-radius,2px)', letterSpacing:'0.06em', textTransform:'uppercase' }}>Book Appointment</Link>
          </div>
          <div style={{ display:'flex', gap:16, marginTop:20, justifyContent:'center', flexWrap:'wrap' }}>
            {['💎 GIA Certified','🔒 Insured Delivery','↩️ Easy Returns'].map(t=><span key={t} style={{ fontSize:10, color:'var(--color-text-muted,#6b6b6b)' }}>{t}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LAYOUT: SPLIT (image left sticky, details scroll right) ────
function LayoutSplit({ product, images, activeImg, setActiveImg, setZoomed, specs, waUrl, wishlist, setWishlist }) {
  return (
    <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'32px 32px 80px' }}>
      <Breadcrumb product={product}/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
        <div style={{ position:'sticky', top: 'calc(var(--nav-height,72px) + 24px)' }}>
          <ImageGallery images={images} activeImg={activeImg} setActiveImg={setActiveImg} setZoomed={setZoomed}/>
        </div>
        <ProductInfo product={product} specs={specs} waUrl={waUrl} wishlist={wishlist} setWishlist={setWishlist} layout="split"/>
      </div>
    </div>
  );
}

// ── LAYOUT: GRID GALLERY (2×2 images left, details right) ─────
function LayoutGrid({ product, images, activeImg, setActiveImg, setZoomed, specs, waUrl, wishlist, setWishlist }) {
  const gridImgs = [...images, ...images].slice(0, 4);
  return (
    <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'32px 32px 80px' }}>
      <Breadcrumb product={product}/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 420px', gap:64, alignItems:'start' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
          {gridImgs.map((img,i) => (
            <div key={i} style={{ aspectRatio:'1', overflow:'hidden', background:'var(--color-bg-secondary,#fafaf8)', cursor:'pointer' }} onClick={() => { setActiveImg(i % images.length); setZoomed(true); }}>
              <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .3s' }}
                onMouseEnter={e=>e.target.style.transform='scale(1.04)'}
                onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
            </div>
          ))}
        </div>
        <div style={{ position:'sticky', top: 'calc(var(--nav-height,72px) + 24px)' }}>
          <ProductInfo product={product} specs={specs} waUrl={waUrl} wishlist={wishlist} setWishlist={setWishlist} layout="grid"/>
        </div>
      </div>
    </div>
  );
}

// ── LAYOUT: MINIMAL ────────────────────────────────────────────
function LayoutMinimal({ product, images, activeImg, setActiveImg, setZoomed, specs, waUrl, wishlist, setWishlist }) {
  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:'48px 32px 80px' }}>
      <Breadcrumb product={product}/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48 }}>
        <ImageGallery images={images} activeImg={activeImg} setActiveImg={setActiveImg} setZoomed={setZoomed}/>
        <ProductInfo product={product} specs={specs} waUrl={waUrl} wishlist={wishlist} setWishlist={setWishlist} layout="minimal"/>
      </div>
    </div>
  );
}

// ── LAYOUT: MAGAZINE (editorial full-bleed) ────────────────────
function LayoutMagazine({ product, images, activeImg, setActiveImg, setZoomed, specs, waUrl, wishlist, setWishlist }) {
  return (
    <div style={{ background:'var(--color-bg,#fff)' }}>
      {/* Hero */}
      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', minHeight:'80vh' }}>
        <div style={{ position:'relative', overflow:'hidden', background:'var(--color-bg-secondary,#fafaf8)' }}>
          <img src={images[activeImg]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'64px 48px', background:'var(--color-bg,#fff)' }}>
          <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto' }}>
            <Breadcrumb product={product}/>
          </div>
          <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--color-accent,#c9a84c)', marginBottom:16 }}>
            {product.collection_name || 'Fine Jewellery'}
          </p>
          <h1 style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:48, fontWeight:'var(--font-heading-weight,400)', color:'var(--color-text,#1a1a1a)', lineHeight:1.05, marginBottom:20 }}>
            {product.name}
          </h1>
          {product.price && <p style={{ fontSize:22, color:'var(--color-text,#1a1a1a)', marginBottom:28, fontWeight:300 }}>AED {parseFloat(product.price).toLocaleString('en-AE')}</p>}
          {product.description && <p style={{ fontSize:14, color:'var(--color-text-muted,#6b6b6b)', lineHeight:1.9, marginBottom:36 }}>{product.description}</p>}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {waUrl && <a href={waUrl} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'16px', background:'var(--color-accent,#c9a84c)', color:'#fff', fontSize:11, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none', borderRadius:'var(--btn-radius,8px)' }}>💬 Enquire on WhatsApp</a>}
            <Link href="/appointment" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'14px', border:'1px solid var(--color-border,#e5e5e5)', color:'var(--color-text,#1a1a1a)', fontSize:11, textDecoration:'none', borderRadius:'var(--btn-radius,8px)', letterSpacing:'0.06em', textTransform:'uppercase' }}>Book Appointment</Link>
          </div>
        </div>
      </div>
      {/* Specs strip */}
      {specs.length > 0 && (
        <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'48px 32px' }}>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(specs.length,4)},1fr)`, gap:32 }}>
            {specs.map(([k,v]) => (
              <div key={k} style={{ borderTop:'2px solid var(--color-accent,#c9a84c)', paddingTop:16 }}>
                <span style={{ fontSize:9, color:'var(--color-text-muted,#6b6b6b)', textTransform:'uppercase', letterSpacing:'0.12em' }}>{k}</span>
                <span style={{ display:'block', fontSize:18, fontFamily:"var(--font-heading,'Playfair Display',serif)", color:'var(--color-text,#1a1a1a)', marginTop:4 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── LAYOUT: FULLSCREEN (70vw image, slim sidebar) ──────────────
function LayoutFullscreen({ product, images, activeImg, setActiveImg, setZoomed, specs, waUrl, wishlist, setWishlist }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'70vw 1fr', minHeight:'100vh' }}>
      <div style={{ position:'sticky', top:0, height:'100vh', overflow:'hidden', background:'var(--color-bg-secondary,#fafaf8)' }}>
        <img src={images[activeImg]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        {images.length > 1 && (
          <div style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', display:'flex', flexDirection:'column', gap:6 }}>
            {images.map((_,i) => (
              <button key={i} onClick={() => setActiveImg(i)} style={{ width:8, height: activeImg===i?24:8, borderRadius:4, background: activeImg===i?'#fff':'rgba(255,255,255,0.5)', border:'none', cursor:'pointer', transition:'height .2s' }}/>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding:'48px 32px', overflowY:'auto', display:'flex', flexDirection:'column', gap:24 }}>
        <Breadcrumb product={product}/>
        <ProductInfo product={product} specs={specs} waUrl={waUrl} wishlist={wishlist} setWishlist={setWishlist} layout="fullscreen"/>
      </div>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────
export default function ProductDetailPage({ params }) {
  const { product, loading } = useProduct(params.slug);
  const [activeImg, setActiveImg] = useState(0);
  const [zoomed,    setZoomed]    = useState(false);
  const [wishlist,  setWishlist]  = useState(false);
  const ctx = useTemplateContext();
  const layout = ctx?.config?.theme_product_layout || 'split';

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ width:32, height:32, border:'2px solid var(--color-accent,#c9a84c)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!product) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:16 }}>
      <p style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:28, color:'var(--color-text,#1a1a1a)' }}>Product not found</p>
      <Link href="/jewellery" style={{ padding:'12px 24px', background:'var(--color-accent,#c9a84c)', color:'#fff', textDecoration:'none', fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:'var(--btn-radius,8px)' }}>
        Back to Jewellery
      </Link>
    </div>
  );

  const images = product.media?.length
    ? product.media.map(m => m.file_url).filter(Boolean)
    : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80'];
  const specs  = buildSpecs(product);
  const waUrl  = buildWhatsAppUrl(product);

  const sharedProps = { product, images, activeImg, setActiveImg, setZoomed, specs, waUrl, wishlist, setWishlist };

  return (
    <>
      {layout === 'cartier'    && <LayoutCartier    {...sharedProps}/>}
      {layout === 'grid'       && <LayoutGrid        {...sharedProps}/>}
      {layout === 'minimal'    && <LayoutMinimal     {...sharedProps}/>}
      {layout === 'magazine'   && <LayoutMagazine    {...sharedProps}/>}
      {layout === 'fullscreen' && <LayoutFullscreen  {...sharedProps}/>}
      {(layout === 'split' || !['cartier','grid','minimal','magazine','fullscreen'].includes(layout)) && <LayoutSplit {...sharedProps}/>}

      {/* Lightbox */}
      {zoomed && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.95)', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => setZoomed(false)}>
          <img src={images[activeImg]} alt="" style={{ maxWidth:'90vw', maxHeight:'90vh', objectFit:'contain' }}/>
          <button style={{ position:'absolute', top:20, right:20, background:'none', border:'none', color:'#fff', fontSize:28, cursor:'pointer' }}>✕</button>
        </div>
      )}
    </>
  );
}
