import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import Toggle from '../components/ui/Toggle';
import api from '../services/api';
import { Save, Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

// ── NAV TYPES ─────────────────────────────────────────────────
const NAV_TYPES = [
  { id:'standard',  label:'Standard Menu',  icon:'≡',  desc:'Simple horizontal links, dropdown on hover' },
  { id:'mega',      label:'Mega Menu',      icon:'⊞',  desc:'Full-width panel with columns and images (Palmiero-style)' },
  { id:'centered',  label:'Centered Logo',  icon:'⊡',  desc:'Logo in center, nav split on both sides' },
  { id:'minimal',   label:'Minimal',        icon:'—',  desc:'Clean single-line navigation' },
];

// Default Tejori menu structure
const DEFAULT_MENU = [
  { id:1, label:'High Jewellery', href:'/jewellery?type=high', type:'mega', children:[
    { id:11, label:'Necklaces',  href:'/jewellery?type=high&category=necklaces' },
    { id:12, label:'Earrings',   href:'/jewellery?type=high&category=earrings' },
    { id:13, label:'Bracelets',  href:'/jewellery?type=high&category=bracelets' },
    { id:14, label:'Rings',      href:'/jewellery?type=high&category=rings' },
  ]},
  { id:2, label:'Jewellery',    href:'/jewellery', type:'mega', children:[
    { id:21, label:'Necklaces',  href:'/jewellery?category=necklaces' },
    { id:22, label:'Earrings',   href:'/jewellery?category=earrings' },
    { id:23, label:'Bracelets',  href:'/jewellery?category=bracelets' },
    { id:24, label:'Rings',      href:'/jewellery?category=rings' },
    { id:25, label:'Pendants',   href:'/jewellery?category=pendants' },
  ]},
  { id:3, label:'Lab-Diamond',  href:'/lab-grown', type:'dropdown', children:[
    { id:31, label:'What are Lab Grown Diamonds?', href:'/lab-grown' },
    { id:32, label:'Lab Necklaces',  href:'/lab-grown?category=necklaces' },
    { id:33, label:'Lab Rings',      href:'/lab-grown?category=rings' },
  ]},
  { id:4, label:'Bespoke Services', href:'/custom', type:'dropdown', children:[
    { id:41, label:'Pick your diamond',    href:'/diamonds' },
    { id:42, label:'Designing bespoke',    href:'/custom' },
    { id:43, label:'Book consultation',    href:'/appointment' },
  ]},
  { id:5, label:'News', href:'/blog', type:'dropdown', children:[
    { id:51, label:'Stories',            href:'/blog?cat=stories' },
    { id:52, label:'Jewellery Care',     href:'/blog?cat=care' },
    { id:53, label:'Upcoming Events',    href:'/exhibitions' },
  ]},
  { id:6, label:'Our Heritage', href:'/about', type:'dropdown', children:[
    { id:61, label:'Legacy',                    href:'/about' },
    { id:62, label:'Craftsmanship & Expertise', href:'/about#craftsmanship' },
    { id:63, label:'Find a Boutique',           href:'/boutiques' },
  ]},
];

const lbl = 'block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-1.5';
const inp = 'input-field text-sm';

export default function MenuBuilderPage() {
  const { collapsed } = useOutletContext()||{};
  const [navType,  setNavType]  = useState('mega');
  const [menu,     setMenu]     = useState(DEFAULT_MENU);
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [newItem,  setNewItem]  = useState({ label:'', href:'' });

  useEffect(() => {
    api.get('/settings').then(r => {
      const map = {};
      (r.data.data||[]).forEach(s => { map[s.key] = typeof s.value==='string'?s.value.replace(/^"|"$/g,''):String(s.value||''); });
      if (map.nav_type) setNavType(map.nav_type);
      if (map.nav_menu) { try { setMenu(JSON.parse(map.nav_menu)); } catch {} }
    }).catch(()=>{});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/settings/bulk', { settings:[
        { key:'nav_type',  value: navType },
        { key:'nav_menu',  value: JSON.stringify(menu) },
      ]});
      toast.success('Menu saved — storefront updated');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const updateItem = (id, field, value) => {
    setMenu(m => m.map(item =>
      item.id===id ? { ...item, [field]:value }
      : { ...item, children: item.children?.map(c => c.id===id ? { ...c, [field]:value } : c) }
    ));
  };

  const addTopItem = () => {
    if (!newItem.label) return;
    const id = Date.now();
    setMenu(m => [...m, { id, label:newItem.label, href:newItem.href||'#', type:'dropdown', children:[] }]);
    setNewItem({ label:'', href:'' });
    toast.success('Menu item added');
  };

  const addChild = (parentId) => {
    const id = Date.now();
    setMenu(m => m.map(item =>
      item.id===parentId
        ? { ...item, children:[...(item.children||[]), { id, label:'New item', href:'#' }] }
        : item
    ));
  };

  const deleteItem = (id, parentId) => {
    if (parentId) {
      setMenu(m => m.map(item =>
        item.id===parentId
          ? { ...item, children:item.children?.filter(c=>c.id!==id) }
          : item
      ));
    } else {
      setMenu(m => m.filter(item=>item.id!==id));
    }
    if (selected===id) setSelected(null);
  };

  const moveItem = (id, dir) => {
    setMenu(prev => {
      const arr = [...prev];
      const idx = arr.findIndex(i=>i.id===id);
      if (idx<0) return prev;
      const newIdx = idx+dir;
      if (newIdx<0||newIdx>=arr.length) return prev;
      [arr[idx],arr[newIdx]] = [arr[newIdx],arr[idx]];
      return arr;
    });
  };

  const sel = selected ? (
    menu.find(i=>i.id===selected) ||
    menu.flatMap(i=>i.children||[]).find(i=>i.id===selected)
  ) : null;
  const isChild = selected && !menu.find(i=>i.id===selected);
  const parentId = isChild ? menu.find(i=>i.children?.some(c=>c.id===selected))?.id : null;

  return (
    <>
      <Topbar title="Menu builder" subtitle="Configure navigation type and menu items"
        actions={<button onClick={save} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs"><Save size={13}/>{saving?'Saving…':'Save & Publish'}</button>}/>

      <div className="flex flex-1 overflow-hidden">
        {/* Left — tree */}
        <div className="w-80 flex-shrink-0 border-r border-ink-200/60 dark:border-ink-800 bg-ink-50 dark:bg-ink-900/50 flex flex-col overflow-hidden">
          {/* Nav type selector */}
          <div className="p-4 border-b border-ink-200/60 dark:border-ink-800">
            <p className={lbl}>Navigation style</p>
            <div className="grid grid-cols-2 gap-2">
              {NAV_TYPES.map(t=>(
                <button key={t.id} onClick={()=>setNavType(t.id)}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all ${navType===t.id?'border-gold-500 bg-gold-50 dark:bg-gold-900/20':'border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 hover:border-gold-300'}`}>
                  <div className="text-lg mb-0.5">{t.icon}</div>
                  <div className={`text-xs font-semibold ${navType===t.id?'text-gold-700':'text-ink-600 dark:text-ink-300'}`}>{t.label}</div>
                  <div className="text-[10px] text-ink-400 mt-0.5 leading-tight">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Menu tree */}
          <div className="flex-1 overflow-y-auto p-3">
            <p className={lbl + ' mb-3'}>Menu items</p>
            <div className="space-y-1">
              {menu.map((item,i)=>(
                <div key={item.id}>
                  {/* Top level */}
                  <div onClick={()=>setSelected(item.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${selected===item.id?'bg-white dark:bg-ink-800 shadow-sm border border-gold-200 dark:border-gold-800':'hover:bg-white dark:hover:bg-ink-800'}`}>
                    <GripVertical size={12} className="text-ink-300"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink-700 dark:text-ink-200 truncate">{item.label}</p>
                      <p className="text-[10px] text-ink-400 truncate">{item.href}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={e=>{e.stopPropagation();moveItem(item.id,-1);}} disabled={i===0} className="p-0.5 text-ink-300 hover:text-ink-600 disabled:opacity-20"><ChevronUp size={10}/></button>
                      <button onClick={e=>{e.stopPropagation();moveItem(item.id,1);}} disabled={i===menu.length-1} className="p-0.5 text-ink-300 hover:text-ink-600 disabled:opacity-20"><ChevronDown size={10}/></button>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${item.type==='mega'?'bg-blue-100 text-blue-600':'bg-ink-100 text-ink-500'}`}>{item.type}</span>
                  </div>
                  {/* Children */}
                  {item.children?.map(child=>(
                    <div key={child.id} onClick={()=>setSelected(child.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg ml-5 cursor-pointer transition-all mt-0.5 ${selected===child.id?'bg-white dark:bg-ink-800 shadow-sm border border-gold-200':'hover:bg-white dark:hover:bg-ink-800'}`}>
                      <div className="w-3 h-px bg-ink-200 flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-ink-600 dark:text-ink-300 truncate">{child.label}</p>
                      </div>
                      <button onClick={e=>{e.stopPropagation();deleteItem(child.id,item.id);}} className="p-0.5 text-ink-300 hover:text-red-500"><Trash2 size={10}/></button>
                    </div>
                  ))}
                  {/* Add child */}
                  <button onClick={()=>addChild(item.id)}
                    className="flex items-center gap-1.5 ml-5 mt-0.5 px-2.5 py-1.5 text-[10px] text-ink-400 hover:text-gold-600 transition-colors">
                    <Plus size={10}/> Add sub-item
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add top-level item */}
          <div className="p-3 border-t border-ink-200/60 dark:border-ink-800 space-y-2">
            <input value={newItem.label} onChange={e=>setNewItem(n=>({...n,label:e.target.value}))} className={inp} placeholder="Menu label"/>
            <input value={newItem.href}  onChange={e=>setNewItem(n=>({...n,href:e.target.value}))}  className={inp} placeholder="/link"/>
            <button onClick={addTopItem} className="btn-gold w-full justify-center text-xs"><Plus size={12}/> Add menu item</button>
          </div>
        </div>

        {/* Right — item editor */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-4">⬅️</div>
              <p className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-2">Select a menu item to edit</p>
              <p className="text-xs text-ink-400">Click any item in the left panel</p>
            </div>
          ) : sel ? (
            <div className="max-w-md space-y-4">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Edit: {sel.label}</h3>
              <div><label className={lbl}>Label</label>
                <input value={sel.label} onChange={e=>updateItem(sel.id,'label',e.target.value)} className={inp}/></div>
              <div><label className={lbl}>Link (href)</label>
                <input value={sel.href} onChange={e=>updateItem(sel.id,'href',e.target.value)} className={inp} placeholder="/jewellery"/></div>
              {!isChild && (
                <div><label className={lbl}>Dropdown type</label>
                  <div className="flex gap-2">
                    {['dropdown','mega','none'].map(t=>(
                      <button key={t} onClick={()=>updateItem(sel.id,'type',t)}
                        className={`px-4 py-2 rounded-lg border text-xs font-semibold capitalize transition-all ${sel.type===t?'border-gold-500 bg-gold-50 text-gold-700':'border-ink-200 text-ink-500 hover:border-gold-300'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-ink-400 mt-2">
                    <strong>dropdown</strong> = standard hover menu · <strong>mega</strong> = full-width panel with image · <strong>none</strong> = direct link
                  </p>
                </div>
              )}
              <div className="pt-4">
                <button onClick={()=>deleteItem(sel.id, parentId)}
                  className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 transition-colors">
                  <Trash2 size={12}/> Delete this item
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
