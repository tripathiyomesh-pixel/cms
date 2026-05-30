import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import AppFooter from './AppFooter';

const NAV_MODE_KEY    = 'jcms_nav_mode';
const SIDEBAR_KEY     = 'jcms_sidebar_collapsed';
const COMFORT_KEY     = 'jcms_comfort_mode';

function useBreakpoint() {
  const [bp, setBp] = useState('desktop');
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setBp(w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return bp;
}

export default function AppLayout() {
  const bp = useBreakpoint();
  const [navMode,    setNavMode]    = useState(() => localStorage.getItem(NAV_MODE_KEY)  || 'sidebar');
  const [collapsed,  setCollapsed]  = useState(() => localStorage.getItem(SIDEBAR_KEY)  === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [comfort,    setComfort]    = useState(() => localStorage.getItem(COMFORT_KEY)   === 'true');

  // Auto-collapse on tablet
  useEffect(() => {
    if (bp === 'tablet' && !collapsed) setCollapsed(true);
    if (bp === 'mobile') setMobileOpen(false);
  }, [bp]);

  // Apply comfort mode class to root html element
  useEffect(() => {
    document.documentElement.classList.toggle('comfort', comfort);
  }, [comfort]);

  const toggleNavMode = () => {
    const next = navMode === 'sidebar' ? 'topbar' : 'sidebar';
    setNavMode(next);
    localStorage.setItem(NAV_MODE_KEY, next);
  };

  const toggleSidebar = () => {
    if (bp === 'mobile') {
      setMobileOpen(o => !o);
    } else {
      const next = !collapsed;
      setCollapsed(next);
      localStorage.setItem(SIDEBAR_KEY, String(next));
    }
  };

  const toggleComfort = () => {
    const next = !comfort;
    setComfort(next);
    localStorage.setItem(COMFORT_KEY, String(next));
  };

  const ctx = { collapsed, toggleSidebar, navMode, toggleNavMode, bp, comfort, toggleComfort };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-ink-50 dark:bg-ink-900">
      <TopNavBar
        navMode={navMode}
        onToggleNavMode={toggleNavMode}
        sidebarCollapsed={collapsed}
        onToggleSidebar={toggleSidebar}
        bp={bp}
        comfort={comfort}
        onToggleComfort={toggleComfort}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {bp === 'mobile' && mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}/>
        )}

        {/* Sidebar */}
        {(navMode === 'sidebar') && (
          <div className={`
            ${bp === 'mobile'
              ? `fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
              : 'relative flex-shrink-0'
            }
          `}>
            <Sidebar collapsed={bp === 'mobile' ? false : collapsed}/>
          </div>
        )}

        {/* Main content — scrollable, footer flows at bottom */}
        <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-w-0">
          {/* Page content */}
          <div className="flex-1">
            <Outlet context={ctx}/>
          </div>
          {/* Footer at natural bottom of scroll — only visible when scrolled down */}
          <AppFooter />
        </main>
      </div>
    </div>
  );
}
