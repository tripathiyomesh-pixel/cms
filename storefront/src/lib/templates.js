/**
 * Template System
 * Controls which template is active for the storefront
 * Set NEXT_PUBLIC_TEMPLATE env var to switch templates
 * 
 * Templates:
 * 1. luxury-dark    — Cartier/Graff style: dark, editorial, gold accents
 * 2. clean-minimal  — Blue Nile/Mejuri style: white, spacious, modern
 * 3. boutique-warm  — Local boutique: warm cream, WhatsApp-first, appointment-led
 * 4. diamond-dealer — Diamond trader: search-first, data-rich, RapNet integrated
 */

export const TEMPLATES = {
  'luxury-dark': {
    id: 'luxury-dark',
    name: 'Luxury Dark',
    description: 'Cartier / Graff style — editorial, dark backgrounds, gold accents',
    preview: '/templates/luxury-dark-preview.jpg',
    fonts: {
      heading: "'Playfair Display', Georgia, serif",
      body:    "'Inter', system-ui, sans-serif",
    },
    colors: {
      bg:         '#0a0a0a',
      bgSecondary:'#141414',
      bgCard:     '#1a1a1a',
      border:     '#2a2a2a',
      text:       '#f5f0e8',
      textMuted:  '#8a8078',
      accent:     '#c9a84c',
      accentHover:'#dbb95f',
      white:      '#ffffff',
      navBg:      'rgba(10,10,10,0.95)',
    },
    hero: 'fullscreen-editorial',    // full viewport, centered text
    productGrid: 'minimal-dark',     // dark cards, hover reveal
    nav: 'transparent-scroll',       // transparent → solid on scroll
  },

  'clean-minimal': {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    description: 'Blue Nile / Mejuri style — white, spacious, conversion-focused',
    preview: '/templates/clean-minimal-preview.jpg',
    fonts: {
      heading: "'Inter', system-ui, sans-serif",
      body:    "'Inter', system-ui, sans-serif",
    },
    colors: {
      bg:         '#ffffff',
      bgSecondary:'#fafaf8',
      bgCard:     '#ffffff',
      border:     '#e5e5e5',
      text:       '#1a1a1a',
      textMuted:  '#6b6b6b',
      accent:     '#1a1a1a',
      accentHover:'#333333',
      white:      '#ffffff',
      navBg:      '#ffffff',
    },
    hero: 'split-screen',            // left text, right image
    productGrid: 'clean-grid',       // white cards, subtle hover
    nav: 'white-border',             // always white with bottom border
  },

  'boutique-warm': {
    id: 'boutique-warm',
    name: 'Boutique Warm',
    description: 'GCC boutique style — warm cream tones, WhatsApp-first, Arabic-friendly',
    preview: '/templates/boutique-warm-preview.jpg',
    fonts: {
      heading: "'Playfair Display', Georgia, serif",
      body:    "'Inter', system-ui, sans-serif",
    },
    colors: {
      bg:         '#fdf6ec',
      bgSecondary:'#f5ebe0',
      bgCard:     '#ffffff',
      border:     '#e8d5bc',
      text:       '#3d2b1a',
      textMuted:  '#8b6f4a',
      accent:     '#8b5e3c',
      accentHover:'#6b4a2e',
      white:      '#ffffff',
      navBg:      '#fdf6ec',
    },
    hero: 'centered-warm',           // centered, warm overlay
    productGrid: 'warm-cards',       // cream background cards
    nav: 'warm-solid',               // warm background always
  },

  'diamond-dealer': {
    id: 'diamond-dealer',
    name: 'Diamond Dealer',
    description: 'Search-first layout for diamond dealers — faceted filters prominent, RapNet integrated',
    preview: '/templates/diamond-dealer-preview.jpg',
    fonts: {
      heading: "'Inter', system-ui, sans-serif",
      body:    "'Inter', system-ui, sans-serif",
    },
    colors: {
      bg:         '#f8fafc',
      bgSecondary:'#f0f4f8',
      bgCard:     '#ffffff',
      border:     '#e2e8f0',
      text:       '#0f172a',
      textMuted:  '#64748b',
      accent:     '#1e40af',
      accentHover:'#1d4ed8',
      white:      '#ffffff',
      navBg:      '#0f172a',
    },
    hero: 'search-hero',             // big search bar hero
    productGrid: 'data-table',       // table-style for diamonds
    nav: 'dark-professional',        // dark navy nav
  },
};

export const getTemplate = () => {
  const id = process.env.NEXT_PUBLIC_TEMPLATE || 'luxury-dark';
  return TEMPLATES[id] || TEMPLATES['luxury-dark'];
};

export const getTemplateColor = (key) => {
  const t = getTemplate();
  return t.colors[key] || '#c9a84c';
};
