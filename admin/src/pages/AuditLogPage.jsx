import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { auditAPI } from '../services/api';
import { Shield, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const ACTION_COLORS = {
  CREATE: 'bg-green-50 dark:bg-green-900/20 text-green-600',
  UPDATE: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
  DELETE: 'bg-red-50 dark:bg-red-900/20 text-red-500',
  LOGIN:  'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
};

export default function AuditLogPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filters, setFilters] = useState({ resource: '', action: '' });
  const limit = 50;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const r = await auditAPI.list({ page: p, limit, ...filters });
      setLogs(r.data?.data || []);
      setTotal(r.data?.total || 0);
    } catch { setLogs([]); }
    setLoading(false);
  };

  useEffect(() => { load(1); }, [filters]);

  const totalPages = Math.ceil(total / limit);

  const RESOURCES = ['product','category','collection','user','banner','order','enquiry','appointment','setting'];
  const ACTIONS   = ['CREATE','UPDATE','DELETE','LOGIN'];

  return (
    <>
      <Topbar title="Audit log" subtitle={`${total} events recorded`}
        collapsed={collapsed} onToggle={toggleSidebar} />

      <div className="flex-1 overflow-y-auto p-5">
        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <select value={filters.resource} onChange={e => setFilters(f => ({...f, resource: e.target.value}))}
            className="input-field w-40 py-2 text-xs">
            <option value="">All resources</option>
            {RESOURCES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filters.action} onChange={e => setFilters(f => ({...f, action: e.target.value}))}
            className="input-field w-36 py-2 text-xs">
            <option value="">All actions</option>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {(filters.resource || filters.action) && (
            <button onClick={() => setFilters({ resource: '', action: '' })}
              className="text-xs text-ink-400 hover:text-red-500 px-3 py-2 rounded-lg border border-ink-200 dark:border-ink-700">
              Clear filters
            </button>
          )}
          <span className="ml-auto text-xs text-ink-400 self-center">{total} events</span>
        </div>

        <div className="card">
          {loading ? (
            <div className="p-8 text-center text-xs text-ink-400">Loading…</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <Shield size={28} className="mx-auto text-ink-300 mb-3" />
              <p className="text-sm text-ink-400">No audit events found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-ink-200/60 dark:border-ink-700">
                    {['Time','User','Action','Resource','IP','Details'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-medium text-ink-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                  {logs.map((log, i) => (
                    <>
                      <tr key={log.id} onClick={() => setExpanded(expanded === i ? null : i)}
                        className="hover:bg-ink-50 dark:hover:bg-ink-800/50 cursor-pointer transition-colors">
                        <td className="px-4 py-2.5 text-ink-400 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('en-AE', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-ink-700 dark:text-ink-200">{log.user_name || '—'}</div>
                          <div className="text-[10px] text-ink-400 truncate max-w-[120px]">{log.user_email}</div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || 'bg-ink-100 text-ink-500'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-ink-600 dark:text-ink-300">
                          {log.resource}
                          {log.resource_id && <span className="text-ink-400 ml-1 text-[10px] font-mono">#{log.resource_id?.slice(0,8)}</span>}
                        </td>
                        <td className="px-4 py-2.5 text-ink-400 font-mono">{log.ip_address || '—'}</td>
                        <td className="px-4 py-2.5 text-ink-400">
                          {log.new_data || log.old_data ? (
                            <span className="text-gold-500 text-[10px] hover:underline">View diff</span>
                          ) : '—'}
                        </td>
                      </tr>
                      {expanded === i && (log.new_data || log.old_data) && (
                        <tr key={`${log.id}-detail`}>
                          <td colSpan={6} className="px-4 pb-3">
                            <div className="grid grid-cols-2 gap-3">
                              {log.old_data && (
                                <div>
                                  <p className="text-[10px] text-red-500 font-medium mb-1">Before</p>
                                  <pre className="text-[10px] bg-red-50 dark:bg-red-900/10 rounded p-2 overflow-x-auto text-ink-600 dark:text-ink-400">
                                    {JSON.stringify(log.old_data, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.new_data && (
                                <div>
                                  <p className="text-[10px] text-green-500 font-medium mb-1">After</p>
                                  <pre className="text-[10px] bg-green-50 dark:bg-green-900/10 rounded p-2 overflow-x-auto text-ink-600 dark:text-ink-400">
                                    {JSON.stringify(log.new_data, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-ink-400">Page {page} of {totalPages} ({total} events)</span>
            <div className="flex gap-1">
              <button onClick={() => { setPage(p=>p-1); load(page-1); }} disabled={page===1} className="btn-ghost disabled:opacity-30 p-1.5"><ChevronLeft size={14} /></button>
              <button onClick={() => { setPage(p=>p+1); load(page+1); }} disabled={page>=totalPages} className="btn-ghost disabled:opacity-30 p-1.5"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
