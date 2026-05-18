import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import Toggle from '../components/ui/Toggle';
import api from '../services/api';
import { Save, ChevronDown, ChevronUp, GripVertical, Edit2, X, Check, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

// ── HERO VARIANTS ─────────────────────────────────────────────
const HERO_TYPES = [
  { id:'fullscreen', label:'Full Screen', icon:'🖼️', desc:'Single full-height image with text overlay' },
  { id:'slider',     label:'Slider',      icon:'🎠', desc:'Multiple slides with auto-play transitions' },
  { id:'split',      label:'Split Screen',icon:'↔️', desc:'Image on right, text on left' },
  { id:'video',      label:'Video Hero',  icon:'🎥', desc:'Background video with text overlay' },
  { id:'minimal',    label:'Minimal',     icon:'—',  desc:'Text only, no image background' },
];

const SLIDE_TRANSITIONS = [
  { id:'fade',   label:'Fade' },
  { id:'slide',  label:'Slide' },
  { id:'zoom',   label:'Zoom' },
  { id:'flip',   label:'Flip' },
];

// ── HOMEPAGE SECTIONS ─────────────────────────────────────────
const DEFAULT_SECTIONS = [
  { key:'hero',            label:'Hero Section',          icon:'🖼️', enabled:true,  order:1 },
  { key:'announcement',    label:'Announcement Bar',      icon:'📢', enabled:true,  order:2 },
  { key:'categories',      label:'Top Categories',        icon:'⭕', enabled:true,  order:3 },
  { key:'featured',        label:'Featured Products',     icon:'💎', enabled:true,  order:4 },
  { key:'promo_strip',     label:'Promo Strip',           icon:'🎯', enabled:true,  order:5 },
  { key:'brand_story',     label:'Brand Story',           icon:'📖', enabled:true,  order:6 },
  { key:'testimonials',    label:'Testimonials',          icon:'⭐', enabled:false, order:7 },
  { key:'collection_banners',label:'Collection Banners',  icon:'🗂️', enabled:true,  order:8 },
  { key:'newsletter',      label:'Newsletter',            icon:'📧', enabled:true,  order:9 },
  { key:'cert_logos',      label:'Certification Logos',   icon:'🏅', enabled:true,  order:10 },
  { key:'editorial',       label:'Editorial Collections', icon:'🎨', enabled:true,  order:11 },
  { key:'learning',        label:'Learning Center',       icon:'📚', enabled:true,  order:12 },
  { key:'about',           label:'About Us',              icon:'🏛️', enabled:true,  order:13 },
  { key:'why_choose',      label:'Why Choose Tejori',     icon:'🏆', enabled:true,  order:14 },
  { key:'events',          label:'Upcoming Events',       icon:'📅', enabled:true,  order:15 },
];

// ── SECTION CONTENT EDITORS ───────────────────────────────────
const SECTION_EDITORS = {
  hero: ({ data, set }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Hero type</label>
        <div className="grid grid-cols-5 gap-2">
          {HERO_TYPES.map(t => (
            <button key={t.id} onClick={() => set('hero_type', t.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${data.hero_type===t.id?'border-gold-500 bg-gold-50':'border-ink-200 hover:border-gold-300'}`}>
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="text-[10px] font-medium text-ink-600">{t.label}</div>
            </button>
          ))}
        </div>
      </div>
      {data.hero_type === 'slider' && (
        <div>
          <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Slide transition</label>
          <div className="flex gap-2">
            {SLIDE_TRANSITIONS.map(t => (
              <button key={t.id} onClick={() => set('slide_transition', t.id)}
                className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all ${data.slide_transition===t.id?'border-gold-500 bg-gold-50 text-gold-700':'border-ink-200 text-ink-500 hover:border-gold-300'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Headline</label>
        <input value={data.hero_headline||''} onChange={e=>set('hero_headline',e.target.value)} className="input-field" placeholder="Frost Yourself"/></div>
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Subtext</label>
        <textarea value={data.hero_subtext||''} onChange={e=>set('hero_subtext',e.target.value)} className="input-field" rows={2} placeholder="Dazzling pear and marquise diamonds..."/></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">CTA Button text</label>
          <input value={data.hero_cta_text||''} onChange={e=>set('hero_cta_text',e.target.value)} className="input-field" placeholder="Discover the selection"/></div>
        <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">CTA Link</label>
          <input value={data.hero_cta_link||''} onChange={e=>set('hero_cta_link',e.target.value)} className="input-field" placeholder="/jewellery"/></div>
      </div>
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Background image URL</label>
        <input value={data.hero_image||''} onChange={e=>set('hero_image',e.target.value)} className="input-field" placeholder="https://..."/>
        {data.hero_image && <img src={data.hero_image} alt="Hero preview" className="mt-2 w-full h-32 object-cover rounded-lg"/>}
      </div>
    </div>
  ),

  announcement: ({ data, set }) => (
    <div className="space-y-4">
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Bar text</label>
        <input value={data.announcement_text||''} onChange={e=>set('announcement_text',e.target.value)} className="input-field" placeholder="Free shipping on all orders · GIA & IGI Certified"/></div>
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Background color</label>
        <div className="flex gap-2">
          {['#1a1a1a','#b8860b','#3d2b1a','#0f172a','#0d3333'].map(c=>(
            <button key={c} onClick={()=>set('announcement_bg',c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${data.announcement_bg===c?'border-gold-500 scale-110':'border-transparent'}`}
              style={{ background:c }}/>
          ))}
          <input type="color" value={data.announcement_bg||'#1a1a1a'} onChange={e=>set('announcement_bg',e.target.value)} className="w-8 h-8 rounded-full border border-ink-200 cursor-pointer"/>
        </div>
      </div>
    </div>
  ),

  brand_story: ({ data, set }) => (
    <div className="space-y-4">
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Section label</label>
        <input value={data.brand_label||''} onChange={e=>set('brand_label',e.target.value)} className="input-field" placeholder="Our Promise"/></div>
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Heading</label>
        <input value={data.brand_heading||''} onChange={e=>set('brand_heading',e.target.value)} className="input-field" placeholder="Handcrafted & Ethically Sourced"/></div>
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Body text</label>
        <textarea value={data.brand_text||''} onChange={e=>set('brand_text',e.target.value)} className="input-field" rows={3}/></div>
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Image URL</label>
        <input value={data.brand_image||''} onChange={e=>set('brand_image',e.target.value)} className="input-field" placeholder="https://..."/>
        {data.brand_image && <img src={data.brand_image} alt="" className="mt-2 w-full h-32 object-cover rounded-lg"/>}
      </div>
    </div>
  ),

  about: ({ data, set }) => (
    <div className="space-y-4">
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Heading</label>
        <input value={data.about_heading||''} onChange={e=>set('about_heading',e.target.value)} className="input-field" placeholder="Our Heritage"/></div>
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Body text</label>
        <textarea value={data.about_text||''} onChange={e=>set('about_text',e.target.value)} className="input-field" rows={4}/></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Legacy number</label>
          <input value={data.about_legacy||''} onChange={e=>set('about_legacy',e.target.value)} className="input-field" placeholder="60+"/></div>
        <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Legacy label</label>
          <input value={data.about_legacy_label||''} onChange={e=>set('about_legacy_label',e.target.value)} className="input-field" placeholder="Years of Legacy"/></div>
      </div>
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Image URL</label>
        <input value={data.about_image||''} onChange={e=>set('about_image',e.target.value)} className="input-field"/>
        {data.about_image && <img src={data.about_image} alt="" className="mt-2 w-full h-32 object-cover rounded-lg"/>}
      </div>
    </div>
  ),

  newsletter: ({ data, set }) => (
    <div className="space-y-4">
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Heading</label>
        <input value={data.newsletter_heading||''} onChange={e=>set('newsletter_heading',e.target.value)} className="input-field" placeholder="Stay in the world of Tejori"/></div>
      <div><label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Subtext</label>
        <input value={data.newsletter_subtext||''} onChange={e=>set('newsletter_subtext',e.target.value)} className="input-field" placeholder="Subscribe for 10% off your first purchase."/></div>
      <div className="flex items-center justify-between p-3 bg-ink-50 rounded-xl">
        <span className="text-sm text-ink-700">Show newsletter on product pages</span>
        <Toggle checked={data.newsletter_on_product!==false} onChange={v=>set('newsletter_on_product',v)}/>
      </div>
    </div>
  ),
};

// ── DRAGGABLE SECTION ROW ─────────────────────────────────────
function SectionRow({ section, onToggle, onEdit, onMoveUp, onMoveDown, isFirst, isLast }) {
  return (
    <div className={`flex items-center gap-3 p-3.5 bg-white dark:bg-ink-900 border rounded-xl transition-all ${section.enabled?'border-ink-200 dark:border-ink-700':'border-ink-100 dark:border-ink-800 opacity-60'}`}>
      <div className="flex flex-col gap-0.5">
        <button onClick={onMoveUp} disabled={isFirst} className="p-0.5 text-ink-300 hover:text-ink-600 disabled:opacity-20"><ChevronUp size={12}/></button>
        <button onClick={onMoveDown} disabled={isLast} className="p-0.5 text-ink-300 hover:text-ink-600 disabled:opacity-20"><ChevronDown size={12}/></button>
      </div>
      <GripVertical size={14} className="text-ink-300 cursor-grab flex-shrink-0"/>
      <span className="text-lg flex-shrink-0">{section.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${section.enabled?'text-ink-700 dark:text-ink-200':'text-ink-400'}`}>{section.label}</p>
      </div>
      <div className="flex items-center gap-2">
        {SECTION_EDITORS[section.key] && (
          <button onClick={() => onEdit(section.key)}
            className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 hover:text-ink-600 transition-colors">
            <Edit2 size={13}/>
          </button>
        )}
        <Toggle checked={section.enabled} onChange={v => onToggle(section.key, v)}/>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function HomeBuilderPage() {
  const { collapsed } = useOutletContext()||{};
  const [sections, setSections]   = useState(DEFAULT_SECTIONS);
  const [content,  setContent]    = useState({});
  const [saving,   setSaving]     = useState(false);
  const [editKey,  setEditKey]    = useState(null);
  const [tab,      setTab]        = useState('sections');

  useEffect(() => {
    api.get('/settings').then(r => {
      const map = {};
      (r.data.data||[]).forEach(s => {
        map[s.key] = typeof s.value==='string' ? s.value.replace(/^"|"$/g,'') : String(s.value||'');
      });

      // Load section order/visibility
      if (map.homepage_sections_config) {
        try {
          const saved = JSON.parse(map.homepage_sections_config);
          if (Array.isArray(saved)) {
            setSections(saved);
            return;
          }
        } catch {}
      }
      // Load content settings
      setContent(map);
    }).catch(() => {});
  }, []);

  const setContentKey = (k, v) => setContent(c => ({ ...c, [k]: v }));

  const toggleSection = (key, enabled) => {
    setSections(s => s.map(sec => sec.key===key ? { ...sec, enabled } : sec));
  };

  const moveSection = (key, dir) => {
    setSections(prev => {
      const arr = [...prev].sort((a,b)=>a.order-b.order);
      const idx = arr.findIndex(s=>s.key===key);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return prev;
      [arr[idx].order, arr[newIdx].order] = [arr[newIdx].order, arr[idx].order];
      return arr;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const sorted = [...sections].sort((a,b)=>a.order-b.order);
      const settings = [
        { key:'homepage_sections_config', value: JSON.stringify(sorted) },
        ...Object.entries(content).map(([key,value]) => ({ key, value: String(value) })),
      ];
      await api.post('/settings/bulk', { settings });
      toast.success('Homepage saved — storefront updated');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const sorted = [...sections].sort((a,b)=>a.order-b.order);
  const EditComponent = editKey ? SECTION_EDITORS[editKey] : null;

  return (
    <>
      <Topbar title="Home page content" subtitle="Control what shows on your homepage and how"
        actions={
          <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
            <Save size={13}/>{saving?'Saving…':'Save & Publish'}
          </button>
        }/>

      <div className="flex flex-1 overflow-hidden">
        {/* Left — sections list */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-ink-50 dark:bg-ink-800/50 p-1 rounded-xl w-fit">
            {['sections','hero'].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${tab===t?'bg-white dark:bg-ink-800 text-gold-600 shadow-sm':'text-ink-400 hover:text-ink-600'}`}>
                {t==='sections'?'Section order & visibility':'Hero settings'}
              </button>
            ))}
          </div>

          {tab === 'sections' && (
            <div className="max-w-xl space-y-2">
              <p className="text-xs text-ink-400 mb-4">Drag rows to reorder · Toggle to show/hide · Click ✏️ to edit content</p>
              {sorted.map((sec, idx) => (
                <SectionRow key={sec.key} section={sec}
                  isFirst={idx===0} isLast={idx===sorted.length-1}
                  onToggle={toggleSection}
                  onMoveUp={()=>moveSection(sec.key,-1)}
                  onMoveDown={()=>moveSection(sec.key,1)}
                  onEdit={k=>setEditKey(editKey===k?null:k)}/>
              ))}
            </div>
          )}

          {tab === 'hero' && (
            <div className="max-w-xl">
              <p className="text-xs text-ink-400 mb-4">Configure your hero section — type, content, images</p>
              {SECTION_EDITORS.hero({ data:content, set:setContentKey })}
            </div>
          )}
        </div>

        {/* Right — section editor panel */}
        {EditComponent && editKey !== 'hero' && (
          <div className="w-80 flex-shrink-0 border-l border-ink-200/60 dark:border-ink-800 bg-white dark:bg-ink-900 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-800">
              <p className="text-sm font-semibold text-ink-700 dark:text-ink-200 capitalize">
                Edit: {sections.find(s=>s.key===editKey)?.label}
              </p>
              <button onClick={()=>setEditKey(null)} className="p-1 rounded hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400">
                <X size={14}/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <EditComponent data={content} set={setContentKey}/>
            </div>
            <div className="px-4 py-3 border-t border-ink-100 dark:border-ink-800">
              <button onClick={()=>setEditKey(null)} className="btn-gold w-full justify-center text-xs">
                <Check size={12}/> Done editing
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
