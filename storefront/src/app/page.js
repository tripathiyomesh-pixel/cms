'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const API   = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const GOLD  = '#b8860b';
const CREAM = '#fdf8f3';
const DARK  = '#0a0a0a';

// ── BLUR PLACEHOLDER (tiny gold square) ──────────────────────
const BLUR_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAABmJLR0QA/wD/AP+gvaeTAAAADklEQVQI12NgYGD4TwABBAEBKkfBGgAAAABJRU5ErkJggg==';

// ── SECTION 1: HERO ───────────────────────────────────────────
function HeroSection({ waNumber }) {
  const waMsg = encodeURIComponent('Hi Tejori, I\'d like to book a private viewing of your jewellery collection.');
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '/appointment';

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100svh',
        background: DARK,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Gold line animation */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${15 + i * 14}%`,
              left: '-10%',
              width: '120%',
              height: 1,
              background: `linear-gradient(90deg, transparent 0%, rgba(184,134,11,${0.04 + i * 0.02}) 40%, rgba(184,134,11,${0.08 + i * 0.02}) 60%, transparent 100%)`,
              animation: `goldLine ${4 + i * 0.8}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>

      {/* Corner ornaments */}
      <div style={{ position: 'absolute', top: 48, left: 48, width: 60, height: 60, borderTop: `1px solid rgba(184,134,11,0.4)`, borderLeft: `1px solid rgba(184,134,11,0.4)` }} />
      <div style={{ position: 'absolute', top: 48, right: 48, width: 60, height: 60, borderTop: `1px solid rgba(184,134,11,0.4)`, borderRight: `1px solid rgba(184,134,11,0.4)` }} />
      <div style={{ position: 'absolute', bottom: 48, left: 48, width: 60, height: 60, borderBottom: `1px solid rgba(184,134,11,0.4)`, borderLeft: `1px solid rgba(184,134,11,0.4)` }} />
      <div style={{ position: 'absolute', bottom: 48, right: 48, width: 60, height: 60, borderBottom: `1px solid rgba(184,134,11,0.4)`, borderRight: `1px solid rgba(184,134,11,0.4)` }} />

      {/* Centre content */}
      <div style={{ position: 'relative', textAlign: 'center', padding: '0 24px', maxWidth: 720 }}>
        <p style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: GOLD,
          marginBottom: 24,
        }}>
          Since 1985 · Dubai
        </p>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(44px, 7vw, 88px)',
          fontWeight: 300,
          color: '#f5ebe0',
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
          marginBottom: 20,
        }}>
          Timeless Jewellery.<br />
          <em style={{ fontStyle: 'italic', color: GOLD }}>Crafted for You.</em>
        </h1>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(16px, 2.5vw, 22px)',
          fontWeight: 300,
          color: '#a09080',
          marginBottom: 48,
          letterSpacing: '0.04em',
        }}>
          Discover the Tejori Collection
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/jewellery"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '15px 40px',
              background: GOLD,
              color: '#fff',
              textDecoration: 'none',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              transition: 'background 200ms ease',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#9a7009'}
            onMouseOut={e => e.currentTarget.style.background = GOLD}
          >
            Explore Collection
          </Link>
          <Link
            href="/appointment"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '15px 40px',
              border: `1px solid rgba(184,134,11,0.6)`,
              color: '#e8d5a3',
              textDecoration: 'none',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              transition: 'border-color 200ms ease, color 200ms ease',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.6)'; e.currentTarget.style.color = '#e8d5a3'; }}
          >
            Book Private Viewing
          </Link>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: -80, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{
            width: 1,
            height: 48,
            background: `linear-gradient(to bottom, rgba(184,134,11,0.6), transparent)`,
            animation: 'scrollPulse 2s ease-in-out infinite',
          }} />
        </div>
      </div>

    </section>
  );
}

// ── SECTION 2: FEATURED COLLECTIONS ──────────────────────────
const COLLECTIONS = [
  {
    name: 'Aurora Collection',
    href: '/jewellery?collection=aurora',
    desc: 'Light-catching gems that dance with colour',
    img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=85',
  },
  {
    name: 'Bridal Edit',
    href: '/jewellery?collection=bridal',
    desc: 'Your perfect jewellery for the most precious day',
    img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=85',
  },
  {
    name: 'New Arrivals',
    href: '/jewellery?collection=new',
    desc: 'The latest additions to the Tejori atelier',
    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=85',
  },
  {
    name: 'Heritage Line',
    href: '/jewellery?collection=heritage',
    desc: 'Inspired by centuries of Indian craftsmanship',
    img: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=85',
  },
];

function CollectionsSection() {
  return (
    <section style={{ background: CREAM, padding: '96px 48px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, marginBottom: 12 }}>
            Curated for You
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 300,
            color: '#1a1208',
            lineHeight: 1.1,
          }}>
            Explore Our Collections
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
        }}>
          {COLLECTIONS.map((col) => (
            <Link
              key={col.name}
              href={col.href}
              style={{ textDecoration: 'none', display: 'block', overflow: 'hidden' }}
            >
              <div
                style={{ overflow: 'hidden', aspectRatio: '3/4', position: 'relative', background: '#e8ddd0' }}
                onMouseOver={e => e.currentTarget.querySelector('img').style.transform = 'scale(1.06)'}
                onMouseOut={e => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}
              >
                <img
                  src={col.img}
                  alt={col.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 500ms ease',
                  }}
                  loading="lazy"
                />
              </div>
              <div style={{ padding: '18px 4px' }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 18,
                  fontWeight: 500,
                  color: '#1a1208',
                  marginBottom: 6,
                  transition: 'color 150ms ease',
                }}
                onMouseOver={e => e.target.style.color = GOLD}
                onMouseOut={e => e.target.style.color = '#1a1208'}
                >
                  {col.name}
                </p>
                <p style={{ fontSize: 11, color: '#8b7355', lineHeight: 1.6 }}>{col.desc}</p>
                <p style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  marginTop: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  Explore →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── SECTION 3: FEATURED PRODUCTS ─────────────────────────────
function ProductCard({ product, waNumber }) {
  const [hovered, setHovered] = useState(false);
  const images = product.images || (product.image_url ? [product.image_url] : []);
  const mainImg = images[0] || null;
  const hoverImg = images[1] || mainImg;

  const waMsg = encodeURIComponent(
    `Hi Tejori, I'm interested in ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''}. Could you share the price and availability?`
  );
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '/jewellery';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#f0e8dc' }}>
        {mainImg ? (
          <img
            src={hovered && hoverImg ? hoverImg : mainImg}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 400ms ease',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, #e8ddd0 0%, #d4c4a8 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 32, opacity: 0.3 }}>✦</span>
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 250ms ease',
        }}>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              padding: '10px 22px',
              background: GOLD,
              color: '#fff',
              textDecoration: 'none',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            Enquire on WhatsApp
          </a>
        </div>

        {/* Wishlist */}
        <button
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 14,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 250ms ease',
          }}
          aria-label="Save to wishlist"
        >
          ♡
        </button>
      </div>

      {/* Info */}
      <Link
        href={`/jewellery/${product.slug || product.id}`}
        style={{ textDecoration: 'none', display: 'block', padding: '14px 0' }}
      >
        <p style={{
          fontSize: 14,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 500,
          color: '#1a1208',
          marginBottom: 4,
          lineHeight: 1.3,
        }}>
          {product.name}
        </p>
        {(product.metal_type || product.stone_type) && (
          <p style={{ fontSize: 11, color: '#8b7355', marginBottom: 8 }}>
            {[product.metal_type, product.stone_type].filter(Boolean).join(' · ')}
          </p>
        )}
        <p style={{ fontSize: 13, fontWeight: 600, color: (product.base_price && Number(product.base_price) > 0) ? '#1a1208' : GOLD }}>
          {product.base_price && Number(product.base_price) > 0
            ? `AED ${Number(product.base_price).toLocaleString()}`
            : 'Request Price'}
        </p>
      </Link>
    </div>
  );
}

function FeaturedProductsSection({ waNumber }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/storefront/products?featured=true&limit=8`)
      .then(r => r.json())
      .then(d => { setProducts(d.data || d.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section style={{ background: '#fff', padding: '96px 48px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, marginBottom: 10 }}>
              Handpicked
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(28px, 3.5vw, 46px)',
              fontWeight: 300,
              color: '#1a1208',
            }}>
              Featured Pieces
            </h2>
          </div>
          <Link
            href="/jewellery"
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, textDecoration: 'none' }}
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
          }}>
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <div style={{ aspectRatio: '1', background: '#f0ebe3', animation: 'shimmer 1.5s ease-in-out infinite alternate' }} />
                <div style={{ height: 14, background: '#f0ebe3', marginTop: 14, width: '70%', animation: 'shimmer 1.5s ease-in-out infinite alternate' }} />
                <div style={{ height: 11, background: '#f0ebe3', marginTop: 8, width: '45%', animation: 'shimmer 1.5s ease-in-out infinite alternate' }} />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
          }}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} waNumber={waNumber} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8b7355' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, marginBottom: 12 }}>
              Our collection is coming soon.
            </p>
            <Link href="/appointment" style={{ color: GOLD, textDecoration: 'none', fontSize: 12 }}>
              Book a private viewing to see our full range →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ── SECTION 4: BRAND STORY STRIP ─────────────────────────────
function BrandStripSection() {
  return (
    <section style={{
      background: DARK,
      padding: '80px 48px',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.5em',
        textTransform: 'uppercase',
        color: GOLD,
        marginBottom: 24,
      }}>
        Since 1985 · Dubai · Crafted with Passion
      </p>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 'clamp(28px, 4vw, 52px)',
        fontWeight: 300,
        color: '#f5ebe0',
        lineHeight: 1.2,
        marginBottom: 48,
        maxWidth: 680,
        margin: '0 auto 48px',
      }}>
        Four decades of crafting memories that last forever
      </h2>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 64,
        flexWrap: 'wrap',
        marginTop: 48,
      }}>
        {[
          { icon: '◈', label: 'Certified Gemstones', sub: 'Every stone verified & certified' },
          { icon: '◇', label: 'GIA Certified Diamonds', sub: 'Graded by the world\'s top authority' },
          { icon: '◉', label: 'Free Consultation', sub: 'Speak to our jewellery experts' },
        ].map((item) => (
          <div key={item.label} style={{ textAlign: 'center', maxWidth: 180 }}>
            <p style={{ fontSize: 28, color: GOLD, marginBottom: 12, lineHeight: 1 }}>{item.icon}</p>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 16,
              fontWeight: 500,
              color: '#f5ebe0',
              marginBottom: 6,
            }}>
              {item.label}
            </p>
            <p style={{ fontSize: 11, color: '#6b5f4a', lineHeight: 1.6 }}>{item.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── SECTION 5: GOLD RATE TICKER ──────────────────────────────
function GoldRateSection() {
  const [rates, setRates] = useState(null);

  useEffect(() => {
    fetch(`${API}/storefront/metal-rates`)
      .then(r => r.json())
      .then(d => { if (d.data || d.rates) setRates(d.data || d.rates); })
      .catch(() => {}); // fail silently — section hidden if API fails
  }, []);

  if (!rates) return null;

  const r22 = rates['22K'] || rates.gold_22k || rates['22k'];
  const r18 = rates['18K'] || rates.gold_18k || rates['18k'];

  if (!r22 && !r18) return null;

  return (
    <div style={{
      background: '#1a1208',
      borderTop: `1px solid rgba(184,134,11,0.2)`,
      borderBottom: `1px solid rgba(184,134,11,0.2)`,
      padding: '14px 48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 40,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD }}>
        Today's Gold Rate
      </span>
      {r22 && (
        <span style={{ fontSize: 12, color: '#e8d5a3', letterSpacing: '0.06em' }}>
          22K — <strong>AED {Number(r22).toFixed(2)}/g</strong>
        </span>
      )}
      {r18 && (
        <span style={{ fontSize: 12, color: '#e8d5a3', letterSpacing: '0.06em' }}>
          18K — <strong>AED {Number(r18).toFixed(2)}/g</strong>
        </span>
      )}
      <Link href="/gold-rate" style={{ fontSize: 10, color: GOLD, textDecoration: 'none', letterSpacing: '0.1em' }}>
        Full Gold Rate Chart →
      </Link>
    </div>
  );
}

// ── SECTION 6: WHATSAPP CTA ───────────────────────────────────
function WhatsAppCTASection({ waNumber }) {
  const waMsg = encodeURIComponent('Hi Tejori, I have a question about your jewellery collection.');
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${waMsg}`
    : 'https://wa.me';

  return (
    <section style={{
      background: CREAM,
      padding: '80px 48px',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, marginBottom: 16 }}>
        We're Here to Help
      </p>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 'clamp(28px, 4vw, 46px)',
        fontWeight: 300,
        color: '#1a1208',
        marginBottom: 16,
      }}>
        Speak to Our Jewellery Expert
      </h2>
      <p style={{ fontSize: 13, color: '#8b7355', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
        Have a question about a piece? Looking for the perfect gift?<br />
        Our experts are available 7 days a week.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 36px',
            background: '#25D366',
            color: '#fff',
            textDecoration: 'none',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Chat on WhatsApp
        </a>
        <Link
          href="/appointment"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '14px 36px',
            border: `1px solid ${GOLD}`,
            color: GOLD,
            textDecoration: 'none',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          Book a Viewing
        </Link>
      </div>
    </section>
  );
}

// ── PAGE ROOT ─────────────────────────────────────────────────
export default function HomePage() {
  const [waNumber, setWaNumber] = useState('');

  useEffect(() => {
    fetch(`${API}/settings/public`)
      .then(r => r.json())
      .then(d => {
        const data = d.data || d || {};
        const num = (data.store_whatsapp || data.whatsapp_number || '')
          .replace(/^"|"$/g, '').replace(/\D/g, '');
        if (num) setWaNumber(num);
      })
      .catch(() => {});
  }, []);

  return (
    <main>
      <HeroSection waNumber={waNumber} />
      <GoldRateSection />
      <CollectionsSection />
      <FeaturedProductsSection waNumber={waNumber} />
      <BrandStripSection />
      <WhatsAppCTASection waNumber={waNumber} />

    </main>
  );
}
