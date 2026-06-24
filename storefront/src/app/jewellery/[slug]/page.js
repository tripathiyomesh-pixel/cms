'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Heart, ChevronLeft, ChevronRight, ZoomIn, X, ExternalLink, ChevronDown } from 'lucide-react';

const API  = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const GOLD = '#b8860b';
const CREAM = '#fdf8f3';

// ── RECENTLY VIEWED (localStorage) ───────────────────────────
function addRecentlyViewed(product) {
  try {
    const key = 'tejori_recent';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = existing.filter(p => p.id !== product.id);
    const updated  = [{ id: product.id, slug: product.slug, name: product.name, image: (product.images||[])[0] || product.image_url }, ...filtered].slice(0, 4);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}
}

function getRecentlyViewed(excludeId) {
  try {
    const key = 'tejori_recent';
    return JSON.parse(localStorage.getItem(key) || '[]').filter(p => p.id !== excludeId);
  } catch { return []; }
}

// ── IMAGE GALLERY ─────────────────────────────────────────────
function ImageGallery({ images }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const prev = () => setActive(i => Math.max(0, i - 1));
  const next = () => setActive(i => Math.min(images.length - 1, i + 1));

  return (
    <>
      <div>
        {/* Main image */}
        <div
          style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#f5f0e8', cursor: 'zoom-in' }}
          onClick={() => setZoomed(true)}
        >
          <img
            src={images[active]}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />

          <button
            style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(255,255,255,0.88)', border: 'none', padding: '7px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={e => { e.stopPropagation(); setZoomed(true); }}
          >
            <ZoomIn size={13} />
            <span style={{ fontSize: 10, letterSpacing: '0.1em' }}>Zoom</span>
          </button>

          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev(); }} disabled={active === 0}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: active === 0 ? 0.3 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={e => { e.stopPropagation(); next(); }} disabled={active === images.length - 1}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: active === images.length - 1 ? 0.3 : 1 }}>
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 10, padding: '3px 8px', letterSpacing: '0.08em' }}>
              {active + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  flexShrink: 0, width: 72, height: 72,
                  border: `2px solid ${active === i ? GOLD : 'transparent'}`,
                  padding: 2, background: '#f5f0e8', cursor: 'pointer',
                  transition: 'border-color 150ms ease',
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom lightbox */}
      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setZoomed(false)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <X size={28} />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev(); }}
                style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={e => { e.stopPropagation(); next(); }}
                style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <img
            src={images[active]}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
          />
        </div>
      )}
    </>
  );
}

// ── COLLAPSIBLE SECTION ───────────────────────────────────────
function Collapsible({ heading, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: '1px solid #e8ddd0' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a1208' }}>
          {heading}
        </span>
        <ChevronDown size={14} color="#8b7355" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms ease' }} />
      </button>
      {open && (
        <div style={{ paddingBottom: 20, fontSize: 13, color: '#5a4a3a', lineHeight: 1.8 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── SPECS TABLE ───────────────────────────────────────────────
function SpecsTable({ product }) {
  const rows = [
    ['Metal Type',      product.metal_type?.replace(/_/g, ' ')],
    ['Purity',          product.purity],
    ['Gross Weight',    product.gross_weight ? `${product.gross_weight}g` : null],
    ['Net Weight',      product.net_weight   ? `${product.net_weight}g`   : null],
    ['Stone Type',      product.stone_type],
    ['Stone Carat',     product.stone_carat  ? `${product.stone_carat} ct` : null],
    ['Certification',   product.certificate_type],
    ['Certificate No.', product.certificate_no ? (
      <a href={`/verify/${product.certificate_no}`} target="_blank" rel="noopener noreferrer"
        style={{ color: GOLD, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {product.certificate_no} <ExternalLink size={10} />
      </a>
    ) : null],
    ['Making Charge',   product.making_charge ? `${product.making_charge}%` : null],
    ['SKU',             product.sku],
  ].filter(([, v]) => v);

  if (!rows.length) return null;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} style={{ borderBottom: '1px solid #f0ebe3' }}>
            <td style={{ padding: '9px 0', color: '#8b7355', width: '45%', verticalAlign: 'top' }}>{label}</td>
            <td style={{ padding: '9px 0', color: '#1a1208', fontWeight: 500 }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── RELATED PRODUCTS STRIP ────────────────────────────────────
function RelatedProducts({ product, waNumber }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!product) return;
    // BUSINESS RULE: never mix natural and lab-grown suggestions
    const isLabGrown = product.stone_type?.toLowerCase().includes('lab') ||
                       product.collection?.toLowerCase().includes('lab') ||
                       product.tags?.includes('lab-grown');
    const params = new URLSearchParams({
      limit: '4',
      exclude: product.id,
      ...(product.category_id && { category_id: product.category_id }),
    });
    // Add diamond-type filter to enforce separation
    if (isLabGrown) params.set('diamond_type', 'lab_grown');
    else if (product.stone_type?.toLowerCase().includes('diamond')) params.set('diamond_type', 'natural');

    fetch(`${API}/storefront/products?${params.toString()}`)
      .then(r => r.json())
      .then(d => setRelated(d.data || d.products || []))
      .catch(() => {});
  }, [product]);

  if (!related.length) return null;

  return (
    <section style={{ padding: '64px 48px', background: '#fdf8f3' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(24px, 3vw, 36px)',
          fontWeight: 300,
          color: '#1a1208',
          marginBottom: 36,
          textAlign: 'center',
        }}>
          You May Also Like
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {related.map(p => {
            const img = (p.images||[])[0] || p.image_url;
            const waMsg = encodeURIComponent(`Hi Tejori, I'm interested in ${p.name}${p.sku ? ` (SKU: ${p.sku})` : ''}.`);
            const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : null;
            return (
              <div key={p.id}>
                <Link href={`/jewellery/${p.slug || p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#f0ebe3', marginBottom: 12 }}>
                    {img ? (
                      <img src={img} alt={p.name} loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 400ms ease' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #e8ddd0, #d4c4a8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ opacity: 0.25, fontSize: 24 }}>✦</span>
                      </div>
                    )}
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, fontWeight: 500, color: '#1a1208', marginBottom: 4 }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: (p.base_price && Number(p.base_price) > 0) ? '#1a1208' : GOLD, fontWeight: 600 }}>
                    {p.base_price && Number(p.base_price) > 0 ? `AED ${Number(p.base_price).toLocaleString()}` : 'Request Price'}
                  </p>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── RECENTLY VIEWED STRIP ─────────────────────────────────────
function RecentlyViewed({ excludeId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getRecentlyViewed(excludeId));
  }, [excludeId]);

  if (!items.length) return null;

  return (
    <section style={{ padding: '0 48px 64px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD, marginBottom: 24 }}>
          Recently Viewed
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          {items.map(p => (
            <Link key={p.id} href={`/jewellery/${p.slug || p.id}`} style={{ textDecoration: 'none', width: 120, flexShrink: 0 }}>
              <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#f0ebe3', marginBottom: 8 }}>
                {p.image ? (
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #e8ddd0, #d4c4a8)' }} />
                )}
              </div>
              <p style={{ fontSize: 11, color: '#1a1208', lineHeight: 1.3 }}>{p.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── MAIN PRODUCT PAGE ─────────────────────────────────────────
export default function ProductPage({ params }) {
  const { slug } = params;
  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [waNumber, setWaNumber]   = useState('');

  useEffect(() => {
    // Fetch WhatsApp number
    fetch(`${API}/settings/public`)
      .then(r => r.json())
      .then(d => {
        const data = d.data || d || {};
        const num = (data.store_whatsapp || data.whatsapp_number || '').replace(/^"|"$/g, '').replace(/\D/g, '');
        if (num) setWaNumber(num);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API}/storefront/products/${slug}`)
      .then(r => r.json())
      .then(d => {
        const p = d.data || d.product || d;
        setProduct(p);
        setLoading(false);
        if (p?.id) addRecentlyViewed(p);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
          <div style={{ aspectRatio: '1', background: '#f0ebe3', animation: 'shimmer 1.4s ease-in-out infinite' }} />
          <div>
            {[80, 160, 40, 40, 40].map((w, i) => (
              <div key={i} style={{ height: i === 1 ? 48 : 14, background: '#f0ebe3', width: `${w}%`, marginBottom: 20, animation: 'shimmer 1.4s ease-in-out infinite' }} />
            ))}
          </div>
        </div>
        <style>{`@keyframes shimmer { from { opacity: 0.5; } to { opacity: 1; } }`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, background: CREAM }}>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, color: '#1a1208', marginBottom: 16 }}>
          This piece is no longer available
        </p>
        <Link href="/jewellery" style={{ color: GOLD, textDecoration: 'none', fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          ← Browse Collection
        </Link>
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : product.image_url ? [product.image_url] : [''];

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const waMsg = encodeURIComponent(
    `Hi Tejori, I'm interested in ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''}. Please share the price and availability.\n\nPage: ${pageUrl}`
  );
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : null;

  return (
    <>
      {/* Breadcrumb */}
      <nav style={{ background: '#fdf8f3', borderBottom: '1px solid #f0ebe3', padding: '12px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#8b7355' }}>
          <Link href="/" style={{ color: '#8b7355', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/jewellery" style={{ color: '#8b7355', textDecoration: 'none' }}>Jewellery</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/jewellery?category=${product.category}`} style={{ color: '#8b7355', textDecoration: 'none' }}>
                {product.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: '#1a1208' }}>{product.name}</span>
        </div>
      </nav>

      <div style={{ background: CREAM }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 48px 64px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '3fr 2fr',
            gap: 64,
            alignItems: 'start',
          }}>
            {/* LEFT: Gallery */}
            <ImageGallery images={images.filter(Boolean)} />

            {/* RIGHT: Product info */}
            <div style={{ position: 'sticky', top: 100 }}>
              {/* Brand */}
              <p style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: GOLD,
                marginBottom: 10,
              }}>
                TEJORI
              </p>

              {/* Name */}
              <h1 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(24px, 3vw, 38px)',
                fontWeight: 300,
                color: '#1a1208',
                lineHeight: 1.15,
                marginBottom: 8,
              }}>
                {product.name}
              </h1>

              {/* SKU */}
              {product.sku && (
                <p style={{ fontSize: 11, color: '#8b7355', marginBottom: 12, letterSpacing: '0.06em' }}>
                  SKU: #{product.sku}
                </p>
              )}

              {/* Metal + Stone summary */}
              {(product.metal_type || product.stone_type) && (
                <p style={{ fontSize: 13, color: '#5a4a3a', marginBottom: 20, letterSpacing: '0.04em' }}>
                  {[product.metal_type?.replace(/_/g,' '), product.stone_type].filter(Boolean).join(' · ')}
                </p>
              )}

              {/* Price */}
              <div style={{ marginBottom: 24 }}>
                {product.base_price && Number(product.base_price) > 0 ? (
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 500, color: '#1a1208' }}>
                    AED {Number(product.base_price).toLocaleString()}
                  </p>
                ) : (
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, color: GOLD, fontStyle: 'italic' }}>
                    Price on Request
                  </p>
                )}
              </div>

              <div style={{ borderTop: '1px solid #e8ddd0', paddingTop: 20, marginBottom: 20 }}>
                <SpecsTable product={product} />
              </div>

              {/* PRIMARY CTA */}
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '16px 24px',
                    background: GOLD,
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginBottom: 10,
                    transition: 'background 150ms ease',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#9a7009'}
                  onMouseOut={e => e.currentTarget.style.background = GOLD}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Request Price on WhatsApp
                </a>
              )}

              {/* SECONDARY CTA */}
              <Link
                href="/appointment"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', padding: '14px 24px',
                  border: `1px solid ${GOLD}`,
                  color: GOLD,
                  textDecoration: 'none',
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                Book a Viewing Appointment
              </Link>

              {/* WISHLIST */}
              <button
                onClick={() => setWishlisted(w => !w)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '12px 24px',
                  background: 'none', border: '1px solid #e0d4c0',
                  color: wishlisted ? '#e03333' : '#5a4a3a',
                  fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  cursor: 'pointer', marginBottom: 28,
                }}
              >
                <Heart size={14} fill={wishlisted ? '#e03333' : 'none'} />
                {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
              </button>

              {/* Description */}
              {product.description && (
                <Collapsible heading="Description" defaultOpen={true}>
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </Collapsible>
              )}

              {/* Care instructions */}
              <Collapsible heading="Care Instructions">
                <p>Store your jewellery in the provided Tejori pouch or box, away from direct sunlight and moisture. Avoid contact with perfumes, lotions, and chemicals. Clean gently with a soft dry cloth. For professional cleaning, visit any Tejori boutique.</p>
              </Collapsible>

              {/* Certificate */}
              {(product.certificate_type || product.certificate_no) && (
                <Collapsible heading={`${product.certificate_type || 'Diamond'} Certification`} defaultOpen={true}>
                  <p style={{ marginBottom: 12 }}>
                    This piece comes with an authentic <strong>{product.certificate_type || 'GIA'}</strong> certificate, verifying the quality and authenticity of your diamond.
                  </p>
                  {product.certificate_no && (
                    <a
                      href={`/verify/${product.certificate_no}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px',
                        border: `1px solid ${GOLD}`, color: GOLD,
                        textDecoration: 'none', fontSize: 10,
                        fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
                      }}
                    >
                      <ExternalLink size={12} />
                      Verify Certificate #{product.certificate_no}
                    </a>
                  )}
                </Collapsible>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      <RelatedProducts product={product} waNumber={waNumber} />

      {/* Recently viewed */}
      <RecentlyViewed excludeId={product.id} />

      <style>{`
        @keyframes shimmer { from { opacity: 0.5; } to { opacity: 1; } }
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 3fr 2fr"] {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          div[style*="position: sticky"] {
            position: static !important;
          }
        }
        @media (max-width: 768px) {
          nav, div[style*="padding: 48px 48px"] { padding: 20px 24px !important; }
        }
      `}</style>
    </>
  );
}
