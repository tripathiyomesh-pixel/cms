'use client';
import { useState, useEffect } from 'react';
import ProductListing from '@/components/plp';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function JewelleryPage() {
  const [plpStyle, setPlpStyle] = useState('plp1');
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    fetch(`${API}/settings/public`)
      .then(r => r.json())
      .then(d => {
        const s = d.data?.plp_style;
        if (s) setPlpStyle(s);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return <ProductListing plpStyle={plpStyle} heading="Jewellery"/>;
}