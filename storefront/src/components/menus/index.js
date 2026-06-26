'use client';
// Mega menu registry — maps menu_style DB setting to component
import MenuM1Cartier    from './MenuM1Cartier';
import MenuM2Tiffany    from './MenuM2Tiffany';
import MenuM3SidePanel  from './MenuM3SidePanel';
import MenuM4Filmstrip  from './MenuM4Filmstrip';
import MenuM5Accordion  from './MenuM5Accordion';
import MenuM6Fullscreen from './MenuM6Fullscreen';
import MenuM7Tabbed     from './MenuM7Tabbed';
import MenuM8DualPanel  from './MenuM8DualPanel';
import MenuM9Magazine   from './MenuM9Magazine';
import MenuM10Tooltip   from './MenuM10Tooltip';
import MenuM11SplitScreen from './MenuM11SplitScreen';
import MenuM12GCC       from './MenuM12GCC';

export const MENU_VARIANTS = {
  M1:  { Component: MenuM1Cartier,     label: 'M1 – Cartier Classic',         fullscreen: false },
  M2:  { Component: MenuM2Tiffany,     label: 'M2 – Tiffany Editorial',       fullscreen: false },
  M3:  { Component: MenuM3SidePanel,   label: 'M3 – Vertical Side Panel',     fullscreen: false },
  M4:  { Component: MenuM4Filmstrip,   label: 'M4 – Horizontal Filmstrip',    fullscreen: false },
  M5:  { Component: MenuM5Accordion,   label: 'M5 – Accordion Vertical',      fullscreen: false },
  M6:  { Component: MenuM6Fullscreen,  label: 'M6 – Fullscreen Overlay',      fullscreen: true  },
  M7:  { Component: MenuM7Tabbed,      label: 'M7 – Tabbed Mega',             fullscreen: false },
  M8:  { Component: MenuM8DualPanel,   label: 'M8 – Dual Panel + Products',   fullscreen: false },
  M9:  { Component: MenuM9Magazine,    label: 'M9 – Magazine Editorial',       fullscreen: false },
  M10: { Component: MenuM10Tooltip,    label: 'M10 – Tooltip Preview',        fullscreen: false },
  M11: { Component: MenuM11SplitScreen,label: 'M11 – Split Screen Takeover',  fullscreen: true  },
  M12: { Component: MenuM12GCC,        label: 'M12 – GCC Regional',           fullscreen: false },
};

// Default export: <MegaMenu variant="M1" openMenu={...} onClose={...} />
export default function MegaMenu({ variant = 'M1', openMenu, onClose, lang, onLangToggle }) {
  const entry = MENU_VARIANTS[variant] || MENU_VARIANTS.M1;
  const { Component } = entry;
  return <Component openMenu={openMenu} onClose={onClose} lang={lang} onLangToggle={onLangToggle} />;
}