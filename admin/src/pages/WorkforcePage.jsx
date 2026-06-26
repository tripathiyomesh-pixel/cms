import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import Toggle from '../components/ui/Toggle';
import api from '../services/api';
import {
  Plus, Search, Edit2, Trash2, Users, Building2,
  Briefcase, Shield, ChevronDown, X, Check, Save,
  Mail, Phone, Calendar, MapPin, Eye, EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── TABS ──────────────────────────────────────────────────────
const TABS = [
  { id:'staff',      label:'Staff',       icon:Users },
  { id:'branches',   label:'Branches',    icon:Building2 },
  { id:'departments',label:'Departments', icon:Briefcase },
  { id:'policies',   label:'Policies',    icon:Shield },
];

const ROLES = [
  { value:'super_admin',      label:'Super Admin' },
  { value:'admin',            label:'Admin' },
  { value:'boutique_manager', label:'Boutique Manager' },
  { value:'sales_staff',      label:'Sales Staff' },
  { value:'inventory_staff',  label:'Inventory Staff' },
  { value:'marketing_staff',  label:'Marketing Staff' },
  { value:'crm_staff',        label:'CRM Staff' },
  { value:'accountant',       label:'Accountant' },
  { value:'viewer',           label:'Viewer' },
];

const CAPABILITIES = [
  { group:'Dashboard',  caps:['dashboard.view'] },
  { group:'Products',   caps:['products.view','products.create','products.edit','products.delete','products.publish'] },
  { group:'Diamonds',   caps:['diamonds.view','diamonds.create','diamonds.edit','diamonds.delete'] },
  { group:'Inventory',  caps:['inventory.view','inventory.manage','inventory.import'] },
  { group:'Orders',     caps:['orders.view','orders.create','orders.manage','orders.approve'] },
  { group:'Enquiries',  caps:['enquiries.view','enquiries.manage','enquiries.assign'] },
  { group:'Appointments',caps:['appointments.view','appointments.create','appointments.manage'] },
  { group:'Customers',  caps:['customers.view','customers.create','customers.edit','customers.delete'] },
  { group:'Marketing',  caps:['marketing.view','marketing.manage'] },
  { group:'Blog',       caps:['blog.view','blog.manage'] },
  { group:'Builder',    caps:['builder.view','builder.manage'] },
  { group:'Settings',   caps:['settings.view','settings.manage'] },
  { group:'Users',      caps:['users.view','users.manage','workforce.view','workforce.manage'] },
  { group:'Reports',    caps:['reports.view','reports.export'] },
];

const lbl = 'block text-[11px] font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-1.5';
const inp = 'input-field text-sm';

// ── ROLE BADGE ─────────────────────────────────────────────────
function RoleBadge({ role }) {
  const colors = {
    super_admin:'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    admin:'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    boutique_manager:'bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-300',
    sales_staff:'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    inventory_staff:'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    marketing_staff:'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    crm_staff:'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    accountant:'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    viewer:'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${colors[role]||colors.viewer}`}>
      {role?.replace(/_/g,' ')}
    </span>
  );
}

// ── CREATE STAFF MODAL ─────────────────────────────────────────
function CreateStaffModal({ branches, departments, policies, onClose, onCreated }) {
  const [form, setForm] = useState({
    name:'', email:'', role:'sales_staff',
    branch_id:'', department_id:'', job_title:'',
    employment_type:'full_time', employee_id:'', policy_ids:[],
  });
  const [saving, setSaving] = useState(false);
  const [activationLink, setActivationLink] = useState('');

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const togglePolicy = (id) => {
    setForm(f=>({...f, policy_ids: f.policy_ids.includes(id)
      ? f.policy_ids.filter(x=>x!==id)
      : [...f.policy_ids, id]
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    setSaving(true);
    try {
      const res = await api.post('/workforce/staff', form);
      setActivationLink(res.data.data.activation_link);
      toast.success('Staff member created');
      onCreated();
    } catch(e) {
      toast.error(e.response?.data?.message || 'Failed to create staff');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 dark:border-ink-800">
          <h3 className="text-base font-bold text-ink-700 dark:text-ink-200">Add staff member</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16}/></button>
        </div>

        {activationLink ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">✅ Staff member created</p>
              <p className="text-xs text-green-600 dark:text-green-500 mb-3">Send this activation link to the staff member. It expires in 7 days.</p>
              <div className="flex gap-2">
                <input readOnly value={activationLink} className="flex-1 px-3 py-2 text-xs bg-white dark:bg-ink-800 border border-green-200 dark:border-green-800 rounded-lg font-mono text-ink-600 dark:text-ink-300"/>
                <button onClick={()=>{ navigator.clipboard.writeText(activationLink); toast.success('Copied'); }}
                  className="px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700">
                  Copy
                </button>
              </div>
            </div>
            <button onClick={onClose} className="btn-gold w-full justify-center text-xs">Done</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Full name *</label><input value={form.name} onChange={e=>set('name',e.target.value)} className={inp} placeholder="Sarah Al-Ahmad"/></div>
                <div><label className={lbl}>Email address *</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} className={inp} placeholder="sarah@tejori.com"/></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Employee ID</label><input value={form.employee_id} onChange={e=>set('employee_id',e.target.value)} className={inp} placeholder="EMP-001"/></div>
                <div><label className={lbl}>Job title</label><input value={form.job_title} onChange={e=>set('job_title',e.target.value)} className={inp} placeholder="Sales Executive"/></div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div><label className={lbl}>Role</label>
                  <select value={form.role} onChange={e=>set('role',e.target.value)} className={inp}>
                    {ROLES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Branch</label>
                  <select value={form.branch_id} onChange={e=>set('branch_id',e.target.value)} className={inp}>
                    <option value="">Select branch</option>
                    {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Department</label>
                  <select value={form.department_id} onChange={e=>set('department_id',e.target.value)} className={inp}>
                    <option value="">Select department</option>
                    {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div><label className={lbl}>Employment type</label>
                <div className="flex gap-2">
                  {['full_time','part_time','contractor','intern'].map(t=>(
                    <button key={t} onClick={()=>set('employment_type',t)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all ${form.employment_type===t?'border-gold-500 bg-gold-50 text-gold-700 dark:bg-gold-900/20 dark:text-gold-400':'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-gold-300'}`}>
                      {t.replace('_',' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign policies */}
              {policies.length > 0 && (
                <div>
                  <label className={lbl}>Permission policies</label>
                  <div className="space-y-2">
                    {policies.map(p=>(
                      <label key={p.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.policy_ids.includes(p.id)?'border-gold-400 bg-gold-50 dark:bg-gold-900/10':'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                        <input type="checkbox" checked={form.policy_ids.includes(p.id)} onChange={()=>togglePolicy(p.id)} className="mt-0.5 accent-gold-500"/>
                        <div>
                          <p className="text-sm font-semibold text-ink-700 dark:text-ink-200">{p.name}</p>
                          {p.description && <p className="text-xs text-ink-400 mt-0.5">{p.description}</p>}
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-ink-400 mt-2">Policies are layered on top of the selected role's base permissions.</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-ink-100 dark:border-ink-800 flex gap-3">
              <button onClick={onClose} className="btn-ghost flex-1 justify-center text-xs">Cancel</button>
              <button onClick={handleSubmit} disabled={saving} className="btn-gold flex-1 justify-center text-xs">
                {saving ? 'Creating…' : 'Create staff & get activation link'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── STAFF TAB ─────────────────────────────────────────────────
function StaffTab({ branches, departments, policies }) {
  const [staff,      setStaff]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterRole,   setFilterRole]   = useState('');
  const [showCreate,   setShowCreate]   = useState(false);
  const [editStaff,    setEditStaff]    = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/workforce/staff', { params:{ branch_id:filterBranch, role:filterRole, limit:50 } })
      .then(r => setStaff(r.data.data?.data || []))
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterBranch, filterRole]);

  const filtered = staff.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.job_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex-1 relative min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search staff…"
            className="input-field pl-8 text-sm w-full"/>
        </div>
        <select value={filterBranch} onChange={e=>setFilterBranch(e.target.value)} className="input-field text-sm w-36">
          <option value="">All branches</option>
          {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={filterRole} onChange={e=>setFilterRole(e.target.value)} className="input-field text-sm w-40">
          <option value="">All roles</option>
          {ROLES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <button onClick={()=>setShowCreate(true)} className="btn-gold flex items-center gap-1.5 text-xs">
          <Plus size={13}/> Add staff
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_,i)=>(
            <div key={i} className="h-16 rounded-xl bg-ink-100 dark:bg-ink-800 animate-pulse"/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users size={40} className="text-ink-200 dark:text-ink-700 mx-auto mb-3"/>
          <p className="text-sm font-semibold text-ink-500 mb-1">No staff members yet</p>
          <p className="text-xs text-ink-400 mb-4">Add your first staff member to get started</p>
          <button onClick={()=>setShowCreate(true)} className="btn-gold text-xs"><Plus size={12}/> Add staff</button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-100 dark:border-ink-800">
                {['Staff member','Role','Branch','Department','Status',''].map(h=>(
                  <th key={h} className="text-left text-[10px] font-bold text-ink-400 uppercase tracking-wider pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50 dark:divide-ink-800">
              {filtered.map(s=>(
                <tr key={s.id} className="hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-gold-700 dark:text-gold-400">{s.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink-700 dark:text-ink-200">{s.name}</p>
                        <p className="text-xs text-ink-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4"><RoleBadge role={s.role}/></td>
                  <td className="py-3 pr-4 text-xs text-ink-500">{s.branch_name||'—'}</td>
                  <td className="py-3 pr-4 text-xs text-ink-500">{s.department_name||'—'}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.is_active?'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 flex items-center gap-1">
                    {!s.has_profile && (
                      <span title="No workforce profile" className="text-[9px] bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-semibold mr-1">Legacy</span>
                    )}
                    <button onClick={()=>setEditStaff(s)} className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 hover:text-ink-600 transition-colors"><Edit2 size={13}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateStaffModal
          branches={branches} departments={departments} policies={policies}
          onClose={()=>setShowCreate(false)}
          onCreated={()=>{ load(); }}
        />
      )}

      {editStaff && (
        <EditStaffModal
          staff={editStaff}
          branches={branches}
          departments={departments}
          onClose={()=>setEditStaff(null)}
          onSaved={()=>{ setEditStaff(null); load(); }}
        />
      )}
    </>
  );
}

function EditStaffModal({ staff, branches, departments, onClose, onSaved }) {
  const lbl = 'block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';
  const inp = 'input-field';
  const [form, setForm] = useState({
    name:          staff.name || '',
    job_title:     staff.job_title || '',
    role:          staff.role || 'staff',
    branch_id:     staff.branch_id || '',
    department_id: staff.department_id || '',
    phone:         staff.phone || '',
    is_active:     staff.is_active !== false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/workforce/staff/${staff.id}`, form);
      toast.success('Staff member updated');
      onSaved();
    } catch(err) { toast.error(err.response?.data?.message || 'Update failed'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Edit staff — {staff.name}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-100 text-ink-400"><X size={16}/></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className={lbl}>Name</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inp} required/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Job title</label>
              <input value={form.job_title} onChange={e=>setForm(f=>({...f,job_title:e.target.value}))} className={inp} placeholder="Sales Associate"/>
            </div>
            <div>
              <label className={lbl}>Role</label>
              <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} className={inp}>
                {['staff','manager','cashier','jeweller','admin'].map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Branch</label>
              <select value={form.branch_id} onChange={e=>setForm(f=>({...f,branch_id:e.target.value}))} className={inp}>
                <option value="">— No branch —</option>
                {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Department</label>
              <select value={form.department_id} onChange={e=>setForm(f=>({...f,department_id:e.target.value}))} className={inp}>
                <option value="">— None —</option>
                {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={lbl}>Phone</label>
            <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className={inp} placeholder="+971 50 000 0000"/>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="edit_is_active" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))} className="rounded"/>
            <label htmlFor="edit_is_active" className="text-xs text-ink-600 dark:text-ink-300">Active</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost text-xs">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
              <Save size={13}/>{saving?'Saving…':'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── BRANCHES TAB ───────────────────────────────────────────────
function BranchesTab() {
  const [branches, setBranches] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState({ name:'', code:'', city:'Dubai', country:'UAE', address:'', phone:'', email:'', is_main:false });
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);

  const load = () => { setLoading(true); api.get('/workforce/branches').then(r=>setBranches(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(()=>{ load(); },[]);

  const save = async () => {
    if (!form.name) return toast.error('Branch name required');
    setSaving(true);
    try {
      await api.post('/workforce/branches', form);
      toast.success('Branch created');
      setShowForm(false);
      setForm({ name:'', code:'', city:'Dubai', country:'UAE', address:'', phone:'', email:'', is_main:false });
      load();
    } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-ink-500">{branches.length} branch{branches.length!==1?'es':''}</p>
        <button onClick={()=>setShowForm(!showForm)} className="btn-gold flex items-center gap-1.5 text-xs"><Plus size={13}/> Add branch</button>
      </div>

      {showForm && (
        <div className="card p-5 mb-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Branch name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inp} placeholder="Dubai Mall Branch"/></div>
            <div><label className={lbl}>Branch code</label><input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} className={inp} placeholder="DXB-MALL"/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>City</label><input value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} className={inp}/></div>
            <div><label className={lbl}>Country</label><input value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))} className={inp}/></div>
          </div>
          <div><label className={lbl}>Address</label><textarea value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} className={inp} rows={2}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Phone</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className={inp} placeholder="+971 4 000 0000"/></div>
            <div><label className={lbl}>Email</label><input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className={inp} placeholder="dubai@tejori.com"/></div>
          </div>
          <div className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
            <div><p className="text-sm font-medium text-ink-700 dark:text-ink-200">Main branch</p><p className="text-xs text-ink-400">Mark as headquarters</p></div>
            <Toggle checked={form.is_main} onChange={v=>setForm(f=>({...f,is_main:v}))}/>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>setShowForm(false)} className="btn-ghost flex-1 justify-center text-xs">Cancel</button>
            <button onClick={save} disabled={saving} className="btn-gold flex-1 justify-center text-xs">{saving?'Saving…':'Save branch'}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(3).fill(0).map((_,i)=><div key={i} className="h-32 rounded-xl bg-ink-100 dark:bg-ink-800 animate-pulse"/>) :
        branches.map(b=>(
          <div key={b.id} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Building2 size={14} className="text-blue-600 dark:text-blue-400"/></div>
                <div>
                  <p className="text-sm font-bold text-ink-700 dark:text-ink-200">{b.name}</p>
                  {b.code && <p className="text-[10px] text-ink-400 font-mono">{b.code}</p>}
                </div>
              </div>
              {b.is_main && <span className="text-[9px] font-bold bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400 px-2 py-0.5 rounded-full">HQ</span>}
            </div>
            <div className="space-y-1.5">
              {b.city && <p className="text-xs text-ink-500 flex items-center gap-1.5"><MapPin size={11}/>{b.city}, {b.country}</p>}
              {b.phone && <p className="text-xs text-ink-500 flex items-center gap-1.5"><Phone size={11}/>{b.phone}</p>}
              {b.email && <p className="text-xs text-ink-500 flex items-center gap-1.5"><Mail size={11}/>{b.email}</p>}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.is_active?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>{b.is_active?'Active':'Inactive'}</span>
              <button className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><Edit2 size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DEPARTMENTS TAB ────────────────────────────────────────────
function DepartmentsTab() {
  const [depts,    setDepts]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [form,     setForm]    = useState({ name:'', code:'', description:'' });
  const [showForm, setShowForm]= useState(false);
  const [saving,   setSaving]  = useState(false);

  const load = () => { setLoading(true); api.get('/workforce/departments').then(r=>setDepts(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(()=>{ load(); },[]);

  const save = async () => {
    if (!form.name) return toast.error('Department name required');
    setSaving(true);
    try {
      await api.post('/workforce/departments', form);
      toast.success('Department created');
      setShowForm(false);
      setForm({ name:'', code:'', description:'' });
      load();
    } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
    setSaving(false);
  };

  const icons = { SALES:'💼', INV:'📦', MKT:'📢', CRM:'👥', ACC:'💰', MGT:'🏛️' };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-ink-500">{depts.length} departments</p>
        <button onClick={()=>setShowForm(!showForm)} className="btn-gold flex items-center gap-1.5 text-xs"><Plus size={13}/> Add department</button>
      </div>

      {showForm && (
        <div className="card p-5 mb-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Department name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inp} placeholder="Sales"/></div>
            <div><label className={lbl}>Code</label><input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} className={inp} placeholder="SALES"/></div>
          </div>
          <div><label className={lbl}>Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className={inp} rows={2}/></div>
          <div className="flex gap-3">
            <button onClick={()=>setShowForm(false)} className="btn-ghost flex-1 justify-center text-xs">Cancel</button>
            <button onClick={save} disabled={saving} className="btn-gold flex-1 justify-center text-xs">{saving?'Saving…':'Save'}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? Array(6).fill(0).map((_,i)=><div key={i} className="h-24 rounded-xl bg-ink-100 dark:bg-ink-800 animate-pulse"/>) :
        depts.map(d=>(
          <div key={d.id} className="card p-4 flex flex-col gap-2">
            <div className="text-2xl">{icons[d.code]||'🏢'}</div>
            <p className="text-sm font-bold text-ink-700 dark:text-ink-200">{d.name}</p>
            {d.code && <p className="text-[10px] font-mono text-ink-400">{d.code}</p>}
            {d.description && <p className="text-xs text-ink-400 leading-relaxed">{d.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── POLICIES TAB ───────────────────────────────────────────────
function PoliciesTab() {
  const [policies, setPolicies] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [newPolicy,setNewPolicy]= useState({ name:'', description:'', capabilities:{} });

  const load = () => { setLoading(true); api.get('/workforce/policies').then(r=>setPolicies(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(()=>{ load(); },[]);

  const toggleCap = (cap, policy, setPolicy) => {
    setPolicy(p=>({ ...p, capabilities:{ ...p.capabilities, [cap]: !p.capabilities[cap] } }));
  };

  const savePolicy = async () => {
    if (!newPolicy.name) return toast.error('Policy name required');
    setSaving(true);
    try {
      await api.post('/workforce/policies', newPolicy);
      toast.success('Policy created');
      setShowNew(false);
      setNewPolicy({ name:'', description:'', capabilities:{} });
      load();
    } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
    setSaving(false);
  };

  const CapGrid = ({ caps, setCaps }) => (
    <div className="space-y-4">
      {CAPABILITIES.map(group=>(
        <div key={group.group}>
          <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2">{group.group}</p>
          <div className="flex flex-wrap gap-2">
            {group.caps.map(cap=>(
              <button key={cap} onClick={()=>setCaps(cap)}
                className={`text-[10px] px-2.5 py-1 rounded-full border font-medium transition-all ${caps[cap]?'bg-gold-500 border-gold-500 text-white':'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-gold-300'}`}>
                {cap.split('.')[1]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Policy list */}
      <div className="lg:col-span-1 space-y-2">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-ink-600 dark:text-ink-300">{policies.length} policies</p>
          <button onClick={()=>{ setShowNew(true); setSelected(null); }} className="btn-ghost text-xs flex items-center gap-1"><Plus size={12}/> New</button>
        </div>
        {loading ? Array(4).fill(0).map((_,i)=><div key={i} className="h-14 rounded-xl bg-ink-100 dark:bg-ink-800 animate-pulse"/>) :
        policies.map(p=>(
          <button key={p.id} onClick={()=>{ setSelected(p); setShowNew(false); }}
            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${selected?.id===p.id?'border-gold-500 bg-gold-50 dark:bg-gold-900/10':'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-200">{p.name}</p>
            {p.description && <p className="text-xs text-ink-400 mt-0.5">{p.description}</p>}
            <p className="text-[10px] text-ink-400 mt-1">{Object.values(p.capabilities||{}).filter(Boolean).length} capabilities</p>
          </button>
        ))}
      </div>

      {/* Policy detail / new form */}
      <div className="lg:col-span-2">
        {showNew && (
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-bold text-ink-700 dark:text-ink-200">New permission policy</h3>
            <div><label className={lbl}>Policy name</label><input value={newPolicy.name} onChange={e=>setNewPolicy(p=>({...p,name:e.target.value}))} className={inp} placeholder="Dubai branch sales"/></div>
            <div><label className={lbl}>Description</label><input value={newPolicy.description} onChange={e=>setNewPolicy(p=>({...p,description:e.target.value}))} className={inp} placeholder="Sales staff in Dubai branch"/></div>
            <div>
              <label className={lbl}>Capabilities</label>
              <CapGrid caps={newPolicy.capabilities} setCaps={(cap)=>setNewPolicy(p=>({...p,capabilities:{...p.capabilities,[cap]:!p.capabilities[cap]}}))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={()=>setShowNew(false)} className="btn-ghost flex-1 justify-center text-xs">Cancel</button>
              <button onClick={savePolicy} disabled={saving} className="btn-gold flex-1 justify-center text-xs">{saving?'Saving…':'Save policy'}</button>
            </div>
          </div>
        )}

        {selected && !showNew && (
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-ink-700 dark:text-ink-200">{selected.name}</h3>
                {selected.description && <p className="text-xs text-ink-400 mt-0.5">{selected.description}</p>}
              </div>
              <button onClick={()=>setSelected(null)} className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={14}/></button>
            </div>
            <div>
              <label className={lbl}>Capabilities granted</label>
              <div className="space-y-3">
                {CAPABILITIES.map(group=>{
                  const granted = group.caps.filter(c=>selected.capabilities?.[c]);
                  if (!granted.length) return null;
                  return (
                    <div key={group.group}>
                      <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1.5">{group.group}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {granted.map(cap=>(
                          <span key={cap} className="text-[10px] px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400 font-medium">
                            {cap.split('.')[1]}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!selected && !showNew && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Shield size={32} className="text-ink-200 dark:text-ink-700 mb-3"/>
            <p className="text-sm text-ink-400">Select a policy to view its capabilities</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────
export default function WorkforcePage() {
  const { collapsed } = useOutletContext()||{};
  const [tab,      setTab]      = useState('staff');
  const [branches, setBranches] = useState([]);
  const [depts,    setDepts]    = useState([]);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    api.get('/workforce/branches').then(r=>setBranches(r.data.data||[])).catch(()=>{});
    api.get('/workforce/departments').then(r=>setDepts(r.data.data||[])).catch(()=>{});
    api.get('/workforce/policies').then(r=>setPolicies(r.data.data||[])).catch(()=>{});
  }, []);

  return (
    <>
      <Topbar title="Workforce" subtitle="Manage staff, branches, departments and permissions"/>

      {/* Tab nav */}
      <div className="flex border-b border-ink-200/60 dark:border-ink-800 px-6 bg-white dark:bg-ink-900 flex-shrink-0">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${tab===t.id?'border-gold-500 text-gold-600':'border-transparent text-ink-400 hover:text-ink-600'}`}>
            <t.icon size={14}/>{t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab==='staff'       && <StaffTab branches={branches} departments={depts} policies={policies}/>}
        {tab==='branches'    && <BranchesTab/>}
        {tab==='departments' && <DepartmentsTab/>}
        {tab==='policies'    && <PoliciesTab/>}
      </div>
    </>
  );
}
