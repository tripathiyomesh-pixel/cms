'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PLPF5CollectionStory from '@/components/plp/PLPF5CollectionStory';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function CollectionPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [waNumber,   setWaNumber]   = useState('');

  useEffect(() => {
    fetch(`${API}/storefront/collections/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.data) setCollection(d.data); })
      .catch(() => {});
    fetch(`${API}/settings/public`)
      .then(r => r.json())
      .then(d => {
        const n = (d.data?.store_whatsapp || d.data?.whatsapp_number || '').replace(/\D/g, '');
        if (n) setWaNumber(n);
      })
      .catch(() => {});
  }, [slug]);

  return (
    <PLPF5CollectionStory
      preFilter={{ collection: slug }}
      heading={collection?.name || 'Collection'}
      heroImage={collection?.banner_image || collection?.image_url || ''}
      heroTag={collection?.label || 'Collection'}
      heroDesc={collection?.description || ''}
    />
  );
}