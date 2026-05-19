const BASE = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3001';

export default function robots() {
  return {
    rules: [
      { userAgent:'*', allow:'/', disallow:['/account/','/api/'] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
