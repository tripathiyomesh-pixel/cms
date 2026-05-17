import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const MOUNTING_TYPES = ['Solitaire','Halo','Pave','Micro-pave','Bezel','Tension','Cathedral','Vintage','Three-stone','Bypass','Cluster','Other'];
const STYLES         = ['Classic','Vintage','Modern','Art Deco','Contemporary','Minimalist','Ornate'];
const CATEGORIES     = ['Ring','Pendant','Earring','Bracelet','Bangle'];
const GENDERS        = ['Women','Men','Unisex'];
const SHANK_STYLES   = ['Plain','Knife edge','Twisted','Split','Tapered','Pavé band','Other'];
const HEAD_TYPES     = ['4-prong','6-prong','Bezel','Half-bezel','Tension','Flush','Bar'];
const SHAPES         = ['Round','Princess','Oval','Marquise','Pear','Cushion','Emerald','Asscher','Radiant','Heart','Trillion'];
const METALS         = ['18K Yellow Gold','18K White Gold','18K Rose Gold','22K Yellow Gold','Platinum 950','Platinum 900','Silver 925'];

export default function MountingFormPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('structure');

  const [form, setForm] = useState({
    name:'', mounting_type:'Solitaire', style:'Classic',
    category:'Ring', gender:'Women',
    shank_style:'', head_type:'4-prong', prong_type:'',
    compatible_shapes:[], min_carat:'', max_carat:'',
    min_stone_size:'', max_stone_size:'',
    metal_options:[], ring_sizes_available:[],
    casting_weight:'', cad_file_url:'', production_days:'7',
    base_labor_price:'', customization_fee:'',
    base_price:'', final_price:'', currency:'AED',
    status:'draft', inventory_mode:'IN_HOUSE', internal_notes:'',
  });

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const toggleShape = (shape) => {
    const current = form.compatible_shapes;
    set('compatible_shapes', current.includes(shape) ? current.filter(s=>s!==shape) : [...current, shape]);
  };

  const toggleSize = (size) => {
    const current = form.ring_sizes_available;
    set('ring_sizes_available', current.includes(size) ? current.filter(s=>s!==size) : [...current, size]);
  };

  const addMetal = () => {
    set('metal_options', [...form.metal_options, { metal:'18K Yellow Gold', price_add:0 }]);
  };

  const updateMetal = (i, field, val) => {
    const updated = form.metal_options.map((m,idx) => idx===i ? {...m,[field]:val} : m);
    set('metal_options', updated);
  };

  const removeMetal = (i) => set('metal_options', form.metal_options.filter((_,idx)=>idx!==i));

  useEffect(()=>{
    if(isEdit) {
      api.get(`/mountings/${id}`).then(r=>{
        const d=r.data.data;
        setForm(f=>({...f,...d,
          compatible_shapes: typeof d.compatible_shapes==='string' ? JSON.parse(d.compatible_shapes) : d.compatible_shapes||[],
          metal_options: typeof d.metal_options==='string' ? JSON.parse(d.metal_options) : d.metal_options||[],
          ring_sizes_available: typeof d.ring_sizes_available==='string' ? JSON.parse(d.ring_sizes_available) : d.ring_sizes_available||[],
          casting_weight:d.casting_weight||'', min_carat:d.min_carat||'', max_carat:d.max_carat||'',
          base_price:d.base_price||'', final_price:d.final_price||'', production_days:d.production_days||'7',
        }));
      }).catch(()=>toast.error('Mounting not found'));
    }
  },[id]);

  const handleSave = async(e)=>{
    e.preventDefault(); setSaving(true);
    try {
      const data={...form,
        min_carat:parseFloat(form.min_carat)||null,
        max_carat:parseFloat(form.max_carat)||null,
        casting_weight:parseFloat(form.casting_weight)||null,
        production_days:parseInt(form.production_days)||7,
        base_price:parseFloat(form.base_price)||0,
        final_price:parseFloat(form.final_price)||parseFloat(form.base_price)||0,
        base_labor_price:parseFloat(form.base_labor_price)||null,
        customization_fee:parseFloat(form.customization_fee)||null,
      };
      if(isEdit){ await api.patch(`/mountings/${id}`,data); toast.success('Mounting updated'); }
      else { await api.post('/mountings',data); toast.success('Mounting created'); navigate('/mountings'); }
    } catch(e){ toast.error(e.response?.data?.message||'Save failed'); }
    setSaving(false);
  };

  const TABS=[
    {id:'structure',label:'Structure'},
    {id:'compatibility',label:'Stone compatibility'},
    {id:'metals',label:'Metal options'},
    {id:'sizing',label:'Ring sizes'},
    {id:'manufacturing',label:'Manufacturing'},
    {id:'pricing',label:'Pricing'},
  ];
  const lbl='block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';
  const inp='input-field';

  return (
    <>
      <Topbar title={isEdit?'Edit mounting':'Add mounting'} subtitle="Mounting catalogue"
        actions={<div className="flex gap-2">
          <button onClick={()=>navigate('/mountings')} className="btn-outline flex items-center gap-1.5 text-xs"><ArrowLeft size={13}/>Back</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs disabled:opacity-50"><Save size={13}/>{saving?'Saving…':'Save mounting'}</button>
        </div>}/>

      <div className="flex-1 overflow-y-auto p-5">
        <form onSubmit={handleSave} className="max-w-4xl space-y-4">

          {/* Tab bar */}
          <div className="flex gap-1 bg-ink-100 dark:bg-ink-800 p-1 rounded-xl w-fit overflow-x-auto">
            {TABS.map(t=>(
              <button key={t.id} type="button" onClick={()=>setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab===t.id?'bg-white dark:bg-ink-700 text-ink-700 dark:text-ink-100 shadow-sm':'text-ink-400 hover:text-ink-600'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── STRUCTURE ── */}
          {tab==='structure' && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Mounting structure</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={lbl}>Mounting name *</label>
                  <input value={form.name} onChange={e=>set('name',e.target.value)} required className={inp} placeholder="e.g. Classic 4-Prong Solitaire Ring"/>
                </div>
                <div>
                  <label className={lbl}>Mounting type</label>
                  <select value={form.mounting_type} onChange={e=>set('mounting_type',e.target.value)} className={inp}>
                    {MOUNTING_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Style</label>
                  <select value={form.style} onChange={e=>set('style',e.target.value)} className={inp}>
                    {STYLES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Category</label>
                  <select value={form.category} onChange={e=>set('category',e.target.value)} className={inp}>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Gender</label>
                  <select value={form.gender} onChange={e=>set('gender',e.target.value)} className={inp}>
                    {GENDERS.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Shank style</label>
                  <select value={form.shank_style} onChange={e=>set('shank_style',e.target.value)} className={inp}>
                    <option value="">Select…</option>
                    {SHANK_STYLES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Head type</label>
                  <select value={form.head_type} onChange={e=>set('head_type',e.target.value)} className={inp}>
                    {HEAD_TYPES.map(h=><option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Status</label>
                  <select value={form.status} onChange={e=>set('status',e.target.value)} className={inp}>
                    {['draft','active','inactive'].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Inventory mode</label>
                  <select value={form.inventory_mode} onChange={e=>set('inventory_mode',e.target.value)} className={inp}>
                    {['IN_HOUSE','MADE_TO_ORDER','VIRTUAL'].map(m=><option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STONE COMPATIBILITY ── */}
          {tab==='compatibility' && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Compatible stone shapes</h3>
              <div className="flex flex-wrap gap-2">
                {SHAPES.map(s=>(
                  <button key={s} type="button" onClick={()=>toggleShape(s)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${form.compatible_shapes.includes(s)?'border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-gold-700':'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-gold-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
              {form.compatible_shapes.length>0 && (
                <p className="text-xs text-ink-400">Selected: {form.compatible_shapes.join(', ')}</p>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-ink-100 dark:border-ink-800">
                <div>
                  <label className={lbl}>Min carat (stone)</label>
                  <input type="number" step="0.01" value={form.min_carat} onChange={e=>set('min_carat',e.target.value)} className={inp} placeholder="e.g. 0.30"/>
                </div>
                <div>
                  <label className={lbl}>Max carat (stone)</label>
                  <input type="number" step="0.01" value={form.max_carat} onChange={e=>set('max_carat',e.target.value)} className={inp} placeholder="e.g. 2.00"/>
                </div>
                <div>
                  <label className={lbl}>Min stone size (mm)</label>
                  <input type="number" step="0.1" value={form.min_stone_size} onChange={e=>set('min_stone_size',e.target.value)} className={inp} placeholder="e.g. 4.5"/>
                </div>
                <div>
                  <label className={lbl}>Max stone size (mm)</label>
                  <input type="number" step="0.1" value={form.max_stone_size} onChange={e=>set('max_stone_size',e.target.value)} className={inp} placeholder="e.g. 8.0"/>
                </div>
              </div>
            </div>
          )}

          {/* ── METAL OPTIONS ── */}
          {tab==='metals' && (
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Available metal options</h3>
                <button type="button" onClick={addMetal} className="btn-outline flex items-center gap-1.5 text-xs"><Plus size={13}/>Add metal</button>
              </div>
              {form.metal_options.length===0 ? (
                <p className="text-xs text-ink-400 py-4 text-center">No metal options yet. Click "Add metal" to add one.</p>
              ) : form.metal_options.map((m,i)=>(
                <div key={i} className="flex items-center gap-3 p-3 bg-ink-50 dark:bg-ink-800 rounded-lg">
                  <select value={m.metal} onChange={e=>updateMetal(i,'metal',e.target.value)} className="input-field flex-1 py-1.5 text-xs">
                    {METALS.map(mt=><option key={mt} value={mt}>{mt}</option>)}
                  </select>
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <label className="text-xs text-ink-400 whitespace-nowrap">Price add (AED)</label>
                    <input type="number" value={m.price_add} onChange={e=>updateMetal(i,'price_add',parseFloat(e.target.value)||0)}
                      className="input-field w-24 py-1.5 text-xs" placeholder="0"/>
                  </div>
                  <button type="button" onClick={()=>removeMetal(i)} className="p-1.5 rounded hover:bg-red-50 text-ink-400 hover:text-red-500"><X size={13}/></button>
                </div>
              ))}
              <div className="pt-2 border-t border-ink-100 dark:border-ink-800">
                <label className={lbl}>Casting weight (grams)</label>
                <input type="number" step="0.001" value={form.casting_weight} onChange={e=>set('casting_weight',e.target.value)} className={`${inp} max-w-[200px]`} placeholder="e.g. 4.500"/>
              </div>
            </div>
          )}

          {/* ── RING SIZES ── */}
          {tab==='sizing' && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Available ring sizes</h3>
              <div className="grid grid-cols-3 gap-4 text-xs text-ink-500">
                <div>
                  <p className="font-medium text-ink-700 dark:text-ink-200 mb-2">US sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {['3','3.5','4','4.5','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10'].map(s=>(
                      <button key={s} type="button" onClick={()=>toggleSize(`US ${s}`)}
                        className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${form.ring_sizes_available.includes(`US ${s}`)?'border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-gold-700':'border-ink-200 dark:border-ink-700 text-ink-500'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-ink-700 dark:text-ink-200 mb-2">UK sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {['H','I','J','K','L','M','N','O','P','Q','R','S','T','U'].map(s=>(
                      <button key={s} type="button" onClick={()=>toggleSize(`UK ${s}`)}
                        className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${form.ring_sizes_available.includes(`UK ${s}`)?'border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-gold-700':'border-ink-200 dark:border-ink-700 text-ink-500'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-ink-700 dark:text-ink-200 mb-2">EU sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {['46','47','48','49','50','51','52','53','54','55','56','57','58','60','62'].map(s=>(
                      <button key={s} type="button" onClick={()=>toggleSize(`EU ${s}`)}
                        className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${form.ring_sizes_available.includes(`EU ${s}`)?'border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-gold-700':'border-ink-200 dark:border-ink-700 text-ink-500'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {form.ring_sizes_available.length>0 && (
                <div className="bg-ink-50 dark:bg-ink-800 rounded-lg p-3">
                  <p className="text-xs text-ink-500">Selected ({form.ring_sizes_available.length}): {form.ring_sizes_available.join(' · ')}</p>
                </div>
              )}
            </div>
          )}

          {/* ── MANUFACTURING ── */}
          {tab==='manufacturing' && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Manufacturing details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Production days</label>
                  <input type="number" value={form.production_days} onChange={e=>set('production_days',e.target.value)} className={inp} placeholder="7"/>
                </div>
                <div>
                  <label className={lbl}>CAD file URL</label>
                  <input value={form.cad_file_url} onChange={e=>set('cad_file_url',e.target.value)} className={inp} placeholder="https://..."/>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Internal notes</label>
                  <textarea value={form.internal_notes} onChange={e=>set('internal_notes',e.target.value)} className={inp} rows={3} placeholder="Workshop notes — not visible to customers"/>
                </div>
              </div>
            </div>
          )}

          {/* ── PRICING ── */}
          {tab==='pricing' && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Base price (metal cost)</label>
                  <input type="number" step="0.01" value={form.base_price} onChange={e=>set('base_price',e.target.value)} className={inp} placeholder="0.00"/>
                </div>
                <div>
                  <label className={lbl}>Final / catalogue price</label>
                  <input type="number" step="0.01" value={form.final_price} onChange={e=>set('final_price',e.target.value)} className={inp} placeholder="0.00"/>
                </div>
                <div>
                  <label className={lbl}>Labour charge</label>
                  <input type="number" step="0.01" value={form.base_labor_price} onChange={e=>set('base_labor_price',e.target.value)} className={inp} placeholder="0.00"/>
                </div>
                <div>
                  <label className={lbl}>Customisation fee</label>
                  <input type="number" step="0.01" value={form.customization_fee} onChange={e=>set('customization_fee',e.target.value)} className={inp} placeholder="0.00"/>
                </div>
                <div>
                  <label className={lbl}>Currency</label>
                  <select value={form.currency} onChange={e=>set('currency',e.target.value)} className={inp}>
                    {['AED','USD','SAR','INR','GBP','EUR'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pb-8">
            <button type="button" onClick={()=>navigate('/mountings')} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold px-8 disabled:opacity-50">
              {saving?'Saving…':isEdit?'Update mounting':'Create mounting'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
