'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { sfAPI } from '@/lib/api';

const GOLD = 'var(--color-accent)';

function CollectionSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 lg:px-16 py-16 max-w-screen-xl mx-auto">
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ background: '#f5f0e8', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: 280, background: '#ece5d8', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ padding: '20px 24px' }}>
            <div style={{ height: 12, background: '#ece5d8', marginBottom: 8, width: '60%', borderRadius: 2 }} />
            <div style={{ height: 10, background: '#ece5d8', width: '40%', borderRadius: 2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => {
    sfAPI.collections()
      .then(r => setCollections(r.data?.data || r.data || []))
      .catch(() => setError('Unable to load collections'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{
        background: 'var(--color-text)',
        color: '#fff',
        textAlign: 'center',
        padding: '80px 24px 64px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Corner ornaments */}
        {[[{top:32,left:32},{borderTop:'1px solid rgba(184,134,11,0.4)',borderLeft:'1px solid rgba(184,134,11,0.4)'}],
          [{top:32,right:32},{borderTop:'1px solid rgba(184,134,11,0.4)',borderRight:'1px solid rgba(184,134,11,0.4)'}]].map(([pos, bdr], i) => (
          <div key={i} style={{ position:'absolute', width:40, height:40, ...pos, ...bdr }} />
        ))}
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, marginBottom: 16 }}>
          Tejori
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 400, letterSpacing: '0.08em', color: '#fff', marginBottom: 16 }}>
          Our Collections
        </h1>
        <div style={{ width: 40, height: 1, background: GOLD, margin: '0 auto 20px' }} />
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
          Each collection tells a story — of heritage, craftsmanship, and the timeless beauty of fine jewellery.
        </p>
      </div>

      {/* Collections grid */}
      {loading ? (
        <CollectionSkeleton />
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--color-text-muted)' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 24, marginBottom: 12 }}>Collections unavailable</p>
          <Link href="/jewellery" style={{ color: GOLD, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Browse all jewellery →
          </Link>
        </div>
      ) : collections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--color-text)', marginBottom: 16 }}>No collections yet</p>
          <Link href="/jewellery" style={{ color: GOLD, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Browse all jewellery →</Link>
        </div>
      ) : (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 32 }}>
            {collections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug || col.id}`}
                style={{ textDecoration: 'none', display: 'block', group: true }}
              >
                <div style={{
                  background: '#f5f0e8',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Banner image */}
                  <div style={{ position: 'relative', height: 300, overflow: 'hidden' }}>
                    {col.banner_url ? (
                      <Image
                        src={col.banner_url}
                        alt={col.name}
                        fill
                        sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
                        style={{ objectFit: 'cover', transition: 'transform 400ms ease' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2a1e0c 0%, #4a3010 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 48, color: 'rgba(184,134,11,0.3)', letterSpacing: '0.2em' }}>T</span>
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
                    {col.is_featured && (
                      <div style={{ position: 'absolute', top: 16, right: 16, background: GOLD, color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', padding: '4px 10px', textTransform: 'uppercase' }}>
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Card content */}
                  <div style={{ padding: '24px 28px 28px', background: 'var(--color-bg)' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 400, color: 'var(--color-text)', letterSpacing: '0.04em', marginBottom: 6 }}>
                      {col.name}
                    </h2>
                    {col.description && (
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {col.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {col.product_count ? `${col.product_count} pieces` : 'Explore collection'}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD }}>
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
