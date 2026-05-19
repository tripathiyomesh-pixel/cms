/**
 * PAGE JSON SCHEMA
 * 
 * A page is an array of sections.
 * Each section has: id, type, props
 * 
 * Example:
 * [
 *   { id: "abc123", type: "hero", props: { headline: "Frost Yourself", image: "..." } },
 *   { id: "def456", type: "products_grid", props: { cols: 4, label: "Featured" } },
 * ]
 * 
 * Storefront: reads JSON → SectionRegistry → renders React component
 * Admin: shows list of sections → form editor per section → saves JSON
 */

export const SECTION_REGISTRY = {
  // ── HERO ──────────────────────────────────────────────────
  hero: {
    label: 'Hero Banner',
    icon: '🖼️',
    category: 'Hero',
    defaults: {
      type: 'fullscreen',       // fullscreen | slider | split | video | minimal
      headline: 'Frost Yourself',
      subtext: 'Dazzling pear and marquise diamonds.',
      cta_text: 'Discover the selection',
      cta_link: '/jewellery',
      label: 'New Collection',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80',
      overlay: 65,
      text_align: 'left',
      slides: [],
      transition: 'fade',
    },
    fields: [
      { key:'type',      label:'Hero style',   type:'select', options:['fullscreen','slider','split','video','minimal'] },
      { key:'headline',  label:'Headline',      type:'text' },
      { key:'subtext',   label:'Subtext',       type:'textarea' },
      { key:'cta_text',  label:'Button text',   type:'text' },
      { key:'cta_link',  label:'Button link',   type:'text' },
      { key:'label',     label:'Top label',     type:'text' },
      { key:'image',     label:'Background image', type:'image' },
      { key:'overlay',   label:'Overlay opacity', type:'range', min:0, max:90, step:5 },
      { key:'transition',label:'Slide transition', type:'select', options:['fade','slide','zoom'], showIf:'type=slider' },
    ],
  },

  // ── PRODUCTS ──────────────────────────────────────────────
  products_grid: {
    label: 'Products Grid',
    icon: '💎',
    category: 'Products',
    defaults: {
      cols: 4,
      label: 'Featured',
      heading: 'Our Selection',
      bg: '#fdf8f3',
      show_cta: true,
      cta_text: 'View All Jewellery',
      cta_link: '/jewellery',
      filter: 'featured',    // featured | new | all
    },
    fields: [
      { key:'cols',     label:'Columns',    type:'select', options:['2','3','4'] },
      { key:'label',    label:'Top label',  type:'text' },
      { key:'heading',  label:'Heading',    type:'text' },
      { key:'filter',   label:'Show products', type:'select', options:['featured','new','all'] },
      { key:'bg',       label:'Background', type:'color' },
      { key:'cta_text', label:'Button text', type:'text' },
      { key:'cta_link', label:'Button link', type:'text' },
    ],
  },

  products_carousel: {
    label: 'Products Carousel',
    icon: '🎠',
    category: 'Products',
    defaults: {
      label: 'Featured',
      heading: 'Our Selection',
      bg: '#fdf8f3',
    },
    fields: [
      { key:'label',   label:'Top label', type:'text' },
      { key:'heading', label:'Heading',   type:'text' },
      { key:'bg',      label:'Background',type:'color' },
    ],
  },

  // ── CATEGORIES ────────────────────────────────────────────
  categories_circles: {
    label: 'Category Circles',
    icon: '⭕',
    category: 'Categories',
    defaults: {
      heading: 'Top Categories',
      bg: '#ffffff',
    },
    fields: [
      { key:'heading', label:'Heading',    type:'text' },
      { key:'bg',      label:'Background', type:'color' },
    ],
  },

  categories_cards: {
    label: 'Category Cards',
    icon: '🗂️',
    category: 'Categories',
    defaults: {
      heading: 'Shop by Category',
      bg: '#fdf8f3',
    },
    fields: [
      { key:'heading', label:'Heading',    type:'text' },
      { key:'bg',      label:'Background', type:'color' },
    ],
  },

  // ── CONTENT ───────────────────────────────────────────────
  brand_story: {
    label: 'Brand Story',
    icon: '📖',
    category: 'Content',
    defaults: {
      label: 'Our Promise',
      heading: 'Handcrafted & Ethically Sourced',
      body: 'With a legacy spanning 60 years, TEJORI is dedicated to offering a wide range of exquisite jewellery pieces.',
      image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=700&q=80',
      image_side: 'right',
      cta_text: 'Learn More',
      cta_link: '/about',
      bg: '#ffffff',
    },
    fields: [
      { key:'label',      label:'Top label',    type:'text' },
      { key:'heading',    label:'Heading',      type:'text' },
      { key:'body',       label:'Body text',    type:'textarea' },
      { key:'image',      label:'Image',        type:'image' },
      { key:'image_side', label:'Image side',   type:'select', options:['left','right'] },
      { key:'cta_text',   label:'Button text',  type:'text' },
      { key:'cta_link',   label:'Button link',  type:'text' },
      { key:'bg',         label:'Background',   type:'color' },
    ],
  },

  about_heritage: {
    label: 'About / Heritage',
    icon: '🏛️',
    category: 'Content',
    defaults: {
      label: 'About us',
      heading: 'Our Heritage',
      body: 'Founded in 2004, Tejori has become one of the most respected jewellery brands in the GCC.',
      image: 'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=700&q=80',
      legacy_number: '60+',
      legacy_label: 'Years of Legacy',
      cta_text: 'Learn More',
      cta_link: '/about',
      bg: '#ffffff',
    },
    fields: [
      { key:'label',         label:'Top label',     type:'text' },
      { key:'heading',       label:'Heading',       type:'text' },
      { key:'body',          label:'Body text',     type:'textarea' },
      { key:'image',         label:'Image',         type:'image' },
      { key:'legacy_number', label:'Legacy number', type:'text' },
      { key:'legacy_label',  label:'Legacy label',  type:'text' },
      { key:'cta_text',      label:'Button text',   type:'text' },
      { key:'cta_link',      label:'Button link',   type:'text' },
      { key:'bg',            label:'Background',    type:'color' },
    ],
  },

  testimonials_carousel: {
    label: 'Testimonials Carousel',
    icon: '⭐',
    category: 'Content',
    defaults: {
      label: 'What Our Clients Say',
      bg: '#fdf8f3',
    },
    fields: [
      { key:'label', label:'Top label',  type:'text' },
      { key:'bg',    label:'Background', type:'color' },
    ],
  },

  testimonials_grid: {
    label: 'Testimonials Grid',
    icon: '⭐',
    category: 'Content',
    defaults: {
      label: 'What Our Clients Say',
      bg: '#ffffff',
    },
    fields: [
      { key:'label', label:'Top label',  type:'text' },
      { key:'bg',    label:'Background', type:'color' },
    ],
  },

  why_choose: {
    label: 'Why Choose Us',
    icon: '🏆',
    category: 'Content',
    defaults: {
      label: 'Our Difference',
      heading: 'Why choose TEJORI?',
      bg: '#fdf8f3',
      pillars: [
        { icon:'🏆', title:'Authenticity Guaranteed', desc:'Every piece is handpicked and inspected.' },
        { icon:'💎', title:'Rare & Iconic Jewellery',  desc:'Our jewellery is a valuable investment.' },
        { icon:'✨', title:'Heritage of Craftsmanship',desc:'Creating masterpieces since 1964.' },
      ],
    },
    fields: [
      { key:'label',   label:'Top label', type:'text' },
      { key:'heading', label:'Heading',   type:'text' },
      { key:'bg',      label:'Background',type:'color' },
    ],
  },

  learning_center: {
    label: 'Learning Center',
    icon: '📚',
    category: 'Content',
    defaults: {
      label: 'Education',
      heading: 'The Learning Center',
      body: 'Whether you\'re buying jewellery for the first time or need a refresher.',
      cta_text: 'Learn more',
      cta_link: '/blog',
      image: 'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=1400&q=80',
    },
    fields: [
      { key:'label',    label:'Top label', type:'text' },
      { key:'heading',  label:'Heading',   type:'text' },
      { key:'body',     label:'Body text', type:'textarea' },
      { key:'cta_text', label:'Button',    type:'text' },
      { key:'cta_link', label:'Link',      type:'text' },
      { key:'image',    label:'Image',     type:'image' },
    ],
  },

  // ── BANNERS ───────────────────────────────────────────────
  editorial_banner: {
    label: 'Editorial Full Width',
    icon: '🎨',
    category: 'Banners',
    defaults: {
      heading: 'Classics',
      body: 'Timeless and elegant jewellery that never goes out of style.',
      cta_text: 'Discover the selection',
      cta_link: '/jewellery?collection=classics',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=80',
      height: 560,
      text_align: 'left',
      overlay: 45,
    },
    fields: [
      { key:'heading',    label:'Heading',     type:'text' },
      { key:'body',       label:'Body text',   type:'textarea' },
      { key:'cta_text',   label:'Button text', type:'text' },
      { key:'cta_link',   label:'Button link', type:'text' },
      { key:'image',      label:'Image',       type:'image' },
      { key:'text_align', label:'Text align',  type:'select', options:['left','center','right'] },
      { key:'overlay',    label:'Overlay',     type:'range', min:0, max:80, step:5 },
    ],
  },

  collection_banners: {
    label: 'Collection Banners (2 col)',
    icon: '🗂️',
    category: 'Banners',
    defaults: {
      left:  { title:'Summer Collections', sub:'Freshwater pearl necklace and earrings', href:'/jewellery', image:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&q=80' },
      right: { title:'Make it memorable',  sub:'Bespoke jewellery for life\'s moments',  href:'/custom',    image:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80' },
    },
    fields: [
      { key:'left.title',  label:'Left title',  type:'text' },
      { key:'left.sub',    label:'Left subtext', type:'text' },
      { key:'left.href',   label:'Left link',   type:'text' },
      { key:'left.image',  label:'Left image',  type:'image' },
      { key:'right.title', label:'Right title', type:'text' },
      { key:'right.sub',   label:'Right subtext',type:'text' },
      { key:'right.href',  label:'Right link',  type:'text' },
      { key:'right.image', label:'Right image', type:'image' },
    ],
  },

  promo_strip: {
    label: 'Promo Strip (3 banners)',
    icon: '🎯',
    category: 'Banners',
    defaults: {
      items: [
        { label:'New Arrivals',   link:'/jewellery?is_new=true',    bg:'#1a1a1a', color:'#c9a84c' },
        { label:'Best Seller',   link:'/jewellery?sort=featured',  bg:'#b8860b', color:'#ffffff' },
        { label:'Clearance Sale',link:'/jewellery?on_sale=true',   bg:'#3d2b1a', color:'#e8d5bc' },
      ],
    },
    fields: [
      { key:'items.0.label', label:'Banner 1 text', type:'text' },
      { key:'items.0.link',  label:'Banner 1 link', type:'text' },
      { key:'items.0.bg',    label:'Banner 1 color',type:'color' },
      { key:'items.1.label', label:'Banner 2 text', type:'text' },
      { key:'items.1.link',  label:'Banner 2 link', type:'text' },
      { key:'items.1.bg',    label:'Banner 2 color',type:'color' },
      { key:'items.2.label', label:'Banner 3 text', type:'text' },
      { key:'items.2.link',  label:'Banner 3 link', type:'text' },
      { key:'items.2.bg',    label:'Banner 3 color',type:'color' },
    ],
  },

  // ── ENGAGEMENT ────────────────────────────────────────────
  newsletter: {
    label: 'Newsletter',
    icon: '📧',
    category: 'Engagement',
    defaults: {
      label: 'Stay Connected',
      heading: 'Stay in the world of Tejori',
      subtext: 'Subscribe for 10% off your first purchase.',
      bg: '#1a1a1a',
      text_color: '#ffffff',
      accent: '#b8860b',
    },
    fields: [
      { key:'label',      label:'Top label', type:'text' },
      { key:'heading',    label:'Heading',   type:'text' },
      { key:'subtext',    label:'Subtext',   type:'text' },
      { key:'bg',         label:'Background',type:'color' },
    ],
  },

  whatsapp_cta: {
    label: 'WhatsApp CTA',
    icon: '💬',
    category: 'Engagement',
    defaults: {
      heading: 'Have a question?',
      body: 'Chat with our jewellery experts on WhatsApp.',
      bg: '#f5ede2',
      button_text: 'Chat on WhatsApp',
    },
    fields: [
      { key:'heading',     label:'Heading',     type:'text' },
      { key:'body',        label:'Body text',   type:'text' },
      { key:'button_text', label:'Button text', type:'text' },
      { key:'bg',          label:'Background',  type:'color' },
    ],
  },

  // ── TRUST ─────────────────────────────────────────────────
  cert_logos: {
    label: 'Certification Logos',
    icon: '🏅',
    category: 'Trust',
    defaults: {
      label: 'Certified by',
      logos: ['GIA Certified', 'IGI Certified', 'HRD Antwerp', 'AGS', 'GCAL'],
      bg: '#ffffff',
    },
    fields: [
      { key:'label', label:'Label', type:'text' },
      { key:'bg',    label:'Background', type:'color' },
    ],
  },

  // ── LAYOUT ────────────────────────────────────────────────
  spacer: {
    label: 'Spacer',
    icon: '↕️',
    category: 'Layout',
    defaults: { height: 80, bg: '#ffffff' },
    fields: [
      { key:'height', label:'Height (px)', type:'number' },
      { key:'bg',     label:'Background',  type:'color' },
    ],
  },

  divider: {
    label: 'Divider',
    icon: '—',
    category: 'Layout',
    defaults: { bg: '#ffffff' },
    fields: [
      { key:'bg', label:'Background', type:'color' },
    ],
  },
};

export const SECTION_CATEGORIES = [
  'Hero', 'Products', 'Categories', 'Content', 'Banners', 'Engagement', 'Trust', 'Layout'
];

export const createSection = (type) => ({
  id: Math.random().toString(36).slice(2, 9),
  type,
  props: { ...SECTION_REGISTRY[type]?.defaults },
});
