import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { customersAPI } from '../services/api';
import { Users, Search, Download, Phone, Mail, ChevronLeft, ChevronRight, X, MessageCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [importing, setImporting] = useState(false);
  const limit = 20;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const r = await customersAPI.list({ page: p, limit, search: search || undefined });
      setCustomers(r.data?.data || []);
      setTotal(r.data?.total || 0);
    } catch { setCustomers([]); }
    setLoading(false);
  };

  useEffect(() => { load(1); }, []);

  const handleImport = async () => {
    setImporting(true);
    try {
      const r = await customersAPI.importFromEnquiries();
      toast.success(r.data?.message || 'Import complete');
      load(1);
    } catch (e) { toast.error('Import failed'); }
    setImporting(false);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Topbar title="Customers" subtitle={`${total} customers`}
        actions={
          <button onClick={handleImport} disabled={importing}
            className="btn-gold flex items-center gap-1.5 text-xs">
            <Download size={14} /> {importing ? 'Importing…' : 'Import from enquiries'}
          </button>
        } />

      <div className="flex-1 overflow-y-auto p-5">
        {/* Search */}
        <div className="relative max-w-sm mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(1)}
            placeholder="Search by name, phone, email…"
            className="input-field pl-9 py-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* List */}
          <div className="lg:col-span-2">
            <div className="card">
              {loading ? (
                <div className="p-8 text-center text-xs text-ink-400">Loading…</div>
              ) : customers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users size={28} className="mx-auto text-ink-300 mb-3" />
                  <p className="text-sm text-ink-400 mb-2">No customers yet</p>
                  <p className="text-xs text-ink-300">Click "Import from enquiries" to create customer profiles from your enquiry data</p>
                </div>
              ) : customers.map((c, i) => (
                <div key={c.id} onClick={() => setSelected(c)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors ${i < customers.length - 1 ? 'border-b border-ink-100 dark:border-ink-800' : ''} ${selected?.id === c.id ? 'bg-gold-50/50 dark:bg-gold-900/10' : ''}`}>
                  <div className="w-9 h-9 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center flex-shrink-0 text-gold-600 dark:text-gold-400 font-semibold text-sm">
                    {(c.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-700 dark:text-ink-200 truncate">{c.name || 'Unknown'}</div>
                    <div className="text-xs text-ink-400">{c.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-ink-500">{c.country_code}</div>
                    {(c.enquiry_count > 0 || c.appointment_count > 0) && (
                      <div className="flex gap-1 justify-end mt-0.5">
                        {c.enquiry_count > 0 && <span className="text-[10px] text-blue-500">{c.enquiry_count} enq</span>}
                        {c.appointment_count > 0 && <span className="text-[10px] text-purple-500">{c.appointment_count} appt</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-ink-400">Page {page} of {totalPages}</span>
                <div className="flex gap-1">
                  <button onClick={() => { setPage(p => p-1); load(page-1); }} disabled={page === 1}
                    className="btn-ghost disabled:opacity-30 p-1.5"><ChevronLeft size={14} /></button>
                  <button onClick={() => { setPage(p => p+1); load(page+1); }} disabled={page >= totalPages}
                    className="btn-ghost disabled:opacity-30 p-1.5"><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div>
            {selected ? (
              <div className="card p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center text-gold-600 font-bold text-lg">
                      {(selected.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink-800 dark:text-ink-100">{selected.name || 'Unknown'}</h3>
                      <p className="text-xs text-ink-400">{selected.country_code}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400">
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {selected.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-ink-400" />
                      <a href={`tel:${selected.phone}`} className="text-ink-600 dark:text-ink-300 hover:text-gold-500">{selected.phone}</a>
                    </div>
                  )}
                  {selected.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-ink-400" />
                      <a href={`mailto:${selected.email}`} className="text-ink-600 dark:text-ink-300 hover:text-gold-500 truncate">{selected.email}</a>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <a href={`https://wa.me/${selected.phone?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition-colors">
                    <MessageCircle size={13} /> WhatsApp
                  </a>
                  <button onClick={() => window.location.href = `/enquiries`}
                    className="flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors">
                    <MessageCircle size={13} /> Enquiries
                  </button>
                </div>

                {selected.notes && (
                  <div className="bg-ink-50 dark:bg-ink-800 rounded-lg p-3 text-xs text-ink-500">
                    {selected.notes}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-800">
                  <p className="text-[10px] text-ink-400">
                    Added {new Date(selected.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <Users size={24} className="mx-auto text-ink-300 mb-2" />
                <p className="text-xs text-ink-400">Select a customer to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
