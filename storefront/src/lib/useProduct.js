'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function useProduct(slug) {
  const [product,  setProduct]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [goldRate, setGoldRate] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    fetch(`${API}/storefront/products/${slug}`)
      .then(r => r.json())
      .then(d => {
        const p = d.data || d;
        setProduct(p);
        const params = new URLSearchParams({ limit: '4', status: 'published' });
        if (p.category)     params.set('category', p.category);
        if (p.diamond_type) params.set('diamond_type', p.diamond_type);
        return fetch(`${API}/storefront/products?${params}`).then(r => r.json()).then(rd => {
          const items = (rd.data || []).filter(x => x.id !== p.id).slice(0, 4);
          setRelated(items);
        });
      })
      .catch(() => setError('Could not load product. Please try again.'))
      .finally(() => setLoading(false));

    fetch(`${API}/storefront/metal-rates`)
      .then(r => r.json())
      .then(d => setGoldRate(d.data || null))
      .catch(() => {});
  }, [slug]);

  return { product, related, goldRate, loading, error };
}
