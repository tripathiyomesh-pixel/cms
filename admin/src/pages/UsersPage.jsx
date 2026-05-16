import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { usersAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit2, Shield, X, Save, UserPlus, Check, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { id: 'super_admin', label: 'Super Admin',  color: 'badge-gold',  desc: 'Full access to everything. Cannot be restricted.' },
  { id: 'admin',       label: 'Admin',         color: 'badge-blue',  desc: 'Manage products, orders, users, plugins and settings.' },
  { id: 'manager',     label: 'Manager',       color: 'badge-green', desc: 'Manage products, orders, inventory and marketing. Cannot manage users.' },
  { id: 'editor',      label: 'Editor',        color: 'badge-gray',  desc: 'Create and edit products and content. Cannot delete or manage users.' },
  { id: 'viewer',      label: 'Viewer',        color: 'badge-gray',  desc: 'Read-only access. Cannot create or edit anything.' },
];

// Permission matrix — what each role can do
const PERMISSIONS_MATRIX = [
  { resource: 'Products',      create: ['editor+'], update: ['editor+'], delete: ['admin+'],   view: ['viewer+'] },
  { resource: 'Orders',        create: ['editor+'], update: ['manager+'],delete: ['admin+'],   view: ['editor+'] },
  { resource: 'Customers',     create: ['manager+'],update: ['manager+'],delete: ['admin+'],   view: ['editor+'] },
  { resource: 'Enquiries',     create: ['editor+'], update: ['editor+'], delete: ['admin+'],   view: ['editor+'] },
  { resource: 'Appointments',  create: ['editor+'], update: ['editor+'], delete: ['admin+'],   view: ['editor+'] },
  { resource: 'Marketing',     create: ['manager+'],update: ['manager+'],delete: ['admin+'],   view: ['editor+'] },
  { resource: 'Inventory',     create: ['manager+'],update: ['manager+'],delete: ['admin+'],   view: ['editor+'] },
  { resource: 'Users',         create: ['admin+'],  update: ['admin+'],  delete: ['super_admin'], view: ['admin+'] },
  { resource: 'Settings',      create: ['admin+'],  update: ['admin+'],  delete: ['admin+'],   view: ['editor+'] },
  { resource: 'Plugins',       create: ['admin+'],  update: ['admin+'],  delete: ['admin+'],   view: ['editor+'] },
  { resource: 'Audit log',     create: ['-'],       update: ['-'],       delete: ['-'],        view: ['admin+'] },
];

const ROLE_ORDER = ['viewer', 'editor', 'manager', 'admin', 'super_admin'];

const hasAccess = (required, userRole) => {
  if (required[0] === '-') return false;
  if (required[0] === 'viewer+') return true;
  const minRole = required[0].replace('+','');
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(minRole);
};

const ROLE_COLORS = {
  super_admin: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-200 dark:border-amber-800',
  admin:       'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-200 dark:border-blue-800',
  manager:     'bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-200 dark:border-green-800',
  editor:      'bg-ink-100 dark:bg-ink-800 text-ink-500 border border-ink-200 dark:border-ink-700',
  viewer:      'bg-ink-50 dark:bg-ink-800/50 text-ink-400 border border-ink-100 dark:border-ink-800',
};

export default function UsersPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { user: currentUser } = useAuth();
  const [users,  setUsers]  = useState([]);
  const [loading,setLoading]= useState(true);
  const [modal,  setModal]  = useState(null);
  const [tab,    setTab]    = useState('users'); // 'users' | 'roles' | 'permissions'

  const isAdmin = ['super_admin','admin'].includes(currentUser?.role);

  const load = async () => {
    setLoading(true);
    try { const r = await usersAPI.list(); setUsers(r.data.data || []); }
    catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (id === currentUser.id) return toast.error("Can't delete yourself");
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try { await usersAPI.delete(id); toast.success('User deleted'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (u) => {
    try {
      await usersAPI.update(u.id, { is_active: !u.is_active });
      toast.success(`${u.name} ${u.is_active ? 'deactivated' : 'activated'}`);
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <>
      <Topbar title="Users & permissions" subtitle={`${users.length} team members`}
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={isAdmin && (
          <button onClick={() => setModal('new')} className="btn-gold flex items-center gap-1.5 text-xs">
            <UserPlus size={14}/> Invite user
          </button>
        )}/>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-ink-100 dark:bg-ink-800 p-1 rounded-xl w-fit">
          {[
            { id:'users',       label:'Team members' },
            { id:'roles',       label:'Role guide' },
            { id:'permissions', label:'Permissions matrix' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${tab===t.id ? 'bg-white dark:bg-ink-700 text-ink-700 dark:text-ink-100 shadow-sm' : 'text-ink-400 hover:text-ink-600'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: USERS ── */}
        {tab === 'users' && (
          <div className="card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200/60 dark:border-ink-700">
                  {['User','Role','Status','Last login',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-ink-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-xs text-ink-400">Loading…</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="border-b border-ink-100 dark:border-ink-800 hover:bg-ink-50/50 dark:hover:bg-ink-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-ink-700 dark:text-ink-200 flex items-center gap-1.5">
                            {u.name}
                            {u.id === currentUser.id && <span className="text-[9px] text-ink-400 bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 rounded">you</span>}
                          </div>
                          <div className="text-[10px] text-ink-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role]}`}>
                        {u.role?.replace('_',' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => u.id !== currentUser.id && handleToggle(u)}
                        disabled={u.id === currentUser.id}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full cursor-pointer disabled:cursor-default transition-colors
                          ${u.is_active ? 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100' : 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100'}`}>
                        {u.is_active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-ink-400">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString('en-AE',{day:'numeric',month:'short',year:'numeric'}) : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      {u.id !== currentUser.id && isAdmin && (
                        <div className="flex gap-1">
                          <button onClick={() => setModal(u)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400" title="Edit user">
                            <Edit2 size={13}/>
                          </button>
                          <button onClick={() => handleDelete(u.id, u.name)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500" title="Delete user">
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TAB: ROLES ── */}
        {tab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map(r => (
              <div key={r.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[r.id]}`}>
                      {r.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-ink-400 bg-ink-50 dark:bg-ink-800 px-2 py-0.5 rounded font-mono">
                    {ROLE_ORDER.indexOf(r.id) + 1}/5
                  </div>
                </div>
                <p className="text-xs text-ink-500 dark:text-ink-400 leading-relaxed mb-3">{r.desc}</p>
                <div className="text-[10px] text-ink-400">
                  {users.filter(u => u.role === r.id).length} user(s) with this role
                </div>
              </div>
            ))}
            {/* Role hierarchy visual */}
            <div className="card p-4 md:col-span-2 lg:col-span-3">
              <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-3">Role hierarchy (highest → lowest access)</p>
              <div className="flex items-center gap-2 flex-wrap">
                {ROLES.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[r.id]}`}>{r.label}</span>
                    {i < ROLES.length - 1 && <span className="text-ink-300 text-xs">→</span>}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-ink-400 mt-3">Higher roles inherit all permissions of lower roles. Super Admin always has full access.</p>
            </div>
          </div>
        )}

        {/* ── TAB: PERMISSIONS MATRIX ── */}
        {tab === 'permissions' && (
          <div className="card overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-ink-200/60 dark:border-ink-700">
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-ink-400 uppercase tracking-wide w-32">Resource</th>
                  {['view','create','update','delete'].map(a => (
                    <th key={a} className="text-center px-3 py-3 text-[11px] font-medium text-ink-400 uppercase tracking-wide">{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS_MATRIX.map((row, i) => (
                  <tr key={row.resource} className={`border-b border-ink-100 dark:border-ink-800 ${i%2===0?'bg-ink-50/30 dark:bg-ink-800/20':''}`}>
                    <td className="px-4 py-2.5 font-medium text-ink-700 dark:text-ink-200">{row.resource}</td>
                    {['view','create','update','delete'].map(action => {
                      const required = row[action];
                      const roleNeeded = required[0] === '-' ? null : required[0].replace('+','');
                      return (
                        <td key={action} className="px-3 py-2.5 text-center">
                          {required[0] === '-' ? (
                            <span className="text-ink-200 dark:text-ink-700 text-base">—</span>
                          ) : (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[roleNeeded] || 'bg-ink-100 text-ink-500'}`}>
                              {roleNeeded?.replace('_',' ')}+
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-ink-100 dark:border-ink-800 flex items-center gap-2">
              <Info size={12} className="text-ink-400"/>
              <span className="text-[10px] text-ink-400">
                "role+" means that role and all higher roles have access. Super Admin always has full access to everything.
              </span>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <UserModal
          data={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </>
  );
}

function UserModal({ data, onClose, onSave }) {
  const isEdit = !!data;
  const [form, setForm] = useState({
    name: data?.name || '', email: data?.email || '',
    password: '', role: data?.role || 'editor',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await usersAPI.update(data.id, { name: form.name, role: form.role });
      } else {
        await authAPI.register(form);
      }
      toast.success(isEdit ? 'User updated' : 'User invited successfully');
      onSave();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const selectedRole = ROLES.find(r => r.id === form.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">
            {isEdit ? `Edit — ${data.name}` : 'Invite new team member'}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input value={form.name} onChange={e => set('name',e.target.value)} className="input-field" required placeholder="e.g. Sarah Ahmed"/>
          </div>

          {!isEdit && (
            <>
              <div>
                <label className="label">Email address</label>
                <input type="email" value={form.email} onChange={e => set('email',e.target.value)} className="input-field" required placeholder="sarah@yourbrand.com"/>
              </div>
              <div>
                <label className="label">Temporary password</label>
                <input type="password" value={form.password} onChange={e => set('password',e.target.value)} className="input-field" required minLength={8} placeholder="Min 8 characters"/>
              </div>
            </>
          )}

          <div>
            <label className="label">Role</label>
            <select value={form.role} onChange={e => set('role',e.target.value)} className="input-field">
              {ROLES.filter(r => r.id !== 'super_admin').map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
            {selectedRole && (
              <p className="text-[11px] text-ink-400 mt-1.5 flex items-start gap-1.5">
                <Info size={11} className="mt-0.5 flex-shrink-0"/>
                {selectedRole.desc}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-ink-100 dark:border-ink-800">
            <button type="button" onClick={onClose} className="btn-ghost text-xs">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
              {saving ? <span className="w-3 h-3 border border-t-transparent border-black/30 rounded-full animate-spin"/> : <Save size={13}/>}
              {isEdit ? 'Update user' : 'Send invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
