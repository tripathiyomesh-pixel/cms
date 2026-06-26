import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import StatCard from '../components/ui/StatCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import StatusBadge from '../components/ui/StatusBadge';
import api from '../services/api';
import {
  MessageSquare, Calendar, Package, Users, TrendingUp, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const fmt = (n) => new Intl.NumberFormat('en-AE').format(Math.round(n || 0));
const fmtAED = (n) => `AED ${fmt(n)}`;
const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="text-ink-500 mb-1">{label}</p>
      <p className="font-semibold text-ink-800 dark:text-ink-100">
        {currency ? fmtAED(payload[0]?.value) : payload[0]?.value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard');
      setData(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const goldRate = data?.gold_rate;
  const topbarActions = (
    <button onClick={load} className="btn-ghost flex items-center gap-1.5">
      <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
    </button>
  );

  return (
    <div className="min-h-full bg-ink-50 dark:bg-ink-900">
      <Topbar
        title="Dashboard"
        subtitle={goldRate
          ? `Gold 22K: AED ${parseFloat(goldRate.rate_22k).toFixed(2)}/g · 18K: AED ${parseFloat(goldRate.rate_18k || 0).toFixed(2)}/g`
          : 'Overview of your store'}
        actions={topbarActions}
      />

      <div className="p-5 space-y-5">
        {error && (
          <div className="card p-4 flex items-center gap-3 border-red-200 bg-red-50 dark:bg-red-900/10">
            <span className="text-xs text-red-600 dark:text-red-400 flex-1">{error}</span>
            <button onClick={load} className="text-xs text-red-600 underline">Retry</button>
          </div>
        )}

        {/* ROW 1 — Stat cards */}
        {loading ? (
          <SkeletonLoader variant="stat-card" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Enquiries"
              value={data?.today?.enquiries ?? 0}
              sub={`${data?.this_month?.enquiries ?? 0} this month`}
              icon={MessageSquare}
              color="blue"
              onClick={() => navigate('/enquiries')}
            />
            <StatCard
              title="Today's Appointments"
              value={data?.today?.appointments ?? 0}
              sub={`${data?.this_month?.appointments ?? 0} this month`}
              icon={Calendar}
              color="gold"
              onClick={() => navigate('/appointments')}
            />
            <StatCard
              title="Total Products"
              value={fmt(data?.totals?.products)}
              sub={`${data?.totals?.collections ?? 0} collections`}
              icon={Package}
              color="purple"
              onClick={() => navigate('/products')}
            />
            <StatCard
              title="Active Leads"
              value={fmt(data?.totals?.active_leads)}
              sub={`${data?.totals?.customers ?? 0} total customers`}
              icon={Users}
              color="green"
              onClick={() => navigate('/crm')}
            />
          </div>
        )}

        {/* ROW 2 — Charts */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Revenue</h3>
                  <p className="text-xs text-ink-400">Last 12 months (AED)</p>
                </div>
                <TrendingUp size={16} className="text-gold-500" />
              </div>
              {data?.revenue_chart?.length ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.revenue_chart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                      tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip content={<ChartTooltip currency />} />
                    <Bar dataKey="revenue" fill="#b8973e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-xs text-ink-400">No revenue data yet</div>
              )}
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Enquiries</h3>
                  <p className="text-xs text-ink-400">Last 30 days</p>
                </div>
                <MessageSquare size={16} className="text-blue-500" />
              </div>
              {data?.enquiry_chart?.length ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={data.enquiry_chart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                      tickFormatter={d => d ? d.slice(5) : ''} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-xs text-ink-400">No enquiry data yet</div>
              )}
            </div>
          </div>
        )}

        {/* ROW 3 — Recent activity tables */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center justify-between px-5 py-3 border-b border-ink-100 dark:border-ink-700">
                <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Recent Enquiries</h3>
                <button onClick={() => navigate('/enquiries')} className="text-xs text-gold-600 dark:text-gold-400 hover:underline">View all</button>
              </div>
              {data?.recent_enquiries?.length ? (
                <div className="divide-y divide-ink-50 dark:divide-ink-800">
                  {data.recent_enquiries.map(e => (
                    <div key={e.id} className="table-row flex items-center gap-3 px-5 py-3" onClick={() => navigate('/enquiries')}>
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-blue-600">{(e.name || e.customer_name || '?')[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink-700 dark:text-ink-200 truncate">{e.name || e.customer_name || 'Customer'}</p>
                        <p className="text-[10px] text-ink-400 truncate">{e.product || 'General enquiry'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <StatusBadge status={e.status} />
                        <p className="text-[10px] text-ink-400 mt-0.5">{timeAgo(e.date || e.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-ink-400">No enquiries yet</div>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between px-5 py-3 border-b border-ink-100 dark:border-ink-700">
                <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Upcoming Appointments</h3>
                <button onClick={() => navigate('/appointments')} className="text-xs text-gold-600 dark:text-gold-400 hover:underline">View all</button>
              </div>
              {data?.recent_appointments?.length ? (
                <div className="divide-y divide-ink-50 dark:divide-ink-800">
                  {data.recent_appointments.map(a => (
                    <div key={a.id} className="table-row flex items-center gap-3 px-5 py-3" onClick={() => navigate('/appointments')}>
                      <div className="w-7 h-7 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-gold-700">{(a.name || a.customer_name || '?')[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink-700 dark:text-ink-200 truncate">{a.name || a.customer_name || 'Customer'}</p>
                        <p className="text-[10px] text-ink-400">{a.purpose || 'Appointment'}</p>
                      </div>
                      <p className="text-xs font-medium text-ink-600 dark:text-ink-300 flex-shrink-0">
                        {a.date ? new Date(a.date).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' }) : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-ink-400">No upcoming appointments</div>
              )}
            </div>
          </div>
        )}

        {/* ROW 4 — Top Collections */}
        {!loading && data?.top_collections?.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-4">Top Collections by Products</h3>
            <div className="space-y-3">
              {data.top_collections.map((c, i) => {
                const max = data.top_collections[0]?.product_count || 1;
                const pct = Math.round((c.product_count / max) * 100);
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-[10px] text-ink-400 w-4 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-ink-700 dark:text-ink-200 truncate">{c.name}</span>
                        <span className="text-xs text-ink-400 ml-2 flex-shrink-0">{c.product_count} products</span>
                      </div>
                      <div className="h-1.5 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gold-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
