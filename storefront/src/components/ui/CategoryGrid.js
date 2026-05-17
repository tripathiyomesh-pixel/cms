import Link from 'next/link';

const CATS = [
  { label:'Natural Diamonds',    href:'/diamonds?type=NATURAL',   emoji:'💎', desc:'GIA/IGI certified loose stones',  bg:'bg-amber-50 border-amber-200' },
  { label:'Lab-Grown Diamonds',  href:'/diamonds?type=LAB_GROWN', emoji:'⚗️', desc:'IGI certified CVD & HPHT',        bg:'bg-blue-50 border-blue-200' },
  { label:'Coloured Gemstones',  href:'/gemstones',               emoji:'💜', desc:'Ruby, sapphire, emerald & more',  bg:'bg-purple-50 border-purple-200' },
  { label:'Pearls',              href:'/pearls',                  emoji:'🤍', desc:'South Sea, Tahitian, Akoya',       bg:'bg-pink-50 border-pink-200' },
  { label:'Fine Jewellery',      href:'/jewellery',               emoji:'💍', desc:'Rings, necklaces, earrings',       bg:'bg-gold-50 border-gold-200' },
  { label:'Mountings',           href:'/mountings',               emoji:'⚙️', desc:'Solitaire, halo, pave settings',  bg:'bg-ink-50 border-ink-200' },
  { label:'Custom Jewellery',    href:'/custom',                  emoji:'✏️', desc:'Your design, our craftsmanship',  bg:'bg-teal-50 border-teal-200' },
  { label:'Book Appointment',    href:'/appointment',             emoji:'📅', desc:'Visit our boutique',               bg:'bg-green-50 border-green-200' },
];

export default function CategoryGrid() {
  return (
    <section className="section">
      <div className="text-center mb-10">
        <h2 className="section-title">What are you looking for?</h2>
        <p className="section-sub">Diamonds, gemstones, pearls and fine jewellery — all certified</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATS.map(cat=>(
          <Link key={cat.label} href={cat.href}
            className={`group card p-5 border hover:shadow-md hover:border-gold-300 transition-all duration-200 ${cat.bg}`}>
            <div className="text-3xl mb-3">{cat.emoji}</div>
            <div className="font-semibold text-ink-700 text-sm mb-1 group-hover:text-gold-700 transition-colors">{cat.label}</div>
            <div className="text-xs text-ink-400 leading-relaxed">{cat.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
