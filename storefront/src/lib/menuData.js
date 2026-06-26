// Shared menu data for all 12 mega menu variants
// BUSINESS RULE: Natural Diamonds → /diamonds ONLY
//                Lab-Grown Diamonds → /lab-grown ONLY
//                These two NEVER appear in the same section

// Placeholder style when image fails to load
export const getPlaceholderStyle = (label = '') => ({
  background: 'linear-gradient(135deg, #1a1208 0%, #2d1f0e 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-accent)',
  fontSize: '48px',
  fontFamily: 'var(--font-heading)',
  letterSpacing: '4px',
});

export const MENU_DATA = {
  jewellery: {
    label: 'Jewellery',
    href: '/jewellery',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    categories: [
      { label: 'Rings',      href: '/jewellery?category=Rings',      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
      { label: 'Necklaces',  href: '/jewellery?category=Necklaces',  image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
      { label: 'Bracelets',  href: '/jewellery?category=Bracelets',  image: 'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
      { label: 'Earrings',   href: '/jewellery?category=Earrings',   image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
      { label: 'Sets',       href: '/jewellery?category=Sets',       image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80' },
      { label: 'Bangles',    href: '/jewellery?category=Bangles',    image: 'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=600&q=80' },
      { label: 'Pendants',   href: '/jewellery?category=Pendants',   image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
    ],
    collections: [
      { label: 'Mallika',       href: '/collections/mallika',         image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
      { label: 'Frost',         href: '/collections/frost',           image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
      { label: 'High Jewellery',href: '/collections/high-jewellery',  image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80' },
      { label: 'Adamas',        href: '/collections/adamas',          image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
      { label: 'Farashat',      href: '/collections/farashat',        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
      { label: 'Luluaat',       href: '/collections/luluaat',         image: 'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
    ],
    featured: {
      label: 'New Arrivals',
      href: '/jewellery?is_new_arrival=true',
      image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
    },
  },

  // BUSINESS RULE: Natural and Lab-Grown in STRICTLY SEPARATE sub-sections
  diamonds: {
    label: 'Diamonds',
    href: '/diamonds',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
    natural: {
      label: 'Natural Diamonds',
      href: '/diamonds',
      note: 'Earth-mined · GIA Certified',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    },
    labGrown: {
      label: 'Lab-Grown Diamonds',
      href: '/lab-grown',
      note: 'IGI Certified · Sustainable',
      image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80',
    },
    shapes: [
      { label: 'Round',    href: '/diamonds?shape=Round'    },
      { label: 'Princess', href: '/diamonds?shape=Princess' },
      { label: 'Oval',     href: '/diamonds?shape=Oval'     },
      { label: 'Emerald',  href: '/diamonds?shape=Emerald'  },
      { label: 'Pear',     href: '/diamonds?shape=Pear'     },
      { label: 'Cushion',  href: '/diamonds?shape=Cushion'  },
    ],
  },

  collections: {
    label: 'Collections',
    href: '/collections',
    image: 'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=800&q=80',
    items: [
      { label: 'Adamas',        href: '/collections/adamas',         image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80' },
      { label: 'Classics',      href: '/collections/classics',       image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80' },
      { label: 'Farashat',      href: '/collections/farashat',       image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' },
      { label: 'Frost',         href: '/collections/frost',          image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80' },
      { label: 'High Jewellery',href: '/collections/high-jewellery', image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=400&q=80' },
      { label: 'Ice Deco',      href: '/collections/ice-deco',       image: 'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=400&q=80' },
      { label: 'Luluaat',       href: '/collections/luluaat',        image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=80' },
      { label: 'Mallika',       href: '/collections/mallika',        image: 'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=400&q=80' },
      { label: 'Vivid Deco',    href: '/collections/vivid-deco',     image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80' },
    ],
  },

  about: {
    label: 'About',
    href: '/about',
    items: [
      { label: 'Our Story',           href: '/about'       },
      { label: 'Boutiques',           href: '/boutiques'   },
      { label: 'Blog',                href: '/blog'        },
      { label: 'Exhibitions',         href: '/exhibitions' },
      { label: 'Verify Certificate',  href: '/verify'      },
    ],
  },
};

// Top-level nav items (drives which key from MENU_DATA to open)
export const NAV_ITEMS = [
  { label: 'Jewellery',   href: '/jewellery',   key: 'jewellery'   },
  { label: 'Diamonds',    href: '/diamonds',    key: 'diamonds'    },
  { label: 'Collections', href: '/collections', key: 'collections' },
  { label: 'Bespoke',     href: '/custom',      key: null          },
  { label: 'About',       href: '/about',       key: 'about'       },
];