import AppearancePage from './pages/AppearancePage';
import PearlsPage from './pages/PearlsPage';
import PearlFormPage from './pages/PearlFormPage';
import ImportEnginePage from './pages/ImportEnginePage';
import BlogPage from './pages/BlogPage';
import MountingFormPage from './pages/MountingFormPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import CollectionsPage from './pages/CollectionsPage';
import CategoriesPage from './pages/CategoriesPage';
import InventoryPage from './pages/InventoryPage';
import MarketingPage from './pages/MarketingPage';
import MediaPage from './pages/MediaPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import PluginsPage from './pages/PluginsPage';
import EnquiriesPage from './pages/EnquiriesPage';
import AppointmentsAdminPage from './pages/AppointmentsAdminPage';
import JewellerySpecsForm from './pages/JewellerySpecsForm';
import StoreLocationsPage from './pages/StoreLocationsPage';
import TrustBadgesPage from './pages/TrustBadgesPage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import AuditLogPage from './pages/AuditLogPage';
import DevStatusPage from './pages/DevStatusPage';
import DiamondsPage from './pages/DiamondsPage';
import DiamondFormPage from './pages/DiamondFormPage';
import GemstonesPage from './pages/GemstonesPage';
import GemstoneFormPage from './pages/GemstoneFormPage';
import MountingsPage from './pages/MountingsPage';
import CustomOrdersPage from './pages/CustomOrdersPage';
import FeatureFlagsPage from './pages/FeatureFlagsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-sm text-ink-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductFormPage />} />
        <Route path="jewellery-specs/:productId" element={<JewellerySpecsForm />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="enquiries" element={<EnquiriesPage />} />
        <Route path="appointments" element={<AppointmentsAdminPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="locations" element={<StoreLocationsPage />} />
        <Route path="trust-badges" element={<TrustBadgesPage />} />
        <Route path="plugins" element={<PluginsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="dev-status" element={<DevStatusPage />} />
        <Route path="diamonds" element={<DiamondsPage />} />
        <Route path="diamonds/new" element={<DiamondFormPage />} />
        <Route path="diamonds/:id" element={<DiamondFormPage />} />
        <Route path="gemstones" element={<GemstonesPage />} />
        <Route path="gemstones/new" element={<GemstoneFormPage />} />
        <Route path="gemstones/:id" element={<GemstoneFormPage />} />
        <Route path="mountings" element={<MountingsPage />} />
              <Route path="mountings/new" element={<MountingFormPage />} />
              <Route path="mountings/:id" element={<MountingFormPage />} />
                <Route path="custom-orders" element={<CustomOrdersPage />} />
        <Route path="feature-flags" element={<FeatureFlagsPage />} />
              <Route path="appearance" element={<AppearancePage />} />
              <Route path="pearls" element={<PearlsPage />} />
              <Route path="pearls/new" element={<PearlFormPage />} />
              <Route path="pearls/:id" element={<PearlFormPage />} />
              <Route path="import" element={<ImportEnginePage />} />
              <Route path="blog" element={<BlogPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontSize: 13 } }} />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
