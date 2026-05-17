import Toggle from '../components/ui/Toggle';
import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const SHAPES    = ['Round','Princess','Oval','Marquise','Pear','Cushion','Emerald','Asscher','Radiant','Heart','Trillion'];
const COLORS    = ['D','E','F','G','H','I','J','K','L','M','N'];
const CLARITIES = ['FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2','I3'];
const GRADES    = ['Excellent','Very Good','Good','Fair','Poor'];
const FLUOR     = ['None','Faint','Medium','Strong','Very Strong'];
const LABS      = ['GIA','IGI','HRD','AGS','SGL','Other'];
const ORIGINS   = ['Botswana','South Africa','Russia','Canada','India','Australia','Angola','Zimbabwe'];

export default function DiamondFormPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('identity');

  const [form, setForm] = useState({
    name:'', diamond_type:'NATURAL', growth_type:'', country_of_origin:'',
    shape:'Round', carat:'', color:'', clarity:'', cut:'Excellent',
    polish:'Excellent', symmetry:'Excellent', fluorescence:'None', fluorescence_color:'',
    laser_inscription:'',
    meas_length:'', meas_width:'', meas_depth:'', table_percent:'', depth_percent:'',
    crown_angle:'', pavilion_angle:'', girdle:'', culet:'',
    rap_rate:'', rap_discount_pct:'',
    primary_cert_no:'', primary_cert_lab:'GIA', cert_url:'',
    base_price:'', final_price:'', currency:'USD',
    status:'draft', inventory_mode:'IN_HOUSE',
    is_available:true, hold_until:'', hold_by_customer:'',
    internal_notes:'',
  });

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    if(isEdit){
      api.get(`/diamonds/${id}`).then(r=>{
        const d=r.data.data;
        setForm(f=>({...f,...d,
          carat:d.carat||'', rap_rate:d.rap_rate||'', rap_discount_pct:d.rap_discount_pct||'',
          base_price:d.base_price||'', final_price:d.final_price||'',
        }));
      }).catch(()=>toast.error('Diamond not found'));
    }
  },[id]);

  const handleSave = async(e)=>{
    e.preventDefault(); setSaving(true);
    try {
      const data={...form,
        carat:parseFloat(form.carat)||null,
        rap_rate:parseFloat(form.rap_rate)||null,
        rap_discount_pct:parseFloat(form.rap_discount_pct)||null,
        base_price:parseFloat(form.base_price)||0,
        final_price:parseFloat(form.final_price)||parseFloat(form.base_price)||0,
        meas_length:parseFloat(form.meas_length)||null,
        meas_width:parseFloat(form.meas_width)||null,
        meas_depth:parseFloat(form.meas_depth)||null,
        table_percent:parseFloat(form.table_percent)||null,
        depth_percent:parseFloat(form.depth_percent)||null,
      };
      if(!data.name) data.name=`${data.diamond_type==='LAB_GROWN'?'Lab':'Natural'} ${data.shape} ${data.carat}ct ${data.color} ${data.clarity}`;
      if(isEdit){ await api.patch(`/diamonds/${id}`,data); toast.success('Diamond updated'); }
      else { const r=await api.post('/diamonds',data); toast.success('Diamond created'); navigate(`/diamonds/${r.data.data.id}`); }
    } catch(e){ toast.error(e.response?.data?.message||'Save failed'); }
    setSaving(false);
  };

  const inp = 'input-field';
  const sel = 'input-field';
  const lbl = 'block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';
  const tabs = [
    {id:'identity',label:'Identity & type'},
    {id:'grading', label:'4Cs + grading'},
    {id:'measurements',label:'Measurements'},
    {id:'pricing',label:'Pricing & Rap'},
    {id:'cert',label:'Certification'},
    {id:'availability',label:'Availability'},
  ];

  const rapFinalPrice = form.rap_rate && form.carat && form.rap_discount_pct !== ''
    ? (parseFloat(form.rap_rate) * parseFloat(form.carat) * (1 + parseFloat(form.rap_discount_pct||0)/100)).toFixed(2)
    : null;

  return (
    <>
      <Topbar title={isEdit?'Edit diamond':'Add diamond'}
        subtitle={isEdit?`SKU: ${form.sku||id}`:'New loose diamond inventory'}
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={<div className="flex gap-2">
          <button onClick={()=>navigate('/diamonds')} className="btn-outline flex items-center gap-1.5 text-xs"><ArrowLeft size={13}/>Back</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs disabled:opacity-50"><Save size={13}/>{saving?'Saving…':'Save diamond'}</button>
        </div>}/>

      <div className="flex-1 overflow-y-auto p-5">
        <form onSubmit={handleSave} className="max-w-4xl space-y-4">

          {/* Tab bar */}
          <div className="flex gap-1 bg-ink-100 dark:bg-ink-800 p-1 rounded-xl w-fit overflow-x-auto">
            {tabs.map(t=>(
              <button key={t.id} type="button" onClick={()=>setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab===t.id?'bg-white dark:bg-ink-700 text-ink-700 dark:text-ink-100 shadow-sm':'text-ink-400 hover:text-ink-600'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB: IDENTITY ── */}
          {tab==='identity' && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Diamond identity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={lbl}>Product name (auto-generated if blank)</label>
                  <input value={form.name} onChange={e=>set('name',e.target.value)} className={inp} placeholder="e.g. Natural Round 1.20ct D VVS1"/>
                </div>
                <div>
                  <label className={lbl}>Diamond type *</label>
                  <select value={form.diamond_type} onChange={e=>set('diamond_type',e.target.value)} className={sel}>
                    <option value="NATURAL">Natural diamond</option>
                    <option value="LAB_GROWN">Lab-grown diamond</option>
                  </select>
                </div>
                {form.diamond_type==='LAB_GROWN' && (
                  <div>
                    <label className={lbl}>Growth method</label>
                    <select value={form.growth_type} onChange={e=>set('growth_type',e.target.value)} className={sel}>
                      <option value="">Not specified</option>
                      <option value="CVD">CVD</option>
                      <option value="HPHT">HPHT</option>
                    </select>
                  </div>
                )}
                {form.diamond_type==='NATURAL' && (
                  <div>
                    <label className={lbl}>Country of origin</label>
                    <select value={form.country_of_origin} onChange={e=>set('country_of_origin',e.target.value)} className={sel}>
                      <option value="">Unknown / Not specified</option>
                      {ORIGINS.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className={lbl}>Inventory mode</label>
                  <select value={form.inventory_mode} onChange={e=>set('inventory_mode',e.target.value)} className={sel}>
                    {['IN_HOUSE','MEMO','SUPPLIER','VIRTUAL'].map(m=><option key={m} value={m}>{m.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Status</label>
                  <select value={form.status} onChange={e=>set('status',e.target.value)} className={sel}>
                    {['draft','active','inactive'].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Laser inscription</label>
                  <input value={form.laser_inscription} onChange={e=>set('laser_inscription',e.target.value)} className={inp} placeholder="e.g. IGI 123456789"/>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: GRADING ── */}
          {tab==='grading' && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">4Cs + advanced grading</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Shape *</label>
                  <select value={form.shape} onChange={e=>set('shape',e.target.value)} className={sel}>
                    {SHAPES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Carat weight *</label>
                  <input type="number" step="0.01" value={form.carat} onChange={e=>set('carat',e.target.value)} className={inp} placeholder="e.g. 1.20"/>
                </div>
                <div>
                  <label className={lbl}>Color grade</label>
                  <select value={form.color} onChange={e=>set('color',e.target.value)} className={sel}>
                    <option value="">Select</option>
                    {COLORS.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Clarity grade</label>
                  <select value={form.clarity} onChange={e=>set('clarity',e.target.value)} className={sel}>
                    <option value="">Select</option>
                    {CLARITIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Cut grade</label>
                  <select value={form.cut} onChange={e=>set('cut',e.target.value)} className={sel}>
                    <option value="">Select</option>
                    {GRADES.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Polish</label>
                  <select value={form.polish} onChange={e=>set('polish',e.target.value)} className={sel}>
                    {GRADES.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Symmetry</label>
                  <select value={form.symmetry} onChange={e=>set('symmetry',e.target.value)} className={sel}>
                    {GRADES.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Fluorescence</label>
                  <select value={form.fluorescence} onChange={e=>set('fluorescence',e.target.value)} className={sel}>
                    {FLUOR.map(f=><option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                {form.fluorescence!=='None' && (
                  <div>
                    <label className={lbl}>Fluorescence color</label>
                    <input value={form.fluorescence_color} onChange={e=>set('fluorescence_color',e.target.value)} className={inp} placeholder="Blue / White / Yellow"/>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: MEASUREMENTS ── */}
          {tab==='measurements' && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Physical measurements (mm)</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {k:'meas_length',l:'Length (mm)'},{k:'meas_width',l:'Width (mm)'},{k:'meas_depth',l:'Depth (mm)'},
                  {k:'table_percent',l:'Table %'},{k:'depth_percent',l:'Depth %'},{k:'crown_angle',l:'Crown angle °'},
                  {k:'pavilion_angle',l:'Pavilion angle °'},
                ].map(f=>(
                  <div key={f.k}>
                    <label className={lbl}>{f.l}</label>
                    <input type="number" step="0.01" value={form[f.k]} onChange={e=>set(f.k,e.target.value)} className={inp} placeholder="0.00"/>
                  </div>
                ))}
                <div>
                  <label className={lbl}>Girdle</label>
                  <input value={form.girdle} onChange={e=>set('girdle',e.target.value)} className={inp} placeholder="Thin to Medium"/>
                </div>
                <div>
                  <label className={lbl}>Culet</label>
                  <input value={form.culet} onChange={e=>set('culet',e.target.value)} className={inp} placeholder="None / Very Small"/>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: PRICING ── */}
          {tab==='pricing' && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Pricing & Rapaport</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Rapaport rate (USD/ct)</label>
                  <input type="number" step="0.01" value={form.rap_rate} onChange={e=>set('rap_rate',e.target.value)} className={inp} placeholder="e.g. 8500"/>
                </div>
                <div>
                  <label className={lbl}>Discount / Premium %</label>
                  <input type="number" step="0.1" value={form.rap_discount_pct} onChange={e=>set('rap_discount_pct',e.target.value)} className={inp} placeholder="-15 (below rap) or +5 (above rap)"/>
                </div>
                <div>
                  <label className={lbl}>Base price (USD)</label>
                  <input type="number" step="0.01" value={form.base_price} onChange={e=>set('base_price',e.target.value)} className={inp} placeholder="0.00"/>
                </div>
                <div>
                  <label className={lbl}>Final / asking price</label>
                  <input type="number" step="0.01" value={form.final_price} onChange={e=>set('final_price',e.target.value)} className={inp} placeholder="0.00"/>
                </div>
                <div>
                  <label className={lbl}>Currency</label>
                  <select value={form.currency} onChange={e=>set('currency',e.target.value)} className={sel}>
                    {['USD','AED','INR','EUR','GBP'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {rapFinalPrice && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Calculated from Rapaport</p>
                  <p className="text-lg font-semibold text-amber-600">USD {Number(rapFinalPrice).toLocaleString()}</p>
                  <p className="text-xs text-amber-600/70">= {form.rap_rate} × {form.carat}ct × (1 {parseFloat(form.rap_discount_pct)>=0?'+':''}{form.rap_discount_pct}%)</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: CERTIFICATION ── */}
          {tab==='cert' && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Certificate details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Certificate lab *</label>
                  <select value={form.primary_cert_lab} onChange={e=>set('primary_cert_lab',e.target.value)} className={sel}>
                    {LABS.map(l=><option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Certificate number *</label>
                  <input value={form.primary_cert_no} onChange={e=>set('primary_cert_no',e.target.value)} className={inp} placeholder="e.g. 2141234567"/>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Certificate verification URL</label>
                  <input value={form.cert_url} onChange={e=>set('cert_url',e.target.value)} className={inp} placeholder="https://www.igi.org/reports/..."/>
                </div>
              </div>
              {form.primary_cert_no && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-3">
                  <i className="ti ti-certificate text-green-600 text-xl" aria-hidden="true"/>
                  <div>
                    <p className="text-xs font-medium text-green-700 dark:text-green-300">Verification page will be live at:</p>
                    <p className="text-xs text-green-600 font-mono">/verify/{form.primary_cert_no}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: AVAILABILITY ── */}
          {tab==='availability' && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Availability & hold</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Toggle checked={!!form.is_available} onChange={v=>set("is_available",v)}/>
                    <span className="text-sm text-ink-600 dark:text-ink-300">Available for sale</span>
                  </label>
                </div>
                <div>
                  <label className={lbl}>Hold until (date)</label>
                  <input type="datetime-local" value={form.hold_until} onChange={e=>set('hold_until',e.target.value)} className={inp}/>
                </div>
                <div>
                  <label className={lbl}>Held by (customer name)</label>
                  <input value={form.hold_by_customer} onChange={e=>set('hold_by_customer',e.target.value)} className={inp} placeholder="Customer name"/>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Internal notes</label>
                  <textarea value={form.internal_notes} onChange={e=>set('internal_notes',e.target.value)} className={inp} rows={3} placeholder="Internal notes — not visible to customers"/>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pb-8">
            <button type="button" onClick={()=>navigate('/diamonds')} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold px-8 disabled:opacity-50">{saving?'Saving…':isEdit?'Update diamond':'Add diamond'}</button>
          </div>
        </form>
      </div>
    </>
  );
}
