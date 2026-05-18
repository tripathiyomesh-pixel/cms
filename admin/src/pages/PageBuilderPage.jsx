import { useEffect, useRef, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Save, Eye, Smartphone, Tablet, Monitor, RotateCcw, Plus } from 'lucide-react';

// ── TEJORI BLOCKS (pre-designed sections) ────────────────────
const TEJORI_BLOCKS = [
  {
    id: 'tejori-hero',
    label: 'Hero Banner',
    category: 'Tejori Sections',
    content: `
      <section style="position:relative;min-height:80vh;background:#1a1a1a;display:flex;align-items:center;overflow:hidden">
        <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.6"/>
        <div style="position:relative;z-index:1;padding:60px 80px;max-width:700px">
          <p style="font-size:10px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:#b8860b;margin-bottom:16px">New Collection</p>
          <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:72px;font-weight:300;color:#fff;line-height:1.05;margin-bottom:20px">Frost Yourself</h1>
          <p style="font-size:16px;color:rgba(255,255,255,0.7);margin-bottom:32px;line-height:1.7;max-width:440px">Dazzling pear and marquise diamonds, sculpted to mirror the wild beauty of ice crystals.</p>
          <a href="/jewellery" style="font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,0.5);padding-bottom:3px">Discover the selection →</a>
        </div>
      </section>`,
  },
  {
    id: 'tejori-categories',
    label: 'Category Grid',
    category: 'Tejori Sections',
    content: `
      <section style="padding:60px 40px;background:#fff;text-align:center">
        <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;font-weight:400;color:#1a1a1a;margin-bottom:40px;letter-spacing:0.02em">Top Categories</h2>
        <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:16px;max-width:1200px;margin:0 auto">
          ${['Bracelets','Diamonds','Earrings','High Jewellery','Jewellery','Lab Grown','Necklaces','Bridal'].map(cat=>
            `<div style="display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer">
              <div style="width:72px;height:72px;border-radius:50%;overflow:hidden;border:2px solid #e5e0d8">
                <img src="https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=200&q=80" style="width:100%;height:100%;object-fit:cover"/>
              </div>
              <span style="font-size:10px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:#4a4a4a">${cat}</span>
            </div>`
          ).join('')}
        </div>
      </section>`,
  },
  {
    id: 'tejori-products',
    label: 'Product Grid',
    category: 'Tejori Sections',
    content: `
      <section style="padding:60px 40px;background:#fdf8f3">
        <div style="max-width:1200px;margin:0 auto">
          <p style="font-size:10px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:#b8860b;margin-bottom:8px">Featured</p>
          <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;font-weight:400;color:#1a1a1a;margin-bottom:40px">Our Selection</h2>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px">
            ${[
              {name:'Croissant Dome Hoops',badge:'-10%'},
              {name:'Diamond Celestial Studs',badge:'-17%'},
              {name:'Medium Flat Hoops',badge:''},
              {name:'Organic Pearl Stacked Hoops',badge:''},
            ].map(p=>`
              <div style="background:#fff;border:1px solid #e5e0d8">
                <div style="position:relative;aspect-ratio:1;overflow:hidden;background:#f5ede2">
                  <img src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=80" style="width:100%;height:100%;object-fit:cover"/>
                  ${p.badge?`<span style="position:absolute;top:12px;left:12px;background:#1a1a1a;color:#fff;font-size:10px;padding:3px 8px;letter-spacing:0.08em">${p.badge}</span>`:''}
                </div>
                <div style="padding:16px">
                  <h3 style="font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:400;color:#1a1a1a;margin-bottom:12px">${p.name}</h3>
                  <button style="width:100%;padding:12px;background:#1a1a1a;color:#fff;font-size:10px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;border:none;cursor:pointer">Inquiry Now</button>
                </div>
              </div>`
            ).join('')}
          </div>
        </div>
      </section>`,
  },
  {
    id: 'tejori-brand-story',
    label: 'Brand Story',
    category: 'Tejori Sections',
    content: `
      <section style="padding:80px 40px;background:#fff">
        <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center">
          <div>
            <p style="font-size:10px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:#b8860b;margin-bottom:16px">Our Promise</p>
            <h2 style="font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:300;color:#1a1a1a;line-height:1.1;margin-bottom:24px">Handcrafted &<br/>Ethically Sourced</h2>
            <div style="width:40px;height:1px;background:#b8860b;margin-bottom:32px"></div>
            <p style="font-size:13px;color:#6b6b6b;line-height:1.9;margin-bottom:32px">With a legacy spanning 60 years, TEJORI is dedicated to offering a wide range of exquisite jewellery pieces and personalized customization services.</p>
            <a href="/about" style="font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#1a1a1a;border-bottom:1px solid #1a1a1a;padding-bottom:2px">Learn More →</a>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=700&q=80" style="width:100%;aspect-ratio:4/5;object-fit:cover"/>
          </div>
        </div>
      </section>`,
  },
  {
    id: 'tejori-testimonials',
    label: 'Testimonials',
    category: 'Tejori Sections',
    content: `
      <section style="padding:80px 40px;background:#fdf8f3;text-align:center">
        <p style="font-size:10px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:#b8860b;margin-bottom:40px">What Our Clients Say</p>
        <div style="color:#b8860b;font-size:20px;letter-spacing:4px;margin-bottom:24px">★★★★★</div>
        <p style="font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:300;font-style:italic;color:#1a1a1a;max-width:700px;margin:0 auto 32px;line-height:1.6">"An extraordinary experience from the moment we walked in. The craftsmanship is beyond compare."</p>
        <p style="font-size:13px;font-weight:600;color:#1a1a1a;letter-spacing:0.08em;margin-bottom:4px">Saitama One</p>
        <p style="font-size:12px;color:#b8860b">"Fabulous Grounds"</p>
      </section>`,
  },
  {
    id: 'tejori-collection-banner',
    label: 'Collection Banner',
    category: 'Tejori Sections',
    content: `
      <div style="display:grid;grid-template-columns:1fr 1fr">
        <div style="position:relative;height:400px;overflow:hidden">
          <img src="https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&q=80" style="width:100%;height:100%;object-fit:cover"/>
          <div style="position:absolute;inset:0;background:rgba(0,0,0,0.4);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px">
            <h3 style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:#fff;margin-bottom:12px">Summer Collections</h3>
            <p style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:24px">Freshwater pearl necklace and earrings</p>
            <a href="/jewellery" style="font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,0.5);padding-bottom:2px">Explore</a>
          </div>
        </div>
        <div style="position:relative;height:400px;overflow:hidden">
          <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80" style="width:100%;height:100%;object-fit:cover"/>
          <div style="position:absolute;inset:0;background:rgba(0,0,0,0.4);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px">
            <h3 style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:#fff;margin-bottom:12px">Make it memorable</h3>
            <p style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:24px">Bespoke jewellery for life's most important moments</p>
            <a href="/custom" style="font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,0.5);padding-bottom:2px">Explore</a>
          </div>
        </div>
      </div>`,
  },
  {
    id: 'tejori-newsletter',
    label: 'Newsletter',
    category: 'Tejori Sections',
    content: `
      <section style="padding:60px 40px;background:#1a1a1a;text-align:center">
        <p style="font-size:10px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:#b8860b;margin-bottom:12px">Stay Connected</p>
        <h2 style="font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;color:#fff;margin-bottom:12px">Stay in the world of Tejori</h2>
        <p style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:32px;letter-spacing:0.05em">Subscribe for 10% off your first purchase. Plus new arrivals and exclusive offers.</p>
        <form style="display:flex;gap:0;max-width:420px;margin:0 auto">
          <input type="email" placeholder="Your email address" style="flex:1;padding:14px 18px;border:1px solid rgba(255,255,255,0.15);border-right:none;background:rgba(255,255,255,0.05);color:#fff;font-size:12px;outline:none"/>
          <button style="padding:14px 24px;background:#b8860b;color:#fff;border:none;cursor:pointer;font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;white-space:nowrap">Subscribe</button>
        </form>
      </section>`,
  },
  {
    id: 'tejori-about',
    label: 'About / Heritage',
    category: 'Tejori Sections',
    content: `
      <section style="padding:80px 40px;background:#fff">
        <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center">
          <div style="position:relative">
            <img src="https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=700&q=80" style="width:100%;aspect-ratio:4/5;object-fit:cover"/>
            <div style="position:absolute;bottom:0;right:0;background:#1a1a1a;padding:20px 24px;min-width:120px">
              <p style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:#b8860b">60+</p>
              <p style="font-size:9px;color:#888;letter-spacing:0.12em;text-transform:uppercase;margin-top:4px">Years of Legacy</p>
            </div>
          </div>
          <div>
            <p style="font-size:10px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:#b8860b;margin-bottom:16px">About us</p>
            <h2 style="font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:300;color:#1a1a1a;margin-bottom:24px;line-height:1.1">Our Heritage</h2>
            <div style="width:40px;height:1px;background:#b8860b;margin-bottom:24px"></div>
            <p style="font-size:13px;color:#6b6b6b;line-height:1.9;margin-bottom:16px">With a legacy spanning 60 years, TEJORI is dedicated to offering a wide range of exquisite jewellery pieces and personalized customization services.</p>
            <p style="font-size:13px;color:#6b6b6b;line-height:1.9;margin-bottom:32px">Founded in 2004, Tejori has become one of the most respected brands in the GCC.</p>
            <a href="/about" style="font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#1a1a1a;border-bottom:1px solid #1a1a1a;padding-bottom:2px">Learn More →</a>
          </div>
        </div>
      </section>`,
  },
  {
    id: 'tejori-why',
    label: 'Why Choose Tejori',
    category: 'Tejori Sections',
    content: `
      <section style="padding:80px 40px;background:#fdf8f3;text-align:center">
        <p style="font-size:10px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:#b8860b;margin-bottom:12px">Our Difference</p>
        <h2 style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:#1a1a1a;margin-bottom:60px">Why choose TEJORI?</h2>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:48px;max-width:1000px;margin:0 auto">
          ${[
            {icon:'🏆',title:'Authenticity Guaranteed',desc:'Every piece is handpicked and meticulously inspected. We guarantee authenticity.'},
            {icon:'💎',title:'Rare & Iconic Jewellery',desc:'Our rare jewellery is not just timeless — it\'s a valuable investment.'},
            {icon:'✨',title:'Heritage of Craftsmanship',desc:'With heritage since 1964, we create masterpieces that last a lifetime.'},
          ].map(p=>`
            <div>
              <div style="font-size:40px;margin-bottom:20px">${p.icon}</div>
              <h3 style="font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#1a1a1a;margin-bottom:12px">${p.title}</h3>
              <p style="font-size:13px;color:#6b6b6b;line-height:1.8">${p.desc}</p>
            </div>`
          ).join('')}
        </div>
      </section>`,
  },
  {
    id: 'tejori-promo-strip',
    label: 'Promo Strip',
    category: 'Tejori Sections',
    content: `
      <div style="display:grid;grid-template-columns:repeat(3,1fr)">
        <a href="/jewellery?is_new=true" style="display:flex;align-items:center;justify-content:center;padding:28px;background:#1a1a1a;color:#c9a84c;font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:300;text-align:center;text-decoration:none;letter-spacing:0.03em">New Arrivals</a>
        <a href="/jewellery?sort=featured" style="display:flex;align-items:center;justify-content:center;padding:28px;background:#b8860b;color:#fff;font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:300;text-align:center;text-decoration:none;letter-spacing:0.03em">Best Seller</a>
        <a href="/jewellery?on_sale=true" style="display:flex;align-items:center;justify-content:center;padding:28px;background:#3d2b1a;color:#e8d5bc;font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:300;text-align:center;text-decoration:none;letter-spacing:0.03em">Clearance Sale</a>
      </div>`,
  },
  {
    id: 'tejori-editorial',
    label: 'Editorial Full-Width',
    category: 'Tejori Sections',
    content: `
      <div style="position:relative;height:560px;overflow:hidden">
        <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=80" style="width:100%;height:100%;object-fit:cover"/>
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45)"></div>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:80px 80px">
          <h2 style="font-family:'Cormorant Garamond',serif;font-size:72px;font-weight:300;color:#fff;line-height:1.05;margin-bottom:16px">Classics</h2>
          <p style="font-size:14px;color:rgba(255,255,255,0.65);max-width:440px;margin-bottom:32px;line-height:1.7">Timeless and elegant jewellery that never goes out of style.</p>
          <a href="/jewellery?collection=classics" style="font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,0.4);padding-bottom:2px;width:fit-content">Discover the selection →</a>
        </div>
      </div>`,
  },
  {
    id: 'tejori-learning',
    label: 'Learning Center',
    category: 'Tejori Sections',
    content: `
      <div style="position:relative;height:320px;overflow:hidden">
        <img src="https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=1400&q=80" style="width:100%;height:100%;object-fit:cover"/>
        <div style="position:absolute;inset:0;background:rgba(10,10,10,0.58)"></div>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px">
          <p style="font-size:10px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:#b8860b;margin-bottom:16px">Education</p>
          <h2 style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:#fff;margin-bottom:16px">The Learning Center</h2>
          <p style="font-size:13px;color:rgba(255,255,255,0.65);max-width:440px;margin-bottom:28px;line-height:1.8">Whether you're buying jewellery for the first time or need a refresher, we've got you covered.</p>
          <a href="/blog" style="font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,0.4);padding-bottom:2px">Learn more →</a>
        </div>
      </div>`,
  },
  {
    id: 'tejori-divider',
    label: 'Section Divider',
    category: 'Tejori Sections',
    content: `<div style="display:flex;align-items:center;gap:20px;padding:32px 80px;background:#fff"><div style="flex:1;height:0.5px;background:#e5e0d8"></div><span style="font-size:18px;color:#b8860b">✦</span><div style="flex:1;height:0.5px;background:#e5e0d8"></div></div>`,
  },
  {
    id: 'tejori-spacer',
    label: 'Spacer',
    category: 'Tejori Sections',
    content: `<div style="height:80px;background:#fff"></div>`,
  },
];

const PAGES = [
  { id:'homepage',   label:'Homepage' },
  { id:'about',      label:'About / Heritage' },
  { id:'lab-grown',  label:'Lab Grown' },
  { id:'custom',     label:'Bespoke Services' },
];

export default function PageBuilderPage() {
  const { collapsed } = useOutletContext()||{};
  const editorRef  = useRef(null);
  const containerRef = useRef(null);
  const [editor,   setEditor]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [activePage, setActivePage] = useState('homepage');
  const [device,   setDevice]   = useState('desktop');
  const [searchParams] = useSearchParams();

  // Load GrapesJS dynamically
  useEffect(() => {
    const page = searchParams.get('page') || 'homepage';
    setActivePage(page);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    let gjs;
    (async () => {
      // Dynamic import GrapesJS
      const grapes = await import('grapesjs');
      const GrapesJS = grapes.default;

      // Load saved content
      let savedHtml = '';
      let savedCss  = '';
      try {
        const res = await api.get(`/settings/page/${activePage}`);
        if (res.data.data) {
          savedHtml = res.data.data.html || '';
          savedCss  = res.data.data.css  || '';
        }
      } catch {}

      // Init GrapesJS
      gjs = GrapesJS.init({
        container: containerRef.current,
        height: '100%',
        storageManager: false,
        panels: { defaults: [] }, // we build our own panels
        deviceManager: {
          devices: [
            { name:'Desktop',  width:'' },
            { name:'Tablet',   width:'768px' },
            { name:'Mobile',   width:'390px' },
          ],
        },
        blockManager: {
          appendTo: '#gjs-blocks',
          blocks: TEJORI_BLOCKS,
        },
        styleManager: {
          appendTo: '#gjs-styles',
          sectors: [
            { name:'Typography', open:false, properties:['font-family','font-size','font-weight','color','text-align','letter-spacing','line-height','text-transform'] },
            { name:'Spacing',    open:false, properties:['padding','padding-top','padding-bottom','padding-left','padding-right','margin','margin-top','margin-bottom'] },
            { name:'Background', open:false, properties:['background-color','background-image','background-size','background-position'] },
            { name:'Dimension',  open:false, properties:['width','min-height','max-width'] },
            { name:'Border',     open:false, properties:['border','border-radius'] },
          ],
        },
        layerManager: { appendTo: '#gjs-layers' },
        traitManager: { appendTo: '#gjs-traits' },
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap',
          ],
        },
        components: savedHtml,
        style: savedCss,
      });

      editorRef.current = gjs;
      setEditor(gjs);
      setLoading(false);
    })();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [activePage]);

  // Device switching
  useEffect(() => {
    if (!editor) return;
    const deviceMap = { desktop:'Desktop', tablet:'Tablet', mobile:'Mobile' };
    editor.setDevice(deviceMap[device]);
  }, [device, editor]);

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    try {
      const html = editor.getHtml();
      const css  = editor.getCss();
      await api.post(`/settings/page/${activePage}`, { html, css });
      toast.success(`${PAGES.find(p=>p.id===activePage)?.label || activePage} saved`);
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const handleReset = () => {
    if (!editor) return;
    if (confirm('Reset page to empty? This cannot be undone.')) {
      editor.setComponents('');
      editor.setStyle('');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-ink-900 border-b border-ink-200/60 dark:border-ink-800 flex-shrink-0 h-14 gap-3">
        {/* Page selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-600 dark:text-ink-300 mr-2">Page:</span>
          {PAGES.map(p => (
            <button key={p.id} onClick={() => setActivePage(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activePage===p.id?'bg-gold-500 text-white':'text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800'}`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Device */}
        <div className="flex items-center gap-1 bg-ink-100 dark:bg-ink-800 rounded-lg p-1">
          {[['desktop',Monitor],['tablet',Tablet],['mobile',Smartphone]].map(([d,Icon]) => (
            <button key={d} onClick={() => setDevice(d)}
              className={`p-1.5 rounded-md transition-all ${device===d?'bg-white dark:bg-ink-700 shadow-sm text-gold-600':'text-ink-400 hover:text-ink-600'}`}>
              <Icon size={14}/>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="btn-ghost text-xs flex items-center gap-1.5">
            <RotateCcw size={12}/> Reset
          </button>
          <a href="http://localhost:3011" target="_blank" rel="noreferrer" className="btn-ghost text-xs flex items-center gap-1.5">
            <Eye size={12}/> Preview
          </a>
          <button onClick={handleSave} disabled={saving}
            className="btn-gold flex items-center gap-1.5 text-xs disabled:opacity-50">
            <Save size={13}/>{saving?'Saving…':'Save & Publish'}
          </button>
        </div>
      </div>

      {/* Editor layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — blocks + layers */}
        <div className="w-56 flex-shrink-0 bg-white dark:bg-ink-900 border-r border-ink-200/60 dark:border-ink-800 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-ink-100 dark:border-ink-800">
            {['Blocks','Layers','Styles'].map((t,i) => (
              <button key={t} onClick={() => {
                  document.getElementById('gjs-blocks')?.style && (document.getElementById('gjs-blocks').style.display = i===0?'block':'none');
                  document.getElementById('gjs-layers')?.style && (document.getElementById('gjs-layers').style.display = i===1?'block':'none');
                  document.getElementById('gjs-styles')?.style && (document.getElementById('gjs-styles').style.display = i===2?'block':'none');
                }}
                className="flex-1 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400 hover:text-gold-600 transition-colors border-b-2 border-transparent hover:border-gold-400">
                {t}
              </button>
            ))}
          </div>
          <div id="gjs-blocks"  className="flex-1 overflow-y-auto gjs-blocks-panel"/>
          <div id="gjs-layers"  className="flex-1 overflow-y-auto hidden"/>
          <div id="gjs-styles"  className="flex-1 overflow-y-auto hidden"/>
          <div id="gjs-traits"  className="hidden"/>
        </div>

        {/* Center — canvas */}
        <div className="flex-1 overflow-hidden relative bg-ink-100 dark:bg-ink-950">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-ink-50 dark:bg-ink-900">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
                <p className="text-xs text-ink-400">Loading editor…</p>
              </div>
            </div>
          )}
          <div ref={containerRef} style={{ width:'100%', height:'100%' }}/>
        </div>
      </div>

      {/* GrapesJS styles */}
      <style>{`
        .gjs-blocks-panel .gjs-block-category-title { font-size:9px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; padding:10px 12px 4px; color:#b8860b; }
        .gjs-blocks-panel .gjs-block { width:calc(50% - 8px); margin:4px; border:1px solid #e5e0d8; border-radius:4px; padding:10px 6px; text-align:center; cursor:grab; transition:all .15s; font-size:10px; }
        .gjs-blocks-panel .gjs-block:hover { border-color:#b8860b; background:#fdf8f3; }
        .gjs-blocks-panel .gjs-block-label { font-size:10px; font-weight:500; color:#4a4a4a; margin-top:4px; }
        .gjs-cv-canvas { background:#f0ede8; }
        .gjs-frame-wrapper { box-shadow:0 4px 32px rgba(0,0,0,0.12); }
      `}</style>
    </div>
  );
}
