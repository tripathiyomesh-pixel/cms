/**
 * Template System — Runtime switching
 * Template is read from:
 * 1. API /api/settings (admin can change without rebuild)
 * 2. Fallback to NEXT_PUBLIC_TEMPLATE env var
 * 3. Fallback to 'luxury-dark'
 */

export const TEMPLATES = {
  'luxury-dark': {
    id: 'luxury-dark',
    name: 'Luxury Dark',
    description: 'Cartier/Graff style — dark, editorial, gold accents',
    fonts: { heading:"'Playfair Display', Georgia, serif", body:"'Inter', system-ui, sans-serif" },
    colors: {
      bg:'#0a0a0a', bgSecondary:'#141414', bgCard:'#1a1a1a',
      border:'#2a2a2a', text:'#f5f0e8', textMuted:'#8a8078',
      accent:'#c9a84c', accentHover:'#dbb95f', white:'#ffffff', navBg:'rgba(10,10,10,0.95)',
    },
  },
  'clean-minimal': {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    description: 'Blue Nile/Mejuri style — white, spacious, modern',
    fonts: { heading:"'Inter', system-ui, sans-serif", body:"'Inter', system-ui, sans-serif" },
    colors: {
      bg:'#ffffff', bgSecondary:'#fafaf8', bgCard:'#ffffff',
      border:'#e5e5e5', text:'#1a1a1a', textMuted:'#6b6b6b',
      accent:'#1a1a1a', accentHover:'#333333', white:'#ffffff', navBg:'#ffffff',
    },
  },
  'boutique-warm': {
    id: 'boutique-warm',
    name: 'Boutique Warm',
    description: 'GCC boutique — warm cream, WhatsApp-first',
    fonts: { heading:"'Playfair Display', Georgia, serif", body:"'Inter', system-ui, sans-serif" },
    colors: {
      bg:'#fdf6ec', bgSecondary:'#f5ebe0', bgCard:'#ffffff',
      border:'#e8d5bc', text:'#3d2b1a', textMuted:'#8b6f4a',
      accent:'#8b5e3c', accentHover:'#6b4a2e', white:'#ffffff', navBg:'#fdf6ec',
    },
  },
  'diamond-dealer': {
    id: 'diamond-dealer',
    name: 'Diamond Dealer',
    description: 'Search-first — navy, data-rich, RapNet integrated',
    fonts: { heading:"'Inter', system-ui, sans-serif", body:"'Inter', system-ui, sans-serif" },
    colors: {
      bg:'#0f172a', bgSecondary:'#1e293b', bgCard:'#1e293b',
      border:'#334155', text:'#f8fafc', textMuted:'#64748b',
      accent:'#3b82f6', accentHover:'#2563eb', white:'#ffffff', navBg:'#0f172a',
    },
  },
};

// Client-side: get template from localStorage cache or env
export const getTemplate = () => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('cms_template');
    if (cached && TEMPLATES[cached]) return TEMPLATES[cached];
  }
  const id = process.env.NEXT_PUBLIC_TEMPLATE || 'luxury-dark';
  return TEMPLATES[id] || TEMPLATES['luxury-dark'];
};

// Server-side: fetch template from CMS settings API
export const fetchTemplate = async () => {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${base}/storefront/store`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    const templateId = data?.data?.storefront_template || process.env.NEXT_PUBLIC_TEMPLATE || 'luxury-dark';
    return TEMPLATES[templateId] || TEMPLATES['luxury-dark'];
  } catch {
    const id = process.env.NEXT_PUBLIC_TEMPLATE || 'luxury-dark';
    return TEMPLATES[id] || TEMPLATES['luxury-dark'];
  }
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);
