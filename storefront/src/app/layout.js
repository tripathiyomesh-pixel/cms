import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import TemplateLayout from '@/components/layout/TemplateLayout';
import { CurrencyProvider } from '@/components/ui/CurrencySwitcher';

const inter    = Inter({ subsets:['latin'], variable:'--font-inter', display:'swap' });
const playfair = Playfair_Display({ subsets:['latin'], variable:'--font-playfair', display:'swap' });

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Luxury Jewellery';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3011'),
  title: { default: 'Tejori — Luxury Jewellery Dubai', template: `%s | Tejori` },
  description: 'Tejori — Six decades of master craftsmanship in Dubai. GIA & IGI certified diamonds, coloured gemstones, and fine jewellery. Since 1964.',
  openGraph: { type:'website', locale:'en_AE', siteName: 'Tejori' },
  robots: { index:true, follow:true },
  keywords: ['Tejori','luxury jewellery Dubai','GIA certified diamonds','fine jewellery','engagement rings','diamond jewellery Dubai'],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

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
