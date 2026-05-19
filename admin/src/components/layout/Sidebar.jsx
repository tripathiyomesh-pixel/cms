import { NavLink, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, Layers, FolderTree, Image,
  ShoppingCart, MessageSquare, Users, Calendar, Hexagon,
  Circle, Star, MapPin, Upload, BookOpen, Megaphone,
  Settings, ChevronDown, ChevronUp, DollarSign, Zap,
  Paintbrush, Layout, LayoutList, Square, Globe, Briefcase,
} from 'lucide-react';

// ── NAVIGATION DEFINITION ─────────────────────────────────────
// Each item has optional `capability` — if set, only shown when user has that capability
const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to:'/',                icon:LayoutDashboard, text:'Dashboard',        capability:'dashboard.view' },
      { to:'/products',        icon:Package,         text:'Jewellery',        capability:'products.view' },
      { to:'/diamonds',        icon:Hexagon,         text:'Diamonds',         capability:'diamonds.view' },
      { to:'/gemstones',       icon:Circle,          text:'Gemstones',        capability:'diamonds.view' },
      { to:'/pearls',          icon:Star,            text:'Pearls',           capability:'diamonds.view' },
      { to:'/mountings',       icon:Layers,          text:'Mountings',        capability:'products.view' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { to:'/orders',          icon:ShoppingCart,    text:'Orders',           capability:'orders.view' },
      { to:'/enquiries',       icon:MessageSquare,   text:'Enquiries',        capability:'enquiries.view' },
      { to:'/appointments',    icon:Calendar,        text:'Appointments',     capability:'appointments.view' },
      { to:'/custom-orders',   icon:Package,         text:'Custom orders',    capability:'orders.view' },
      { to:'/customers',       icon:Users,           text:'Customers',        capability:'customers.view' },
      { to:'/exhibitions',     icon:MapPin,          text:'Exhibitions',      capability:'marketing.view' },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { to:'/categories',      icon:FolderTree,      text:'Categories',       capability:'products.view' },
      { to:'/media',           icon:Image,           text:'Media',            capability:'media.view' },
      { to:'/import',          icon:Upload,          text:'Bulk import',      capability:'inventory.manage' },
      { to:'/marketing',       icon:Megaphone,       text:'Banners',          capability:'marketing.view' },
      { to:'/blog',            icon:BookOpen,        text:'Blog',             capability:'blog.view' },
    ],
  },
  {
    label: 'Theme & Home',
    items: [
      { to:'/theme-editor',    icon:Paintbrush,      text:'Theme settings',   capability:'builder.view' },
      { to:'/home-builder',    icon:Layout,          text:'Home page',        capability:'builder.view' },
    ],
  },
  {
    label: 'Website Builder',
    items: [
      { to:'/menu-builder',    icon:LayoutList,      text:'Menu builder',     capability:'builder.view' },
      { to:'/page-builder',    icon:Square,          text:'Custom pages',     capability:'builder.view' },
      { to:'/frontend-settings',icon:Globe,          text:'Frontend settings',capability:'settings.view' },
    ],
  },
  {
    label: 'System',
    items: [
      { to:'/workforce',       icon:Briefcase,       text:'Workforce',        capability:'workforce.view' },
      { to:'/gold-rates',       icon:DollarSign,      text:'Gold rates',       capability:'gold_rates.view' },
      { to:'/users',           icon:Users,           text:'Users',            capability:'users.view' },
      { to:'/payments',        icon:DollarSign,      text:'Payments',         capability:'settings.manage' },
      { to:'/erp-integration', icon:Zap,             text:'ERP sync',         capability:'erp.view' },
      { to:'/settings',        icon:Settings,        text:'Settings',         capability:'settings.view' },
    ],
  },
];

export default function Sidebar({ collapsed }) {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggle = (label) => setCollapsedSections(s => ({ ...s, [label]: !s[label] }));

  // Get user capabilities from auth context
  const userCaps = user?.capabilities || {};
  const userRole = user?.role || 'viewer';

  // Check if user can see a menu item
  const canSee = (capability) => {
    if (!capability) return true;
    if (userRole === 'super_admin' || userRole === 'admin') return true;
    return !!userCaps[capability];
  };

  const isSectionActive = (items) =>
    items.some(item => item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to));

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
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '6px 0 12px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--color-border-secondary) transparent',
      }}>
        {NAV_SECTIONS.map(section => {
          // Filter items user can see
          const visibleItems = section.items.filter(item => canSee(item.capability));
          if (!visibleItems.length) return null;

          const sectionActive = isSectionActive(visibleItems);
          const isCollapsed   = collapsedSections[section.label];

          return (
            <div key={section.label}>
              {!collapsed && (
                <button onClick={() => toggle(section.label)}
                  style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px 3px', border:'none', background:'transparent', cursor:'pointer' }}>
                  <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color: sectionActive ? '#c9a84c' : 'var(--color-text-secondary)', opacity:0.65 }}>
                    {section.label}
                  </span>
                  {isCollapsed
                    ? <ChevronUp size={10} style={{ color:'var(--color-text-secondary)', opacity:0.5 }}/>
                    : <ChevronDown size={10} style={{ color:'var(--color-text-secondary)', opacity:0.5 }}/>
                  }
                </button>
              )}

              {!isCollapsed && visibleItems.map(item => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} title={collapsed ? item.text : undefined}
                  style={({ isActive }) => ({
                    display:'flex', alignItems:'center', gap:9,
                    padding: collapsed ? '8px 0' : '6px 10px',
                    margin: collapsed ? '1px 4px' : '1px 6px',
                    borderRadius:8, textDecoration:'none',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
                    color: isActive ? '#c9a84c' : 'var(--color-text-secondary)',
                    transition:'all .12s', position:'relative',
                  })}>
                  {({ isActive }) => (
                    <>
                      {isActive && !collapsed && (
                        <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:2.5, background:'#c9a84c', borderRadius:2 }}/>
                      )}
                      <item.icon size={15} style={{ flexShrink:0, opacity: isActive ? 1 : 0.65 }}/>
                      {!collapsed && (
                        <span style={{ fontSize:12, fontWeight: isActive ? 600 : 400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {item.text}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}

              {!collapsed && (
                <div style={{ height:0.5, background:'var(--color-border-tertiary)', margin:'4px 10px 2px', opacity:0.4 }}/>
              )}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div style={{ borderTop:'0.5px solid var(--color-border-tertiary)', padding:'8px 14px', flexShrink:0 }}>
          <p style={{ fontSize:9, color:'var(--color-text-secondary)', opacity:0.4, letterSpacing:'0.05em' }}>JCOS v0.9</p>
        </div>
      )}
    </aside>
  );
}
