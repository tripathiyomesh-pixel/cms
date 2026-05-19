/**
 * SEO helper — generates metadata for each page
 * Used with Next.js generateMetadata() function
 */

const DEFAULTS = {
  title:       'TEJORI — Luxury Jewellery Dubai',
  description: 'Discover certified diamonds, high jewellery and luxury pieces at TEJORI. GIA & IGI certified. Boutique in Dubai.',
  keywords:    'luxury jewellery Dubai, certified diamonds UAE, high jewellery GCC, gold jewellery Dubai',
  ogImage:     'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80',
  canonical:   'https://tejori.com',
};

export function buildMeta({ title, description, keywords, image, canonical, type='website', noIndex=false } = {}) {
  return {
    title: title ? `${title} | TEJORI` : DEFAULTS.title,
    description: description || DEFAULTS.description,
    keywords: keywords || DEFAULTS.keywords,
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      title:       title || DEFAULTS.title,
      description: description || DEFAULTS.description,
      images:      [{ url: image || DEFAULTS.ogImage, width:1200, height:630 }],
      type,
    },
    twitter: {
      card:        'summary_large_image',
      title:       title || DEFAULTS.title,
      description: description || DEFAULTS.description,
      images:      [image || DEFAULTS.ogImage],
    },
    alternates: { canonical: canonical || DEFAULTS.canonical },
  };
}

export async function fetchSettingsSEO(page) {
  try {
    const api = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://backend:4000/api';
    const res = await fetch(`${api}/settings`, { next: { revalidate: 300 } });
    const data = await res.json();
    const map = {};
    (data.data||[]).forEach(s => { map[s.key] = s.value; });
    return {
      storeName:   map.store_name   || 'TEJORI',
      tagline:     map.tagline      || '',
      seoTitle:    map.seo_title    || '',
      seoDesc:     map.seo_description || '',
      logoUrl:     map.logo_url     || '',
    };
  } catch { return {}; }
}
