/**
 * TopNavBar — always-visible top bar
 * In SIDEBAR mode: shows logo + hamburger + notification + user
 * In TOPBAR mode:  shows logo + full mega-menu + notification + user
 */
import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Layers, FolderTree, Image, Megaphone,
  ShoppingCart, BarChart3, Users, Puzzle, Activity, MapPin,
  ShieldCheck, ClipboardList, Upload, BookOpen, Paintbrush,
  Zap, ToggleLeft, Calendar, Hexagon, Circle, Star, MessageSquare,
  UserCheck, Settings, ChevronDown, Layout, LayoutList, DollarSign,
  Bell, Sun, Moon, User, LogOut, Shield, Eye, PanelLeft,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Toggle from '../ui/Toggle';

// ── MEGA MENU DEFINITION ──────────────────────────────────────
const MEGA_MENU = [
  {
    label: 'Inventory',
    icon: Package,
    color: '#c9a84c',
    cols: [
      {
        heading: 'Products',
        items: [
          { to:'/products',   icon:Package,  label:'All Products' },
          { to:'/diamonds',   icon:Hexagon,  label:'Diamonds' },
          { to:'/gemstones',  icon:Circle,   label:'Gemstones' },
          { to:'/pearls',     icon:Star,     label:'Pearls' },
          { to:'/mountings',  icon:Layers,   label:'Mountings' },
        ],
      },
      {
        heading: 'Catalogue',
        items: [
          { to:'/categories',  icon:FolderTree, label:'Categories' },
          { to:'/collections', icon:Layers,     label:'Collections' },
          { to:'/media',       icon:Image,      label:'Media library' },
          { to:'/inventory',   icon:BarChart3,  label:'Stock & inventory' },
          { to:'/import',      icon:Upload,     label:'Bulk import' },
        ],
      },
    ],
  },
  {
    label: 'Commerce',
    icon: ShoppingCart,
    color: '#3b82f6',
    cols: [
      {
        heading: 'Sales',
        items: [
          { to:'/orders',        icon:ShoppingCart,  label:'Orders' },
          { to:'/custom-orders', icon:Package,       label:'Custom orders' },
          { to:'/enquiries',     icon:MessageSquare, label:'Enquiries' },
        ],
      },
      {
        heading: 'Customers',
        items: [
          { to:'/appointments', icon:Calendar,  label:'Appointments' },
          { to:'/customers',    icon:UserCheck, label:'Customers' },
          { to:'/exhibitions',  icon:MapPin,    label:'Exhibitions' },
        ],
      },
    ],
  },
  {
    label: 'Content',
    icon: BookOpen,
    color: '#8b5cf6',
    cols: [
      {
        heading: 'Content',
        items: [
          { to:'/marketing',    icon:Megaphone,  label:'Banners & promos' },
          { to:'/blog',         icon:BookOpen,   label:'Blog & content' },
          { to:'/locations',    icon:MapPin,     label:'Store locations' },
          { to:'/trust-badges', icon:ShieldCheck,label:'Trust badges' },
        ],
      },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    color: '#6b7280',
    cols: [
      {
        heading: 'Configuration',
        items: [
          { to:'/settings',      icon:Settings,  label:'Store settings' },
          { to:'/theme-editor',  icon:Paintbrush,label:'Theme editor' },
          { to:'/page-builder',  icon:Layout,    label:'Page builder' },
          { to:'/appearance',    icon:Paintbrush,label:'Appearance' },
          { to:'/rapnet',        icon:Zap,       label:'RapNet' },
          { to:'/plugins',       icon:Puzzle,    label:'Plugins' },
          { to:'/feature-flags', icon:ToggleLeft,label:'Feature flags' },
        ],
      },
      {
        heading: 'System',
        items: [
          { to:'/users',      icon:Users,        label:'Users & roles' },
          { to:'/audit-log',  icon:ClipboardList,label:'Audit log' },
          { to:'/dev-status',        icon:Activity,     label:'Dev status' },
          { to:'/payments',          icon:DollarSign,   label:'Payments' },
          { to:'/erp-integration',  icon:Zap,          label:'ERP Integration' },
        ],
      },
    ],
  },
];

// ── NOTIFICATION BELL ─────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen]   = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread]= useState(0);
  const ref = useRef();

  useEffect(()=>{
    api.get('/dashboard/recent-activity').then(r=>{
      const list=(r.data.data||[]).slice(0,8).map((a,i)=>({ ...a, id:i, read:i>2 }));
      setItems(list);
      setUnread(list.filter(n=>!n.read).length);
    }).catch(()=>{});
  },[]);

  useEffect(()=>{
    const fn=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown',fn);
    return()=>document.removeEventListener('mousedown',fn);
  },[]);

  const ICONS={ enquiry:'💬',appointment:'📅',order:'🛒',custom_order:'✏️',product:'💎' };

  return(
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 hover:text-ink-600 transition-colors">
        <Bell size={16}/>
        {unread>0&&<span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unread>9?'9+':unread}</span>}
      </button>
      {open&&(
        <div className="absolute right-0 top-full mt-1.5 w-80 bg-white dark:bg-ink-900 rounded-xl shadow-2xl border border-ink-200/60 dark:border-ink-700 overflow-hidden z-[200]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-800">
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-200">Notifications</p>
            {unread>0&&<button onClick={()=>{setItems(i=>i.map(x=>({...x,read:true})));setUnread(0);}} className="text-[11px] text-gold-600 font-medium">Mark all read</button>}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {items.length===0
              ? <div className="py-8 text-center text-xs text-ink-400">No notifications</div>
              : items.map(n=>(
                <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-ink-50 dark:border-ink-800/50 last:border-0 ${!n.read?'bg-gold-50/40 dark:bg-gold-900/10':''}`}>
                  <span className="text-base flex-shrink-0">{ICONS[n.type]||'🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs truncate ${!n.read?'font-semibold text-ink-700 dark:text-ink-200':'text-ink-500 dark:text-ink-400'}`}>{n.label}</p>
                    <p className="text-[10px] text-ink-400 capitalize mt-0.5">{n.sub}</p>
                  </div>
                  {!n.read&&<div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 flex-shrink-0"/>}
                </div>
              ))
            }
          </div>
          <div className="px-4 py-2 border-t border-ink-100 dark:border-ink-800 text-center">
            <a href="/audit-log" className="text-[11px] text-gold-600 font-medium">View all activity →</a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── USER DROPDOWN ─────────────────────────────────────────────
function UserMenu() {
  const { user, logout }   = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen]       = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ name:user?.name||'', email:user?.email||'' });
  const [pwForm,  setPwForm]  = useState({ current:'',next:'',confirm:'' });
  const [saving,  setSaving]  = useState(false);
  const ref = useRef();

  useEffect(()=>{
    const fn=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown',fn);
    return()=>document.removeEventListener('mousedown',fn);
  },[]);

  const saveProfile = async()=>{
    setSaving(true);
    try{ await api.patch(`/users/${user.id}`,{name:profile.name,email:profile.email}); toast.success('Profile updated'); }
    catch(e){ toast.error(e.response?.data?.message||'Failed'); }
    setSaving(false);
  };

  const changePw = async()=>{
    if(pwForm.next!==pwForm.confirm) return toast.error('Passwords do not match');
    if(pwForm.next.length<8) return toast.error('Min 8 characters');
    setSaving(true);
    try{ await api.post('/auth/change-password',{current_password:pwForm.current,new_password:pwForm.next}); toast.success('Password changed'); setPwForm({current:'',next:'',confirm:''}); }
    catch(e){ toast.error(e.response?.data?.message||'Failed'); }
    setSaving(false);
  };

  const ROLE_COLORS={ super_admin:'bg-red-100 text-red-700',admin:'bg-gold-100 text-gold-700',manager:'bg-blue-100 text-blue-700',staff:'bg-green-100 text-green-700',viewer:'bg-ink-100 text-ink-600' };
  const inp='w-full border border-ink-200 dark:border-ink-700 rounded-xl px-3 py-2 text-xs text-ink-700 dark:text-ink-200 outline-none focus:border-gold-400 bg-white dark:bg-ink-800 transition-all';
  const lbl='block text-[10px] font-semibold text-ink-400 uppercase tracking-wide mb-1';

  return(
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
        <div className="w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()||'A'}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-ink-700 dark:text-ink-200 leading-none">{user?.name}</p>
          <p className="text-[10px] text-ink-400 mt-0.5 capitalize leading-none">{user?.role?.replace('_',' ')}</p>
        </div>
        <ChevronDown size={12} className={`text-ink-400 transition-transform ${open?'rotate-180':''}`}/>
      </button>

      {open&&!showProfile&&(
        <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-ink-900 rounded-xl shadow-2xl border border-ink-200/60 dark:border-ink-700 overflow-hidden z-[200]">
          <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-800/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()||'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-700 dark:text-ink-200 truncate">{user?.name}</p>
                <p className="text-xs text-ink-400 truncate">{user?.email}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 inline-block capitalize ${ROLE_COLORS[user?.role]||''}`}>
              {user?.role?.replace('_',' ')}
            </span>
          </div>
          <div className="py-1">
            {[
              { icon:User,     label:'My profile',          fn:()=>{ setShowProfile(true); setOpen(false); } },
              { icon:dark?Sun:Moon, label:dark?'Light mode':'Dark mode', fn:toggleTheme },
              { icon:Settings, label:'Store settings',      fn:()=>{ navigate('/settings'); setOpen(false); } },
              ...((['super_admin','admin'].includes(user?.role))?[{ icon:Shield, label:'Users & roles', fn:()=>{ navigate('/users'); setOpen(false); } }]:[]),
              { icon:Eye,      label:'Dev status',          fn:()=>{ navigate('/dev-status'); setOpen(false); } },
            ].map((item,i)=>(
              <button key={i} onClick={item.fn}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors text-left">
                <item.icon size={14} className="text-ink-400 flex-shrink-0"/>
                {item.label}
              </button>
            ))}
          </div>
          <div className="border-t border-ink-100 dark:border-ink-800 py-1">
            <button onClick={()=>{ logout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
              <LogOut size={14}/> Log out
            </button>
          </div>
        </div>
      )}

      {/* Profile panel */}
      {showProfile&&(
        <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4" onClick={()=>setShowProfile(false)}>
          <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-800/50">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Profile & Preferences</h3>
              <button onClick={()=>setShowProfile(false)} className="text-ink-400 hover:text-ink-600 text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <p className={lbl}>Profile information</p>
                <div className="space-y-2">
                  <div><label className={lbl}>Name</label><input value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} className={inp}/></div>
                  <div><label className={lbl}>Email</label><input type="email" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} className={inp}/></div>
                </div>
                <button onClick={saveProfile} disabled={saving} className="btn-gold text-xs mt-3">{saving?'Saving…':'Save profile'}</button>
              </div>
              <div className="border-t border-ink-100 dark:border-ink-800 pt-4">
                <p className={lbl}>Preferences</p>
                <div className="flex items-center justify-between py-2">
                  <div><p className="text-xs font-medium text-ink-700 dark:text-ink-200">Dark mode</p></div>
                  <Toggle checked={dark} onChange={toggleTheme}/>
                </div>
              </div>
              <div className="border-t border-ink-100 dark:border-ink-800 pt-4">
                <p className={lbl}>Change password</p>
                <div className="space-y-2">
                  <div><label className={lbl}>Current password</label><input type="password" value={pwForm.current} onChange={e=>setPwForm(p=>({...p,current:e.target.value}))} className={inp}/></div>
                  <div><label className={lbl}>New password</label><input type="password" value={pwForm.next} onChange={e=>setPwForm(p=>({...p,next:e.target.value}))} className={inp}/></div>
                  <div><label className={lbl}>Confirm</label><input type="password" value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} className={inp}/></div>
                </div>
                <button onClick={changePw} disabled={saving||!pwForm.current||!pwForm.next} className="btn-gold text-xs mt-3">{saving?'Updating…':'Update password'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN TOPNAVBAR ────────────────────────────────────────────
export default function TopNavBar({ navMode, onToggleNavMode, sidebarCollapsed, onToggleSidebar, bp="desktop" }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef();

  useEffect(()=>{
    const fn=e=>{ if(menuRef.current&&!menuRef.current.contains(e.target)) setActiveMenu(null); };
    document.addEventListener('mousedown',fn);
    return()=>document.removeEventListener('mousedown',fn);
  },[]);

  const isSidebar = navMode === 'sidebar';

  return (
    <div className="flex-shrink-0 bg-white dark:bg-ink-900 border-b border-ink-200/60 dark:border-ink-800 z-[100] relative"
      style={{ height: 52 }}>
      <div className="flex items-center h-full px-3 gap-2">

        {/* Hamburger — always on mobile, only in sidebar mode on desktop */}
        {(isSidebar || bp === 'mobile') && (
          <button onClick={onToggleSidebar}
            className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 transition-colors flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="4"    width="12" height="1.5" rx=".75" fill="currentColor"/>
              <rect x="2" y="7.25" width="9"  height="1.5" rx=".75" fill="currentColor"/>
              <rect x="2" y="10.5" width="12" height="1.5" rx=".75" fill="currentColor"/>
            </svg>
          </button>
        )}

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 flex-shrink-0 mr-2 no-underline">
          <div className="w-7 h-7 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-ink-800 dark:text-ink-100 hidden sm:block" style={{fontFamily:"'Playfair Display',serif"}}>
            JewelCMS
          </span>
        </NavLink>

        {/* MEGA MENU (topbar mode only, desktop only) */}
        {!isSidebar && bp === 'desktop' && (
          <nav ref={menuRef} className="flex items-center gap-0.5 flex-1">
            {/* Dashboard */}
            <NavLink to="/" end
              className={({isActive})=>`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors no-underline ${isActive?'bg-gold-50 dark:bg-gold-900/20 text-gold-600':'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'}`}>
              <LayoutDashboard size={13}/> Dashboard
            </NavLink>

            {/* Mega menu items */}
            {MEGA_MENU.map(menu=>(
              <div key={menu.label} className="relative">
                <button
                  onClick={()=>setActiveMenu(activeMenu===menu.label?null:menu.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeMenu===menu.label?'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200':'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'}`}>
                  <menu.icon size={13}/>
                  {menu.label}
                  <ChevronDown size={10} className={`transition-transform ${activeMenu===menu.label?'rotate-180':''}`}/>
                </button>

                {/* Mega panel */}
                {activeMenu===menu.label&&(
                  <div className="absolute left-0 top-full mt-1 bg-white dark:bg-ink-900 rounded-xl shadow-2xl border border-ink-200/60 dark:border-ink-700 overflow-hidden z-[200]"
                    style={{ minWidth: menu.cols.length > 1 ? 440 : 220 }}>
                    <div className="flex" onClick={()=>setActiveMenu(null)}>
                      {menu.cols.map((col,ci)=>(
                        <div key={ci} className={`flex-1 p-3 ${ci>0?'border-l border-ink-100 dark:border-ink-800':''}`}>
                          <p className="text-[10px] font-bold text-ink-400 dark:text-ink-500 uppercase tracking-widest px-2 pb-2">{col.heading}</p>
                          {col.items.map(item=>(
                            <NavLink key={item.to} to={item.to}
                              className={({isActive})=>`flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs transition-colors no-underline ${isActive?'bg-gold-50 dark:bg-gold-900/20 text-gold-600 font-semibold':'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800'}`}>
                              <item.icon size={13} className="flex-shrink-0 opacity-60"/>
                              {item.label}
                            </NavLink>
                          ))}
                        </div>
                      ))}
                    </div>
                    {/* Accent bar at bottom */}
                    <div style={{ height:2, background:menu.color, opacity:0.6 }}/>
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Spacer for sidebar mode */}
        {isSidebar && <div className="flex-1"/>}

        {/* Right side — always visible */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Nav mode toggle — desktop only */}
          {bp !== 'mobile' && <button
            onClick={onToggleNavMode}
            title={isSidebar ? 'Switch to top navigation' : 'Switch to sidebar navigation'}
            className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 hover:text-gold-600 transition-colors"
          >
            {isSidebar ? <LayoutList size={16}/> : <PanelLeft size={16}/>}
          </button>}
          <NotificationBell/>
          <UserMenu/>
        </div>
      </div>
    </div>
  );
}
