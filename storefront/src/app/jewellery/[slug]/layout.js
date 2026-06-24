const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${API}/storefront/products/${params.slug}`, { next: { revalidate: 120 } });
    const d   = await res.json();
    const p   = d.data || d.product || d;
    const img = p.media?.[0]?.file_url || p.image_url || '';
    const rawDesc = (p.description || '').replace(/<[^>]+>/g, '').slice(0, 155);
    const desc = rawDesc || `${(p.metal_type || '').replace(/_/g, ' ')} ${p.category_name || 'jewellery'} by Tejori Dubai.`.trim();
    return {
      title: p.name ? `${p.name} — Tejori` : 'Tejori Jewellery',
      description: desc,
      openGraph: { images: img ? [{ url: img, width: 800, height: 800, alt: p.name || 'Tejori' }] : [] },
    };
  } catch {
    return { title: 'Tejori — Luxury Jewellery Dubai' };
  }
}

export default function ProductLayout({ children }) {
  return children;
}
