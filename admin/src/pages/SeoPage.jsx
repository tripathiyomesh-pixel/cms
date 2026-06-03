/**
 * VANTIX-CMS Admin — SEO Management Page
 * Redirect Manager · Robots.txt Editor · SMTP Test · Audit Tool
 */
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { Plus, Trash2, Edit2, CheckCircle, XCircle, Search,
         ExternalLink, AlertTriangle, RefreshCw, Mail, Shield,
         ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const TABS = ['Redirects', 'Robots.txt', 'SEO Audit', 'Email Settings'];

const emptyRedirect = { from_path: '', to_path: '', type: 301 };

export default function SeoPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [tab, setTab]               = useState(0);

  // ── Redirects ──────────────────────────────────────────────
  const [redirects, setRedirects]   = useState([]);
  const [rSearch, setRSearch]       = useState('');
  const [rLoading, setRLoading]     = useState(true);
  const [rModal, setRModal]         = useState(false);
  const [rForm, setRForm]           = useState(emptyRedirect);
  const [rSaving, setRSaving]       = useState(false);
  const [editId, setEditId]         = useState(null);

  // ── Robots.txt ─────────────────────────────────────────────
  const [robotsTxt, setRobotsTxt]   = useState('');
  const [robotsSaving, setRobotsSaving] = useState(false);

  // ── SEO Audit ──────────────────────────────────────────────
  const [auditType, setAuditType]   = useState('product');
  const [auditSlug, setAuditSlug]   = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);

  // ── Email Settings ─────────────────────────────────────────
  const [smtpStatus, setSmtpStatus] = useState(null);
  const [testEmail, setTestEmail]   = useState('');
  const [sending, setSending]       = useState(false);

  // ── Load redirects ─────────────────────────────────────────
  const loadRedirects = async () => {
    setRLoading(true);
    try {
      const r = await api.get('/seo/redirects', { params: { search: rSearch || undefined } });
      setRedirects(r.data.data || []);
    } catch { setRedirects([]); }
    setRLoading(false);
  };
  useEffect(() => { if (tab === 0) loadRedirects(); }, [tab, rSearch]);

  // ── Load robots.txt ────────────────────────────────────────
  useEffect(() => {
    if (tab !== 1) return;
    fetch('/api/seo/robots.txt').then(r => r.text()).then(setRobotsTxt).catch(() => {});
  }, [tab]);

  // ── Load SMTP status ───────────────────────────────────────
  useEffect(() => {
    if (tab !== 3) return;
    api.get('/seo/smtp-status').then(r => setSmtpStatus(r.data)).catch(() => setSmtpStatus({ success: false, message: 'Could not connect' }));
  }, [tab]);

  // ── Redirect handlers ──────────────────────────────────────
  const openNew = () => { setRForm(emptyRedirect); setEditId(null); setRModal(true); };
  const openEdit = (r) => {
    setRForm({ from_path: r.from_path, to_path: r.to_path, type: r.type });
    setEditId(r.id);
    setRModal(true);
  };

  const saveRedirect = async () => {
    if (!rForm.from_path || !rForm.to_path)
      return toast.error('Both paths are required');
    setRSaving(true);
    try {
      if (editId) {
        await api.patch(`/seo/redirects/${editId}`, { to_path: rForm.to_path, type: rForm.type });
        toast.success('Redirect updated');
      } else {
        await api.post('/seo/redirects', rForm);
        toast.success('Redirect created');
      }
      setRModal(false);
      loadRedirects();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
    setRSaving(false);
  };

  const toggleRedirect = async (r) => {
    try {
      await api.patch(`/seo/redirects/${r.id}`, { is_active: !r.is_active });
      loadRedirects();
    } catch { toast.error('Failed'); }
  };

  const deleteRedirect = async (id) => {
    if (!confirm('Delete this redirect?')) return;
    try {
      await api.delete(`/seo/redirects/${id}`);
      toast.success('Deleted');
      loadRedirects();
    } catch { toast.error('Failed'); }
  };

  // ── Robots.txt save ────────────────────────────────────────
  const saveRobots = async () => {
    setRobotsSaving(true);
    try {
      await api.put('/seo/robots', { content: robotsTxt });
      toast.success('robots.txt saved');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
    setRobotsSaving(false);
  };

  // ── SEO Audit ──────────────────────────────────────────────
  const runAudit = async () => {
    if (!auditSlug) return toast.error('Enter a slug');
    setAuditLoading(true);
    setAuditResult(null);
    try {
      const r = await api.get(`/seo/audit/${auditType}/${auditSlug}`);
      setAuditResult(r.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Audit failed');
    }
    setAuditLoading(false);
  };

  // ── Test email ─────────────────────────────────────────────
  const sendTestEmail = async () => {
    if (!testEmail) return toast.error('Enter a recipient email');
    setSending(true);
    try {
      const r = await api.post('/seo/test-email', { to: testEmail });
      toast.success(r.data.message);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Send failed');
    }
    setSending(false);
  };

  const gradeColor = { A: 'text-green-600', B: 'text-blue-600', C: 'text-amber-600', D: 'text-red-600' };
  const impactBadge = { high: 'bg-red-50 text-red-600', medium: 'bg-amber-50 text-amber-600', low: 'bg-ink-100 text-ink-500' };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="SEO & Email" subtitle="Redirects, robots.txt, audits, email settings"
        collapsed={collapsed} toggleSidebar={toggleSidebar} />

      <div className="flex-1 p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-ink-200 dark:border-ink-700">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === i
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab 0: Redirects ── */}
        {tab === 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
                <input value={rSearch} onChange={e => setRSearch(e.target.value)}
                  placeholder="Search paths…" className="input pl-9 w-64"/>
              </div>
              <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm">
                <Plus size={14}/> Add Redirect
              </button>
            </div>

            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 dark:border-ink-800">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">From</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide w-8"></th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">To</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide w-16">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide w-16">Hits</th>
                    <th className="px-4 py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {rLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <tr key={i} className="border-b border-ink-100 dark:border-ink-800">
                        {Array(6).fill(0).map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-4 bg-ink-100 dark:bg-ink-800 rounded animate-pulse"/></td>
                        ))}
                      </tr>
                    ))
                  ) : redirects.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-400 text-sm">
                      No redirects yet. Add one to handle moved URLs.
                    </td></tr>
                  ) : redirects.map(r => (
                    <tr key={r.id} className={`border-b border-ink-100 dark:border-ink-800 ${!r.is_active ? 'opacity-40' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-ink-600 dark:text-ink-300">{r.from_path}</td>
                      <td className="px-4 py-3 text-ink-400"><ArrowRight size={12}/></td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-600 dark:text-ink-300">{r.to_path}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.type === 301 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-400">{r.hit_count}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => toggleRedirect(r)} title={r.is_active ? 'Disable' : 'Enable'}
                            className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400 transition-colors">
                            {r.is_active ? <ToggleRight size={14} className="text-green-500"/> : <ToggleLeft size={14}/>}
                          </button>
                          <button onClick={() => openEdit(r)}
                            className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400 transition-colors">
                            <Edit2 size={13}/>
                          </button>
                          <button onClick={() => deleteRedirect(r.id)}
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab 1: Robots.txt ── */}
        {tab === 1 && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">robots.txt</h3>
                <p className="text-xs text-ink-400 mt-0.5">Served at <code className="bg-ink-100 dark:bg-ink-800 px-1 rounded">/robots.txt</code></p>
              </div>
              <div className="flex gap-2">
                <a href="/robots.txt" target="_blank" rel="noreferrer" className="btn-ghost text-xs flex items-center gap-1">
                  <ExternalLink size={11}/> Preview
                </a>
                <button onClick={saveRobots} disabled={robotsSaving} className="btn-primary text-xs">
                  {robotsSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
            <textarea value={robotsTxt} onChange={e => setRobotsTxt(e.target.value)} rows={18}
              className="w-full font-mono text-xs bg-ink-950 dark:bg-ink-950 text-green-400 p-4 rounded-xl border border-ink-700 focus:outline-none focus:border-brand-500 resize-y"/>
            <p className="text-xs text-ink-400">Changes are saved to the database and served dynamically. The default is generated from your site URL if you haven't customised it.</p>
          </div>
        )}

        {/* ── Tab 2: SEO Audit ── */}
        {tab === 2 && (
          <div className="space-y-6 max-w-2xl">
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Run SEO Audit</h3>
              <div className="flex gap-3">
                <select value={auditType} onChange={e => setAuditType(e.target.value)} className="input w-36">
                  <option value="product">Product</option>
                  <option value="page">Page</option>
                  <option value="blog">Blog Post</option>
                </select>
                <input value={auditSlug} onChange={e => setAuditSlug(e.target.value)}
                  placeholder="Enter slug (e.g. diamond-solitaire-ring)"
                  className="input flex-1" onKeyDown={e => e.key === 'Enter' && runAudit()}/>
                <button onClick={runAudit} disabled={auditLoading} className="btn-primary flex items-center gap-2 text-sm">
                  {auditLoading ? <RefreshCw size={13} className="animate-spin"/> : <Search size={13}/>}
                  Audit
                </button>
              </div>
            </div>

            {auditResult && (
              <div className="card p-5 space-y-5">
                {/* Score */}
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${gradeColor[auditResult.grade] || 'text-ink-700'}`}>{auditResult.grade}</div>
                    <div className="text-xs text-ink-400 mt-1">Grade</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-ink-700 dark:text-ink-200">{auditResult.score}/100</div>
                    <div className="w-48 h-2 bg-ink-100 dark:bg-ink-700 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${auditResult.score}%` }}/>
                    </div>
                    <div className="text-xs text-ink-400 mt-1">{auditResult.summary.issues} issues · {auditResult.summary.warnings} warnings · {auditResult.summary.passes} passed</div>
                  </div>
                </div>

                {/* Issues */}
                {auditResult.issues.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Issues</h4>
                    <div className="space-y-2">
                      {auditResult.issues.map((iss, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                          <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5"/>
                          <div>
                            <span className="text-xs font-semibold text-red-700 dark:text-red-400">{iss.check}</span>
                            <span className="text-xs text-red-600 dark:text-red-300"> — {iss.message}</span>
                          </div>
                          <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${impactBadge[iss.impact]}`}>{iss.impact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {auditResult.warnings.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Warnings</h4>
                    <div className="space-y-2">
                      {auditResult.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5"/>
                          <span className="text-xs text-amber-700 dark:text-amber-300">{w.check} — {w.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Passes */}
                {auditResult.passes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Passing</h4>
                    <div className="space-y-1">
                      {auditResult.passes.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
                          <CheckCircle size={12} className="text-green-500 flex-shrink-0"/>
                          {p.check} — {p.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta summary */}
                <div className="border-t border-ink-100 dark:border-ink-800 pt-4">
                  <h4 className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">Meta</h4>
                  <div className="space-y-1 text-xs text-ink-600 dark:text-ink-400">
                    <p><span className="font-medium">Title:</span> {auditResult.meta.title || '(none)'}</p>
                    <p><span className="font-medium">Description:</span> {auditResult.meta.description?.substring(0,120) || '(none)'}{auditResult.meta.description?.length > 120 ? '…' : ''}</p>
                    {auditResult.meta.wordCount > 0 && <p><span className="font-medium">Word count:</span> {auditResult.meta.wordCount}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: Email Settings ── */}
        {tab === 3 && (
          <div className="space-y-6 max-w-xl">
            {/* SMTP Status */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 flex items-center gap-2">
                  <Shield size={15} className="text-ink-400"/> SMTP Status
                </h3>
                <button onClick={() => {
                  setSmtpStatus(null);
                  api.get('/seo/smtp-status').then(r => setSmtpStatus(r.data)).catch(() => setSmtpStatus({ success: false, message: 'Connection failed' }));
                }} className="btn-ghost text-xs flex items-center gap-1">
                  <RefreshCw size={11}/> Refresh
                </button>
              </div>
              {!smtpStatus ? (
                <div className="flex items-center gap-2 text-xs text-ink-400"><RefreshCw size={12} className="animate-spin"/> Checking…</div>
              ) : (
                <div className={`flex items-center gap-3 p-3 rounded-lg ${smtpStatus.success ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
                  {smtpStatus.success
                    ? <CheckCircle size={16} className="text-green-500 flex-shrink-0"/>
                    : <XCircle size={16} className="text-red-500 flex-shrink-0"/>}
                  <span className={`text-sm font-medium ${smtpStatus.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {smtpStatus.message}
                  </span>
                </div>
              )}

              <div className="mt-4 p-3 bg-ink-50 dark:bg-ink-800 rounded-lg text-xs text-ink-500 space-y-1">
                <p>Configure SMTP in your <code className="bg-ink-200 dark:bg-ink-700 px-1 rounded">.env</code> file:</p>
                <p className="font-mono text-ink-600 dark:text-ink-400">SMTP_HOST · SMTP_PORT · SMTP_USER · SMTP_PASS</p>
              </div>
            </div>

            {/* Test Email */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 flex items-center gap-2 mb-4">
                <Mail size={15} className="text-ink-400"/> Send Test Email
              </h3>
              <div className="flex gap-2">
                <input value={testEmail} onChange={e => setTestEmail(e.target.value)}
                  type="email" placeholder="recipient@email.com" className="input flex-1"/>
                <button onClick={sendTestEmail} disabled={sending}
                  className="btn-primary text-sm flex items-center gap-2">
                  {sending ? <RefreshCw size={13} className="animate-spin"/> : <Mail size={13}/>}
                  Send
                </button>
              </div>
              <p className="text-xs text-ink-400 mt-2">
                Sends a test email using your configured SMTP settings. If SMTP is not configured, the email is logged to the server console (dev mode).
              </p>
            </div>

            {/* Email templates info */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3">Email Templates</h3>
              <div className="space-y-2">
                {[
                  ['Password Reset',         'Triggered by Forgot Password flow'],
                  ['Welcome',                'Sent on new user registration'],
                  ['Order Confirmation',     'Sent when an order is placed'],
                  ['Appointment Confirmed',  'Sent when an appointment is booked'],
                ].map(([name, desc]) => (
                  <div key={name} className="flex items-center justify-between py-2 border-b border-ink-100 dark:border-ink-800 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-ink-700 dark:text-ink-300">{name}</p>
                      <p className="text-xs text-ink-400">{desc}</p>
                    </div>
                    <span className="text-[10px] bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Redirect Modal ── */}
      {rModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-ink-800 dark:text-ink-100 mb-5">
              {editId ? 'Edit Redirect' : 'Add Redirect'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">From Path <span className="text-red-500">*</span></label>
                <input value={rForm.from_path} onChange={e => setRForm(f => ({ ...f, from_path: e.target.value }))}
                  placeholder="/old-url" className="input w-full" disabled={!!editId}/>
                <p className="text-[10px] text-ink-400 mt-1">Must start with /</p>
              </div>
              <div>
                <label className="label">To Path <span className="text-red-500">*</span></label>
                <input value={rForm.to_path} onChange={e => setRForm(f => ({ ...f, to_path: e.target.value }))}
                  placeholder="/new-url or https://external.com/path" className="input w-full"/>
              </div>
              <div>
                <label className="label">Redirect Type</label>
                <select value={rForm.type} onChange={e => setRForm(f => ({ ...f, type: parseInt(e.target.value) }))} className="input w-full">
                  <option value={301}>301 — Permanent (recommended for moved pages)</option>
                  <option value={302}>302 — Temporary (for A/B tests, seasonal pages)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setRModal(false)} className="btn-ghost">Cancel</button>
              <button onClick={saveRedirect} disabled={rSaving} className="btn-primary">
                {rSaving ? 'Saving…' : editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
