import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, Layers, FolderTree, Image,
  ShoppingCart, BarChart3, Users, Puzzle, Activity,
  MapPin, ClipboardList, Upload, BookOpen,
  Calendar, Hexagon, Circle, Star, MessageSquare,
  UserCheck, Settings, ChevronDown, ChevronRight,
  Megaphone, ShieldCheck, DollarSign, Zap, Paintbrush,
} from 'lucide-react';
import React from 'react';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to:'/',               icon:LayoutDashboard, text:'Dashboard' },
      { to:'/products',       icon:Package,         text:'Jewellery' },
      { to:'/diamonds',       icon:Hexagon,         text:'Diamonds' },
      { to:'/gemstones',      icon:Circle,          text:'Gemstones' },
      { to:'/pearls',         icon:Star,            text:'Pearls' },
      { to:'/mountings',      icon:Layers,          text:'Mountings' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { to:'/orders',         icon:ShoppingCart,    text:'Orders' },
      { to:'/enquiries',      icon:MessageSquare,   text:'Enquiries' },
      { to:'/appointments',   icon:Calendar,        text:'Appointments' },
      { to:'/custom-orders',  icon:Package,         text:'Custom orders' },
      { to:'/customers',      icon:UserCheck,       text:'Customers' },
      { to:'/exhibitions',    icon:MapPin,          text:'Exhibitions' },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { to:'/categories',     icon:FolderTree,      text:'Categories' },
      { to:'/media',          icon:Image,           text:'Media' },
      { to:'/import',         icon:Upload,          text:'Bulk import' },
      { to:'/marketing',      icon:Megaphone,       text:'Banners' },
      { to:'/blog',           icon:BookOpen,        text:'Blog' },
    ],
  },
  {
    label: 'Config',
    items: [
      { to:'/theme-editor',   icon:Paintbrush,      text:'Theme editor' },
      { to:'/payments',       icon:DollarSign,      text:'Payments' },
      { to:'/erp-integration',icon:Zap,             text:'ERP sync' },
      { to:'/settings',       icon:Settings,        text:'Settings' },
      { to:'/users',          icon:Users,           text:'Users' },
    ],
  },
];

// ── SIDEBAR ───────────────────────────────────────────────────
export default function Sidebar({ collapsed }) {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsedSections, setCollapsedSections] = React.useState({});

  const toggle = (label) =>
    setCollapsedSections(s => ({ ...s, [label]: !s[label] }));

  const isSectionActive = (items) =>
    items.some(item =>
      item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
    );

  return (
    <aside style={{
      width: collapsed ? 52 : 210,
      flexShrink: 0,
      background: 'var(--color-background-primary)',
      borderRight: '0.5px solid var(--color-border-tertiary)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width .2s ease',
      overflow: 'hidden',
      height: '100%',
    }}>

      {/* Scrollable nav — this is the key fix */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '6px 0 12px',
        /* Custom thin scrollbar */
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--color-border-secondary) transparent',
      }}>
        {NAV_SECTIONS.map(section => {
          const sectionActive  = isSectionActive(section.items);
          const isCollapsed    = collapsedSections[section.label];

          return (
            <div key={section.label}>
              {/* Section label */}
              {!collapsed && (
                <button
                  onClick={() => toggle(section.label)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px 3px', border: 'none',
                    background: 'transparent', cursor: 'pointer',
                  }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: sectionActive
                      ? '#c9a84c'
                      : 'var(--color-text-secondary)',
                    opacity: 0.65,
                  }}>
                    {section.label}
                  </span>
                  {isCollapsed
                    ? <ChevronRight size={10} style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}/>
                    : <ChevronDown  size={10} style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}/>
                  }
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: collapsed ? '8px 0' : '6px 10px',
                    margin: collapsed ? '1px 4px' : '1px 6px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: isActive
                      ? 'rgba(201,168,76,0.1)'
                      : 'transparent',
                    color: isActive
                      ? '#c9a84c'
                      : 'var(--color-text-secondary)',
                    transition: 'all .12s',
                    position: 'relative',
                  })}>
                  {({ isActive }) => (
                    <>
                      {/* Active indicator */}
                      {isActive && !collapsed && (
                        <div style={{
                          position: 'absolute', left: 0, top: '20%', bottom: '20%',
                          width: 2.5, background: '#c9a84c', borderRadius: 2,
                        }}/>
                      )}
                      <item.icon
                        size={15}
                        style={{ flexShrink: 0, opacity: isActive ? 1 : 0.65 }}/>
                      {!collapsed && (
                        <span style={{
                          fontSize: 12,
                          fontWeight: isActive ? 600 : 400,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {item.text}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}

              {/* Section spacer */}
              {!collapsed && (
                <div style={{
                  height: 0.5,
                  background: 'var(--color-border-tertiary)',
                  margin: '4px 10px 2px',
                  opacity: 0.4,
                }}/>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom — version */}
      {!collapsed && (
        <div style={{
          borderTop: '0.5px solid var(--color-border-tertiary)',
          padding: '8px 14px',
          flexShrink: 0,
        }}>
          <p style={{ fontSize: 9, color: 'var(--color-text-secondary)', opacity: 0.4, letterSpacing: '0.05em' }}>
            JewelCMS v0.9
          </p>
        </div>
      )}
    </aside>
  );
}

