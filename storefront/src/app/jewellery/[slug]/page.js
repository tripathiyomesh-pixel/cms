'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useProduct from '@/lib/useProduct';
import ProductDetail from '@/components/pdp';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [pdpStyle, setPdpStyle] = useState('pdp1');
  const [waNumber, setWaNumber] = useState('');
  const { product, related, goldRate, loading, error } = useProduct(slug);

  useEffect(() => {
    fetch(`${API}/settings/public`)
      .then(r => r.json())
      .then(d => {
        if (d.data?.pdp_style) setPdpStyle(d.data.pdp_style);
        const n = (d.data?.store_whatsapp || d.data?.whatsapp_number || '').replace(/\D/g, '');
        if (n) setWaNumber(n);
      })
      .catch(() => {});
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 700ms linear infinite', margin: '0 auto 16px' }}/>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Loading</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>Could not load. Try again</p>
      <button onClick={() => window.location.reload()} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: 'var(--color-accent)', background: 'none', border: '1px solid var(--color-accent)', padding: '10px 24px', cursor: 'pointer', textTransform: 'uppercase' }}>Retry</button>
    </div>
  );

  return (
    <ProductDetail pdpStyle={pdpStyle} product={product} related={related} goldRate={goldRate} waNumber={waNumber}/>
  );
}