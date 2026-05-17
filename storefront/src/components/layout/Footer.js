import Link from 'next/link';
import { MapPin, Phone, Mail, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink-900 text-ink-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.5"/>
                </svg>
              </div>
              <span className="font-serif text-lg text-white">{process.env.NEXT_PUBLIC_STORE_NAME||'JewelCMS'}</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">Certified diamonds, coloured gemstones and fine jewellery. GIA & IGI certified with global shipping.</p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-ink-800 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors"><Instagram size={14}/></a>
              <a href="#" className="w-8 h-8 bg-ink-800 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors"><Youtube size={14}/></a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 uppercase tracking-wide">Inventory</h4>
            <ul className="space-y-2 text-sm">
              {[['Natural Diamonds','/diamonds?type=NATURAL'],['Lab-Grown Diamonds','/diamonds?type=LAB_GROWN'],['Coloured Gemstones','/gemstones'],['Pearls','/pearls'],['Mountings','/mountings'],['Fine Jewellery','/jewellery']].map(([l,h])=>(
                <li key={l}><Link href={h} className="hover:text-gold-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 uppercase tracking-wide">Services</h4>
            <ul className="space-y-2 text-sm">
              {[['Custom Jewellery','/custom'],['Book Appointment','/appointment'],['Certificate Verify','/verify'],['Ring Size Guide','/about#ring-size'],['4Cs Education','/about#4cs'],['Blog & Education','/blog']].map(([l,h])=>(
                <li key={l}><Link href={h} className="hover:text-gold-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 uppercase tracking-wide">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><MapPin size={14} className="text-gold-400 mt-0.5 flex-shrink-0"/>Dubai, UAE</li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-gold-400"/>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`} className="hover:text-gold-400 transition-colors">WhatsApp us</a>
              </li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-gold-400"/>
                <a href="mailto:info@store.com" className="hover:text-gold-400 transition-colors">info@store.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ink-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500">© {year} {process.env.NEXT_PUBLIC_STORE_NAME||'JewelCMS'}. All rights reserved.</p>
          <p className="text-xs text-ink-600">Powered by <span className="text-gold-600 font-medium">JewelCMS</span> · KenTech Global</p>
        </div>
      </div>
    </footer>
  );
}
