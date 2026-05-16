import JewellerySpecsForm from './pages/JewellerySpecsForm';
import EnquiriesPage from './pages/EnquiriesPage';
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
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import PluginsPage from './pages/PluginsPage';
import MediaPage from './pages/MediaPage';
import OrdersPage from './pages/OrdersPage';
import PageBuilderPage from './pages/PageBuilderPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-900">
      <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />

            {/* Protected CMS */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id" element={<ProductFormPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="pages" element={<PageBuilderPage />} />
              <Route path="media" element={<MediaPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="marketing" element={<MarketingPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="plugins" element={<PluginsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/jewellery-specs/:productId" element={<JewellerySpecsForm />} />
          <Route path="/enquiries" element={<EnquiriesPage />} />
        </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontSize: '13px', borderRadius: '10px', padding: '10px 16px' },
            success: { iconTheme: { primary: '#B8973E', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
