import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const GEMSTONE_TYPES = ['Ruby','Sapphire','Emerald','Tanzanite','Alexandrite','Aquamarine','Tourmaline','Spinel','Garnet','Opal','Amethyst','Citrine','Peridot','Topaz','Morganite','Kunzite','Paraiba Tourmaline','Padparadscha Sapphire','Other'];
const ORIGINS = ['Burma/Myanmar','Sri Lanka','Mozambique','Madagascar','Colombia','Tanzania','Brazil','Afghanistan','Kashmir','Kenya','Russia','USA','Other'];
const TREATMENTS = ['No heat','Heat','Fracture filled','Beryllium treated','Lead glass filled','Oiling','Resin impregnation','No treatment','Clarity enhanced'];
const SHAPES  = ['Round','Oval','Cushion','Pear','Marquise','Emerald cut','Asscher','Radiant','Heart','Trillion','Cabochon','Freeform'];
const SATURATION = ['Faint','Light','Medium-Light','Medium','Medium-Dark','Dark','Vivid'];
const TONE    = ['Very Light','Light','Medium-Light','Medium','Medium-Dark','Dark','Very Dark'];
const LABS    = ['GRS','SSEF','GIA','Gübelin','Lotus','AGL','IGI','Other'];

export default function GemstoneFormPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('identity');

  const [form, setForm] = useState({
    name:'', gemstone_type:'Ruby', species:'', variety:'',
    country_of_origin:'', treatment:'', is_treated:false,
    shape:'Oval', carat:'', dimensions_mm:'',
    transparency:'Transparent', color_description:'', color_hue:'',
    saturation:'Vivid', tone:'Medium', luster:'',
    cert_lab:'GRS', cert_number:'', cert_url:'',
    base_price:'', final_price:'', currency:'USD',
    status:'draft', inventory_mode:'IN_HOUSE', internal_notes:'',
  });

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    if(isEdit) api.get(`/gemstones/${id}`).then(r=>{ const d=r.data.data; setForm(f=>({...f,...d,carat:d.carat||'',base_price:d.base_price||'',final_price:d.final_price||''})); }).catch(()=>toast.error('Not found'));
  },[id]);

  const handleSave = async(e)=>{ e.preventDefault(); setSaving(true);
    try {
      const data={...form, carat:parseFloat(form.carat)||null, base_price:parseFloat(form.base_price)||0, final_price:parseFloat(form.final_price)||parseFloat(form.base_price)||0};
      if(isEdit){ await api.patch(`/gemstones/${id}`,data); toast.success('Updated'); }
      else { const r=await api.post('/gemstones',data); toast.success('Gemstone added'); navigate(`/gemstones`); }
    } catch(e){ toast.error(e.response?.data?.message||'Save failed'); }
    setSaving(false);
  };

  const TABS=[{id:'identity',label:'Identity'},{id:'quality',label:'Quality & colour'},{id:'cert',label:'Certification'},{id:'pricing',label:'Pricing'}];
  const lbl='block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';
  const inp='input-field';

  return (
    <>
      <Topbar title={isEdit?'Edit gemstone':'Add gemstone'} subtitle="Coloured stone inventory"
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={<div className="flex gap-2">
          <button onClick={()=>navigate('/gemstones')} className="btn-outline flex items-center gap-1.5 text-xs"><ArrowLeft size={13}/>Back</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs disabled:opacity-50"><Save size={13}/>{saving?'Saving…':'Save gemstone'}</button>
        </div>}/>
      <div className="flex-1 overflow-y-auto p-5">
        <form onSubmit={handleSave} className="max-w-3xl space-y-4">
          <div className="flex gap-1 bg-ink-100 dark:bg-ink-800 p-1 rounded-xl w-fit">
            {TABS.map(t=>(
              <button key={t.id} type="button" onClick={()=>setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab===t.id?'bg-white dark:bg-ink-700 text-ink-700 dark:text-ink-100 shadow-sm':'text-ink-400 hover:text-ink-600'}`}>{t.label}</button>
            ))}
          </div>

          {tab==='identity' && <div className="card p-5 grid grid-cols-2 gap-4">
            <h3 className="col-span-2 text-sm font-medium text-ink-700 dark:text-ink-200">Gemstone identity</h3>
            <div className="col-span-2"><label className={lbl}>Product name</label><input value={form.name} onChange={e=>set('name',e.target.value)} className={inp} placeholder="e.g. Burmese Ruby 2.5ct Unheated"/></div>
            <div><label className={lbl}>Gemstone type *</label>
              <select value={form.gemstone_type} onChange={e=>set('gemstone_type',e.target.value)} className={inp}>
                {GEMSTONE_TYPES.map(g=><option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Shape</label><select value={form.shape} onChange={e=>set('shape',e.target.value)} className={inp}>{SHAPES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className={lbl}>Species (mineralogy)</label><input value={form.species} onChange={e=>set('species',e.target.value)} className={inp} placeholder="e.g. Corundum, Beryl"/></div>
            <div><label className={lbl}>Variety</label><input value={form.variety} onChange={e=>set('variety',e.target.value)} className={inp} placeholder="e.g. Padparadscha, Paraiba"/></div>
            <div><label className={lbl}>Country of origin</label>
              <select value={form.country_of_origin} onChange={e=>set('country_of_origin',e.target.value)} className={inp}>
                <option value="">Unknown</option>{ORIGINS.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Treatment</label>
              <select value={form.treatment} onChange={e=>{ set('treatment',e.target.value); set('is_treated',!['No heat','No treatment'].includes(e.target.value)); }} className={inp}>
                <option value="">Not specified</option>{TREATMENTS.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Carat weight</label><input type="number" step="0.01" value={form.carat} onChange={e=>set('carat',e.target.value)} className={inp} placeholder="e.g. 2.50"/></div>
            <div><label className={lbl}>Dimensions (mm)</label><input value={form.dimensions_mm} onChange={e=>set('dimensions_mm',e.target.value)} className={inp} placeholder="e.g. 8.5 x 6.2 x 4.1"/></div>
            <div><label className={lbl}>Inventory mode</label><select value={form.inventory_mode} onChange={e=>set('inventory_mode',e.target.value)} className={inp}>{['IN_HOUSE','MEMO','SUPPLIER','VIRTUAL'].map(m=><option key={m} value={m}>{m.replace('_',' ')}</option>)}</select></div>
            <div><label className={lbl}>Status</label><select value={form.status} onChange={e=>set('status',e.target.value)} className={inp}>{['draft','active','inactive'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
          </div>}

          {tab==='quality' && <div className="card p-5 grid grid-cols-2 gap-4">
            <h3 className="col-span-2 text-sm font-medium text-ink-700 dark:text-ink-200">Colour & quality</h3>
            <div className="col-span-2"><label className={lbl}>Colour description</label><input value={form.color_description} onChange={e=>set('color_description',e.target.value)} className={inp} placeholder="e.g. Vivid red with slight orange hue"/></div>
            <div><label className={lbl}>Colour hue</label><input value={form.color_hue} onChange={e=>set('color_hue',e.target.value)} className={inp} placeholder="Red, Blue, Green…"/></div>
            <div><label className={lbl}>Saturation</label><select value={form.saturation} onChange={e=>set('saturation',e.target.value)} className={inp}>{SATURATION.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className={lbl}>Tone</label><select value={form.tone} onChange={e=>set('tone',e.target.value)} className={inp}>{TONE.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className={lbl}>Transparency</label><select value={form.transparency} onChange={e=>set('transparency',e.target.value)} className={inp}>{['Transparent','Semi-transparent','Translucent','Semi-translucent','Opaque'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className={lbl}>Lustre</label><input value={form.luster} onChange={e=>set('luster',e.target.value)} className={inp} placeholder="Vitreous, Silky, Adamantine…"/></div>
            <div className="col-span-2"><label className={lbl}>Internal notes</label><textarea value={form.internal_notes} onChange={e=>set('internal_notes',e.target.value)} className={inp} rows={3} placeholder="Internal notes — not visible to customers"/></div>
          </div>}

          {tab==='cert' && <div className="card p-5 grid grid-cols-2 gap-4">
            <h3 className="col-span-2 text-sm font-medium text-ink-700 dark:text-ink-200">Certification</h3>
            <div><label className={lbl}>Certificate lab</label><select value={form.cert_lab} onChange={e=>set('cert_lab',e.target.value)} className={inp}><option value="">No certificate</option>{LABS.map(l=><option key={l} value={l}>{l}</option>)}</select></div>
            <div><label className={lbl}>Certificate number</label><input value={form.cert_number} onChange={e=>set('cert_number',e.target.value)} className={inp} placeholder="e.g. GRS2024-001234"/></div>
            <div className="col-span-2"><label className={lbl}>Certificate URL</label><input value={form.cert_url} onChange={e=>set('cert_url',e.target.value)} className={inp} placeholder="https://www.gemresearch.ch/..."/></div>
            {form.cert_number && <div className="col-span-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-3">
              <i className="ti ti-certificate text-green-600 text-xl" aria-hidden="true"/>
              <div><p className="text-xs font-medium text-green-700 dark:text-green-300">Verification page will be live at:</p><p className="text-xs text-green-600 font-mono">/verify/{form.cert_number}</p></div>
            </div>}
          </div>}

          {tab==='pricing' && <div className="card p-5 grid grid-cols-2 gap-4">
            <h3 className="col-span-2 text-sm font-medium text-ink-700 dark:text-ink-200">Pricing</h3>
            <div><label className={lbl}>Base price</label><input type="number" step="0.01" value={form.base_price} onChange={e=>set('base_price',e.target.value)} className={inp} placeholder="0.00"/></div>
            <div><label className={lbl}>Final / asking price</label><input type="number" step="0.01" value={form.final_price} onChange={e=>set('final_price',e.target.value)} className={inp} placeholder="0.00"/></div>
            <div><label className={lbl}>Currency</label><select value={form.currency} onChange={e=>set('currency',e.target.value)} className={inp}>{['USD','AED','INR','EUR','GBP'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          </div>}

          <div className="flex justify-end gap-3 pb-8">
            <button type="button" onClick={()=>navigate('/gemstones')} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold px-8 disabled:opacity-50">{saving?'Saving…':isEdit?'Update gemstone':'Add gemstone'}</button>
          </div>
        </form>
      </div>
    </>
  );
}
