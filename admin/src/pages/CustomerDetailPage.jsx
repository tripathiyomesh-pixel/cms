/**
 * VANTIX-CMS Admin — Customer Detail Page
 * Accessed via /customers/:id
 * Shows: profile, activity timeline, notes, linked enquiries/orders
 */
import { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate, Link } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { crmAPI, customersAPI, ordersAPI } from '../services/api';
import api from '../services/api';
import {
  ArrowLeft, Phone, Mail, MessageCircle, Calendar, ShoppingBag,
  FileText, Plus, Trash2, Pin, Edit2, Clock, RefreshCw, X,
  ChevronRight, Globe, MapPin, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Activity type config ──────────────────────────────────────
const ACTIVITY_CONFIG = {
  enquiry:     { emoji: '💬', color: 'bg-blue-100 dark:bg-blue-900/30',   label: 'Enquiry'     },
  appointment: { emoji: '📅', color: 'bg-purple-100 dark:bg-purple-900/30', label: 'Appointment' },
  order:       { emoji: '🛒', color: 'bg-green-100 dark:bg-green-900/30',  label: 'Order'       },
  note:        { emoji: '📝', color: 'bg-amber-100 dark:bg-amber-900/30',  label: 'Note'        },
  call:        { emoji: '📞', color: 'bg-ink-100 dark:bg-ink-800',         label: 'Call'        },
  email:       { emoji: '✉️', color: 'bg-ink-100 dark:bg-ink-800',         label: 'Email'       },
  whatsapp:    { emoji: '💚', color: 'bg-green-50 dark:bg-green-900/20',   label: 'WhatsApp'    },
  visit:       { emoji: '🏪', color: 'bg-amber-50 dark:bg-amber-900/20',   label: 'Visit'       },
};

const LOG_TYPES = ['call', 'email', 'whatsapp', 'visit', 'note'];

const timeAgo = (d) => {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(d).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function CustomerDetailPage() {
  const { id }                            = useParams();
  const { collapsed, toggleSidebar }      = useOutletContext();
  const navigate                          = useNavigate();

  const [customer,    setCustomer]        = useState(null);
  const [timeline,    setTimeline]        = useState([]);
  const [notes,       setNotes]           = useState([]);
  const [enquiries,   setEnquiries]       = useState([]);
  const [orders,      setOrders]          = useState([]);
  const [loading,     setLoading]         = useState(true);
  const [activeTab,   setActiveTab]       = useState('timeline');

  // Note form
  const [noteText,    setNoteText]        = useState('');
  const [addingNote,  setAddingNote]      = useState(false);
  const [notePin,     setNotePin]         = useState(false);

  // Activity log form
  const [logOpen,     setLogOpen]         = useState(false);
  const [logForm,     setLogForm]         = useState({ type: 'call', title: '', description: '' });
  const [logging,     setLogging]         = useState(false);

  // Load all data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [custR, timelineR, notesR] = await Promise.all([
          api.get(`/customers/${id}`),
          crmAPI.timeline(id),
          crmAPI.notes(id),
        ]);
        setCustomer(custR.data.data);
        setTimeline(timelineR.data.data || []);
        setNotes(notesR.data.data || []);

        // Load enquiries and orders linked to this customer
        const phone = custR.data.data?.phone;
        const email = custR.data.data?.email;
        if (phone || email) {
          const [enqR, ordR] = await Promise.all([
            api.get('/enquiries', { params: { phone: phone || undefined, limit: 10 } }).catch(() => ({ data: { data: [] } })),
            api.get('/orders', { params: { search: phone || email || '', limit: 10 } }).catch(() => ({ data: { data: [] } })),
          ]);
          setEnquiries(enqR.data.data || []);
          setOrders(ordR.data.data || []);
        }
      } catch (e) {
        toast.error('Failed to load customer');
        navigate('/customers');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  // Add note
  const addNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const r = await crmAPI.addNote(id, { content: noteText.trim(), is_pinned: notePin });
      setNotes(n => [r.data.data, ...n]);
      setTimeline(t => [{ type: 'note', title: 'Note added', occurred_at: new Date().toISOString(), user_name: 'You' }, ...t]);
      setNoteText('');
      setNotePin(false);
      toast.success('Note saved');
    } catch { toast.error('Failed'); }
    setAddingNote(false);
  };

  // Delete note
  const deleteNote = async (noteId) => {
    try {
      await crmAPI.deleteNote(id, noteId);
      setNotes(n => n.filter(x => x.id !== noteId));
    } catch { toast.error('Failed'); }
  };

  // Toggle pin note
  const togglePin = async (note) => {
    try {
      const r = await crmAPI.updateNote(id, note.id, { is_pinned: !note.is_pinned });
      setNotes(n => n.map(x => x.id === note.id ? r.data.data : x).sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0)));
    } catch { toast.error('Failed'); }
  };

  // Log activity
  const logActivity = async () => {
    if (!logForm.title.trim()) return toast.error('Title required');
    setLogging(true);
    try {
      const r = await crmAPI.logActivity(id, logForm);
      setTimeline(t => [r.data.data, ...t]);
      setLogForm({ type: 'call', title: '', description: '' });
      setLogOpen(false);
      toast.success('Activity logged');
    } catch { toast.error('Failed'); }
    setLogging(false);
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Customer" collapsed={collapsed} toggleSidebar={toggleSidebar}/>
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw size={20} className="animate-spin text-ink-400"/>
      </div>
    </div>
  );

  if (!customer) return null;

  const TABS = [
    { key: 'timeline', label: `Timeline (${timeline.length})` },
    { key: 'notes',    label: `Notes (${notes.length})` },
    { key: 'enquiries',label: `Enquiries (${enquiries.length})` },
    { key: 'orders',   label: `Orders (${orders.length})` },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Customer Detail"
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        actions={
          <Link to="/customers" className="btn-ghost flex items-center gap-1.5 text-xs">
            <ArrowLeft size={13}/> All Customers
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-6">

          {/* Profile card */}
          <div className="card p-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 text-white text-xl font-bold shadow-md">
                {(customer.name || '?').charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-ink-800 dark:text-ink-100">{customer.name}</h2>
                <div className="flex flex-wrap gap-4 mt-2">
                  {customer.phone && (
                    <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-700 transition-colors">
                      <Phone size={12}/> {customer.phone}
                    </a>
                  )}
                  {customer.email && (
                    <a href={`mailto:${customer.email}`} className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-700 transition-colors">
                      <Mail size={12}/> {customer.email}
                    </a>
                  )}
                  {customer.phone && (
                    <a href={`https://wa.me/${customer.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 transition-colors">
                      <MessageCircle size={12}/> WhatsApp
                    </a>
                  )}
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="text-center">
                    <p className="text-xs font-bold text-ink-700 dark:text-ink-200">{customer.enquiry_count || 0}</p>
                    <p className="text-[10px] text-ink-400">Enquiries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-ink-700 dark:text-ink-200">{customer.appointment_count || 0}</p>
                    <p className="text-[10px] text-ink-400">Appointments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-ink-700 dark:text-ink-200">{orders.length}</p>
                    <p className="text-[10px] text-ink-400">Orders</p>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex flex-col gap-2">
                <button onClick={() => setLogOpen(true)}
                  className="btn-primary text-xs flex items-center gap-1.5">
                  <Plus size={12}/> Log Activity
                </button>
                <button onClick={() => setActiveTab('notes')}
                  className="btn-ghost text-xs flex items-center gap-1.5">
                  <FileText size={12}/> Add Note
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-ink-200 dark:border-ink-700">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === t.key
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TIMELINE ── */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              {timeline.length === 0 ? (
                <div className="card p-10 text-center">
                  <p className="text-3xl mb-3">📋</p>
                  <p className="text-sm text-ink-500">No activity yet</p>
                  <button onClick={() => setLogOpen(true)} className="btn-primary text-xs mt-3">Log first activity</button>
                </div>
              ) : timeline.map((event, i) => {
                const ac = ACTIVITY_CONFIG[event.type] || ACTIVITY_CONFIG.note;
                return (
                  <div key={event.id || i} className="flex gap-3">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${ac.color}`}>
                        {ac.emoji}
                      </div>
                      {i < timeline.length - 1 && <div className="w-px flex-1 bg-ink-100 dark:bg-ink-800 mt-1.5"/>}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-medium text-ink-700 dark:text-ink-200">{event.title}</span>
                          {event.user_name && (
                            <span className="text-[10px] text-ink-400 ml-2">by {event.user_name}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-ink-300 flex-shrink-0">{timeAgo(event.occurred_at)}</span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-ink-500 mt-1 leading-relaxed">{event.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── NOTES ── */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add note form */}
              <div className="card p-4 space-y-3">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  rows={3}
                  placeholder="Add a note about this customer…"
                  className="input w-full resize-none"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-ink-500 cursor-pointer">
                    <input type="checkbox" checked={notePin} onChange={e => setNotePin(e.target.checked)} className="rounded"/>
                    Pin this note
                  </label>
                  <button onClick={addNote} disabled={addingNote || !noteText.trim()} className="btn-primary text-xs">
                    {addingNote ? 'Saving…' : 'Save Note'}
                  </button>
                </div>
              </div>

              {/* Notes list */}
              {notes.length === 0 ? (
                <p className="text-sm text-ink-400 text-center py-8">No notes yet.</p>
              ) : notes.map(note => (
                <div key={note.id} className={`card p-4 ${note.is_pinned ? 'border-brand-300 dark:border-brand-700 bg-brand-50/30 dark:bg-brand-900/10' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-ink-700 dark:text-ink-200 leading-relaxed flex-1">{note.content}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => togglePin(note)} title={note.is_pinned ? 'Unpin' : 'Pin'}
                        className={`p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors ${note.is_pinned ? 'text-brand-500' : 'text-ink-300'}`}>
                        <Pin size={11}/>
                      </button>
                      <button onClick={() => deleteNote(note.id)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-300 hover:text-red-500 transition-colors">
                        <Trash2 size={11}/>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {note.is_pinned && <span className="text-[9px] bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-full font-medium">Pinned</span>}
                    <span className="text-[10px] text-ink-300">{note.user_name} · {timeAgo(note.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ENQUIRIES ── */}
          {activeTab === 'enquiries' && (
            <div className="card overflow-hidden p-0">
              {enquiries.length === 0 ? (
                <div className="p-10 text-center text-sm text-ink-400">No enquiries linked</div>
              ) : enquiries.map((e, i) => (
                <div key={e.id} className={`flex items-center gap-4 px-4 py-3 ${i < enquiries.length - 1 ? 'border-b border-ink-100 dark:border-ink-800' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-sm flex-shrink-0">💬</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-ink-700 dark:text-ink-200 truncate">{e.product_name || 'General enquiry'}</p>
                    <p className="text-[10px] text-ink-400">{e.message?.substring(0, 80) || '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${e.status === 'replied' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{e.status || 'new'}</span>
                    <p className="text-[10px] text-ink-300 mt-0.5">{timeAgo(e.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeTab === 'orders' && (
            <div className="card overflow-hidden p-0">
              {orders.length === 0 ? (
                <div className="p-10 text-center text-sm text-ink-400">No orders found</div>
              ) : orders.map((o, i) => (
                <div key={o.id} className={`flex items-center gap-4 px-4 py-3 ${i < orders.length - 1 ? 'border-b border-ink-100 dark:border-ink-800' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-sm flex-shrink-0">🛒</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold font-mono text-ink-700 dark:text-ink-200">{o.order_number}</p>
                    <p className="text-[10px] text-ink-400">{o.currency} {Number(o.total_amount || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-500 capitalize">{o.status}</span>
                    <p className="text-[10px] text-ink-300 mt-0.5">{timeAgo(o.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Log Activity Modal */}
      {logOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Log Activity</h3>
              <button onClick={() => setLogOpen(false)} className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800">
                <X size={14} className="text-ink-400"/>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Activity Type</label>
                <div className="flex flex-wrap gap-2">
                  {LOG_TYPES.map(t => (
                    <button key={t} onClick={() => setLogForm(f => ({ ...f, type: t }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                        logForm.type === t
                          ? 'bg-brand-500 text-white'
                          : 'bg-ink-100 dark:bg-ink-800 text-ink-500 hover:bg-ink-200'
                      }`}>
                      {ACTIVITY_CONFIG[t]?.emoji} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Title <span className="text-red-500">*</span></label>
                <input value={logForm.title} onChange={e => setLogForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={`e.g. Called to follow up on engagement ring enquiry`}
                  className="input w-full"/>
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea value={logForm.description} onChange={e => setLogForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className="input w-full resize-none" placeholder="What was discussed…"/>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setLogOpen(false)} className="btn-ghost text-sm">Cancel</button>
              <button onClick={logActivity} disabled={logging} className="btn-primary text-sm">
                {logging ? 'Saving…' : 'Log Activity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
