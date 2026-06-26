'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { sfAPI } from '@/lib/api';

const GOLD = 'var(--color-accent)';
const API  = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function ProductCard({ p, waNumber }) {
  const price = p.final_price && Number(p.final_price) > 0
    ? `AED ${Number(p.final_price).toLocaleString('en-AE')}`
    : 'Price on Request';
  const isPOR = !p.final_price || Number(p.final_price) === 0;
  const img   = (p.images || [])[0] || p.image_url || p.thumb_url;

  const waMsg = encodeURIComponent(
    `Hi Tejori, I am interested in ${p.name}${p.sku ? ` (SKU: ${p.sku})` : ''}. Please share pricing and availability.`
  );
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${waMsg}`
    : `/appointment`;

  return (
    <Link href={`/jewellery/${p.slug || p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: 'var(--color-bg)', position: 'relative', overflow: 'hidden', transition: 'transform 200ms ease, box-shadow 200ms ease' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#f5f0e8' }}>
          {img ? (
            <Image src={img} alt={p.name} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              style={{ objectFit: 'cover', transition: 'transform 400ms ease' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 36, color: 'rgba(184,134,11,0.2)' }}>T</span>
            </div>
          )}
          {/* WhatsApp hover overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'flex-end', transition: 'background 200ms ease' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
          >
            <a href={waLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
              style={{ width: '100%', padding: '12px', background: '#25D366', color: '#fff', textAlign: 'center', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', opacity: 0, transition: 'opacity 200ms ease' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0'}
            >
              Enquire on WhatsApp
            </a>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '16px 4px 20px' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 400, color: 'var(--color-text)', marginBottom: 4, lineHeight: 1.3 }}>
            {p.name}
          </p>
          {p.metal_type && (
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>{p.metal_type}</p>
          )}
          <p style={{ fontSize: 13, fontWeight: 600, color: isPOR ? GOLD : 'var(--color-text)' }}>{price}</p>
        </div>
      </div>
    </Link>
  );
}

export default function CollectionDetailPage() {
  const { slug }           = useParams();
  const [collection, setCollection] = useState(null);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [waNumber, setWaNumber]     = useState('');

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    fetch(`${base}/settings/whatsapp_number`).then(r => r.json()).then(d => {
      const n = (d.data || d.value || '').toString().replace(/\D/g, '');
      if (n) setWaNumber(n);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    Promise.all([
      sfAPI.collection(slug).catch(() => null),
      sfAPI.products({ collection: slug, limit: 48 }).catch(() => null),
    ]).then(([colRes, prodRes]) => {
      if (colRes?.data) {
        const d = colRes.data.data || colRes.data;
        setCollection(Array.isArray(d) ? d[0] : d);
      }
      if (prodRes?.data) {
        setProducts(prodRes.data.data || prodRes.data || []);
      }
    }).catch(() => setError('Unable to load collection'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
        <div style={{ height: 400, background: 'linear-gradient(135deg, #2a1e0c, #4a3010)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-heading)', fontSize: 18 }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 28, color: 'var(--color-text)' }}>Collection not found</p>
        <Link href="/collections" style={{ color: GOLD, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>← All collections</Link>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Hero banner */}
      <div style={{ position: 'relative', height: 'clamp(320px, 50vh, 520px)', overflow: 'hidden' }}>
        {collection.banner_url ? (
          <Image src={collection.banner_url} alt={collection.name} fill priority
            sizes="100vw" style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1208 0%, #2d1e08 100%)' }} />
        )}
        {/* Dark overlay + text */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, marginBottom: 16 }}>
            Tejori Collection
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem,6vw,3.5rem)', fontWeight: 400, color: '#fff', letterSpacing: '0.06em', marginBottom: 16 }}>
            {collection.name}
          </h1>
          <div style={{ width: 40, height: 1, background: GOLD, marginBottom: 20 }} />
          {collection.description && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', maxWidth: 560, lineHeight: 1.8 }}>
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <nav style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 48px', fontSize: 11, color: 'var(--color-text-muted)' }}>
        <Link href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <Link href="/collections" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Collections</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ color: 'var(--color-text)' }}>{collection.name}</span>
      </nav>

      {/* Products */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px 80px' }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--color-text)', marginBottom: 16 }}>
              No products in this collection yet
            </p>
            <Link href="/jewellery" style={{ color: GOLD, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Browse all jewellery →
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 32 }}>
              {products.length} {products.length === 1 ? 'piece' : 'pieces'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 32 }}>
              {products.map(p => <ProductCard key={p.id} p={p} waNumber={waNumber} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
