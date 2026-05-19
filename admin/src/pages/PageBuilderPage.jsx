import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Save, Eye, Smartphone, Tablet, Monitor, Trash2,
  ChevronUp, ChevronDown, GripVertical, Plus,
  X, Check, Settings, RotateCcw, Copy,
} from 'lucide-react';

// ── SECTION REGISTRY (mirrors storefront/src/lib/pageSchema.js) ──
const REGISTRY = {
  hero:                 { label:'Hero Banner',           icon:'🖼️', cat:'Hero',       defaults:{ type:'fullscreen', headline:'Frost Yourself', subtext:'Dazzling pear and marquise diamonds.', cta_text:'Discover the selection', cta_link:'/jewellery', label:'New Collection', image:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80', overlay:65, transition:'fade' }, fields:[{key:'type',label:'Hero style',type:'select',options:['fullscreen','slider','split','video','minimal']},{key:'headline',label:'Headline',type:'text'},{key:'subtext',label:'Subtext',type:'textarea'},{key:'cta_text',label:'Button text',type:'text'},{key:'cta_link',label:'Button link',type:'text'},{key:'label',label:'Top label',type:'text'},{key:'image',label:'Background image',type:'image'},{key:'overlay',label:'Overlay %',type:'range',min:0,max:90,step:5},{key:'transition',label:'Slide transition',type:'select',options:['fade','slide','zoom']}] },
  products_grid:        { label:'Products Grid',         icon:'💎', cat:'Products',   defaults:{ cols:4, label:'Featured', heading:'Our Selection', bg:'#fdf8f3', filter:'featured', cta_text:'View All', cta_link:'/jewellery' }, fields:[{key:'cols',label:'Columns',type:'select',options:['2','3','4']},{key:'label',label:'Top label',type:'text'},{key:'heading',label:'Heading',type:'text'},{key:'filter',label:'Show',type:'select',options:['featured','new','all']},{key:'bg',label:'Background',type:'color'},{key:'cta_text',label:'Button text',type:'text'},{key:'cta_link',label:'Button link',type:'text'}] },
  products_carousel:    { label:'Products Carousel',     icon:'🎠', cat:'Products',   defaults:{ label:'Featured', heading:'Our Selection', bg:'#fdf8f3' }, fields:[{key:'label',label:'Top label',type:'text'},{key:'heading',label:'Heading',type:'text'},{key:'bg',label:'Background',type:'color'}] },
  categories_circles:   { label:'Category Circles',      icon:'⭕', cat:'Categories', defaults:{ heading:'Top Categories', bg:'#ffffff' }, fields:[{key:'heading',label:'Heading',type:'text'},{key:'bg',label:'Background',type:'color'}] },
  categories_cards:     { label:'Category Cards',        icon:'🗂️', cat:'Categories', defaults:{ heading:'Shop by Category', bg:'#fdf8f3' }, fields:[{key:'heading',label:'Heading',type:'text'},{key:'bg',label:'Background',type:'color'}] },
  brand_story:          { label:'Brand Story',           icon:'📖', cat:'Content',    defaults:{ label:'Our Promise', heading:'Handcrafted & Ethically Sourced', body:'With a legacy spanning 60 years, TEJORI is dedicated to offering a wide range of exquisite jewellery pieces.', image:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=700&q=80', image_side:'right', cta_text:'Learn More', cta_link:'/about', bg:'#ffffff' }, fields:[{key:'label',label:'Top label',type:'text'},{key:'heading',label:'Heading',type:'text'},{key:'body',label:'Body text',type:'textarea'},{key:'image',label:'Image URL',type:'image'},{key:'image_side',label:'Image side',type:'select',options:['left','right']},{key:'cta_text',label:'Button text',type:'text'},{key:'cta_link',label:'Button link',type:'text'},{key:'bg',label:'Background',type:'color'}] },
  about_heritage:       { label:'About / Heritage',      icon:'🏛️', cat:'Content',    defaults:{ label:'About us', heading:'Our Heritage', body:'Founded in 2004, Tejori has become one of the most respected jewellery brands in the GCC.', image:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=700&q=80', legacy_number:'60+', legacy_label:'Years of Legacy', cta_text:'Learn More', cta_link:'/about', bg:'#ffffff' }, fields:[{key:'label',label:'Top label',type:'text'},{key:'heading',label:'Heading',type:'text'},{key:'body',label:'Body text',type:'textarea'},{key:'image',label:'Image URL',type:'image'},{key:'legacy_number',label:'Legacy number',type:'text'},{key:'legacy_label',label:'Legacy label',type:'text'},{key:'cta_text',label:'Button',type:'text'},{key:'cta_link',label:'Link',type:'text'},{key:'bg',label:'Background',type:'color'}] },
  testimonials_carousel:{ label:'Testimonials Carousel', icon:'⭐', cat:'Content',    defaults:{ label:'What Our Clients Say', bg:'#fdf8f3' }, fields:[{key:'label',label:'Top label',type:'text'},{key:'bg',label:'Background',type:'color'}] },
  testimonials_grid:    { label:'Testimonials Grid',     icon:'⭐', cat:'Content',    defaults:{ label:'What Our Clients Say', bg:'#ffffff' }, fields:[{key:'label',label:'Top label',type:'text'},{key:'bg',label:'Background',type:'color'}] },
  why_choose:           { label:'Why Choose Us',         icon:'🏆', cat:'Content',    defaults:{ label:'Our Difference', heading:'Why choose TEJORI?', bg:'#fdf8f3' }, fields:[{key:'label',label:'Top label',type:'text'},{key:'heading',label:'Heading',type:'text'},{key:'bg',label:'Background',type:'color'}] },
  learning_center:      { label:'Learning Center',       icon:'📚', cat:'Content',    defaults:{ label:'Education', heading:'The Learning Center', body:'Whether you\'re buying jewellery for the first time or need a refresher.', cta_text:'Learn more', cta_link:'/blog', image:'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=1400&q=80' }, fields:[{key:'label',label:'Top label',type:'text'},{key:'heading',label:'Heading',type:'text'},{key:'body',label:'Body text',type:'textarea'},{key:'cta_text',label:'Button text',type:'text'},{key:'cta_link',label:'Button link',type:'text'},{key:'image',label:'Image URL',type:'image'}] },
  editorial_banner:     { label:'Editorial Full Width',  icon:'🎨', cat:'Banners',    defaults:{ heading:'Classics', body:'Timeless and elegant jewellery that never goes out of style.', cta_text:'Discover the selection', cta_link:'/jewellery?collection=classics', image:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=80', overlay:45, text_align:'left' }, fields:[{key:'heading',label:'Heading',type:'text'},{key:'body',label:'Body text',type:'textarea'},{key:'cta_text',label:'Button',type:'text'},{key:'cta_link',label:'Link',type:'text'},{key:'image',label:'Image URL',type:'image'},{key:'text_align',label:'Text align',type:'select',options:['left','center','right']},{key:'overlay',label:'Overlay %',type:'range',min:0,max:80,step:5}] },
  collection_banners:   { label:'Collection Banners',    icon:'🗂️', cat:'Banners',    defaults:{ left_title:'Summer Collections', left_sub:'Freshwater pearl necklace and earrings', left_href:'/jewellery', left_image:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&q=80', right_title:'Make it memorable', right_sub:'Bespoke jewellery for life\'s moments', right_href:'/custom', right_image:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80' }, fields:[{key:'left_title',label:'Left title',type:'text'},{key:'left_sub',label:'Left subtext',type:'text'},{key:'left_href',label:'Left link',type:'text'},{key:'left_image',label:'Left image URL',type:'image'},{key:'right_title',label:'Right title',type:'text'},{key:'right_sub',label:'Right subtext',type:'text'},{key:'right_href',label:'Right link',type:'text'},{key:'right_image',label:'Right image URL',type:'image'}] },
  promo_strip:          { label:'Promo Strip',           icon:'🎯', cat:'Banners',    defaults:{ b1_label:'New Arrivals', b1_link:'/jewellery?is_new=true', b1_bg:'#1a1a1a', b2_label:'Best Seller', b2_link:'/jewellery?sort=featured', b2_bg:'#b8860b', b3_label:'Clearance Sale', b3_link:'/jewellery?on_sale=true', b3_bg:'#3d2b1a' }, fields:[{key:'b1_label',label:'Banner 1 text',type:'text'},{key:'b1_link',label:'Banner 1 link',type:'text'},{key:'b1_bg',label:'Banner 1 color',type:'color'},{key:'b2_label',label:'Banner 2 text',type:'text'},{key:'b2_link',label:'Banner 2 link',type:'text'},{key:'b2_bg',label:'Banner 2 color',type:'color'},{key:'b3_label',label:'Banner 3 text',type:'text'},{key:'b3_link',label:'Banner 3 link',type:'text'},{key:'b3_bg',label:'Banner 3 color',type:'color'}] },
  newsletter:           { label:'Newsletter',            icon:'📧', cat:'Engagement', defaults:{ label:'Stay Connected', heading:'Stay in the world of Tejori', subtext:'Subscribe for 10% off your first purchase.', bg:'#1a1a1a' }, fields:[{key:'label',label:'Top label',type:'text'},{key:'heading',label:'Heading',type:'text'},{key:'subtext',label:'Subtext',type:'text'},{key:'bg',label:'Background',type:'color'}] },
  whatsapp_cta:         { label:'WhatsApp CTA',          icon:'💬', cat:'Engagement', defaults:{ heading:'Have a question?', body:'Chat with our jewellery experts on WhatsApp.', button_text:'Chat on WhatsApp', bg:'#f5ede2' }, fields:[{key:'heading',label:'Heading',type:'text'},{key:'body',label:'Body text',type:'text'},{key:'button_text',label:'Button text',type:'text'},{key:'bg',label:'Background',type:'color'}] },
  cert_logos:           { label:'Certification Logos',   icon:'🏅', cat:'Trust',      defaults:{ label:'Certified by', bg:'#ffffff' }, fields:[{key:'label',label:'Label',type:'text'},{key:'bg',label:'Background',type:'color'}] },
  spacer:               { label:'Spacer',                icon:'↕️', cat:'Layout',     defaults:{ height:80, bg:'#ffffff' }, fields:[{key:'height',label:'Height px',type:'number'},{key:'bg',label:'Background',type:'color'}] },
  divider:              { label:'Divider',               icon:'—',  cat:'Layout',     defaults:{ bg:'#ffffff' }, fields:[{key:'bg',label:'Background',type:'color'}] },
};

const CATS = ['Hero','Products','Categories','Content','Banners','Engagement','Trust','Layout'];

const PAGES = [
  { id:'homepage',  label:'Homepage' },
  { id:'about',     label:'About' },
  { id:'lab-grown', label:'Lab Diamond' },
  { id:'bespoke',   label:'Bespoke' },
];

const newSection = (type) => ({
  id: Math.random().toString(36).slice(2,9),
  type,
  props: { ...REGISTRY[type]?.defaults },
});

// ── FIELD RENDERER ────────────────────────────────────────────
function FieldRenderer({ field, value, onChange }) {
  const lbl = 'block text-[11px] font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-1.5';
  const inp = 'w-full px-3 py-2 text-sm border border-ink-200 dark:border-ink-700 rounded-lg bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-200 focus:outline-none focus:border-gold-400 transition-colors';

  switch (field.type) {
    case 'text':
      return <div><label className={lbl}>{field.label}</label><input type="text" value={value||''} onChange={e=>onChange(e.target.value)} className={inp} placeholder={field.label}/></div>;
    case 'textarea':
      return <div><label className={lbl}>{field.label}</label><textarea value={value||''} onChange={e=>onChange(e.target.value)} className={inp} rows={3} placeholder={field.label}/></div>;
    case 'number':
      return <div><label className={lbl}>{field.label}</label><input type="number" value={value||''} onChange={e=>onChange(Number(e.target.value))} className={inp}/></div>;
    case 'select':
      return <div><label className={lbl}>{field.label}</label>
        <select value={value||''} onChange={e=>onChange(e.target.value)} className={inp}>
          {field.options.map(o=><option key={o} value={o}>{o}</option>)}
        </select></div>;
    case 'color':
      return <div><label className={lbl}>{field.label}</label>
        <div className="flex items-center gap-2">
          <input type="color" value={value||'#ffffff'} onChange={e=>onChange(e.target.value)} className="w-10 h-9 rounded-lg border border-ink-200 cursor-pointer flex-shrink-0"/>
          <input type="text" value={value||''} onChange={e=>onChange(e.target.value)} className={inp} placeholder="#ffffff"/>
        </div></div>;
    case 'image':
      return <div><label className={lbl}>{field.label}</label>
        <input type="text" value={value||''} onChange={e=>onChange(e.target.value)} className={inp} placeholder="https://..."/>
        {value && <img src={value} alt="" className="mt-2 w-full h-28 object-cover rounded-lg border border-ink-200"/>}
      </div>;
    case 'range':
      return <div><label className={lbl}>{field.label}: {value||0}%</label>
        <input type="range" min={field.min||0} max={field.max||100} step={field.step||1} value={value||0} onChange={e=>onChange(Number(e.target.value))} className="w-full accent-gold-500"/>
      </div>;
    default:
      return null;
  }
}

// ── SECTION CARD ──────────────────────────────────────────────
function SectionCard({ section, index, total, onEdit, onDelete, onMove, onDuplicate, isSelected }) {
  const reg = REGISTRY[section.type];
  return (
    <div className={`group relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${isSelected?'border-gold-500 bg-gold-50 dark:bg-gold-900/10':'border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 hover:border-gold-300'}`}
      onClick={()=>onEdit(section)}>
      {/* Drag handle */}
      <GripVertical size={14} className="text-ink-300 flex-shrink-0"/>

      {/* Icon + info */}
      <span className="text-xl flex-shrink-0">{reg?.icon||'📦'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-700 dark:text-ink-200 truncate">{reg?.label||section.type}</p>
        <p className="text-[11px] text-ink-400 truncate">
          {section.props?.heading || section.props?.headline || section.props?.label || 'Click to edit'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={e=>{e.stopPropagation();onMove(index,-1);}} disabled={index===0} title="Move up"
          className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 disabled:opacity-20 transition-colors"><ChevronUp size={13}/></button>
        <button onClick={e=>{e.stopPropagation();onMove(index,1);}} disabled={index===total-1} title="Move down"
          className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 disabled:opacity-20 transition-colors"><ChevronDown size={13}/></button>
        <button onClick={e=>{e.stopPropagation();onDuplicate(section);}} title="Duplicate"
          className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 transition-colors"><Copy size={13}/></button>
        <button onClick={e=>{e.stopPropagation();onDelete(section.id);}} title="Delete"
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500 transition-colors"><Trash2 size={13}/></button>
      </div>

      {/* Selected indicator */}
      {isSelected && <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-gold-500 rounded-r"/>}
    </div>
  );
}

// ── ADD SECTION PANEL ─────────────────────────────────────────
function AddSectionPanel({ onAdd, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = Object.entries(REGISTRY).filter(([type, reg]) =>
    !search || reg.label.toLowerCase().includes(search.toLowerCase()) || reg.cat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute inset-0 bg-white dark:bg-ink-900 z-10 flex flex-col rounded-xl shadow-2xl border border-ink-200 dark:border-ink-700">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-800">
        <p className="text-sm font-bold text-ink-700 dark:text-ink-200">Add section</p>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={15}/></button>
      </div>
      <div className="px-3 py-2.5 border-b border-ink-100 dark:border-ink-800">
        <input value={search} onChange={e=>setSearch(e.target.value)} autoFocus
          placeholder="Search sections…"
          className="w-full px-3 py-2 text-sm border border-ink-200 dark:border-ink-700 rounded-lg bg-white dark:bg-ink-800 focus:outline-none focus:border-gold-400 text-ink-700 dark:text-ink-200"/>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {CATS.map(cat => {
          const items = filtered.filter(([,r])=>r.cat===cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="mb-4">
              <p className="text-[10px] font-bold text-gold-600 uppercase tracking-widest px-1 mb-2">{cat}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {items.map(([type, reg]) => (
                  <button key={type} onClick={()=>{ onAdd(type); onClose(); }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-ink-200 dark:border-ink-700 hover:border-gold-400 hover:bg-gold-50 dark:hover:bg-gold-900/10 transition-all text-left">
                    <span className="text-lg flex-shrink-0">{reg.icon}</span>
                    <span className="text-xs font-medium text-ink-600 dark:text-ink-300 leading-tight">{reg.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PREVIEW PANEL ─────────────────────────────────────────────
function PreviewPanel({ sections, device, page }) {
  const previewUrl = `http://localhost:3001/${page==='homepage'?'':page}?preview=1`;
  const w = { desktop:'100%', tablet:'768px', mobile:'390px' };
  
  return (
    <div className="flex-1 flex flex-col bg-ink-100 dark:bg-ink-950 overflow-hidden">
      {/* Preview bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-ink-900 border-b border-ink-200/60 dark:border-ink-800 flex-shrink-0">
        <p className="text-xs font-medium text-ink-500">Live preview</p>
        <a href={previewUrl} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-gold-600 transition-colors">
          <Eye size={12}/> Open full screen
        </a>
      </div>

      {/* Mock canvas */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-6">
        <div style={{ width:w[device], maxWidth:'100%', transition:'width .3s', background:'#fff', boxShadow:'0 8px 40px rgba(0,0,0,0.15)' }}>
          {/* Mock nav */}
          <div style={{ background:'#1a1a1a', padding:'9px 20px', textAlign:'center' }}>
            <span style={{ fontSize:10, color:'#b8860b', letterSpacing:'0.1em' }}>Complimentary shipping · GIA & IGI Certified</span>
          </div>
          <div style={{ background:'#fff', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #e5e0d8' }}>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, letterSpacing:'0.15em' }}>TEJORI</span>
            <div style={{ display:'flex', gap:16 }}>
              {['Jewellery','Diamonds','Lab-Diamond','Heritage'].map(n=>(
                <span key={n} style={{ fontSize:10, color:'#4a4a4a', letterSpacing:'0.05em', textTransform:'uppercase' }}>{n}</span>
              ))}
            </div>
          </div>

          {/* Section previews */}
          {sections.map(sec => <SectionMockup key={sec.id} section={sec} device={device}/>)}

          {/* Mock footer */}
          <div style={{ background:'#1a1a1a', padding:'32px 24px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
              {['Customer Care','Our Company','Follow Us'].map(col=>(
                <div key={col}>
                  <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'#fff', marginBottom:10 }}>{col}</p>
                  {[1,2,3].map(i=><div key={i} style={{ height:8, background:'rgba(255,255,255,0.1)', borderRadius:4, marginBottom:6, width:`${60+i*15}%` }}/>)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SECTION MOCKUP (preview in canvas) ───────────────────────
function SectionMockup({ section, device }) {
  const p = section.props || {};
  const compact = device === 'mobile';

  switch(section.type) {
    case 'hero':
      return (
        <div style={{ position:'relative', height: compact?280:420, overflow:'hidden', background:'#1a1a1a' }}>
          {p.image && <img src={p.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity: 1-(p.overlay||65)/100 }}/>}
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', padding: compact?'20px':'40px 60px' }}>
            <div>
              {p.label && <p style={{ fontSize:9, color:'#b8860b', letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:8 }}>{p.label}</p>}
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: compact?28:52, fontWeight:300, color:'#fff', lineHeight:1, marginBottom:12 }}>{p.headline||'Hero Headline'}</h2>
              {!compact && <p style={{ fontSize:12, color:'rgba(255,255,255,0.65)', maxWidth:340, marginBottom:20 }}>{p.subtext}</p>}
              <div style={{ height:1, width:60, background:'rgba(255,255,255,0.4)', marginBottom:12 }}/>
              <p style={{ fontSize:9, color:'#fff', letterSpacing:'0.15em', textTransform:'uppercase' }}>{p.cta_text||'Discover →'}</p>
            </div>
          </div>
          <div style={{ position:'absolute', top:8, right:8, background:'rgba(184,134,11,0.9)', padding:'3px 8px', borderRadius:2 }}>
            <span style={{ fontSize:9, color:'#fff', fontWeight:600, letterSpacing:'0.08em' }}>HERO · {(p.type||'fullscreen').toUpperCase()}</span>
          </div>
        </div>
      );

    case 'products_grid':
      return (
        <div style={{ padding: compact?'24px 16px':'40px 32px', background: p.bg||'#fdf8f3' }}>
          {p.label && <p style={{ fontSize:9, color:'#b8860b', letterSpacing:'0.25em', textTransform:'uppercase', textAlign:'center', marginBottom:6 }}>{p.label}</p>}
          {p.heading && <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: compact?22:32, fontWeight:300, textAlign:'center', color:'#1a1a1a', marginBottom:24 }}>{p.heading}</h3>}
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${compact?2:Math.min(4,p.cols||4)},1fr)`, gap:12 }}>
            {Array(compact?2:Math.min(4,parseInt(p.cols)||4)).fill(0).map((_,i)=>(
              <div key={i} style={{ background:'#fff', border:'1px solid #e5e0d8' }}>
                <div style={{ aspectRatio:'1', background:'#f5ede2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>💎</div>
                <div style={{ padding:'10px 12px' }}>
                  <div style={{ height:8, background:'#f0ede8', borderRadius:4, marginBottom:6, width:'80%' }}/>
                  <div style={{ height:20, background:'#1a1a1a', borderRadius:2 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'categories_circles':
      return (
        <div style={{ padding: compact?'24px 16px':'40px 32px', background: p.bg||'#fff', textAlign:'center' }}>
          {p.heading && <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: compact?22:32, fontWeight:300, color:'#1a1a1a', marginBottom:20 }}>{p.heading}</h3>}
          <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
            {['Rings','Necklaces','Earrings','Bracelets'].slice(0, compact?2:4).map(c=>(
              <div key={c} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'#f5ede2', border:'1.5px solid #e5e0d8' }}/>
                <span style={{ fontSize:8, color:'#4a4a4a', letterSpacing:'0.1em', textTransform:'uppercase' }}>{c}</span>
              </div>
            ))}
            {!compact && ['Pendants','Lab Grown','Pearls','Bridal'].map(c=>(
              <div key={c} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'#f5ede2', border:'1.5px solid #e5e0d8' }}/>
                <span style={{ fontSize:8, color:'#4a4a4a', letterSpacing:'0.1em', textTransform:'uppercase' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'brand_story':
    case 'about_heritage':
      return (
        <div style={{ padding: compact?'24px 16px':'40px 32px', background: p.bg||'#fff' }}>
          <div style={{ display:'grid', gridTemplateColumns: compact?'1fr':'1fr 1fr', gap:32, alignItems:'center' }}>
            {(p.image_side==='left' || section.type==='about_heritage') && !compact && (
              <div style={{ aspectRatio:'4/5', background:'#f5ede2', backgroundImage:`url(${p.image})`, backgroundSize:'cover', backgroundPosition:'center' }}/>
            )}
            <div>
              {p.label && <p style={{ fontSize:9, color:'#b8860b', letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:10 }}>{p.label}</p>}
              {p.heading && <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: compact?22:36, fontWeight:300, color:'#1a1a1a', marginBottom:12 }}>{p.heading}</h3>}
              <div style={{ width:40, height:1, background:'#b8860b', marginBottom:14 }}/>
              {p.body && <p style={{ fontSize:11, color:'#6b6b6b', lineHeight:1.7, marginBottom:16 }}>{p.body.slice(0,100)}{p.body.length>100?'…':''}</p>}
              {p.legacy_number && (
                <div style={{ display:'inline-block', background:'#1a1a1a', padding:'12px 16px', marginBottom:14 }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:'#b8860b', lineHeight:1 }}>{p.legacy_number}</p>
                  <p style={{ fontSize:8, color:'#888', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:4 }}>{p.legacy_label}</p>
                </div>
              )}
              <div style={{ height:8, background:'rgba(0,0,0,0.08)', borderRadius:4, width:80 }}/>
            </div>
            {p.image_side==='right' && section.type==='brand_story' && !compact && (
              <div style={{ aspectRatio:'4/5', backgroundImage:`url(${p.image})`, backgroundSize:'cover', backgroundPosition:'center', background:'#f5ede2' }}/>
            )}
          </div>
        </div>
      );

    case 'newsletter':
      return (
        <div style={{ padding: compact?'32px 16px':'48px 32px', background: p.bg||'#1a1a1a', textAlign:'center' }}>
          {p.label && <p style={{ fontSize:9, color:'#b8860b', letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:10 }}>{p.label}</p>}
          {p.heading && <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: compact?20:32, fontWeight:300, color:'#fff', marginBottom:8 }}>{p.heading}</h3>}
          {p.subtext && <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginBottom:20 }}>{p.subtext}</p>}
          <div style={{ display:'flex', maxWidth:380, margin:'0 auto', gap:0 }}>
            <div style={{ flex:1, height:40, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRight:'none' }}/>
            <div style={{ width:90, height:40, background:'#b8860b' }}/>
          </div>
        </div>
      );

    case 'editorial_banner':
      return (
        <div style={{ position:'relative', height: compact?180:320, overflow:'hidden', background:'#1a1a1a' }}>
          {p.image && <img src={p.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:1-(p.overlay||45)/100 }}/>}
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'center', padding: compact?'20px':'40px 60px', textAlign: p.text_align==='center'?'center':'left', alignItems: p.text_align==='center'?'center':'flex-start' }}>
            {p.heading && <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: compact?28:52, fontWeight:300, color:'#fff', lineHeight:1, marginBottom:8 }}>{p.heading}</h3>}
            {!compact && p.body && <p style={{ fontSize:11, color:'rgba(255,255,255,0.6)', maxWidth:360, marginBottom:14 }}>{p.body.slice(0,80)}…</p>}
            <div style={{ fontSize:9, color:'#fff', letterSpacing:'0.15em', textTransform:'uppercase', borderBottom:'1px solid rgba(255,255,255,0.4)', paddingBottom:2 }}>{p.cta_text||'Discover →'}</div>
          </div>
        </div>
      );

    case 'collection_banners':
      return (
        <div style={{ display:'grid', gridTemplateColumns: compact?'1fr':'1fr 1fr' }}>
          {[{title:p.left_title,sub:p.left_sub,img:p.left_image},{title:p.right_title,sub:p.right_sub,img:p.right_image}].map((b,i)=>(
            <div key={i} style={{ position:'relative', height: compact?140:240, overflow:'hidden', background:'#1a1a1a' }}>
              {b.img && <img src={b.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.55 }}/>}
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'20px' }}>
                <h4 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: compact?18:28, fontWeight:300, color:'#fff', marginBottom:4 }}>{b.title||`Banner ${i+1}`}</h4>
                {!compact && <p style={{ fontSize:10, color:'rgba(255,255,255,0.6)' }}>{b.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      );

    case 'promo_strip':
      return (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)' }}>
          {[{l:p.b1_label,bg:p.b1_bg||'#1a1a1a'},{l:p.b2_label,bg:p.b2_bg||'#b8860b'},{l:p.b3_label,bg:p.b3_bg||'#3d2b1a'}].map((b,i)=>(
            <div key={i} style={{ padding: compact?'14px':'22px', background:b.bg, textAlign:'center' }}>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: compact?14:22, color:'#fff', fontWeight:300 }}>{b.l||`Banner ${i+1}`}</span>
            </div>
          ))}
        </div>
      );

    case 'cert_logos':
      return (
        <div style={{ padding:'20px 32px', background: p.bg||'#fff', textAlign:'center', borderTop:'1px solid #f0ede8', borderBottom:'1px solid #f0ede8' }}>
          {p.label && <p style={{ fontSize:9, color:'#aaa', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:14 }}>{p.label}</p>}
          <div style={{ display:'flex', justifyContent:'center', gap:24, flexWrap:'wrap' }}>
            {['GIA','IGI','HRD','AGS','GCAL'].map(c=>(
              <span key={c} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:12, color:'rgba(0,0,0,0.2)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:400 }}>{c}</span>
            ))}
          </div>
        </div>
      );

    case 'whatsapp_cta':
      return (
        <div style={{ padding: compact?'24px 16px':'40px 32px', background: p.bg||'#f5ede2', textAlign:'center' }}>
          {p.heading && <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: compact?20:32, fontWeight:300, color:'#1a1a1a', marginBottom:8 }}>{p.heading}</h3>}
          {p.body && <p style={{ fontSize:11, color:'#6b6b6b', marginBottom:16 }}>{p.body}</p>}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 24px', background:'#1a7a35' }}>
            <span style={{ fontSize:10, color:'#fff', letterSpacing:'0.1em', textTransform:'uppercase' }}>{p.button_text||'Chat on WhatsApp'}</span>
          </div>
        </div>
      );

    case 'spacer':
      return <div style={{ height: Math.max(20, Math.min(120, p.height||80)), background: p.bg||'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:9, color:'#ccc', letterSpacing:'0.1em', textTransform:'uppercase' }}>Spacer · {p.height||80}px</span>
      </div>;

    case 'divider':
      return <div style={{ padding:'16px 40px', background: p.bg||'#fff', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ flex:1, height:0.5, background:'#e5e0d8' }}/><span style={{ fontSize:14, color:'#b8860b' }}>✦</span><div style={{ flex:1, height:0.5, background:'#e5e0d8' }}/>
      </div>;

    default:
      return (
        <div style={{ padding:'24px 32px', background:'#f5f5f5', textAlign:'center' }}>
          <span style={{ fontSize:24 }}>{REGISTRY[section.type]?.icon||'📦'}</span>
          <p style={{ fontSize:11, color:'#888', marginTop:8 }}>{REGISTRY[section.type]?.label||section.type}</p>
        </div>
      );
  }
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function PageBuilderPage() {
  const { collapsed } = useOutletContext()||{};
  const [activePage,  setActivePage]  = useState('homepage');
  const [sections,    setSections]    = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [device,      setDevice]      = useState('desktop');
  const [saving,      setSaving]      = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [showAdd,     setShowAdd]     = useState(false);
  const [dirty,       setDirty]       = useState(false);

  // Load saved page
  useEffect(() => {
    setLoading(true);
    setSelected(null);
    api.get(`/settings/page/${activePage}`)
      .then(r => {
        const data = r.data.data;
        if (Array.isArray(data)) {
          setSections(data);
        } else if (data?.sections) {
          setSections(data.sections);
        } else {
          setSections([]);
        }
        setDirty(false);
      })
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }, [activePage]);

  const addSection  = (type) => { const s = newSection(type); setSections(p=>[...p, s]); setSelected(s); setDirty(true); };
  const delSection  = (id)   => { setSections(p=>p.filter(s=>s.id!==id)); if(selected?.id===id) setSelected(null); setDirty(true); };
  const dupSection  = (sec)  => { const s = {...sec, id:Math.random().toString(36).slice(2,9)}; setSections(p=>[...p,s]); setDirty(true); };
  const moveSection = (idx, dir) => {
    setSections(prev => {
      const arr = [...prev];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return prev;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
    setDirty(true);
  };

  const updateProp = (key, value) => {
    if (!selected) return;
    const updated = { ...selected, props: { ...selected.props, [key]: value } };
    setSelected(updated);
    setSections(p => p.map(s => s.id===selected.id ? updated : s));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save as JSON array (per spec: JSON-based page structure)
      await api.post(`/settings/page/${activePage}`, sections);
      toast.success('Page saved — storefront updated');
      setDirty(false);
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const reg = selected ? REGISTRY[selected.type] : null;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* ── TOP BAR ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-ink-900 border-b border-ink-200/60 dark:border-ink-800 flex-shrink-0" style={{ height:52 }}>
        {/* Page selector */}
        <div className="flex gap-1">
          {PAGES.map(p=>(
            <button key={p.id} onClick={()=>setActivePage(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activePage===p.id?'bg-ink-900 dark:bg-white text-white dark:text-ink-900':'text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800'}`}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex-1"/>

        {/* Device */}
        <div className="flex items-center gap-1 bg-ink-100 dark:bg-ink-800 rounded-lg p-1">
          {[['desktop',Monitor],['tablet',Tablet],['mobile',Smartphone]].map(([d,Icon])=>(
            <button key={d} onClick={()=>setDevice(d)}
              className={`p-1.5 rounded-md transition-all ${device===d?'bg-white dark:bg-ink-700 shadow-sm text-gold-600':'text-ink-400 hover:text-ink-600'}`}>
              <Icon size={14}/>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {dirty && <span className="text-[10px] text-amber-600 font-medium">● Unsaved</span>}
          <a href="http://localhost:3001" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-ink-200 dark:border-ink-700 rounded-lg text-ink-500 hover:text-ink-700 transition-colors">
            <Eye size={12}/> Preview
          </a>
          <button onClick={handleSave} disabled={saving}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 ${dirty?'bg-gold-500 text-white shadow-sm':'bg-ink-900 dark:bg-white text-white dark:text-ink-900'}`}>
            <Save size={12}/>{saving?'Saving…':'Save & Publish'}
          </button>
        </div>
      </div>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Section list */}
        <div className="flex flex-col border-r border-ink-200/60 dark:border-ink-800 bg-ink-50 dark:bg-ink-900/50" style={{ width:260, flexShrink:0 }}>
          <div className="p-3 border-b border-ink-100 dark:border-ink-800 flex-shrink-0">
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2">
              {PAGES.find(p=>p.id===activePage)?.label} · {sections.length} sections
            </p>
            <button onClick={()=>setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold transition-colors">
              <Plus size={14}/> Add section
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {loading ? (
              Array(4).fill(0).map((_,i)=>(
                <div key={i} className="h-16 rounded-xl bg-ink-100 dark:bg-ink-800 animate-pulse"/>
              ))
            ) : sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <span className="text-4xl mb-3">🏗️</span>
                <p className="text-sm font-semibold text-ink-600 dark:text-ink-300 mb-1">Empty page</p>
                <p className="text-xs text-ink-400">Click Add section to start building</p>
              </div>
            ) : (
              sections.map((sec, idx) => (
                <SectionCard key={sec.id} section={sec} index={idx} total={sections.length}
                  isSelected={selected?.id===sec.id}
                  onEdit={setSelected}
                  onDelete={delSection}
                  onMove={moveSection}
                  onDuplicate={dupSection}/>
              ))
            )}
          </div>

          {/* Add section panel overlay */}
          {showAdd && (
            <div className="absolute inset-0 z-20 p-3" style={{ left:0, width:260 }}>
              <AddSectionPanel onAdd={addSection} onClose={()=>setShowAdd(false)}/>
            </div>
          )}
        </div>

        {/* CENTER — Preview */}
        <PreviewPanel sections={sections} device={device} page={activePage}/>

        {/* RIGHT — Section editor */}
        <div className={`flex flex-col border-l border-ink-200/60 dark:border-ink-800 bg-white dark:bg-ink-900 transition-all overflow-hidden flex-shrink-0 ${selected?'w-72':'w-0'}`}>
          {selected && reg && (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-800 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{reg.icon}</span>
                  <p className="text-sm font-bold text-ink-700 dark:text-ink-200">{reg.label}</p>
                </div>
                <button onClick={()=>setSelected(null)} className="p-1 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 transition-colors">
                  <X size={14}/>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {reg.fields.map(field => (
                  <FieldRenderer key={field.key} field={field}
                    value={selected.props?.[field.key]}
                    onChange={v=>updateProp(field.key,v)}/>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-ink-100 dark:border-ink-800 flex-shrink-0">
                <button onClick={()=>setSelected(null)} className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-gold-500 hover:bg-gold-600 text-white rounded-lg transition-colors">
                  <Check size={12}/> Done
                </button>
              </div>
            </>
          )}
          {!selected && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <Settings size={24} className="text-ink-200 dark:text-ink-700 mb-3"/>
              <p className="text-xs text-ink-400">Select a section to edit its content</p>
            </div>
          )}
        </div>
      </div>

      {/* Import Lucide icons needed */}
      <style>{`.ti{display:none}`}</style>
    </div>
  );
}

