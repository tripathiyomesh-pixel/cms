import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import {
  Package, MessageCircle, Calendar, ShoppingBag, AlertTriangle,
  Plus, Upload, ArrowUpRight, TrendingUp, Users, Gem
} from 'lucide-react';

const TYPE_CONFIG = {
  enquiry:     { icon: MessageCircle, color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20',    label: 'Enquiry' },
  appointment: { icon: Calendar,      color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20',label: 'Appointment' },
  order:       { icon: ShoppingBag,   color: 'text-green-500',   bg: 'bg-green-50 dark:bg-green-900/20',  label: 'Order' },
  product:     { icon: Package,       color: 'text-gold-500',    bg: 'bg-gold-50 dark:bg-gold-900/20',    label: 'Product' },
};

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400)return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

export default function DashboardPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, aRes, lRes] = await Promise.allSettled([
          dashboardAPI.stats(),
          dashboardAPI.recentActivity(),
          dashboardAPI.lowStock(),
        ]);
        if (sRes.status === 'fulfilled') setStats(sRes.value.data?.data);
        if (aRes.status === 'fulfilled') setActivity(aRes.value.data?.data || []);
        if (lRes.status === 'fulfilled') setLowStock(lRes.value.data?.data || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const kpis = stats ? [
    { icon: Package,        label: 'Total products',     value: stats.products?.total || 0,        sub: `${stats.products?.active || 0} active`,         color: 'bg-gold-50 dark:bg-gold-900/20 text-gold-600',     nav: '/products' },
    { icon: MessageCircle,  label: 'Enquiries',          value: stats.enquiries?.total || 0,       sub: `${stats.enquiries?.unread || 0} unread`,          color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',     nav: '/enquiries' },
    { icon: Calendar,       label: 'Appointments',       value: stats.appointments?.total || 0,    sub: `${stats.appointments?.pending || 0} pending`,      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',nav: '/appointments' },
    { icon: ShoppingBag,    label: 'Orders',             value: stats.orders?.total || 0,          sub: `AED ${Number(stats.orders?.revenue||0).toLocaleString()}`,color: 'bg-green-50 dark:bg-green-900/20 text-green-600',  nav: '/orders' },
    { icon: AlertTriangle,  label: 'Low stock',          value: stats.products?.low_stock || 0,    sub: `${stats.products?.out_of_stock || 0} out of stock`,color: 'bg-red-50 dark:bg-red-900/20 text-red-500',        nav: '/inventory' },
    { icon: Users,          label: 'Users',              value: stats.users || 0,                  sub: 'Team members',                                    color: 'bg-ink-50 dark:bg-ink-800 text-ink-500',           nav: '/users' },
  ] : [];

  const quickActions = [
    { label: 'Add product',       sub: 'Create new jewellery item',   icon: Plus,    color: 'text-gold-600 bg-gold-50 dark:bg-gold-900/20',     nav: '/products/new' },
    { label: 'Upload media',      sub: 'Add product images',          icon: Upload,  color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',     nav: '/media' },
    { label: 'View enquiries',    sub: `${stats?.enquiries?.unread||0} unread`,     icon: MessageCircle, color: 'text-green-600 bg-green-50 dark:bg-green-900/20',  nav: '/enquiries' },
    { label: 'Appointments',      sub: `${stats?.appointments?.today||0} today`,    icon: Calendar,      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',nav: '/appointments' },
    { label: 'Jewellery specs',   sub: 'Manage specs & certs',        icon: Gem,     color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',   nav: '/products' },
    { label: 'View orders',       sub: `${stats?.orders?.pending||0} pending`,      icon: ShoppingBag,   color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20',     nav: '/orders' },
  ];

  return (
    <>
      <Topbar title="Dashboard" subtitle={`Welcome back, ${user?.name || 'Admin'} 👋`}
        actions={
          <button onClick={() => navigate('/products/new')} className="btn-gold flex items-center gap-1.5 text-xs">
            <Plus size={14} /> Add product
          </button>
        } />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {loading ? Array(6).fill(0).map((_,i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="w-9 h-9 rounded-lg bg-ink-100 dark:bg-ink-800 mb-3" />
              <div className="h-6 bg-ink-100 dark:bg-ink-800 rounded w-12 mb-2" />
              <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded w-20" />
            </div>
          )) : kpis.map(k => (
            <button key={k.label} onClick={() => navigate(k.nav)}
              className="card p-4 text-left hover:border-gold-400 dark:hover:border-gold-600 transition-colors group">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${k.color}`}>
                <k.icon size={16} strokeWidth={1.6} />
              </div>
              <div className="font-semibold text-xl text-ink-800 dark:text-ink-100">{k.value.toLocaleString()}</div>
              <div className="text-[11px] text-ink-400 mt-0.5">{k.label}</div>
              <div className="text-[10px] text-ink-300 dark:text-ink-600 mt-0.5">{k.sub}</div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-[11px] font-medium text-ink-400 uppercase tracking-wide mb-2">Quick actions</p>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map(a => (
              <button key={a.label} onClick={() => navigate(a.nav)}
                className="card p-3 text-left hover:border-gold-400 transition-colors group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${a.color}`}>
                  <a.icon size={14} strokeWidth={1.6} />
                </div>
                <div className="text-xs font-medium text-ink-700 dark:text-ink-200 leading-tight">{a.label}</div>
                <div className="text-[10px] text-ink-400 mt-0.5">{a.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Recent activity */}
          <div className="card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-200/60 dark:border-ink-700">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Recent activity</span>
              <TrendingUp size={14} className="text-ink-400" />
            </div>
            <div className="divide-y divide-ink-100 dark:divide-ink-800">
              {activity.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-ink-400">No activity yet — add your first product</div>
              ) : activity.slice(0, 8).map((a, i) => {
                const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.product;
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <cfg.icon size={13} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-ink-700 dark:text-ink-200 truncate">{a.label}</div>
                      <div className="text-[10px] text-ink-400">{cfg.label} · {a.sub}</div>
                    </div>
                    <div className="text-[10px] text-ink-400 flex-shrink-0">{timeAgo(a.created_at)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low stock alerts */}
          <div className="card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-200/60 dark:border-ink-700">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Low stock alerts</span>
              <button onClick={() => navigate('/inventory')} className="text-xs text-gold-500 font-medium hover:text-gold-600 flex items-center gap-1">
                View all <ArrowUpRight size={11} />
              </button>
            </div>
            <div className="divide-y divide-ink-100 dark:divide-ink-800">
              {lowStock.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-ink-400">
                  <AlertTriangle size={20} className="mx-auto text-ink-300 mb-2" />
                  No low stock alerts — all good!
                </div>
              ) : lowStock.slice(0, 8).map((p, i) => (
                <div key={i} onClick={() => navigate(`/products/${p.id}`)}
                  className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-800/50">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-ink-700 dark:text-ink-200 truncate">{p.name}</div>
                    <div className="text-[10px] text-ink-400">{p.sku}</div>
                  </div>
                  <div className="text-right ml-3">
                    <div className={`text-xs font-semibold ${p.stock_quantity === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      {p.stock_quantity === 0 ? 'Out of stock' : `${p.stock_quantity} left`}
                    </div>
                    <div className="text-[10px] text-ink-400">min: {p.low_stock_alert}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
