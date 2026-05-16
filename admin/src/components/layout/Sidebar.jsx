import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, Layers, FolderTree, Image, Megaphone,
  ShoppingCart, BarChart3, Users, Settings, Shield, LogOut, Puzzle, Layout, Activity,
} from 'lucide-react';

const NAV = [
  { label: 'Main', items: [
    { to: '/',            icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/pages',       icon: Layout,          text: 'Page builder' },
    { to: '/products',    icon: Package,         text: 'Products' },
    { to: '/collections', icon: Layers,          text: 'Collections' },
    { to: '/categories',  icon: FolderTree,      text: 'Categories' },
    { to: '/media',       icon: Image,           text: 'Media library' },
  ]},
  { label: 'Commerce', items: [
    { to: '/inventory',   icon: BarChart3,       text: 'Inventory' },
    { to: '/marketing',   icon: Megaphone,       text: 'Marketing' },
    { to: '/orders',      icon: ShoppingCart,     text: 'Orders' },
  ]},
  { label: 'System', items: [
    { to: '/plugins',     icon: Puzzle,          text: 'Plugins' },
    { to: '/users',       icon: Users,           text: 'Users' },
    { to: '/settings',    icon: Settings,        text: 'Settings' },
    { to: '/dev-status',  icon: Activity,        text: 'Dev status' },
  ]},
];

const navClass = ({ isActive }) =>
  `flex items-center gap-2.5 px-4 py-2 text-[13px] rounded-lg transition-all duration-150 border-l-2 ${
    isActive
      ? 'bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-300 border-gold-500 font-medium'
      : 'text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-200 hover:bg-ink-100/60 dark:hover:bg-ink-800 border-transparent'
  }`;

export default function Sidebar({ collapsed }) {
  const { user, logout } = useAuth();

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-56'} flex-shrink-0 h-screen bg-white dark:bg-ink-900 border-r border-ink-200/60 dark:border-ink-700 flex flex-col transition-all duration-200`}>
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-ink-200/60 dark:border-ink-700 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.4"/>
            <polyline points="1,5 8,9 15,5" fill="none" stroke="#fff" strokeWidth="1"/>
            <line x1="8" y1="9" x2="8" y2="15" stroke="#fff" strokeWidth="1"/>
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100 leading-none">
              Jewel<span className="text-gold-500">CMS</span>
            </div>
            <div className="text-[9px] tracking-[2px] uppercase text-ink-300 dark:text-ink-600">Admin</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-1 text-[9px] tracking-[1.5px] uppercase font-medium text-ink-300 dark:text-ink-600">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navClass}>
                  <item.icon size={16} strokeWidth={1.6} />
                  {!collapsed && <span>{item.text}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-ink-200/60 dark:border-ink-700 p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-ink-700 dark:text-ink-200 truncate">{user?.name}</div>
              <div className="text-[10px] text-ink-400 dark:text-ink-500 truncate">{user?.role}</div>
            </div>
          )}
          <button onClick={logout} className="p-1.5 rounded-md hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400" title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
