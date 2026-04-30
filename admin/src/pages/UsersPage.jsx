import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { usersAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit2, Shield, X, Save, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['admin', 'manager', 'editor', 'viewer'];
const ROLE_COLORS = { super_admin: 'badge-gold', admin: 'badge-blue', manager: 'badge-green', editor: 'badge-gray', viewer: 'badge-gray' };

export default function UsersPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { user: currentUser, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const res = await usersAPI.list(); setUsers(res.data.data || []); }
    catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (id === currentUser.id) return toast.error("Can't delete yourself");
    if (!confirm(`Delete user "${name}"?`)) return;
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
      <Topbar title="Users" subtitle={`${users.length} users`}
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={hasRole('super_admin', 'admin') && (
          <button onClick={() => setModal('new')} className="btn-gold flex items-center gap-1.5 text-xs">
            <UserPlus size={14} /> Add user
          </button>
        )}
      />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200/60 dark:border-ink-700">
                {['User', 'Email', 'Role', 'Status', 'Last login', ''].map(h =>
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-ink-400 tracking-wide uppercase">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-ink-400 text-xs">Loading...</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-ink-100 dark:border-ink-800">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {u.name?.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-ink-700 dark:text-ink-200">{u.name}</span>
                      {u.id === currentUser.id && <span className="text-[9px] text-ink-400">(you)</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">{u.email}</td>
                  <td className="px-4 py-3"><span className={`badge ${ROLE_COLORS[u.role] || 'badge-gray'}`}>{u.role}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(u)} disabled={u.id === currentUser.id}
                      className={`badge cursor-pointer disabled:cursor-not-allowed ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-ink-400">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3">
                    {u.id !== currentUser.id && hasRole('super_admin', 'admin') && (
                      <div className="flex gap-1">
                        <button onClick={() => setModal(u)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400"><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(u.id, u.name)} className="p-1.5 rounded hover:bg-red-50 text-ink-400 hover:text-red-500"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <UserModal data={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
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
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await usersAPI.update(data.id, { name: form.name, role: form.role });
      } else {
        await authAPI.register(form);
      }
      toast.success(isEdit ? 'User updated' : 'User created');
      onSave();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
          <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">{isEdit ? 'Edit user' : 'New user'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-100 text-ink-400"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Full name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className="input-field" required />
          </div>
          {!isEdit && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Password</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} className="input-field" required minLength={8} />
              </div>
            </>
          )}
          <div>
            <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Role</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} className="input-field">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-outline text-xs">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs"><Save size={13} /> {isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
