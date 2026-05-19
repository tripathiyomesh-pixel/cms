const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:4000/api';
const BASE = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3001';

async function fetchJSON(path) {
  try {
    const r = await fetch(`${API}${path}`, { next: { revalidate: 3600 } });
    return r.json();
  } catch { return { data: [] }; }
}

export default async function sitemap() {
  const [products, diamonds, blog, exhibitions, collections] = await Promise.all([
    fetchJSON('/storefront/products?limit=500&status=active'),
    fetchJSON('/storefront/diamonds?limit=200&status=available'),
    fetchJSON('/blog?limit=200&status=published'),
    fetchJSON('/exhibitions?limit=100'),
    fetchJSON('/collections?limit=100&is_active=true'),
  ]);

  const staticPages = [
    { url:`${BASE}/`,           lastModified:new Date(), changeFrequency:'daily',   priority:1.0 },
    { url:`${BASE}/jewellery`,  lastModified:new Date(), changeFrequency:'daily',   priority:0.9 },
    { url:`${BASE}/diamonds`,   lastModified:new Date(), changeFrequency:'daily',   priority:0.9 },
    { url:`${BASE}/lab-grown`,  lastModified:new Date(), changeFrequency:'weekly',  priority:0.8 },
    { url:`${BASE}/gemstones`,  lastModified:new Date(), changeFrequency:'weekly',  priority:0.7 },
    { url:`${BASE}/pearls`,     lastModified:new Date(), changeFrequency:'weekly',  priority:0.7 },
    { url:`${BASE}/about`,      lastModified:new Date(), changeFrequency:'monthly', priority:0.6 },
    { url:`${BASE}/boutiques`,  lastModified:new Date(), changeFrequency:'monthly', priority:0.6 },
    { url:`${BASE}/appointment`,lastModified:new Date(), changeFrequency:'monthly', priority:0.7 },
    { url:`${BASE}/custom`,     lastModified:new Date(), changeFrequency:'monthly', priority:0.6 },
    { url:`${BASE}/blog`,       lastModified:new Date(), changeFrequency:'weekly',  priority:0.7 },
    { url:`${BASE}/exhibitions`,lastModified:new Date(), changeFrequency:'weekly',  priority:0.6 },
  ];

  const productPages = (products.data?.data || []).map(p => ({
    url: `${BASE}/jewellery/${p.slug||p.id}`,
    lastModified: new Date(p.updated_at || Date.now()),
    changeFrequency: 'weekly',
    priority: p.is_featured ? 0.9 : 0.7,
  }));

  const diamondPages = (diamonds.data?.data || []).map(d => ({
    url: `${BASE}/diamonds/${d.id}`,
    lastModified: new Date(d.updated_at || Date.now()),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const blogPages = (blog.data?.data || blog.data || []).map(b => ({
    url: `${BASE}/blog/${b.slug||b.id}`,
    lastModified: new Date(b.updated_at || Date.now()),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const exhibitionPages = (exhibitions.data?.data || []).map(e => ({
    url: `${BASE}/exhibitions/${e.slug||e.id}`,
    lastModified: new Date(e.updated_at || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...diamondPages, ...blogPages, ...exhibitionPages];
}
