import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import TemplateLayout from '@/components/layout/TemplateLayout';
import { CurrencyProvider } from '@/components/ui/CurrencySwitcher';

const inter    = Inter({ subsets:['latin'], variable:'--font-inter', display:'swap' });
const playfair = Playfair_Display({ subsets:['latin'], variable:'--font-playfair', display:'swap' });

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Luxury Jewellery';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3011'),
  title: { default: storeName, template: `%s | ${storeName}` },
  description: `Certified diamonds, coloured gemstones, pearls and fine jewellery. GIA & IGI certified. ${storeName}.`,
  openGraph: { type:'website', locale:'en_AE', siteName: storeName },
  robots: { index:true, follow:true },
  keywords: ['diamonds','GIA certified','fine jewellery','engagement rings','loose diamonds','coloured gemstones','Dubai jewellery'],
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
