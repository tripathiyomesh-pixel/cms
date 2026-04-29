import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-ink-900">
      <Sidebar collapsed={collapsed} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet context={{ collapsed, toggleSidebar: () => setCollapsed(c => !c) }} />
      </main>
    </div>
  );
}
