import { useState, useEffect } from 'react';
import Topbar from '../components/layout/Topbar';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { jewelleryAPI } from '../services/api';
import { X, ChevronLeft, ChevronRight, RefreshCw, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
  { value: '',            label: 'All' },
  { value: 'pending',     label: 'Pending' },
  { value: 'confirmed',   label: 'Confirmed' },
  { value: 'completed',   label: 'Completed' },
  { value: 'cancelled',   label: 'Cancelled' },
];

const STATUS_DOT = {
  pending:   'bg-amber-400',
  confirmed: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-ink-400',
  no_show:   'bg-red-500',
};

export default function AppointmentsAdminPage() {
  const [appts, setAppts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ today: [], upcoming: [] });
  const limit = 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filter) params.status = filter;
      if (dateFilter) params.date = dateFilter;
      const r = await jewelleryAPI.getAppointments(params);
      setAppts(r.data?.data?.data || []);
      setTotal(r.data?.data?.total || 0);
    } catch { toast.error('Failed to load appointments'); }
    setLoading(false);
  };

  const loadSummary = async () => {
    try {
      const r = await jewelleryAPI.getAppointmentSummary();
      setSummary(r.data?.data || { today: [], upcoming: [] });
    } catch { /* non-fatal */ }
  };

  useEffect(() => { load(); loadSummary(); }, [filter, dateFilter, page]);

  const updateStatus = async (id, status) => {
    try {
      await jewelleryAPI.updateAppt(id, { status });
      toast.success(`Marked as ${status}`);
      load();
      if (selected?.id === id) setSelected(a => ({ ...a, status }));
    } catch { toast.error('Update failed'); }
  };

  const todayCount      = summary.today?.reduce((acc, r) => acc + parseInt(r.count || 0), 0) || 0;
  const confirmedToday  = summary.today?.find(r => r.status === 'confirmed')?.count || 0;
  const pendingCount    = summary.today?.find(r => r.status === 'pending')?.count || 0;

  return (
    <div className="min-h-full bg-ink-50 dark:bg-ink-900">
      <Topbar
        title="Appointments"
        subtitle="Boutique visit bookings"
        actions={
          <button onClick={() => { load(); loadSummary(); }} className="btn-ghost flex items-center gap-1.5">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        }
      />

      <div className="p-5 space-y-4">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Today's bookings",     value: todayCount,     color: 'text-gold-600' },
            { label: 'Confirmed today',      value: confirmedToday, color: 'text-green-600' },
            { label: 'Pending confirmation', value: pendingCount,   color: 'text-amber-600' },
            { label: 'Total all time',       value: total,          color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className="text-[11px] text-ink-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Upcoming confirmed */}
        {summary.upcoming?.length > 0 && (
          <div className="card p-4 border-gold-200 dark:border-gold-800">
            <p className="text-xs font-semibold text-gold-600 dark:text-gold-400 mb-3">Upcoming confirmed appointments</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {summary.upcoming.map(a => (
                <div key={a.id} className="bg-ink-50 dark:bg-ink-700/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-ink-700 dark:text-ink-200 truncate">{a.customer_name}</p>
                  <p className="text-[11px] text-gold-600 dark:text-gold-400 mt-0.5">
                    {new Date(a.preferred_date).toLocaleDateString('en-AE', { day: 'numeric', month: 'short' })} · {a.preferred_time}
                  </p>
                  <p className="text-[10px] text-ink-400 truncate">{a.location_name || 'Any boutique'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 bg-white dark:bg-ink-800 border border-ink-200/60 dark:border-ink-700 rounded-lg p-1">
            {STATUS_FILTERS.map(s => (
              <button
                key={s.value}
                onClick={() => { setFilter(s.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === s.value
                    ? 'bg-gold-500 text-white'
                    : 'text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-700 dark:text-ink-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={e => { setDateFilter(e.target.value); setPage(1); }}
            className="input-field py-1.5 text-xs w-36 ml-auto"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-xs text-red-500 hover:underline">
              Clear date
            </button>
          )}
        </div>

        {/* Content: list + detail */}
        <div className={`grid gap-4 ${selected ? 'grid-cols-1 lg:grid-cols-[1fr_380px]' : 'grid-cols-1'}`}>
          {/* Appointment list */}
          <div className="card overflow-hidden">
            {loading ? (
              <SkeletonLoader count={8} />
            ) : appts.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No appointments found"
                message="Appointments booked through your website appear here."
              />
            ) : (
              <div className="divide-y divide-ink-50 dark:divide-ink-800">
                {appts.map(a => (
                  <div
                    key={a.id}
                    onClick={() => setSelected(s => s?.id === a.id ? null : a)}
                    className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors ${
                      selected?.id === a.id
                        ? 'bg-gold-50 dark:bg-gold-900/10 border-l-2 border-gold-500'
                        : 'hover:bg-ink-50 dark:hover:bg-ink-800/50 border-l-2 border-transparent'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[a.status] || 'bg-ink-300'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink-700 dark:text-ink-200 truncate">{a.customer_name}</p>
                        {a.party_size > 1 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-ink-400">
                            <Users size={10} /> {a.party_size}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-400 truncate">
                        {a.purpose || 'Appointment'}{a.location_name ? ` · ${a.location_name}` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <p className="text-xs font-medium text-gold-600 dark:text-gold-400">
                        {new Date(a.preferred_date).toLocaleDateString('en-AE', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-[10px] text-ink-400">{a.preferred_time}</p>
                    </div>
                    <StatusBadge status={a.status} />
                    {a.status === 'pending' && (
                      <button
                        onClick={e => { e.stopPropagation(); updateStatus(a.id, 'confirmed'); }}
                        className="flex-shrink-0 text-[10px] px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold hover:bg-green-100 transition-colors"
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-ink-100 dark:border-ink-800">
                <span className="text-[11px] text-ink-400">
                  Page {page} of {totalPages} · {total} appointments
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-ghost p-1.5 disabled:opacity-30">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-ghost p-1.5 disabled:opacity-30">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="card p-5 h-fit sticky top-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">{selected.customer_name}</h3>
                  {selected.booking_ref && (
                    <p className="text-[11px] font-mono text-gold-600 dark:text-gold-400 mt-0.5">{selected.booking_ref}</p>
                  )}
                </div>
                <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400">
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  ['Date',     `${new Date(selected.preferred_date).toLocaleDateString('en-AE', { weekday: 'long', day: 'numeric', month: 'long' })} at ${selected.preferred_time}`],
                  ['Location', selected.location_name || 'Any boutique'],
                  ['Purpose',  selected.purpose],
                  ['Phone',    selected.customer_phone],
                  selected.customer_email ? ['Email', selected.customer_email] : null,
                  selected.party_size > 1 ? ['Party', `${selected.party_size} people`] : null,
                  selected.product_name ? ['Product', selected.product_name] : null,
                  selected.special_requests ? ['Notes', selected.special_requests] : null,
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-ink-400 w-20 flex-shrink-0">{k}</span>
                    <span className="text-ink-700 dark:text-ink-200 font-medium">{v}</span>
                  </div>
                ))}
              </div>

              {selected.customer_phone && (
                <a
                  href={`https://wa.me/${selected.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${selected.customer_name}! Your appointment is confirmed for ${selected.preferred_date} at ${selected.preferred_time}. Booking ref: ${selected.booking_ref || ''}. We look forward to seeing you.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors"
                >
                  💬 Confirm via WhatsApp
                </a>
              )}

              <div>
                <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wide mb-2">Update status</p>
                <div className="grid grid-cols-2 gap-2">
                  {['pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all capitalize ${
                        selected.status === s
                          ? 'bg-gold-500 border-gold-500 text-white'
                          : 'bg-transparent border-ink-200 dark:border-ink-600 text-ink-500 dark:text-ink-400 hover:border-gold-400 hover:text-gold-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
