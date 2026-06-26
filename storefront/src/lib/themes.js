// Storefront theme system — reads settings from API, injects CSS vars at runtime
// No rebuild needed when admin changes theme

export const THEMES = [
  { id:'cartier-noir',    name:'Cartier Noir',    thumbnail:'⬛', category:'Luxury',    colors:{ bg:'#0a0a0a',bgSecondary:'#141414',bgCard:'#1a1a1a',border:'#2a2a2a',text:'#f5f0e8',textMuted:'#8a8078',accent:'#c9a84c',accentHover:'#dbb95f',navBg:'rgba(10,10,10,0.95)',buttonBg:'#c9a84c',buttonText:'#0a0a0a' }, fonts:{ heading:"'Playfair Display', Georgia, serif",body:"'Inter', system-ui, sans-serif",headingWeight:400 }, nav:{ topBar:true,topBarBg:'#c9a84c',topBarText:'#0a0a0a' }, buttons:{ radius:'2px' }, preview:{ bg:'#0a0a0a',accent:'#c9a84c',text:'#f5f0e8' } },
  { id:'graff-gold',      name:'Graff Gold',      thumbnail:'🟡', category:'Luxury',    colors:{ bg:'#1a1208',bgSecondary:'#241a0a',bgCard:'#2a1e0c',border:'#4a3010',text:'#f5e8c8',textMuted:'#a08050',accent:'#d4a843',accentHover:'#e8c060',navBg:'rgba(26,18,8,0.97)',buttonBg:'#d4a843',buttonText:'#1a1208' }, fonts:{ heading:"'Cormorant Garamond', Georgia, serif",body:"'Inter', system-ui, sans-serif",headingWeight:300 }, nav:{ topBar:true,topBarBg:'#d4a843',topBarText:'#1a1208' }, buttons:{ radius:'4px' }, preview:{ bg:'#1a1208',accent:'#d4a843',text:'#f5e8c8' } },
  { id:'blue-nile-white', name:'Blue Nile',        thumbnail:'⬜', category:'Modern',    colors:{ bg:'#ffffff',bgSecondary:'#fafaf8',bgCard:'#ffffff',border:'#e5e5e5',text:'#1a1a1a',textMuted:'#6b6b6b',accent:'#1a1a1a',accentHover:'#333333',navBg:'#ffffff',buttonBg:'#1a1a1a',buttonText:'#ffffff' }, fonts:{ heading:"'Inter', system-ui, sans-serif",body:"'Inter', system-ui, sans-serif",headingWeight:300 }, nav:{ topBar:true,topBarBg:'#1a1a1a',topBarText:'#ffffff' }, buttons:{ radius:'50px' }, preview:{ bg:'#ffffff',accent:'#1a1a1a',text:'#1a1a1a' } },
  { id:'mejuri-rose',     name:'Mejuri Rose',      thumbnail:'🌸', category:'Modern',    colors:{ bg:'#fdf8f6',bgSecondary:'#f5ede8',bgCard:'#ffffff',border:'#e8d5cc',text:'#2a1a14',textMuted:'#8a5a4a',accent:'#c07060',accentHover:'#a05040',navBg:'#fdf8f6',buttonBg:'#c07060',buttonText:'#ffffff' }, fonts:{ heading:"'Cormorant Garamond', Georgia, serif",body:"'Inter', system-ui, sans-serif",headingWeight:400 }, nav:{ topBar:false,topBarBg:'#c07060',topBarText:'#ffffff' }, buttons:{ radius:'50px' }, preview:{ bg:'#fdf8f6',accent:'#c07060',text:'#2a1a14' } },
  { id:'tejori-cream',    name:'Tejori Cream',     thumbnail:'🤎', category:'Boutique',  colors:{ bg:'#fdf6ec',bgSecondary:'#f5ebe0',bgCard:'#ffffff',border:'#e8d5bc',text:'#3d2b1a',textMuted:'#8b6f4a',accent:'#8b5e3c',accentHover:'#6b4a2e',navBg:'#fdf6ec',buttonBg:'#8b5e3c',buttonText:'#ffffff' }, fonts:{ heading:"'Playfair Display', Georgia, serif",body:"'Inter', system-ui, sans-serif",headingWeight:400 }, nav:{ topBar:true,topBarBg:'#3d2b1a',topBarText:'#f5ebe0' }, buttons:{ radius:'8px' }, preview:{ bg:'#fdf6ec',accent:'#8b5e3c',text:'#3d2b1a' } },
  { id:'dubai-gold-souk', name:'Dubai Gold Souk',  thumbnail:'🏆', category:'Boutique',  colors:{ bg:'#faf3e0',bgSecondary:'#f0e6c8',bgCard:'#ffffff',border:'#d4b896',text:'#2d1810',textMuted:'#7a4a30',accent:'#b8860b',accentHover:'#9a700a',navBg:'#2d1810',buttonBg:'#b8860b',buttonText:'#ffffff' }, fonts:{ heading:"'Playfair Display', Georgia, serif",body:"'Inter', system-ui, sans-serif",headingWeight:500 }, nav:{ topBar:true,topBarBg:'#2d1810',topBarText:'#d4b896' }, buttons:{ radius:'2px' }, preview:{ bg:'#faf3e0',accent:'#b8860b',text:'#2d1810' } },
  { id:'diamond-navy',    name:'Diamond Navy',     thumbnail:'💙', category:'Diamond',   colors:{ bg:'#0f172a',bgSecondary:'#1e293b',bgCard:'#1e293b',border:'#334155',text:'#f8fafc',textMuted:'#64748b',accent:'#3b82f6',accentHover:'#2563eb',navBg:'#0f172a',buttonBg:'#3b82f6',buttonText:'#ffffff' }, fonts:{ heading:"'Inter', system-ui, sans-serif",body:"'Inter', system-ui, sans-serif",headingWeight:600 }, nav:{ topBar:true,topBarBg:'#1e293b',topBarText:'#93bbfc' }, buttons:{ radius:'8px' }, preview:{ bg:'#0f172a',accent:'#3b82f6',text:'#f8fafc' } },
  { id:'platinum-slate',  name:'Platinum Slate',   thumbnail:'🔘', category:'Diamond',   colors:{ bg:'#f8fafc',bgSecondary:'#f1f5f9',bgCard:'#ffffff',border:'#e2e8f0',text:'#0f172a',textMuted:'#475569',accent:'#64748b',accentHover:'#475569',navBg:'#0f172a',buttonBg:'#0f172a',buttonText:'#ffffff' }, fonts:{ heading:"'Inter', system-ui, sans-serif",body:"'Inter', system-ui, sans-serif",headingWeight:400 }, nav:{ topBar:true,topBarBg:'#0f172a',topBarText:'#94a3b8' }, buttons:{ radius:'50px' }, preview:{ bg:'#f8fafc',accent:'#0f172a',text:'#0f172a' } },
  { id:'tiffany-blue',    name:'Tiffany Blue',     thumbnail:'🩵', category:'Editorial', colors:{ bg:'#f0fafa',bgSecondary:'#e0f5f5',bgCard:'#ffffff',border:'#b2e0e0',text:'#0d3333',textMuted:'#4a8888',accent:'#0ababa',accentHover:'#089898',navBg:'#0d3333',buttonBg:'#0ababa',buttonText:'#ffffff' }, fonts:{ heading:"'Playfair Display', Georgia, serif",body:"'Inter', system-ui, sans-serif",headingWeight:400 }, nav:{ topBar:true,topBarBg:'#0d3333',topBarText:'#b2e0e0' }, buttons:{ radius:'50px' }, preview:{ bg:'#f0fafa',accent:'#0ababa',text:'#0d3333' } },
  { id:'midnight-emerald',name:'Midnight Emerald', thumbnail:'💚', category:'Editorial', colors:{ bg:'#0a1a0f',bgSecondary:'#0f2218',bgCard:'#142a1c',border:'#1e4028',text:'#e8f5ec',textMuted:'#6a9878',accent:'#4caf70',accentHover:'#3d9060',navBg:'rgba(10,26,15,0.97)',buttonBg:'#4caf70',buttonText:'#0a1a0f' }, fonts:{ heading:"'Playfair Display', Georgia, serif",body:"'Inter', system-ui, sans-serif",headingWeight:400 }, nav:{ topBar:true,topBarBg:'#4caf70',topBarText:'#0a1a0f' }, buttons:{ radius:'6px' }, preview:{ bg:'#0a1a0f',accent:'#4caf70',text:'#e8f5ec' } },

  // ── Named themes for Tejori store ────────────────────────────
  {
    id: 'tejori',
    name: 'Tejori — Rose Gold',
    thumbnail: '🤎',
    category: 'Tejori',
    colors: {
      bg: '#fdf8f3', surface: '#ffffff', text: '#1a1208',
      textMuted: '#6b7280', accent: '#b8860b', accentHover: '#9a7209',
      border: '#e5e7eb', heading: '#1a1208',
      navBg: '#1a1208', navText: '#ffffff', navAccent: '#b8860b',
      bgSecondary: '#f5ede2', bgCard: '#ffffff', buttonText: '#ffffff',
    },
    fonts: { heading: 'cormorant', body: 'inter', headingWeight: 400 },
    buttonRadius: '0px',
    buttons: { radius: '0px' },
    preview: { bg: '#fdf8f3', accent: '#b8860b', text: '#1a1208' },
  },
  {
    id: 'noir',
    name: 'Noir — Cartier Black',
    thumbnail: '⬛',
    category: 'Tejori',
    colors: {
      bg: '#0a0a0a', surface: '#1a1a1a', text: '#f5f5f5',
      textMuted: '#9ca3af', accent: '#c9a84c', accentHover: '#b8960a',
      border: '#2d2d2d', heading: '#ffffff',
      navBg: '#000000', navText: '#ffffff', navAccent: '#c9a84c',
      bgSecondary: '#141414', bgCard: '#1a1a1a', buttonText: '#000000',
    },
    fonts: { heading: 'playfair', body: 'inter', headingWeight: 400 },
    buttonRadius: '0px',
    buttons: { radius: '0px' },
    preview: { bg: '#0a0a0a', accent: '#c9a84c', text: '#f5f5f5' },
  },
  {
    id: 'pearl',
    name: 'Pearl — Tiffany White',
    thumbnail: '🩵',
    category: 'Tejori',
    colors: {
      bg: '#ffffff', surface: '#f8fffe', text: '#2c3e50',
      textMuted: '#6b7280', accent: '#0abab5', accentHover: '#089e99',
      border: '#e0f7f6', heading: '#1a3a3a',
      navBg: '#0d3333', navText: '#ffffff', navAccent: '#0abab5',
      bgSecondary: '#f0fafa', bgCard: '#ffffff', buttonText: '#ffffff',
    },
    fonts: { heading: 'cormorant', body: 'inter', headingWeight: 400 },
    buttonRadius: '4px',
    buttons: { radius: '4px' },
    preview: { bg: '#ffffff', accent: '#0abab5', text: '#2c3e50' },
  },
];

export const getThemeById = (id) => THEMES.find(t => t.id === id) || THEMES[0];

/**
 * Inject theme as CSS variables on <html>.
 * Called client-side on every page load after fetching settings.
 * No rebuild needed — settings change → CSS vars change → storefront updates.
 */
export function applyThemeVars(theme, config = {}) {
  if (typeof document === 'undefined') return;

  const accent      = config.theme_accent_color  || theme.colors.accent;
  const bg          = config.theme_bg_color       || theme.colors.bg;
  const darkMode    = config.theme_dark_mode      === 'true';

  // Font resolution: named key ('cormorant') → CSS variable, or use raw value
  const FONT_MAP = {
    cormorant: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
    playfair:  "var(--font-playfair, 'Playfair Display', Georgia, serif)",
    inter:     "var(--font-inter, 'Inter', system-ui, sans-serif)",
    lato:      "'Lato', system-ui, sans-serif",
  };
  const resolveFont = (v) => (v && FONT_MAP[v]) ? FONT_MAP[v] : (v || FONT_MAP.cormorant);
  const headingFont = config.theme_heading_font || resolveFont(theme.fonts.heading);
  const bodyFont    = config.theme_body_font    || resolveFont(theme.fonts.body);
  const btnRadius   = config.theme_button_radius || theme.buttons?.radius || theme.buttonRadius || '0px';

  const root = document.documentElement;

  // Core color tokens
  root.style.setProperty('--color-accent',        accent);
  root.style.setProperty('--color-accent-hover',  config.theme_accent_hover || theme.colors.accentHover || accent);
  root.style.setProperty('--color-bg',            bg);
  root.style.setProperty('--color-surface',       theme.colors.surface      || theme.colors.bgCard || bg);
  root.style.setProperty('--color-bg-secondary',  theme.colors.bgSecondary  || theme.colors.surface || bg);
  root.style.setProperty('--color-bg-card',       theme.colors.bgCard       || theme.colors.surface || bg);
  root.style.setProperty('--color-border',        theme.colors.border);
  root.style.setProperty('--color-text',          theme.colors.text);
  root.style.setProperty('--color-text-muted',    theme.colors.textMuted);
  root.style.setProperty('--color-heading',       theme.colors.heading      || theme.colors.text);
  root.style.setProperty('--color-button-bg',     accent);
  root.style.setProperty('--color-button-text',   theme.colors.buttonText   || '#ffffff');

  // Nav / header tokens (both --nav-bg and legacy --color-nav-bg)
  const navBg   = theme.colors.navBg   || theme.colors.nav?.bg  || theme.colors.text;
  const navText = theme.colors.navText || theme.colors.nav?.text || '#ffffff';
  const navAccent = theme.colors.navAccent || theme.colors.nav?.accent || accent;
  root.style.setProperty('--nav-bg',              navBg);
  root.style.setProperty('--nav-text',            navText);
  root.style.setProperty('--nav-accent',          navAccent);
  root.style.setProperty('--color-nav-bg',        navBg);   // legacy alias

  // Typography
  root.style.setProperty('--font-heading',        headingFont);
  root.style.setProperty('--font-body',           bodyFont);
  root.style.setProperty('--font-heading-weight', String(theme.fonts.headingWeight || theme.fonts.weight || 400));

  // Buttons
  root.style.setProperty('--btn-radius',          btnRadius);
  root.style.setProperty('--radius-btn',          btnRadius);  // alias used in globals.css

  // Layout
  root.style.setProperty('--max-width',           '1320px');
  root.style.setProperty('--nav-height',          '72px');

  // Dark mode — adds/removes 'dark' class on <html>
  if (darkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Fetch settings from API and apply theme vars.
 * Call this in _app.js or layout.js useEffect on client side.
 */
export async function initTheme() {
  if (typeof window === 'undefined') return;

  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res  = await fetch(`${base}/settings`, { cache: 'no-store' });
    if (!res.ok) throw new Error('settings fetch failed');

    const data = await res.json();
    const map  = {};
    (data.data || []).forEach(s => {
      map[s.key] = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : String(s.value || '');
    });

    const themeId = map.storefront_theme || map.storefront_template || 'cartier-noir';
    const theme   = getThemeById(themeId);

    applyThemeVars(theme, map);

    // Cache for instant apply on next page load (avoids FOUC)
    try { sessionStorage.setItem('jcos_theme_config', JSON.stringify({ themeId, map })); } catch {}

    return { theme, config: map };
  } catch {
    // Fallback: apply from session cache or default theme
    try {
      const cached = sessionStorage.getItem('jcos_theme_config');
      if (cached) {
        const { themeId, map } = JSON.parse(cached);
        applyThemeVars(getThemeById(themeId), map);
        return;
      }
    } catch {}
    applyThemeVars(getThemeById('cartier-noir'), {});
  }
}

/**
 * Server-side: get theme config for SSR.
 * Pass the result as props to Header and Footer.
 */
export async function fetchThemeConfig() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res  = await fetch(`${base}/settings`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('settings fetch failed');
    const data = await res.json();
    const map  = {};
    (data.data || []).forEach(s => {
      map[s.key] = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : String(s.value || '');
    });
    const themeId = map.storefront_theme || map.storefront_template || 'cartier-noir';
    return { theme: getThemeById(themeId), config: map };
  } catch {
    return { theme: getThemeById('cartier-noir'), config: {} };
  }
}
