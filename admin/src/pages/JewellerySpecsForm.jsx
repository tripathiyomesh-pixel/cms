import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { jewelleryAPI } from "../services/api";
import toast from "react-hot-toast";

const METALS = ['gold','silver','platinum','rose_gold','white_gold','yellow_gold','two_tone'];
const PURITIES = ['24K','22K','21K','18K','14K','10K','925','950','999'];
const CUTS = ['Excellent','Very Good','Good','Fair','Poor'];
const COLORS = ['D','E','F','G','H','I','J','K','L','M'];
const CLARITIES = ['FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2','I3'];
const SHAPES = ['Round','Princess','Oval','Marquise','Pear','Cushion','Emerald','Asscher','Radiant','Heart'];
const CERT_TYPES = ['IGI','GIA','SGL','HRD','AGS','BIS_Hallmark','Other'];
const OCCASIONS = ['bridal','daily','gifting','festive','office','luxury'];

export default function JewellerySpecsForm() {
  const { productId } = useParams();
  const { dark } = useTheme();
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('metal');
  const [specs, setSpecs] = useState({
    metal_type: 'gold', purity: '18K', gross_weight: '', net_weight: '',
    has_diamond: false, diamond_carat: '', diamond_cut: '', diamond_color: '',
    diamond_clarity: '', diamond_shape: '',
    has_gemstone: false, gemstone_type: '', gemstone_carat: '', gemstone_color: '',
    making_charges: '', making_pct: '', use_live_rate: false,
    ring_size_min: '', ring_size_max: '', occasion: [], gender: 'women',
    care_instructions: ''
  });
  const [certs, setCerts] = useState([]);
  const [newCert, setNewCert] = useState({ cert_type: 'IGI', cert_number: '', cert_lab: '', cert_date: '', file: null, is_primary: false });
  const [images, setImages] = useState([]);
  const [uploadingImgs, setUploadingImgs] = useState(false);
  const [rates, setRates] = useState([]);

  const bg = dark ? '#1a1a1a' : '#ffffff';
  const cardBg = dark ? '#242424' : '#f8f8f8';
  const border = dark ? '#333' : '#e5e5e5';
  const text = dark ? '#e0e0e0' : '#1a1a1a';
  const muted = dark ? '#888' : '#666';
  const gold = '#c9a84c';
  const inputStyle = { background: dark?'#2a2a2a':'#fff', border:`1px solid ${border}`, borderRadius:8, padding:'8px 12px', color:text, width:'100%', fontSize:13 };
  const labelStyle = { fontSize:12, color:muted, marginBottom:4, display:'block', fontWeight:500 };
  const tabStyle = (active) => ({ padding:'8px 16px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:active?500:400, background:active?gold:'transparent', color:active?'#000':muted, border:'none' });

  useEffect(() => {
    if (productId) {
      jewelleryAPI.getSpecs(productId).then(r => { if (r.data?.data) setSpecs(s => ({...s,...r.data.data})); });
      jewelleryAPI.getImages(productId).then(r => { if (r.data?.data) setImages(r.data.data); });
      jewelleryAPI.getCerts(productId).then(r => { if (r.data?.data) setCerts(r.data.data); });
    }
    jewelleryAPI.getMetalRates().then(r => { if (r.data?.data) setRates(r.data.data); });
  }, [productId]);

  const set = (field, val) => setSpecs(s => ({...s, [field]: val}));

  const toggleOccasion = (occ) => {
    setSpecs(s => ({...s, occasion: s.occasion.includes(occ) ? s.occasion.filter(o=>o!==occ) : [...s.occasion, occ]}));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await jewelleryAPI.saveSpecs(productId, specs);
      toast.success('Jewellery specs saved!');
    } catch(e) { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleAddCert = async () => {
    if (!newCert.cert_number) return toast.error('Certificate number required');
    const fd = new FormData();
    Object.keys(newCert).forEach(k => { if (k !== 'file' && newCert[k]) fd.append(k, newCert[k]); });
    if (newCert.file) fd.append('cert_file', newCert.file);
    try {
      await jewelleryAPI.addCert(productId, fd);
      toast.success('Certificate added');
      jewelleryAPI.getCerts(productId).then(r => { if(r.data?.data) setCerts(r.data.data); });
      setNewCert({ cert_type: 'IGI', cert_number: '', cert_lab: '', cert_date: '', file: null, is_primary: false });
    } catch(e) { toast.error('Failed'); }
  };

  const handleImgUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImgs(true);
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    try {
      await jewelleryAPI.uploadImages(productId, fd);
      toast.success(`${files.length} image(s) uploaded`);
      jewelleryAPI.getImages(productId).then(r => { if(r.data?.data) setImages(r.data.data); });
    } catch(e) { toast.error('Upload failed'); }
    setUploadingImgs(false);
  };

  const tabs = [
    { id:'metal', label:'Metal & Stone' },
    { id:'certifications', label:'Certifications' },
    { id:'images', label:'Images' },
    { id:'pricing', label:'Pricing' },
    { id:'details', label:'Details' },
  ];

  return (
    <div style={{ background:bg, minHeight:'100vh', color:text, fontFamily:'Inter,sans-serif' }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'24px 20px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:600, margin:0 }}>Jewellery Specs</h1>
            <p style={{ fontSize:13, color:muted, margin:'4px 0 0' }}>Product ID: {productId}</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => nav(-1)} style={{ ...inputStyle, width:'auto', padding:'8px 18px', cursor:'pointer' }}>Back</button>
            <button onClick={handleSave} disabled={saving}
              style={{ background:gold, color:'#000', border:'none', borderRadius:8, padding:'8px 24px', fontWeight:600, cursor:'pointer', fontSize:13 }}>
              {saving ? 'Saving…' : 'Save specs'}
            </button>
          </div>
        </div>

        {/* Live rate strip */}
        {rates.length > 0 && (
          <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:10, padding:'10px 16px', marginBottom:20, display:'flex', gap:24, flexWrap:'wrap' }}>
            <span style={{ fontSize:12, color:gold, fontWeight:600 }}>Live rates (latest)</span>
            {rates.slice(0,4).map(r => (
              <span key={r.id} style={{ fontSize:12, color:muted }}>
                {r.purity} {r.metal}: <strong style={{color:text}}>AED {parseFloat(r.rate_aed||0).toFixed(2)}/g</strong>
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:24, background:cardBg, padding:6, borderRadius:12, border:`1px solid ${border}` }}>
          {tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={tabStyle(activeTab===t.id)}>{t.label}</button>)}
        </div>

        {/* ── TAB: METAL & STONE ── */}
        {activeTab === 'metal' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:12, padding:20 }}>
              <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16, color:gold }}>Metal details</h3>
              <div style={{ marginBottom:12 }}>
                <label style={labelStyle}>Metal type</label>
                <select value={specs.metal_type} onChange={e => set('metal_type',e.target.value)} style={inputStyle}>
                  {METALS.map(m => <option key={m} value={m}>{m.replace('_',' ')}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={labelStyle}>Purity</label>
                <select value={specs.purity} onChange={e => set('purity',e.target.value)} style={inputStyle}>
                  {PURITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div>
                  <label style={labelStyle}>Gross weight (g)</label>
                  <input type="number" step="0.001" value={specs.gross_weight} onChange={e => set('gross_weight',e.target.value)} style={inputStyle} placeholder="e.g. 5.250" />
                </div>
                <div>
                  <label style={labelStyle}>Net weight (g)</label>
                  <input type="number" step="0.001" value={specs.net_weight} onChange={e => set('net_weight',e.target.value)} style={inputStyle} placeholder="e.g. 4.800" />
                </div>
              </div>
            </div>

            <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:12, padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <h3 style={{ fontSize:15, fontWeight:600, color:gold, margin:0 }}>Diamond</h3>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                  <input type="checkbox" checked={specs.has_diamond} onChange={e => set('has_diamond',e.target.checked)} />
                  <span style={{ fontSize:12, color:muted }}>Has diamond</span>
                </label>
              </div>
              {specs.has_diamond && (<>
                <div style={{ marginBottom:10 }}>
                  <label style={labelStyle}>Shape</label>
                  <select value={specs.diamond_shape||''} onChange={e => set('diamond_shape',e.target.value)} style={inputStyle}>
                    <option value="">Select</option>
                    {SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <div>
                    <label style={labelStyle}>Carat</label>
                    <input type="number" step="0.001" value={specs.diamond_carat||''} onChange={e => set('diamond_carat',e.target.value)} style={inputStyle} placeholder="e.g. 0.500" />
                  </div>
                  <div>
                    <label style={labelStyle}>Cut</label>
                    <select value={specs.diamond_cut||''} onChange={e => set('diamond_cut',e.target.value)} style={inputStyle}>
                      <option value="">Select</option>
                      {CUTS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Color</label>
                    <select value={specs.diamond_color||''} onChange={e => set('diamond_color',e.target.value)} style={inputStyle}>
                      <option value="">Select</option>
                      {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Clarity</label>
                    <select value={specs.diamond_clarity||''} onChange={e => set('diamond_clarity',e.target.value)} style={inputStyle}>
                      <option value="">Select</option>
                      {CLARITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </>)}

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:16, marginBottom:12 }}>
                <h3 style={{ fontSize:15, fontWeight:600, color:gold, margin:0 }}>Gemstone</h3>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                  <input type="checkbox" checked={specs.has_gemstone} onChange={e => set('has_gemstone',e.target.checked)} />
                  <span style={{ fontSize:12, color:muted }}>Has gemstone</span>
                </label>
              </div>
              {specs.has_gemstone && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div>
                    <label style={labelStyle}>Gemstone type</label>
                    <input type="text" value={specs.gemstone_type||''} onChange={e => set('gemstone_type',e.target.value)} style={inputStyle} placeholder="Ruby, Emerald…" />
                  </div>
                  <div>
                    <label style={labelStyle}>Carat</label>
                    <input type="number" step="0.001" value={specs.gemstone_carat||''} onChange={e => set('gemstone_carat',e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={labelStyle}>Color / description</label>
                    <input type="text" value={specs.gemstone_color||''} onChange={e => set('gemstone_color',e.target.value)} style={inputStyle} placeholder="Pigeon blood red" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: CERTIFICATIONS ── */}
        {activeTab === 'certifications' && (
          <div>
            <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:12, padding:20, marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16, color:gold }}>Add certification</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
                <div>
                  <label style={labelStyle}>Lab / Type</label>
                  <select value={newCert.cert_type} onChange={e => setNewCert(c=>({...c,cert_type:e.target.value}))} style={inputStyle}>
                    {CERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Certificate number *</label>
                  <input type="text" value={newCert.cert_number} onChange={e => setNewCert(c=>({...c,cert_number:e.target.value}))} style={inputStyle} placeholder="e.g. IGI-1234567" />
                </div>
                <div>
                  <label style={labelStyle}>Issue date</label>
                  <input type="date" value={newCert.cert_date} onChange={e => setNewCert(c=>({...c,cert_date:e.target.value}))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display:'flex', gap:12, alignItems:'flex-end' }}>
                <div style={{ flex:1 }}>
                  <label style={labelStyle}>Certificate PDF / image</label>
                  <input type="file" accept=".pdf,.jpg,.png" onChange={e => setNewCert(c=>({...c,file:e.target.files[0]}))} style={{...inputStyle, padding:'6px'}} />
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', paddingBottom:8, whiteSpace:'nowrap', fontSize:13, color:muted }}>
                  <input type="checkbox" checked={newCert.is_primary} onChange={e => setNewCert(c=>({...c,is_primary:e.target.checked}))} /> Primary cert
                </label>
                <button onClick={handleAddCert}
                  style={{ background:gold, color:'#000', border:'none', borderRadius:8, padding:'8px 20px', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontSize:13 }}>
                  Add cert
                </button>
              </div>
            </div>
            <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:12, padding:20 }}>
              <h3 style={{ fontSize:14, fontWeight:600, marginBottom:12, color:muted }}>Saved certifications ({certs.length})</h3>
              {certs.length === 0 && <p style={{ fontSize:13, color:muted }}>No certifications yet</p>}
              {certs.filter(Boolean).map((c,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${border}` }}>
                  <div>
                    <span style={{ background:gold+'22', color:gold, fontSize:11, padding:'2px 8px', borderRadius:4, fontWeight:600, marginRight:8 }}>{c.type}</span>
                    <span style={{ fontSize:13, fontWeight:500 }}>{c.number}</span>
                    {c.primary && <span style={{ marginLeft:8, fontSize:11, color:'#22c55e' }}>✓ Primary</span>}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    {c.file && <a href={c.file} target="_blank" rel="noreferrer" style={{ fontSize:12, color:gold }}>View PDF</a>}
                    <button onClick={async () => { await jewelleryAPI.deleteCert(c.id); jewelleryAPI.getCerts(productId).then(r => { if(r.data?.data) setCerts(r.data.data); }); }}
                      style={{ fontSize:12, color:'#ef4444', background:'none', border:'none', cursor:'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: IMAGES ── */}
        {activeTab === 'images' && (
          <div>
            <div style={{ background:cardBg, border:`2px dashed ${border}`, borderRadius:12, padding:32, textAlign:'center', marginBottom:16 }}>
              <p style={{ fontSize:14, color:muted, marginBottom:12 }}>Upload product images (multiple allowed · JPG, PNG, WebP)</p>
              <input type="file" accept="image/*" multiple onChange={handleImgUpload} style={{ display:'none' }} id="img-upload" />
              <label htmlFor="img-upload" style={{ background:gold, color:'#000', padding:'10px 28px', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13 }}>
                {uploadingImgs ? 'Uploading…' : 'Choose images'}
              </label>
              <p style={{ fontSize:12, color:muted, marginTop:8 }}>First image = primary / cover. Drag to reorder (coming soon)</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
              {images.filter(Boolean).map((img,i) => (
                <div key={i} style={{ background:cardBg, border:`1px solid ${img.primary?gold:border}`, borderRadius:10, overflow:'hidden', position:'relative' }}>
                  <img src={img.url} alt={img.alt||'product'} style={{ width:'100%', height:140, objectFit:'cover', display:'block' }} />
                  <div style={{ padding:'8px 10px' }}>
                    <span style={{ fontSize:11, color:muted }}>{img.type}</span>
                    {img.primary && <span style={{ marginLeft:6, fontSize:11, color:gold, fontWeight:600 }}>★ Primary</span>}
                  </div>
                  <div style={{ display:'flex', gap:6, padding:'0 10px 10px' }}>
                    {!img.primary && <button onClick={async () => { await jewelleryAPI.setImagePrimary(img.id); jewelleryAPI.getImages(productId).then(r => { if(r.data?.data) setImages(r.data.data); }); }}
                      style={{ fontSize:11, color:gold, background:'none', border:'none', cursor:'pointer', padding:0 }}>Set primary</button>}
                    <button onClick={async () => { await jewelleryAPI.deleteImage(img.id); jewelleryAPI.getImages(productId).then(r => { if(r.data?.data) setImages(r.data.data); }); }}
                      style={{ fontSize:11, color:'#ef4444', background:'none', border:'none', cursor:'pointer', padding:0, marginLeft:'auto' }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: PRICING ── */}
        {activeTab === 'pricing' && (
          <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:12, padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:600, marginBottom:20, color:gold }}>Pricing rules</h3>
            <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', marginBottom:20, padding:'12px 16px', background:specs.use_live_rate?gold+'22':'transparent', borderRadius:8, border:`1px solid ${specs.use_live_rate?gold:border}` }}>
              <input type="checkbox" checked={specs.use_live_rate} onChange={e => set('use_live_rate',e.target.checked)} />
              <div>
                <div style={{ fontSize:14, fontWeight:500 }}>Calculate price from live gold rate</div>
                <div style={{ fontSize:12, color:muted }}>Price = (net weight × live rate/g) + making charges</div>
              </div>
            </label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div>
                <label style={labelStyle}>Making charges (flat AED)</label>
                <input type="number" step="0.01" value={specs.making_charges||''} onChange={e => set('making_charges',e.target.value)} style={inputStyle} placeholder="e.g. 250.00" />
              </div>
              <div>
                <label style={labelStyle}>Making charges (%)</label>
                <input type="number" step="0.1" value={specs.making_pct||''} onChange={e => set('making_pct',e.target.value)} style={inputStyle} placeholder="e.g. 12.5" />
              </div>
            </div>
            {specs.use_live_rate && specs.net_weight && rates.length > 0 && (() => {
              const r = rates.find(x => x.purity === specs.purity);
              if (!r) return null;
              const metalVal = parseFloat(specs.net_weight) * parseFloat(r.rate_aed||0);
              const pct = metalVal * (parseFloat(specs.making_pct||0)/100);
              const flat = parseFloat(specs.making_charges||0);
              const total = metalVal + pct + flat;
              return (
                <div style={{ marginTop:20, padding:'14px 18px', background:gold+'11', border:`1px solid ${gold}44`, borderRadius:8 }}>
                  <div style={{ fontSize:12, color:gold, fontWeight:600, marginBottom:6 }}>Estimated price preview</div>
                  <div style={{ fontSize:13, color:text }}>Metal value: AED {metalVal.toFixed(2)}</div>
                  <div style={{ fontSize:13, color:text }}>Making charges: AED {(pct+flat).toFixed(2)}</div>
                  <div style={{ fontSize:16, fontWeight:700, color:gold, marginTop:6 }}>Total: AED {total.toFixed(2)}</div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── TAB: DETAILS ── */}
        {activeTab === 'details' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:12, padding:20 }}>
              <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16, color:gold }}>Ring sizes</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div>
                  <label style={labelStyle}>Min size</label>
                  <input type="number" step="0.5" value={specs.ring_size_min||''} onChange={e => set('ring_size_min',e.target.value)} style={inputStyle} placeholder="e.g. 5" />
                </div>
                <div>
                  <label style={labelStyle}>Max size</label>
                  <input type="number" step="0.5" value={specs.ring_size_max||''} onChange={e => set('ring_size_max',e.target.value)} style={inputStyle} placeholder="e.g. 10" />
                </div>
              </div>
            </div>
            <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:12, padding:20 }}>
              <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16, color:gold }}>Gender &amp; occasion</h3>
              <div style={{ marginBottom:12 }}>
                <label style={labelStyle}>Gender</label>
                <select value={specs.gender} onChange={e => set('gender',e.target.value)} style={inputStyle}>
                  {['women','men','unisex','kids'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <label style={labelStyle}>Occasion (select multiple)</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {OCCASIONS.map(occ => (
                  <button key={occ} onClick={() => toggleOccasion(occ)}
                    style={{ padding:'5px 12px', borderRadius:20, fontSize:12, cursor:'pointer', fontWeight:500,
                      background:specs.occasion?.includes(occ)?gold:'transparent',
                      color:specs.occasion?.includes(occ)?'#000':muted,
                      border:`1px solid ${specs.occasion?.includes(occ)?gold:border}` }}>
                    {occ}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ gridColumn:'1/-1', background:cardBg, border:`1px solid ${border}`, borderRadius:12, padding:20 }}>
              <label style={labelStyle}>Care instructions</label>
              <textarea value={specs.care_instructions||''} onChange={e => set('care_instructions',e.target.value)}
                style={{...inputStyle, height:100, resize:'vertical'}}
                placeholder="e.g. Store in a cool dry place. Clean with a soft cloth. Avoid contact with perfumes and chemicals." />
            </div>
          </div>
        )}

        {/* Save button bottom */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:24 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ background:gold, color:'#000', border:'none', borderRadius:8, padding:'10px 32px', fontWeight:600, cursor:'pointer', fontSize:14 }}>
            {saving ? 'Saving…' : 'Save all specs'}
          </button>
        </div>
      </div>
    </div>
  );
}
