import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

const inter    = Inter({ subsets:['latin'], variable:'--font-inter', display:'swap' });
const playfair = Playfair_Display({ subsets:['latin'], variable:'--font-playfair', display:'swap' });

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Luxury Jewellery';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3001'),
  title: { default: storeName, template: `%s | ${storeName}` },
  description: `Certified diamonds, coloured gemstones, pearls and fine jewellery. GIA & IGI certified. ${storeName}.`,
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    siteName: storeName,
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  keywords: ['diamonds','GIA certified','fine jewellery','engagement rings','loose diamonds','coloured gemstones','pearls','Dubai jewellery'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3001'}/>
      </head>
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
