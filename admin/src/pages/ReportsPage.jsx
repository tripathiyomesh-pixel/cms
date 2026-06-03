/**
 * VANTIX-CMS Admin — Reports Page
 * Revenue · Enquiries · Appointments · CRM Pipeline · Customers
 * All tabs support CSV download.
 */
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import api from '../services/api';
import {
  Download, RefreshCw, TrendingUp, TrendingDown,
  DollarSign, MessageCircle, Calendar, Target, Users,
  BarChart2, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'revenue',      label: 'Revenue',       icon: DollarSign  },
  { key: 'enquiries',    label: 'Enquiries',      icon: MessageCircle },
  { key: 'appointments', label: 'Appointments',   icon: Calendar    },
  { key: 'crm',          label: 'CRM Pipeline',   icon: Target      },
  { key: 'customers',    label: 'Customers',      icon: Users       },
];

const DAYS_OPTIONS = [
  { value: 30,  label: 'Last 30 days' },
  { value: 60,  label: 'Last 60 days' },
  { value: 90,  label: 'Last 90 days' },
  { value: 180, label: 'Last 6 months' },
  { value: 365, label: 'Last year' },
];

// ── Mini bar chart ─────────────────────────────────────────────────────────
function MiniBar({ value, max, color = '#b8860b', height = 40 }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height, justifyContent: 'center' }}>
      <div style={{
        width: '80%', borderRadius: '3px 3px 0 0',
        height: `${Math.max(pct, value > 0 ? 6 : 0)}%`,
        background: color, opacity: 0.85, transition: 'height 0.4s ease',
      }}/>
    </div>
  );
}

// ── Stat chip ──────────────────────────────────────────────────────────────
function Chip({ label, value, color = 'text-ink-700 dark:text-ink-200', sub }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-xs text-ink-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-ink-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Stage pill ─────────────────────────────────────────────────────────────
const STAGE_COLORS = {
  new: 'bg-ink-100 text-ink-600', contacted: 'bg-blue-50 text-blue-600',
  qualified: 'bg-purple-50 text-purple-600', proposal: 'bg-amber-50 text-amber-600',
  won: 'bg-green-50 text-green-700', lost: 'bg-red-50 text-red-500',
};

export default function ReportsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [tab,     setTab]     = useState('revenue');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [days,    setDays]    = useState(90);
  const [year,    setYear]    = useState(new Date().getFullYear());

  const load = useCallback(async () => {
    setLoading(true);
    setData(null);
    try {
      const params = tab === 'revenue'
        ? { year }
        : { days };
      const r = await api.get(`/reports/${tab}`, { params });
      setData(r.data.data);
    } catch (e) {
      toast.error('Failed to load report');
    }
    setLoading(false);
  }, [tab, days, year]);

  useEffect(() => { load(); }, [load]);

  const downloadCSV = async () => {
    const params = tab === 'revenue' ? { year, format: 'csv' } : { days, format: 'csv' };
    const qs = new URLSearchParams(params).toString();
    const url = `${import.meta.env.VITE_API_URL || '/api'}/reports/${tab}?${qs}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tab}-report.csv`;
    link.click();
  };

  const fmt = (n) => n !== undefined && n !== null
    ? `AED ${Number(n).toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : '—';

  const num = (n) => n !== undefined && n !== null ? Number(n).toLocaleString() : '—';

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Reports"
        subtitle="Revenue · Enquiries · Appointments · CRM · Customers"
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        actions={
          <button onClick={downloadCSV} className="btn-ghost flex items-center gap-1.5 text-xs">
            <Download size={13}/> Export CSV
          </button>
        }
      />

      {/* Tab bar + controls */}
      <div className="flex items-center justify-between px-6 pt-4 border-b border-ink-200 dark:border-ink-700 flex-wrap gap-3">
        <div className="flex gap-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                  tab === t.key
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'
                }`}>
                <Icon size={12}/>{t.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pb-3">
          {tab === 'revenue' ? (
            <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="input text-xs py-1.5 w-28">
              {(data?.available_years || [year]).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          ) : (
            <select value={days} onChange={e => setDays(parseInt(e.target.value))} className="input text-xs py-1.5 w-36">
              {DAYS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
          <button onClick={load} disabled={loading} className="btn-ghost p-2">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw size={20} className="animate-spin text-ink-400"/>
          </div>
        ) : !data ? null : (

          <>
            {/* ── REVENUE ── */}
            {tab === 'revenue' && (
              <div className="space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Chip label="Total Revenue"    value={fmt(data.totals?.total_revenue)} color="text-brand-600"/>
                  <Chip label="Total Orders"     value={num(data.totals?.total_orders)}/>
                  <Chip label="Avg Order Value"  value={fmt(data.totals?.avg_order_value)}/>
                  <Chip label="VAT Collected"    value={fmt(data.totals?.total_tax)} color="text-amber-600"/>
                </div>

                {/* Monthly bar chart */}
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Monthly Revenue — {year}</h3>
                  {data.monthly.length === 0 ? (
                    <p className="text-sm text-ink-400 py-8 text-center">No orders in {year}</p>
                  ) : (
                    <>
                      <div className="flex gap-1 items-end" style={{ height: 120 }}>
                        {data.monthly.map((m, i) => {
                          const max = Math.max(...data.monthly.map(x => Number(x.revenue)), 1);
                          return (
                            <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group" title={`${m.month_label}: ${fmt(m.revenue)}`}>
                              <div className="text-[8px] text-ink-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {fmt(m.revenue)}
                              </div>
                              <MiniBar value={Number(m.revenue)} max={max} height={90}/>
                              <span className="text-[8px] text-ink-400 mt-1">{m.month_label?.split(' ')[0]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Monthly table */}
                <div className="card overflow-hidden p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-100 dark:border-ink-800">
                        {['Month', 'Orders', 'Subtotal', 'VAT', 'Revenue', 'Delivered', 'Cancelled'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.monthly.length === 0 ? (
                        <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-400">No data for {year}</td></tr>
                      ) : data.monthly.map((m, i) => (
                        <tr key={m.month} className="border-b border-ink-100 dark:border-ink-800 hover:bg-ink-50/50 dark:hover:bg-ink-800/30">
                          <td className="px-4 py-3 text-xs font-medium text-ink-700 dark:text-ink-200">{m.month_label}</td>
                          <td className="px-4 py-3 text-xs text-ink-600 dark:text-ink-300">{num(m.order_count)}</td>
                          <td className="px-4 py-3 text-xs text-ink-600 dark:text-ink-300">{fmt(m.subtotal)}</td>
                          <td className="px-4 py-3 text-xs text-ink-600 dark:text-ink-300">{fmt(m.tax)}</td>
                          <td className="px-4 py-3 text-xs font-bold text-brand-600 dark:text-brand-400">{fmt(m.revenue)}</td>
                          <td className="px-4 py-3 text-xs text-green-600">{num(m.delivered)}</td>
                          <td className="px-4 py-3 text-xs text-red-500">{num(m.cancelled)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── ENQUIRIES ── */}
            {tab === 'enquiries' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Chip label="Total"      value={num(data.totals?.total)}/>
                  <Chip label="Replied"    value={num(data.totals?.replied)}   color="text-blue-600"/>
                  <Chip label="Converted"  value={num(data.totals?.converted)} color="text-green-600"/>
                  <Chip label="WhatsApp"   value={num(data.totals?.whatsapp)}  color="text-green-600"/>
                  <Chip label="Form"       value={num(data.totals?.form)}/>
                </div>

                {/* Top enquired products */}
                {data.top_products?.length > 0 && (
                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Top Enquired Products</h3>
                    <div className="space-y-2">
                      {data.top_products.map((p, i) => {
                        const max = data.top_products[0]?.enquiry_count || 1;
                        const pct = Math.round((p.enquiry_count / max) * 100);
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-[10px] text-ink-400 w-4 flex-shrink-0">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-ink-700 dark:text-ink-200 truncate">{p.product_name}</span>
                                <span className="text-xs font-bold text-ink-700 dark:text-ink-200 ml-2 flex-shrink-0">{p.enquiry_count}</span>
                              </div>
                              <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full">
                                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }}/>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Daily table */}
                <div className="card overflow-hidden p-0">
                  <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-ink-700 dark:text-ink-200">Daily Breakdown</h3>
                    <span className="text-xs text-ink-400">{data.daily.length} days</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white dark:bg-ink-900">
                        <tr className="border-b border-ink-100 dark:border-ink-800">
                          {['Date','Total','Replied','Converted','WhatsApp','Form'].map(h => (
                            <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-ink-400 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.daily.map((d, i) => (
                          <tr key={d.date} className="border-b border-ink-100 dark:border-ink-800 hover:bg-ink-50/50 dark:hover:bg-ink-800/30">
                            <td className="px-4 py-2 text-xs font-medium text-ink-700 dark:text-ink-200">{d.date_label || d.date}</td>
                            <td className="px-4 py-2 text-xs font-bold text-ink-700 dark:text-ink-200">{d.enquiries}</td>
                            <td className="px-4 py-2 text-xs text-blue-600">{d.replied}</td>
                            <td className="px-4 py-2 text-xs text-green-600">{d.converted}</td>
                            <td className="px-4 py-2 text-xs text-green-500">{d.whatsapp}</td>
                            <td className="px-4 py-2 text-xs text-ink-500">{d.form}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── APPOINTMENTS ── */}
            {tab === 'appointments' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-xl">
                  {data.daily.length > 0 && (
                    <>
                      <Chip label="Total Appointments" value={num(data.daily.reduce((s, d) => s + parseInt(d.total || 0), 0))}/>
                      <Chip label="Confirmed"          value={num(data.daily.reduce((s, d) => s + parseInt(d.confirmed || 0), 0))} color="text-blue-600"/>
                    </>
                  )}
                </div>

                {/* By purpose */}
                {data.by_purpose?.length > 0 && (
                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">By Purpose</h3>
                    <div className="space-y-2">
                      {data.by_purpose.map((p, i) => {
                        const max = data.by_purpose[0]?.count || 1;
                        const pct = Math.round((p.count / max) * 100);
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xs text-ink-700 dark:text-ink-200 w-40 flex-shrink-0 truncate capitalize">{p.purpose}</span>
                            <div className="flex-1 h-2 bg-ink-100 dark:bg-ink-800 rounded-full">
                              <div className="h-full bg-purple-400 rounded-full" style={{ width: `${pct}%` }}/>
                            </div>
                            <span className="text-xs font-bold text-ink-700 dark:text-ink-200 flex-shrink-0 w-8 text-right">{p.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {data.daily.length === 0 && (
                  <div className="card p-10 text-center text-sm text-ink-400">No appointments in this period</div>
                )}
              </div>
            )}

            {/* ── CRM PIPELINE ── */}
            {tab === 'crm' && (
              <div className="space-y-6">
                {/* Pipeline stages */}
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Pipeline Stages</h3>
                  <div className="space-y-3">
                    {data.pipeline?.map(s => {
                      const total = data.pipeline.reduce((sum, x) => sum + parseInt(x.count || 0), 1);
                      const pct = Math.round((s.count / total) * 100);
                      return (
                        <div key={s.stage} className="flex items-center gap-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-24 text-center flex-shrink-0 capitalize ${STAGE_COLORS[s.stage] || 'bg-ink-100 text-ink-600'}`}>
                            {s.stage}
                          </span>
                          <div className="flex-1 h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }}/>
                          </div>
                          <div className="flex items-center gap-3 w-52 flex-shrink-0 text-xs text-ink-600 dark:text-ink-300">
                            <span className="font-bold w-8">{s.count}</span>
                            <span className="text-brand-600 font-medium">{fmt(s.total_value)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* By source */}
                {data.by_source?.length > 0 && (
                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Leads by Source</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {data.by_source.map(s => (
                        <div key={s.source} className="text-center p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                          <p className="text-lg font-bold text-ink-700 dark:text-ink-200">{s.count}</p>
                          <p className="text-xs text-ink-400 capitalize">{s.source}</p>
                          {s.total_value > 0 && <p className="text-[10px] text-brand-600 mt-1">{fmt(s.total_value)}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent wins */}
                {data.recent_wins?.length > 0 && (
                  <div className="card overflow-hidden p-0">
                    <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-800">
                      <h3 className="text-xs font-semibold text-ink-700 dark:text-ink-200">Recent Wins 🏆</h3>
                    </div>
                    {data.recent_wins.map((w, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-ink-100 dark:border-ink-800 last:border-0">
                        <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-xs flex-shrink-0">🏆</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-ink-700 dark:text-ink-200">{w.name}</p>
                          <p className="text-[10px] text-ink-400 capitalize">{w.source}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {w.value && <p className="text-xs font-bold text-green-600">{fmt(w.value)}</p>}
                          <p className="text-[10px] text-ink-300">{w.converted_at ? new Date(w.converted_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short' }) : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CUSTOMERS ── */}
            {tab === 'customers' && (
              <div className="space-y-6">
                {/* Monthly growth */}
                {data.monthly_growth?.length > 0 && (
                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">New Customers per Month</h3>
                    <div className="flex gap-2 items-end" style={{ height: 100 }}>
                      {data.monthly_growth.map((m, i) => {
                        const max = Math.max(...data.monthly_growth.map(x => parseInt(x.new_customers)), 1);
                        return (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group" title={`${m.month_label}: ${m.new_customers} new`}>
                            <MiniBar value={parseInt(m.new_customers)} max={max} color="#3b82f6" height={80}/>
                            <span className="text-[8px] text-ink-400">{m.month_label?.split(' ')[0]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Top customers */}
                <div className="card overflow-hidden p-0">
                  <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-800">
                    <h3 className="text-xs font-semibold text-ink-700 dark:text-ink-200">Most Engaged Customers</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-100 dark:border-ink-800">
                        {['Customer', 'Phone', 'Enquiries', 'Appointments', 'Since'].map(h => (
                          <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-ink-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.top_customers?.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-400">No customers yet</td></tr>
                      ) : data.top_customers?.map((c, i) => (
                        <tr key={c.id} className="border-b border-ink-100 dark:border-ink-800 hover:bg-ink-50/50 dark:hover:bg-ink-800/30">
                          <td className="px-4 py-3 text-xs font-medium text-ink-700 dark:text-ink-200">{c.name}</td>
                          <td className="px-4 py-3 text-xs text-ink-500">{c.phone}</td>
                          <td className="px-4 py-3 text-xs font-bold text-blue-600">{c.enquiries}</td>
                          <td className="px-4 py-3 text-xs font-bold text-purple-600">{c.appointments}</td>
                          <td className="px-4 py-3 text-[10px] text-ink-400">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
