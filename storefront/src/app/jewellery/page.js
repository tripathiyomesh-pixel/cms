'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SlidersHorizontal, X, Heart, ChevronDown } from 'lucide-react';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/app/wishlist/page';

const API  = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const GOLD = 'var(--color-accent)';

const CATEGORIES  = ['Rings','Necklaces','Bracelets','Earrings','Pendants','Sets','Bangles','Engagement Rings'];
const COLLECTIONS = ['Aurora Collection','Bridal Edit','Frost Collection','Vivid Collection','Heritage Line','New Arrivals','Classics'];
const METALS      = ['Gold 22K','Gold 18K','White Gold','Rose Gold','Platinum'];
const SORTS       = [
  ['recommended', 'Recommended'],
  ['newest',      'Newest First'],
  ['price_asc',   'Price: Low to High'],
  ['price_desc',  'Price: High to Low'],
  ['featured',    'Featured'],
];

// ── SKELETON CARD ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div>
      <div style={{
        aspectRatio: '1',
        background: 'linear-gradient(90deg, #f0ebe3 25%, #e8e0d4 50%, #f0ebe3 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
      }} />
      <div style={{ paddingTop: 14 }}>
        <div style={{ height: 14, background: '#f0ebe3', width: '72%', marginBottom: 8, animation: 'shimmer 1.4s ease-in-out infinite' }} />
        <div style={{ height: 11, background: '#f0ebe3', width: '45%', marginBottom: 8, animation: 'shimmer 1.4s ease-in-out infinite' }} />
        <div style={{ height: 13, background: '#f0ebe3', width: '30%', animation: 'shimmer 1.4s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

// ── PRODUCT CARD ──────────────────────────────────────────────
function ProductCard({ product, waNumber }) {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(() => isInWishlist(product.id));

  const images = Array.isArray(product.images)
    ? product.images
    : product.image_url ? [product.image_url] : [];
  const img1 = images[0] || null;
  const img2 = images[1] || img1;

  const waMsg = encodeURIComponent(
    `Hi Tejori, I'm interested in ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''}. Please share price and availability.`
  );
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : null;
  const slug = product.slug || product.id;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#f5f0e8' }}>
        {img1 ? (
          <Image
            src={hovered && img2 ? img2 : img1}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            style={{
              objectFit: 'cover',
              transition: 'transform 400ms ease',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #e8ddd0, #d4c4a8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 28, opacity: 0.25 }}>✦</span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); if (wishlisted) { removeFromWishlist(product.id); setWishlisted(false); } else { addToWishlist(product); setWishlisted(true); } }}
          aria-label="Save to wishlist"
          style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(255,255,255,0.92)',
            border: 'none',
            borderRadius: '50%',
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            opacity: hovered || wishlisted ? 1 : 0,
            transition: 'opacity 200ms ease',
            color: wishlisted ? '#e03333' : '#5a4a3a',
          }}
        >
          {wishlisted ? '♥' : '♡'}
        </button>

        {/* WhatsApp hover CTA */}
        {waHref && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '0 10px 10px',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 200ms ease, transform 200ms ease',
          }}>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '9px',
                background: 'rgba(10,10,10,0.82)',
                color: '#f5ebe0',
                textDecoration: 'none',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                backdropFilter: 'blur(4px)',
              }}
            >
              Enquire on WhatsApp
            </a>
          </div>
        )}
      </div>

      {/* Info */}
      <Link href={`/jewellery/${slug}`} style={{ textDecoration: 'none', display: 'block', padding: '12px 0' }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--color-text)',
          marginBottom: 4,
          lineHeight: 1.3,
        }}>
          {product.name}
        </p>
        {(product.metal_type || product.stone_type) && (
          <p style={{ fontSize: 11, color: '#8b7355', marginBottom: 6, letterSpacing: '0.02em' }}>
            {[product.metal_type, product.stone_type].filter(Boolean).join(' · ')}
          </p>
        )}
        <p style={{ fontSize: 13, fontWeight: 600, color: (product.base_price && Number(product.base_price) > 0) ? 'var(--color-text)' : GOLD }}>
          {product.base_price && Number(product.base_price) > 0
            ? `AED ${Number(product.base_price).toLocaleString()}`
            : 'Request Price'}
        </p>
      </Link>
    </div>
  );
}

// ── FILTER SIDEBAR ────────────────────────────────────────────
function FilterSection({ heading, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #f0ebe3', paddingBottom: 20, marginBottom: 20 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', marginBottom: open ? 14 : 0, padding: 0,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
          {heading}
        </span>
        <ChevronDown size={12} color="#8b7355" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms ease' }} />
      </button>
      {open && children}
    </div>
  );
}

function FilterSidebar({ filters, set, onClose, waNumber }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui" }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
        paddingBottom: 16, borderBottom: '1px solid #e8ddd0',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
          Filter
        </span>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={16} color="#5a4a3a" />
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection heading="Category">
        {CATEGORIES.map(c => (
          <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.categories?.includes(c) || false}
              onChange={() => {
                const cur = filters.categories || [];
                set('categories', cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]);
              }}
              style={{ accentColor: GOLD, width: 14, height: 14 }}
            />
            <span style={{ fontSize: 12, color: '#4a3a2a' }}>{c}</span>
          </label>
        ))}
      </FilterSection>

      {/* Collections */}
      <FilterSection heading="Collections">
        {COLLECTIONS.map(c => (
          <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.collections?.includes(c) || false}
              onChange={() => {
                const cur = filters.collections || [];
                set('collections', cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]);
              }}
              style={{ accentColor: GOLD, width: 14, height: 14 }}
            />
            <span style={{ fontSize: 12, color: '#4a3a2a' }}>{c}</span>
          </label>
        ))}
      </FilterSection>

      {/* Metal Type */}
      <FilterSection heading="Metal Type">
        {METALS.map(m => (
          <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.metals?.includes(m) || false}
              onChange={() => {
                const cur = filters.metals || [];
                set('metals', cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m]);
              }}
              style={{ accentColor: GOLD, width: 14, height: 14 }}
            />
            <span style={{ fontSize: 12, color: '#4a3a2a' }}>{m}</span>
          </label>
        ))}
      </FilterSection>

      {/* Price Range */}
      <FilterSection heading="Price Range (AED)">
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ''}
            onChange={e => set('priceMin', e.target.value)}
            style={{
              flex: 1, padding: '7px 10px', fontSize: 12,
              border: '1px solid #e0d4c0', background: '#faf6f0',
              color: 'var(--color-text)', outline: 'none',
            }}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ''}
            onChange={e => set('priceMax', e.target.value)}
            style={{
              flex: 1, padding: '7px 10px', fontSize: 12,
              border: '1px solid #e0d4c0', background: '#faf6f0',
              color: 'var(--color-text)', outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            ['0', '5000', 'Under 5K'],
            ['5000', '15000', '5K–15K'],
            ['15000', '50000', '15K–50K'],
            ['50000', '', '50K+'],
          ].map(([min, max, label]) => (
            <button
              key={label}
              onClick={() => { set('priceMin', min); set('priceMax', max); }}
              style={{
                padding: '5px 10px', fontSize: 10, cursor: 'pointer',
                border: `1px solid ${filters.priceMin === min && filters.priceMax === max ? GOLD : '#e0d4c0'}`,
                background: filters.priceMin === min && filters.priceMax === max ? GOLD : 'transparent',
                color: filters.priceMin === min && filters.priceMax === max ? '#fff' : '#4a3a2a',
                letterSpacing: '0.06em',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Clear */}
      <button
        onClick={() => set('__reset__', null)}
        style={{
          width: '100%', padding: '10px', background: 'none',
          border: `1px solid #e0d4c0`, fontSize: 11, cursor: 'pointer',
          letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7355',
          marginTop: 4,
        }}
      >
        Clear All Filters
      </button>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
function JewelleryPageInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [hasMore, setHasMore]     = useState(false);
  const [page, setPage]           = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [waNumber, setWaNumber]   = useState('');

  const [filters, setFiltersRaw] = useState({
    categories:  params.get('category') ? [params.get('category')] : [],
    collections: params.get('collection') ? [params.get('collection')] : [],
    metals:      [],
    priceMin:    '',
    priceMax:    '',
    sort:        params.get('sort') || 'recommended',
  });

  const setFilter = useCallback((key, value) => {
    if (key === '__reset__') {
      setFiltersRaw({ categories: [], collections: [], metals: [], priceMin: '', priceMax: '', sort: 'recommended' });
      setPage(1);
    } else {
      setFiltersRaw(prev => ({ ...prev, [key]: value }));
      setPage(1);
    }
  }, []);

  // Fetch WhatsApp number once
  useEffect(() => {
    fetch(`${API}/settings/public`)
      .then(r => r.json())
      .then(d => {
        const data = d.data || d || {};
        const num = (data.store_whatsapp || data.whatsapp_number || '').replace(/^"|"$/g, '').replace(/\D/g, '');
        if (num) setWaNumber(num);
      })
      .catch(() => {});
  }, []);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    const qp = new URLSearchParams();
    qp.set('page', page);
    qp.set('limit', '24');
    if (filters.categories.length)  qp.set('category',   filters.categories.join(','));
    if (filters.collections.length) qp.set('collection', filters.collections.join(','));
    if (filters.metals.length)      qp.set('metal_type', filters.metals.join(','));
    if (filters.priceMin)           qp.set('price_min',  filters.priceMin);
    if (filters.priceMax)           qp.set('price_max',  filters.priceMax);
    if (filters.sort !== 'recommended') qp.set('sort', filters.sort);

    fetch(`${API}/storefront/products?${qp.toString()}`)
      .then(r => r.json())
      .then(d => {
        const items = d.data || d.products || [];
        setProducts(prev => page === 1 ? items : [...prev, ...items]);
        setHasMore(items.length === 24);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters, page]);

  const activeFilterCount = [
    filters.categories.length,
    filters.collections.length,
    filters.metals.length,
    filters.priceMin || filters.priceMax ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', fontFamily: "'Inter', system-ui" }}>

      {/* Page header */}
      <div style={{
        background: 'var(--color-text)',
        padding: '48px 48px 40px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, marginBottom: 10 }}>
          The Tejori Atelier
        </p>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 300,
          color: '#f5ebe0',
          letterSpacing: '-0.01em',
        }}>
          {filters.collections[0] || filters.categories[0] || 'All Jewellery'}
        </h1>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
        {/* Sort + filter bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0',
          borderBottom: '1px solid #e8ddd0',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: `1px solid #e0d4c0`,
              padding: '8px 16px', cursor: 'pointer',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
              color: 'var(--color-text)',
            }}
          >
            <SlidersHorizontal size={14} />
            Filter
            {activeFilterCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 18, height: 18, background: GOLD, color: '#fff',
                borderRadius: '50%', fontSize: 9, fontWeight: 700,
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {!loading && (
              <span style={{ fontSize: 11, color: '#8b7355' }}>
                {products.length} {products.length === 1 ? 'piece' : 'pieces'}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#8b7355' }}>Sort:</span>
              <select
                value={filters.sort}
                onChange={e => setFilter('sort', e.target.value)}
                style={{
                  padding: '7px 10px', fontSize: 11, border: '1px solid #e0d4c0',
                  background: 'var(--color-bg)', color: 'var(--color-text)', cursor: 'pointer', outline: 'none',
                }}
              >
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 40, paddingTop: 32, paddingBottom: 64 }}>

          {/* Desktop sidebar */}
          <div style={{ width: 240, flexShrink: 0 }} className="filter-desktop">
            <FilterSidebar filters={filters} set={setFilter} />
          </div>

          {/* Products */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading && page === 1 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 28, fontWeight: 300, color: 'var(--color-text)', marginBottom: 12,
                }}>
                  No pieces found
                </p>
                <p style={{ fontSize: 13, color: '#8b7355', marginBottom: 24 }}>
                  Try adjusting your filters or explore our full collection.
                </p>
                <button
                  onClick={() => setFilter('__reset__', null)}
                  style={{
                    padding: '10px 28px', background: GOLD, color: '#fff',
                    border: 'none', fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                  {products.map(p => (
                    <ProductCard key={p.id} product={p} waNumber={waNumber} />
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div style={{ textAlign: 'center', marginTop: 48 }}>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={loading}
                      style={{
                        padding: '13px 48px',
                        border: `1px solid ${GOLD}`,
                        background: 'transparent',
                        color: GOLD,
                        fontSize: 11, fontWeight: 600,
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? 'Loading…' : 'Load More Pieces'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
          />
          <div style={{
            position: 'fixed', top: 0, left: 0,
            width: 'min(300px, 90vw)', height: '100%',
            background: 'var(--color-bg)', zIndex: 201,
            overflowY: 'auto', padding: '28px 24px',
          }}>
            <FilterSidebar filters={filters} set={setFilter} onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

    </div>
  );
}

export default function JewelleryPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, color: '#8b7355' }}>
          Loading collection…
        </p>
      </div>
    }>
      <JewelleryPageInner />
    </Suspense>
  );
}

