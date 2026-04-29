import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { productsAPI, collectionsAPI, inventoryAPI, marketingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, Layers, BarChart3, AlertTriangle, Plus, Upload, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

const KPICard = ({ icon: Icon, label, value, change, color }) => (
  <div className="card p-4">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={16} strokeWidth={1.6} />
      </div>
      {change && <span className="badge badge-green text-[10px]">{change}</span>}
    </div>
    <div className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-100">{value}</div>
    <div className="text-[11px] text-ink-400 dark:text-ink-500 mt-1">{label}</div>
  </div>
);

export default function DashboardPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, collections: 0, lowStock: 0, promos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, cRes, iRes, mRes] = await Promise.allSettled([
          productsAPI.list({ limit: 1 }),
          collectionsAPI.list(),
          inventoryAPI.lowStock(5),
          marketingAPI.promoCodes(),
        ]);
        setStats({
          products:    pRes.status === 'fulfilled' ? pRes.value.data.pagination?.total || 0 : 0,
          collections: cRes.status === 'fulfilled' ? cRes.value.data.data?.length || 0 : 0,
          lowStock:    iRes.status === 'fulfilled' ? iRes.value.data.data?.count || 0 : 0,
          promos:      mRes.status === 'fulfilled' ? mRes.value.data.data?.length || 0 : 0,
        });
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name || 'Admin'}`}
        collapsed={collapsed}
        onToggle={toggleSidebar}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate('/products/new')} className="btn-gold flex items-center gap-1.5 text-xs">
              <Plus size={14} /> Add product
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard icon={Package} label="Total products" value={stats.products.toLocaleString()} change="+24" color="bg-blue-50 dark:bg-blue-900/20 text-blue-600" />
          <KPICard icon={Layers} label="Collections" value={stats.collections} color="bg-gold-50 dark:bg-gold-900/20 text-gold-600" />
          <KPICard icon={AlertTriangle} label="Low stock alerts" value={stats.lowStock} color="bg-red-50 dark:bg-red-900/20 text-red-500" />
          <KPICard icon={BarChart3} label="Active promos" value={stats.promos} color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => navigate('/products/new')} className="card p-4 hover:border-gold-500 transition-colors text-left group">
            <div className="w-9 h-9 rounded-lg bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center text-gold-600 mb-3">
              <Plus size={16} />
            </div>
            <div className="text-sm font-medium text-ink-700 dark:text-ink-200 group-hover:text-gold-600 transition-colors">Add product</div>
            <div className="text-[10px] text-ink-400 mt-0.5">Create a new jewellery product</div>
          </button>
          <button onClick={() => navigate('/media')} className="card p-4 hover:border-gold-500 transition-colors text-left group">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mb-3">
              <Upload size={16} />
            </div>
            <div className="text-sm font-medium text-ink-700 dark:text-ink-200 group-hover:text-gold-600 transition-colors">Upload media</div>
            <div className="text-[10px] text-ink-400 mt-0.5">Upload product images</div>
          </button>
          <button onClick={() => navigate('/collections')} className="card p-4 hover:border-gold-500 transition-colors text-left group">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 mb-3">
              <Layers size={16} />
            </div>
            <div className="text-sm font-medium text-ink-700 dark:text-ink-200 group-hover:text-gold-600 transition-colors">Create collection</div>
            <div className="text-[10px] text-ink-400 mt-0.5">Organize your catalogue</div>
          </button>
        </div>

        {/* Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Activity placeholder */}
          <div className="card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-200/60 dark:border-ink-700">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Recent activity</span>
            </div>
            <div className="p-4 space-y-3">
              {['Product created: Solitaire Ring', 'Banner updated for UAE', 'New enquiry received', '12 images uploaded'].map((msg, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${['bg-gold-500','bg-blue-500','bg-emerald-500','bg-gold-400'][i]}`} />
                  <div>
                    <div className="text-xs text-ink-700 dark:text-ink-200">{msg}</div>
                    <div className="text-[10px] text-ink-400">{['2 min ago','1 hr ago','3 hrs ago','Yesterday'][i]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Alerts placeholder */}
          <div className="card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-200/60 dark:border-ink-700">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Inventory alerts</span>
              <button onClick={() => navigate('/inventory')} className="text-xs text-gold-500 font-medium hover:text-gold-600 flex items-center gap-1">
                View all <ArrowUpRight size={11} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {stats.lowStock === 0 ? (
                <div className="text-xs text-ink-400 text-center py-6">No low stock alerts</div>
              ) : (
                <div className="text-xs text-ink-400 text-center py-6">
                  {stats.lowStock} item(s) below threshold
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
