import { Sun, Moon, Bell, Search, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title, subtitle, actions, collapsed, onToggle }) {
  const { dark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between px-5 py-3 bg-white dark:bg-ink-900 border-b border-ink-200/60 dark:border-ink-800 flex-shrink-0">
      {/* Left — sidebar toggle + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 transition-colors flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="12" height="1.5" rx=".75" fill="currentColor"/>
            <rect x="2" y="7.25" width="9"  height="1.5" rx=".75" fill="currentColor"/>
            <rect x="2" y="10.5" width="12" height="1.5" rx=".75" fill="currentColor"/>
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-ink-800 dark:text-ink-100 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-ink-400 truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Right — actions + user */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        <button onClick={toggleTheme}
          className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 transition-colors">
          {dark ? <Sun size={15}/> : <Moon size={15}/>}
        </button>

        {/* User pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-ink-200 dark:border-ink-700 ml-1">
          <div className="w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-ink-700 dark:text-ink-200 leading-none">{user?.name}</p>
            <p className="text-[10px] text-ink-400 leading-none mt-0.5 capitalize">{user?.role?.replace('_',' ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
