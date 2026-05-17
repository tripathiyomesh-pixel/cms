import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

const inter    = Inter({ subsets:['latin'], variable:'--font-inter', display:'swap' });
const playfair = Playfair_Display({ subsets:['latin'], variable:'--font-playfair', display:'swap' });

export const metadata = {
  title: { default:'Luxury Jewellery', template:'%s | Luxury Jewellery' },
  description:'Certified diamonds, coloured gemstones, pearls and fine jewellery. GIA & IGI certified.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
