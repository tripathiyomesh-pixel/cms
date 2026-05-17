import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, Layers, FolderTree, Image, Megaphone,
  ShoppingCart, BarChart3, Users, Shield, Puzzle, Activity,
  MapPin, ShieldCheck, ClipboardList, Upload, BookOpen, Paintbrush, DollarSign,
  Zap, ToggleLeft, Calendar, Hexagon, Circle, Star, MessageSquare,
  UserCheck, Settings, ChevronDown, ChevronRight, Layout,
} from 'lucide-react';

// ─── NAVIGATION STRUCTURE ────────────────────────────────────
// Settings / Appearance / RapNet / Feature flags / Users / Audit
// are NOT in the main sidebar — they belong under Settings
// Only operational modules appear as main nav items

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/',            icon: LayoutDashboard, text: 'Dashboard' },
      { to: '/products',    icon: Package,         text: 'Products / Jewellery' },
      { to: '/diamonds',    icon: Hexagon,         text: 'Diamonds' },
      { to: '/gemstones',   icon: Circle,             text: 'Gemstones' },
      { to: '/pearls',      icon: Star,            text: 'Pearls' },
      { to: '/mountings',   icon: Layers,          text: 'Mountings' },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { to: '/categories',  icon: FolderTree,      text: 'Categories' },
      { to: '/collections', icon: Layers,          text: 'Collections' },
      { to: '/media',       icon: Image,           text: 'Media library' },
      { to: '/inventory',   icon: BarChart3,       text: 'Stock & inventory' },
      { to: '/import',      icon: Upload,          text: 'Bulk import' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { to: '/orders',          icon: ShoppingCart,  text: 'Orders' },
      { to: '/custom-orders',   icon: Package,       text: 'Custom orders' },
      { to: '/enquiries',       icon: MessageSquare, text: 'Enquiries' },
      { to: '/appointments',    icon: Calendar,      text: 'Appointments' },
      { to: '/customers',       icon: UserCheck,     text: 'Customers' },
      { to: '/exhibitions',     icon: MapPin,        text: 'Exhibitions' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/marketing',   icon: Megaphone,   text: 'Banners & promos' },
      { to: '/blog',        icon: BookOpen,    text: 'Blog & content' },
      { to: '/locations',   icon: MapPin,      text: 'Store locations' },
      { to: '/trust-badges',icon: ShieldCheck, text: 'Trust badges' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { to: '/settings',      icon: Settings,   text: 'Store settings' },
      { to: '/page-builder',  icon: Layout,     text: 'Page builder' },
      { to: '/appearance',    icon: Paintbrush, text: 'Appearance' },
      { to: '/rapnet',        icon: Zap,        text: 'RapNet' },
      { to: '/plugins',       icon: Puzzle,     text: 'Plugins' },
      { to: '/feature-flags', icon: ToggleLeft, text: 'Feature flags' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/users',       icon: Users,         text: 'Users & roles' },
      { to: '/audit-log',   icon: ClipboardList, text: 'Audit log' },
      { to: '/dev-status',  icon: Activity,      text: 'Dev status' },
    ],
  },
];

// ─── SIDEBAR COMPONENT ────────────────────────────────────────
export default function Sidebar({ collapsed }) {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (label) => {
    setCollapsedSections(s => ({ ...s, [label]: !s[label] }));
  };

  // Check if any item in section is active
  const isSectionActive = (items) =>
    items.some(item => item.to === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.to));

  return (
    <aside style={{
      width: collapsed ? 56 : 220,
      flexShrink: 0,
      background: 'var(--color-background-primary)',
      borderRight: '0.5px solid var(--color-border-tertiary)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width .2s ease',
      overflow: 'hidden',
    }}>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}
        className="hide-scrollbar">
        {NAV_SECTIONS.map(section => {
          const sectionActive = isSectionActive(section.items);
          const isCollapsed   = collapsedSections[section.label];

          return (
            <div key={section.label}>
              {/* Section label / toggle */}
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.label)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 14px 4px', border: 'none', background: 'transparent', cursor: 'pointer',
                  }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: sectionActive ? '#c9a84c' : 'var(--color-text-secondary)', opacity: 0.7 }}>
                    {section.label}
                  </span>
                  {isCollapsed
                    ? <ChevronRight size={10} style={{ color: 'var(--color-text-secondary)' }}/>
                    : <ChevronDown  size={10} style={{ color: 'var(--color-text-secondary)' }}/>}
                </button>
              )}

              {/* Items */}
              {!isCollapsed && section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  title={collapsed ? item.text : undefined}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: collapsed ? '9px 0' : '7px 12px',
                    margin: collapsed ? '1px 4px' : '1px 6px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: isActive ? 'var(--color-gold-subtle, rgba(201,168,76,0.1))' : 'transparent',
                    color: isActive ? '#c9a84c' : 'var(--color-text-secondary)',
                    transition: 'all .15s',
                  })}
                  onMouseEnter={e => { if (!e.currentTarget.style.color.includes('c9a84c')) e.currentTarget.style.background = 'var(--color-background-secondary)'; }}
                  onMouseLeave={e => { if (!e.currentTarget.style.color.includes('c9a84c')) e.currentTarget.style.background = 'transparent'; }}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={15} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}/>
                      {!collapsed && (
                        <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.text}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}

              {/* Divider between sections */}
              {!collapsed && (
                <div style={{ height: 1, background: 'var(--color-border-tertiary)', margin: '4px 12px 2px', opacity: 0.5 }}/>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom — version only */}
      {!collapsed && (
        <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', padding: '8px 14px' }}>
          <p style={{ fontSize: 9, color: 'var(--color-text-secondary)', opacity: 0.5, letterSpacing: '0.05em' }}>JewelCMS v0.9 · KenTech</p>
        </div>
      )}
    </aside>
  );
}
