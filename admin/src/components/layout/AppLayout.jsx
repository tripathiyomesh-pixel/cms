import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';

const NAV_MODE_KEY = 'jcms_nav_mode'; // 'sidebar' | 'topbar'

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [navMode, setNavMode] = useState(() => {
    return localStorage.getItem(NAV_MODE_KEY) || 'sidebar';
  });

  const toggleNavMode = () => {
    const next = navMode === 'sidebar' ? 'topbar' : 'sidebar';
    setNavMode(next);
    localStorage.setItem(NAV_MODE_KEY, next);
  };

  const ctx = {
    collapsed:     sidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed(c => !c),
    navMode,
    toggleNavMode,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-ink-50 dark:bg-ink-900">
      {/* Top navigation bar (always visible — has logo, topbar toggle, notifications, user) */}
      <TopNavBar
        navMode={navMode}
        onToggleNavMode={toggleNavMode}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(c => !c)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — shown only in sidebar mode */}
        {navMode === 'sidebar' && (
          <Sidebar collapsed={sidebarCollapsed} onToggleNavMode={toggleNavMode}/>
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet context={ctx}/>
        </main>
      </div>
    </div>
  );
}
