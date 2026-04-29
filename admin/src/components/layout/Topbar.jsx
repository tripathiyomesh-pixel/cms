import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Bell, Search, PanelLeftClose, PanelLeft } from 'lucide-react';

export default function Topbar({ title, subtitle, collapsed, onToggle, actions }) {
  const { dark, toggle } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-14 flex items-center justify-between px-5 border-b border-ink-200/60 dark:border-ink-700 bg-white dark:bg-ink-900 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onToggle} className="p-1.5 rounded-md hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400">
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-800 dark:text-ink-100 leading-none">{title}</h1>
          {subtitle && <p className="text-[11px] text-ink-400 dark:text-ink-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {actions}

        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 w-48 text-xs rounded-lg border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 text-ink-700 dark:text-ink-200 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        {/* Theme toggle */}
        <div className="flex items-center bg-ink-100 dark:bg-ink-800 rounded-lg border border-ink-200/60 dark:border-ink-700 overflow-hidden">
          <button
            onClick={() => dark && toggle()}
            className={`px-2.5 py-1.5 text-[11px] font-medium transition-all ${!dark ? 'bg-gold-500 text-white' : 'text-ink-400'}`}
          >
            <Sun size={13} />
          </button>
          <button
            onClick={() => !dark && toggle()}
            className={`px-2.5 py-1.5 text-[11px] font-medium transition-all ${dark ? 'bg-gold-500 text-white' : 'text-ink-400'}`}
          >
            <Moon size={13} />
          </button>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg border border-ink-200 dark:border-ink-700 hover:border-gold-500 transition-colors bg-white dark:bg-ink-800">
          <Bell size={15} className="text-ink-400" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
