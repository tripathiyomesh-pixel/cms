import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';

export function PlaceholderPage({ title, subtitle }) {
  const { collapsed, toggleSidebar } = useOutletContext();
  return (
    <>
      <Topbar title={title} subtitle={subtitle} collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
              <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="currentColor" strokeWidth="1" className="text-gold-500"/>
            </svg>
          </div>
          <h2 className="font-display text-xl font-semibold text-ink-700 dark:text-ink-200">{title}</h2>
          <p className="text-xs text-ink-400 mt-1">{subtitle || 'Coming soon'}</p>
        </div>
      </div>
    </>
  );
}

export const CollectionsPage = () => <PlaceholderPage title="Collections" subtitle="Manage product collections — Bridal, Daily Wear, Luxury" />;
export const CategoriesPage  = () => <PlaceholderPage title="Categories" subtitle="Category tree with drag-and-drop sorting" />;
export const MediaPage       = () => <PlaceholderPage title="Media library" subtitle="Upload and organize product images" />;
export const InventoryPage   = () => <PlaceholderPage title="Inventory" subtitle="Stock levels, alerts, and bulk updates" />;
export const MarketingPage   = () => <PlaceholderPage title="Marketing" subtitle="Banners, promo codes, homepage editor" />;
export const OrdersPage      = () => <PlaceholderPage title="Orders" subtitle="Order management and customer enquiries" />;
export const UsersPage       = () => <PlaceholderPage title="Users" subtitle="User management and role assignments" />;
export const SettingsPage    = () => <PlaceholderPage title="Settings" subtitle="Store settings, countries, and license" />;
