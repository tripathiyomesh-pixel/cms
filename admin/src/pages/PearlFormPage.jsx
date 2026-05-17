import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const PEARL_TYPES  = ['Akoya','South Sea','Tahitian','Freshwater','Keshi','Mabe','Blister'];
const SHAPES       = ['Round','Near-round','Semi-round','Drop','Semi-drop','Button','Circled','Baroque','Semi-baroque'];
const LUSTER       = ['Excellent','Very Good','Good','Fair','Poor'];
const NACRE        = ['Excellent','Very Good','Good','Acceptable'];
const SURFACE      = ['Clean','Lightly spotted','Moderately spotted','Heavily spotted'];
const GRADES       = ['AAA','AA+','AA','A+','A','B'];
const OVERTONES    = ['Rose','Silver','Cream','Gold','Green','Blue','Peacock','Cherry','Aubergine'];

export default function PearlFormPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name:'', pearl_type:'Akoya', pearl_color:'', overtone:'',
    shape:'Round', size_mm_min:'', size_mm_max:'',
    nacre_quality:'Very Good', luster:'Very Good', surface:'Lightly spotted',
    matching_grade:'AA', is_strand:false, strand_length:'', num_pearls:'',
    cert_lab:'', cert_number:'',
    base_price:'', final_price:'', currency:'AED',
    status:'draft', inventory_mode:'IN_HOUSE', internal_notes:'',
  });

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    if(isEdit) api.get(`/pearls/${id}`).then(r=>{ const d=r.data.data; setForm(f=>({...f,...d,size_mm_min:d.size_mm_min||'',size_mm_max:d.size_mm_max||'',base_price:d.base_price||'',final_price:d.final_price||''})); }).catch(()=>toast.error('Not found'));
  },[id]);

  const handleSave = async(e)=>{ e.preventDefault(); setSaving(true);
    try {
      const data={...form,size_mm_min:parseFloat(form.size_mm_min)||null,size_mm_max:parseFloat(form.size_mm_max)||null,base_price:parseFloat(form.base_price)||0,final_price:parseFloat(form.final_price)||parseFloat(form.base_price)||0,num_pearls:parseInt(form.num_pearls)||null};
      if(isEdit){ await api.patch(`/pearls/${id}`,data); toast.success('Pearl updated'); }
      else { await api.post('/pearls',data); toast.success('Pearl added'); navigate('/pearls'); }
    } catch(e){ toast.error(e.response?.data?.message||'Save failed'); }
    setSaving(false);
  };

  const lbl='block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';
  const inp='input-field';

  return (
    <>
      <Topbar title={isEdit?'Edit pearl':'Add pearl'} subtitle="Pearl inventory"
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={<div className="flex gap-2">
          <button onClick={()=>navigate('/pearls')} className="btn-outline flex items-center gap-1.5 text-xs"><ArrowLeft size={13}/>Back</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs disabled:opacity-50"><Save size={13}/>{saving?'Saving…':'Save pearl'}</button>
        </div>}/>
      <div className="flex-1 overflow-y-auto p-5">
        <form onSubmit={handleSave} className="max-w-3xl space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Pearl identity & grading</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className={lbl}>Product name</label><input value={form.name} onChange={e=>set('name',e.target.value)} required className={inp} placeholder="e.g. South Sea White Round Pearl 12mm"/></div>
              <div><label className={lbl}>Pearl type *</label><select value={form.pearl_type} onChange={e=>set('pearl_type',e.target.value)} className={inp}>{PEARL_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className={lbl}>Shape</label><select value={form.shape} onChange={e=>set('shape',e.target.value)} className={inp}>{SHAPES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className={lbl}>Colour</label><input value={form.pearl_color} onChange={e=>set('pearl_color',e.target.value)} className={inp} placeholder="White, Cream, Black, Golden…"/></div>
              <div><label className={lbl}>Overtone</label><select value={form.overtone} onChange={e=>set('overtone',e.target.value)} className={inp}><option value="">None</option>{OVERTONES.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
              <div><label className={lbl}>Size min (mm)</label><input type="number" step="0.1" value={form.size_mm_min} onChange={e=>set('size_mm_min',e.target.value)} className={inp} placeholder="10.0"/></div>
              <div><label className={lbl}>Size max (mm)</label><input type="number" step="0.1" value={form.size_mm_max} onChange={e=>set('size_mm_max',e.target.value)} className={inp} placeholder="11.0"/></div>
              <div><label className={lbl}>Nacre quality</label><select value={form.nacre_quality} onChange={e=>set('nacre_quality',e.target.value)} className={inp}>{NACRE.map(n=><option key={n} value={n}>{n}</option>)}</select></div>
              <div><label className={lbl}>Lustre</label><select value={form.luster} onChange={e=>set('luster',e.target.value)} className={inp}>{LUSTER.map(l=><option key={l} value={l}>{l}</option>)}</select></div>
              <div><label className={lbl}>Surface quality</label><select value={form.surface} onChange={e=>set('surface',e.target.value)} className={inp}>{SURFACE.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className={lbl}>Matching grade</label><select value={form.matching_grade} onChange={e=>set('matching_grade',e.target.value)} className={inp}>{GRADES.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Strand details (if applicable)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={()=>set('is_strand',!form.is_strand)} className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${form.is_strand?'bg-gold-500':'bg-ink-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${form.is_strand?'translate-x-5':'translate-x-1'}`}/>
                  </div>
                  <span className="text-sm text-ink-600 dark:text-ink-300">This is a strand / necklace</span>
                </label>
              </div>
              {form.is_strand && <>
                <div><label className={lbl}>Strand length</label><input value={form.strand_length} onChange={e=>set('strand_length',e.target.value)} className={inp} placeholder='18 inches / 45cm'/></div>
                <div><label className={lbl}>Number of pearls</label><input type="number" value={form.num_pearls} onChange={e=>set('num_pearls',e.target.value)} className={inp} placeholder="47"/></div>
              </>}
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Certification & pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Certificate lab</label><input value={form.cert_lab} onChange={e=>set('cert_lab',e.target.value)} className={inp} placeholder="GIA, CIBJO, etc."/></div>
              <div><label className={lbl}>Certificate number</label><input value={form.cert_number} onChange={e=>set('cert_number',e.target.value)} className={inp} placeholder="Cert number"/></div>
              <div><label className={lbl}>Base price</label><input type="number" step="0.01" value={form.base_price} onChange={e=>set('base_price',e.target.value)} className={inp} placeholder="0.00"/></div>
              <div><label className={lbl}>Final price</label><input type="number" step="0.01" value={form.final_price} onChange={e=>set('final_price',e.target.value)} className={inp} placeholder="0.00"/></div>
              <div><label className={lbl}>Currency</label><select value={form.currency} onChange={e=>set('currency',e.target.value)} className={inp}>{['AED','USD','SAR','INR','GBP','EUR'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className={lbl}>Status</label><select value={form.status} onChange={e=>set('status',e.target.value)} className={inp}>{['draft','active','inactive'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              <div className="col-span-2"><label className={lbl}>Internal notes</label><textarea value={form.internal_notes} onChange={e=>set('internal_notes',e.target.value)} className={inp} rows={3}/></div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pb-8">
            <button type="button" onClick={()=>navigate('/pearls')} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold px-8 disabled:opacity-50">{saving?'Saving…':isEdit?'Update pearl':'Add pearl'}</button>
          </div>
        </form>
      </div>
    </>
  );
}
