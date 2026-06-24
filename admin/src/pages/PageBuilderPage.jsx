import { useState, useEffect, useCallback } from 'react';
import { Puck, Render } from '@measured/puck';
import '@measured/puck/puck.css';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Eye, Save, Monitor, Tablet, Smartphone } from 'lucide-react';

// ── PAGES ─────────────────────────────────────────────────────
const PAGES = [
  { id: 'homepage',  label: 'Homepage' },
  { id: 'about',     label: 'About' },
  { id: 'lab-grown', label: 'Lab Diamond' },
  { id: 'bespoke',   label: 'Bespoke' },
];

// ── PUCK COMPONENT DEFINITIONS ────────────────────────────────
// Each component = one section type on the storefront
const config = {
  components: {

    // ── HERO ────────────────────────────────────────────────
    HeroBanner: {
      label: '🖼️ Hero Banner',
      fields: {
        type: {
          label: 'Hero style',
          type: 'select',
          options: [
            { label: 'Full Screen', value: 'fullscreen' },
            { label: 'Slider',      value: 'slider' },
            { label: 'Split Screen',value: 'split' },
            { label: 'Video',       value: 'video' },
            { label: 'Minimal',     value: 'minimal' },
          ],
        },
        headline:  { label: 'Headline',       type: 'text' },
        subtext:   { label: 'Subtext',        type: 'textarea' },
        cta_text:  { label: 'Button text',    type: 'text' },
        cta_link:  { label: 'Button link',    type: 'text' },
        label:     { label: 'Top label',      type: 'text' },
        image:     { label: 'Background image URL', type: 'text' },
        overlay:   { label: 'Overlay %',      type: 'number' },
      },
      defaultProps: {
        type:     'fullscreen',
        headline: 'Frost Yourself',
        subtext:  'Dazzling pear and marquise diamonds.',
        cta_text: 'Discover the selection',
        cta_link: '/jewellery',
        label:    'New Collection',
        image:    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80',
        overlay:  65,
      },
      render: ({ type, headline, subtext, cta_text, cta_link, label, image, overlay }) => (
        <div style={{ position:'relative', minHeight:420, overflow:'hidden', background:'#1a1a1a' }}>
          {image && <img src={image} alt={headline} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:1-(overlay||65)/100 }}/>}
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', padding:'40px 60px' }}>
            <div style={{ maxWidth:600 }}>
              {label && <p style={{ fontSize:10, fontWeight:500, letterSpacing:'0.3em', textTransform:'uppercase', color:'#b8860b', marginBottom:12 }}>{label}</p>}
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(36px,5vw,72px)', fontWeight:300, color:'#fff', lineHeight:1, marginBottom:16 }}>{headline}</h1>
              {subtext && <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', maxWidth:440, lineHeight:1.7, marginBottom:28 }}>{subtext}</p>}
              <span style={{ fontSize:10, fontWeight:500, letterSpacing:'0.18em', textTransform:'uppercase', color:'#fff', borderBottom:'1px solid rgba(255,255,255,0.5)', paddingBottom:2 }}>{cta_text} →</span>
            </div>
          </div>
          <div style={{ position:'absolute', top:8, right:8, background:'rgba(184,134,11,0.85)', padding:'3px 8px', borderRadius:2 }}>
            <span style={{ fontSize:9, color:'#fff', fontWeight:600, letterSpacing:'0.1em' }}>HERO · {(type||'fullscreen').toUpperCase()}</span>
          </div>
        </div>
      ),
    },

    // ── PRODUCTS GRID ────────────────────────────────────────
    ProductsGrid: {
      label: '💎 Products Grid',
      fields: {
        cols:    { label: 'Columns', type: 'select', options:[{label:'2 Columns',value:'2'},{label:'3 Columns',value:'3'},{label:'4 Columns',value:'4'}] },
        label:   { label: 'Top label',  type: 'text' },
        heading: { label: 'Heading',    type: 'text' },
        bg:      { label: 'Background', type: 'text' },
      },
      defaultProps: { cols:'4', label:'Featured', heading:'Our Selection', bg:'#fdf8f3' },
      render: ({ cols, label, heading, bg }) => (
        <div style={{ padding:'48px 40px', background:bg||'#fdf8f3' }}>
          {label && <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', color:'#b8860b', textAlign:'center', marginBottom:8 }}>{label}</p>}
          {heading && <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:300, color:'#1a1a1a', textAlign:'center', marginBottom:36 }}>{heading}</h2>}
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols||4},1fr)`, gap:20 }}>
            {Array(parseInt(cols)||4).fill(0).map((_,i) => (
              <div key={i} style={{ background:'#fff', border:'1px solid #e5e0d8' }}>
                <div style={{ aspectRatio:'1', background:'#f5ede2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>💎</div>
                <div style={{ padding:'12px 14px' }}>
                  <div style={{ height:8, background:'#f0ede8', borderRadius:4, marginBottom:8, width:'75%' }}/>
                  <div style={{ height:22, background:'#1a1a1a', borderRadius:2 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // ── CATEGORIES CIRCLES ────────────────────────────────────
    CategoriesCircles: {
      label: '⭕ Category Circles',
      fields: {
        heading: { label: 'Heading',    type: 'text' },
        bg:      { label: 'Background', type: 'text' },
      },
      defaultProps: { heading:'Top Categories', bg:'#ffffff' },
      render: ({ heading, bg }) => (
        <div style={{ padding:'48px 40px', background:bg||'#fff', textAlign:'center' }}>
          {heading && <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:300, color:'#1a1a1a', marginBottom:32 }}>{heading}</h2>}
          <div style={{ display:'flex', justifyContent:'center', gap:24, flexWrap:'wrap' }}>
            {['Rings','Necklaces','Earrings','Bracelets','Pendants','Lab Grown'].map(c => (
              <div key={c} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:'#f5ede2', border:'1.5px solid #e5e0d8' }}/>
                <span style={{ fontSize:9, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#4a4a4a' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // ── BRAND STORY ───────────────────────────────────────────
    BrandStory: {
      label: '📖 Brand Story',
      fields: {
        label:      { label: 'Top label',   type: 'text' },
        heading:    { label: 'Heading',     type: 'text' },
        body:       { label: 'Body text',   type: 'textarea' },
        image:      { label: 'Image URL',   type: 'text' },
        image_side: { label: 'Image side',  type: 'select', options:[{label:'Right',value:'right'},{label:'Left',value:'left'}] },
        cta_text:   { label: 'Button text', type: 'text' },
        bg:         { label: 'Background',  type: 'text' },
      },
      defaultProps: {
        label:'Our Promise', heading:'Handcrafted & Ethically Sourced',
        body:'With a legacy spanning 60 years, TEJORI is dedicated to offering exquisite jewellery.',
        image:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=700&q=80',
        image_side:'right', cta_text:'Learn More', bg:'#ffffff',
      },
      render: ({ label, heading, body, image, image_side, cta_text, bg }) => (
        <div style={{ padding:'48px 40px', background:bg||'#fff' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center', maxWidth:1200, margin:'0 auto' }}>
            {image_side==='left' && image && <img src={image} alt={heading} style={{ width:'100%', aspectRatio:'4/5', objectFit:'cover' }}/>}
            <div>
              {label && <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', color:'#b8860b', marginBottom:12 }}>{label}</p>}
              {heading && <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:300, color:'#1a1a1a', lineHeight:1.1, marginBottom:16 }}>{heading}</h2>}
              <div style={{ width:40, height:1, background:'#b8860b', marginBottom:20 }}/>
              {body && <p style={{ fontSize:13, color:'#6b6b6b', lineHeight:1.9, marginBottom:24 }}>{body}</p>}
              {cta_text && <span style={{ fontSize:10, fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase', color:'#1a1a1a', borderBottom:'1px solid #1a1a1a', paddingBottom:2 }}>{cta_text} →</span>}
            </div>
            {image_side==='right' && image && <img src={image} alt={heading} style={{ width:'100%', aspectRatio:'4/5', objectFit:'cover' }}/>}
          </div>
        </div>
      ),
    },

    // ── EDITORIAL BANNER ──────────────────────────────────────
    EditorialBanner: {
      label: '🎨 Editorial Banner',
      fields: {
        heading:    { label: 'Heading',     type: 'text' },
        body:       { label: 'Body text',   type: 'textarea' },
        cta_text:   { label: 'Button text', type: 'text' },
        image:      { label: 'Image URL',   type: 'text' },
        overlay:    { label: 'Overlay %',   type: 'number' },
        text_align: { label: 'Text align',  type: 'select', options:[{label:'Left',value:'left'},{label:'Center',value:'center'}] },
      },
      defaultProps: {
        heading:'Classics', body:'Timeless and elegant jewellery.',
        cta_text:'Discover the selection',
        image:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=80',
        overlay:45, text_align:'left',
      },
      render: ({ heading, body, cta_text, image, overlay, text_align }) => (
        <div style={{ position:'relative', height:320, overflow:'hidden', background:'#1a1a1a' }}>
          {image && <img src={image} alt={heading} style={{ width:'100%', height:'100%', objectFit:'cover', opacity:1-(overlay||45)/100 }}/>}
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'center', padding:'40px 60px', textAlign:text_align==='center'?'center':'left', alignItems:text_align==='center'?'center':'flex-start' }}>
            {heading && <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(32px,5vw,64px)', fontWeight:300, color:'#fff', lineHeight:1, marginBottom:12 }}>{heading}</h2>}
            {body && <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', maxWidth:380, marginBottom:20 }}>{body}</p>}
            {cta_text && <span style={{ fontSize:9, fontWeight:500, letterSpacing:'0.18em', textTransform:'uppercase', color:'#fff', borderBottom:'1px solid rgba(255,255,255,0.4)', paddingBottom:2 }}>{cta_text}</span>}
          </div>
        </div>
      ),
    },

    // ── NEWSLETTER ────────────────────────────────────────────
    Newsletter: {
      label: '📧 Newsletter',
      fields: {
        label:   { label: 'Top label', type: 'text' },
        heading: { label: 'Heading',   type: 'text' },
        subtext: { label: 'Subtext',   type: 'text' },
        bg:      { label: 'Background',type: 'text' },
      },
      defaultProps: { label:'Stay Connected', heading:'Stay in the world of Tejori', subtext:'Subscribe for 10% off your first purchase.', bg:'#1a1a1a' },
      render: ({ label, heading, subtext, bg }) => (
        <div style={{ padding:'48px 40px', background:bg||'#1a1a1a', textAlign:'center' }}>
          {label && <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', color:'#b8860b', marginBottom:10 }}>{label}</p>}
          {heading && <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:300, color:'#fff', marginBottom:10 }}>{heading}</h2>}
          {subtext && <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:24 }}>{subtext}</p>}
          <div style={{ display:'flex', maxWidth:400, margin:'0 auto' }}>
            <div style={{ flex:1, height:42, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRight:'none' }}/>
            <div style={{ width:100, height:42, background:'#b8860b', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:9, color:'#fff', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase' }}>Subscribe</span>
            </div>
          </div>
        </div>
      ),
    },

    // ── WHATSAPP CTA ──────────────────────────────────────────
    WhatsAppCTA: {
      label: '💬 WhatsApp CTA',
      fields: {
        heading:     { label: 'Heading',     type: 'text' },
        body:        { label: 'Body text',   type: 'text' },
        button_text: { label: 'Button text', type: 'text' },
        bg:          { label: 'Background',  type: 'text' },
      },
      defaultProps: { heading:'Have a question?', body:'Chat with our jewellery experts on WhatsApp.', button_text:'Chat on WhatsApp', bg:'#f5ede2' },
      render: ({ heading, body, button_text, bg }) => (
        <div style={{ padding:'48px 40px', background:bg||'#f5ede2', textAlign:'center' }}>
          {heading && <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:300, color:'#1a1a1a', marginBottom:10 }}>{heading}</h2>}
          {body && <p style={{ fontSize:13, color:'#6b6b6b', marginBottom:24 }}>{body}</p>}
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'13px 32px', background:'#1a7a35' }}>
            <span style={{ fontSize:16 }}>💬</span>
            <span style={{ fontSize:10, color:'#fff', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase' }}>{button_text}</span>
          </div>
        </div>
      ),
    },

    // ── TESTIMONIALS ──────────────────────────────────────────
    Testimonials: {
      label: '⭐ Testimonials',
      fields: {
        label: { label: 'Top label',  type: 'text' },
        bg:    { label: 'Background', type: 'text' },
      },
      defaultProps: { label:'What Our Clients Say', bg:'#fdf8f3' },
      render: ({ label, bg }) => (
        <div style={{ padding:'48px 40px', background:bg||'#fdf8f3', textAlign:'center' }}>
          {label && <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', color:'#b8860b', marginBottom:32 }}>{label}</p>}
          <div style={{ color:'#b8860b', fontSize:18, letterSpacing:4, marginBottom:20 }}>★★★★★</div>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, fontStyle:'italic', color:'#1a1a1a', maxWidth:600, margin:'0 auto 24px', lineHeight:1.6 }}>"An extraordinary experience from the moment we walked in. The craftsmanship is beyond compare."</p>
          <p style={{ fontSize:12, fontWeight:600, color:'#1a1a1a' }}>— Happy Client</p>
        </div>
      ),
    },

    // ── CERT LOGOS ────────────────────────────────────────────
    CertLogos: {
      label: '🏅 Certification Logos',
      fields: {
        label: { label: 'Label',      type: 'text' },
        bg:    { label: 'Background', type: 'text' },
      },
      defaultProps: { label:'Certified by', bg:'#ffffff' },
      render: ({ label, bg }) => (
        <div style={{ padding:'20px 40px', background:bg||'#fff', textAlign:'center', borderTop:'1px solid #f0ede8', borderBottom:'1px solid #f0ede8' }}>
          {label && <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#aaa', marginBottom:14 }}>{label}</p>}
          <div style={{ display:'flex', justifyContent:'center', gap:32, flexWrap:'wrap' }}>
            {['GIA Certified','IGI Certified','HRD Antwerp','AGS','GCAL'].map(c => (
              <span key={c} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:'rgba(0,0,0,0.2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>{c}</span>
            ))}
          </div>
        </div>
      ),
    },

    // ── SPACER ────────────────────────────────────────────────
    Spacer: {
      label: '↕️ Spacer',
      fields: {
        height: { label: 'Height (px)', type: 'number' },
        bg:     { label: 'Background',  type: 'text' },
      },
      defaultProps: { height: 60, bg: '#ffffff' },
      render: ({ height, bg }) => (
        <div style={{ height:height||60, background:bg||'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:9, color:'#ccc', letterSpacing:'0.1em', textTransform:'uppercase' }}>Spacer · {height||60}px</span>
        </div>
      ),
    },

    // ── PROMO STRIP ───────────────────────────────────────────
    PromoStrip: {
      label: '🎯 Promo Strip',
      fields: {
        b1_label: { label: 'Banner 1 text',  type: 'text' },
        b1_bg:    { label: 'Banner 1 color', type: 'text' },
        b2_label: { label: 'Banner 2 text',  type: 'text' },
        b2_bg:    { label: 'Banner 2 color', type: 'text' },
        b3_label: { label: 'Banner 3 text',  type: 'text' },
        b3_bg:    { label: 'Banner 3 color', type: 'text' },
      },
      defaultProps: { b1_label:'New Arrivals', b1_bg:'#1a1a1a', b2_label:'Best Seller', b2_bg:'#b8860b', b3_label:'Clearance Sale', b3_bg:'#3d2b1a' },
      render: ({ b1_label, b1_bg, b2_label, b2_bg, b3_label, b3_bg }) => (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)' }}>
          {[{l:b1_label,bg:b1_bg},{l:b2_label,bg:b2_bg},{l:b3_label,bg:b3_bg}].map((b,i) => (
            <div key={i} style={{ padding:'22px', background:b.bg||'#1a1a1a', textAlign:'center' }}>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:'#fff', fontWeight:300 }}>{b.l}</span>
            </div>
          ))}
        </div>
      ),
    },

  },
};

// ── MAIN PAGE BUILDER ─────────────────────────────────────────
export default function PageBuilderPage() {
  const [activePage, setActivePage] = useState('homepage');
  const [puckData,   setPuckData]   = useState({ content:[], root:{} });
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [preview,    setPreview]    = useState(false);

  // Load saved page data
  useEffect(() => {
    setLoading(true);
    api.get(`/settings/page/${activePage}`)
      .then(r => {
        const data = r.data.data;
        if (data && data.content !== undefined) {
          setPuckData(data);
        } else {
          setPuckData({ content:[], root:{} });
        }
      })
      .catch(() => setPuckData({ content:[], root:{} }))
      .finally(() => setLoading(false));
  }, [activePage]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      await api.post(`/settings/page/${activePage}`, data);
      toast.success('Page saved — storefront updated');
    } catch {
      toast.error('Save failed');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:12 }}>
        <div style={{ width:32, height:32, border:'2px solid #b8860b', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
        <p style={{ fontSize:12, color:'#6b6b6b', letterSpacing:'0.1em' }}>Loading editor…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Top bar */}
      <div style={{ height:50, flexShrink:0, background:'#fff', borderBottom:'1px solid #e5e0d8', display:'flex', alignItems:'center', padding:'0 16px', gap:8, zIndex:100 }}>
        {/* Page selector */}
        <div style={{ display:'flex', gap:4 }}>
          {PAGES.map(p => (
            <button key={p.id} onClick={() => setActivePage(p.id)}
              style={{ padding:'5px 12px', fontSize:11, fontWeight:500, borderRadius:6, border:'none', cursor:'pointer', background:activePage===p.id?'#1a1a1a':'transparent', color:activePage===p.id?'#fff':'#6b6b6b', transition:'all .15s' }}>
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ flex:1 }}/>

        {/* Preview toggle */}
        <button onClick={() => setPreview(!preview)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', fontSize:11, border:'1px solid #e5e0d8', borderRadius:6, background:preview?'#1a1a1a':'#fff', color:preview?'#fff':'#4a4a4a', cursor:'pointer', transition:'all .15s' }}>
          <Eye size={13}/> {preview ? 'Edit' : 'Preview'}
        </button>

        <a href="http://localhost:3001" target="_blank" rel="noreferrer"
          style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', fontSize:11, border:'1px solid #e5e0d8', borderRadius:6, color:'#4a4a4a', textDecoration:'none', transition:'all .15s' }}>
          🌐 View live
        </a>
      </div>

      {/* Puck Editor */}
      <div style={{ flex:1, overflow:'hidden' }}>
        {preview ? (
          <div style={{ flex:1, overflow:'auto', background:'#e8e4df', padding:24 }}>
            <div style={{ background:'#fff', maxWidth:1280, margin:'0 auto', boxShadow:'0 4px 40px rgba(0,0,0,0.1)' }}>
              <Render config={config} data={puckData}/>
            </div>
          </div>
        ) : (
          <Puck
            config={config}
            data={puckData}
            onPublish={handleSave}
            onChange={setPuckData}
          />
        )}
      </div>

      {/* Override Puck publish button text */}
      <style>{`
        [data-testid="publish-button"] { background: #b8860b !important; }
        [data-testid="publish-button"]:hover { background: #9a7009 !important; }
        .Puck-header { border-bottom: 1px solid #e5e0d8 !important; }
      `}</style>
    </div>
  );
}
