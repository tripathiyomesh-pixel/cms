import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import TemplateLayout from '@/components/layout/TemplateLayout';
import { CurrencyProvider } from '@/components/ui/CurrencySwitcher';

const inter    = Inter({ subsets:['latin'], variable:'--font-inter', display:'swap' });
const playfair = Playfair_Display({ subsets:['latin'], variable:'--font-playfair', display:'swap' });

const API  = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const BASE = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3011';

async function getPublicSettings() {
  try {
    const res = await fetch(`${API}/settings/public`, { next: { revalidate: 300 } });
    if (!res.ok) return {};
    return res.json().then(d => d.data || d || {});
  } catch { return {}; }
}

function strip(v) {
  // Settings values are JSON-stringified — unwrap outer quotes
  if (typeof v === 'string') return v.replace(/^"|"$/g, '');
  return v ?? '';
}

export async function generateMetadata() {
  const s = await getPublicSettings();

  const storeName = strip(s.store_name) || process.env.NEXT_PUBLIC_STORE_NAME || 'Luxury Jewellery';
  const desc      = strip(s.store_description) || `Certified diamonds, coloured gemstones, pearls and fine jewellery. GIA & IGI certified. ${storeName}.`;
  const keywords  = strip(s.store_keywords)    || 'diamonds,GIA certified,fine jewellery,engagement rings,loose diamonds,coloured gemstones,Dubai jewellery';
  const ogImage   = strip(s.og_image)          || null;
  const favicon   = strip(s.favicon_url)       || null;

  return {
    metadataBase: new URL(BASE),
    title: { default: storeName, template: `%s | ${storeName}` },
    description: desc,
    keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
    openGraph: {
      type:     'website',
      locale:   'en_AE',
      siteName: storeName,
      ...(ogImage ? { images: [{ url: ogImage, width:1200, height:630, alt: storeName }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: { index:true, follow:true },
    ...(favicon ? { icons: { icon: favicon, shortcut: favicon } } : {}),
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <CurrencyProvider>
          <TemplateLayout>
            {children}
          </TemplateLayout>
        </CurrencyProvider>
      </body>
    </html>
  );
}
