import Toggle from '../components/ui/Toggle';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import api from '../services/api';
import { Plus, Edit2, Users, Calendar, MapPin, X, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const empty = { title:'',subtitle:'',description:'',venue_name:'',venue_address:'',venue_city:'Dubai',venue_country:'UAE',venue_map_url:'',booth_number:'',start_date:'',end_date:'',start_time:'10:00',end_time:'20:00',hero_image:'',is_vip:false,is_published:false,registration_open:true,reg_close_date:'',max_registrations:'',seo_title:'',seo_description:'' };

export default function ExhibitionsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [exhibitions, setExhibitions]   = useState([]);
  const [loading,     setLoading]       = useState(true);
  const [modal,       setModal]         = useState(null);
  const [regsModal,   setRegsModal]     = useState(null);
  const [regs,        setRegs]          = useState([]);
  const [form,        setForm]          = useState(empty);
  const [saving,      setSaving]        = useState(false);
  const [tab,         setTab]           = useState('details');

  const load = async () => {
    setLoading(true);
    try { const r=await api.get('/exhibitions'); setExhibitions(r.data.data||[]); }
    catch { setExhibitions([]); }
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const openNew  = () => { setForm(empty); setModal('new'); setTab('details'); };
  const openEdit = async(ex) => {
    try { const r=await api.get(`/exhibitions/${ex.id}`); setForm({...empty,...r.data.data,max_registrations:r.data.data.max_registrations||''}); setModal(ex); setTab('details'); }
    catch { toast.error('Failed to load'); }
  };

  const openRegs = async(ex) => {
    try { const r=await api.get(`/exhibitions/${ex.id}/registrations`); setRegs(r.data.data||[]); setRegsModal(ex); }
    catch { toast.error('Failed to load registrations'); }
  };

  const handleSave = async(e) => {
    e.preventDefault(); setSaving(true);
    try {
      if(modal==='new') { await api.post('/exhibitions',form); toast.success('Exhibition created'); }
      else { await api.patch(`/exhibitions/${modal.id}`,form); toast.success('Updated'); }
      setModal(null); load();
    } catch(e) { toast.error(e.response?.data?.message||'Save failed'); }
    setSaving(false);
  };

  const togglePublish = async(ex) => {
    try { await api.patch(`/exhibitions/${ex.id}`,{ is_published:!ex.is_published }); toast.success(ex.is_published?'Unpublished':'Published'); load(); }
    catch { toast.error('Failed'); }
  };

  const STATUS_COLORS = { registered:'text-blue-600 bg-blue-50', confirmed:'text-green-600 bg-green-50', cancelled:'text-red-600 bg-red-50', attended:'text-purple-600 bg-purple-50' };
  const lbl = 'block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';
  const inp = 'input-field';
  const TABS = ['details','venue','settings'];

  const getStatus = (ex) => {
    const now = new Date(); const start = new Date(ex.start_date); const end = new Date(ex.end_date);
    if (now < start) return { label:`In ${Math.ceil((start-now)/86400000)}d`, color:'bg-blue-50 text-blue-600' };
    if (now <= end)  return { label:'Live now', color:'bg-green-50 text-green-600' };
    return { label:'Ended', color:'bg-ink-100 text-ink-400' };
  };

  return (
    <>
      <Topbar title="Exhibitions" subtitle="Trade shows, VIP events and exhibitions"
        actions={<button onClick={openNew} className="btn-gold flex items-center gap-1.5 text-xs"><Plus size={14}/>Add exhibition</button>}/>

      <div className="flex-1 overflow-y-auto p-5">
        {loading ? <p className="text-sm text-ink-400">Loading…</p>
        : exhibitions.length===0 ? (
          <div className="card p-16 text-center">
            <Calendar size={32} className="mx-auto text-ink-300 mb-4"/>
            <p className="text-sm text-ink-400 mb-3">No exhibitions yet</p>
            <button onClick={openNew} className="btn-gold text-xs">Add first exhibition</button>
          </div>
        ) : (
          <div className="space-y-3">
            {exhibitions.map(ex=>{
              const st = getStatus(ex);
              return (
                <div key={ex.id} className="card p-5">
                  <div className="flex items-start gap-4">
                    {ex.hero_image && <img src={ex.hero_image} alt={ex.title} className="w-20 h-16 rounded-lg object-cover flex-shrink-0 bg-ink-100"/>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">{ex.title}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                        {ex.is_vip && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gold-100 text-gold-700">VIP</span>}
                        {!ex.is_published && <span className="text-[10px] text-ink-400 bg-ink-100 px-2 py-0.5 rounded-full">Draft</span>}
                      </div>
                      <div className="flex gap-4 text-xs text-ink-400 flex-wrap">
                        <span className="flex items-center gap-1"><Calendar size={11}/>{ex.start_date} → {ex.end_date}</span>
                        {ex.venue_name && <span className="flex items-center gap-1"><MapPin size={11}/>{ex.venue_name}{ex.booth_number?`, Booth ${ex.booth_number}`:''}</span>}
                        <span className="flex items-center gap-1"><Users size={11}/>{ex.reg_count||0} registered</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={()=>openRegs(ex)} className="btn-outline text-xs flex items-center gap-1"><Users size={12}/>{ex.reg_count||0}</button>
                      <button onClick={()=>togglePublish(ex)} className={`btn-outline text-xs flex items-center gap-1 ${ex.is_published?'text-green-600':'text-ink-400'}`}>
                        {ex.is_published?<Eye size={12}/>:<EyeOff size={12}/>}{ex.is_published?'Live':'Draft'}
                      </button>
                      <button onClick={()=>openEdit(ex)} className="btn-outline text-xs"><Edit2 size={12}/></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exhibition form modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={()=>setModal(null)}>
          <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">{modal==='new'?'New exhibition':'Edit exhibition'}</h3>
              <button onClick={()=>setModal(null)} className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16}/></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-5 pt-4">
              {TABS.map(t=>(
                <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${tab===t?'bg-gold-50 dark:bg-gold-900/20 text-gold-700':'text-ink-400 hover:text-ink-600'}`}>{t}</button>
              ))}
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {tab==='details' && <>
                <div><label className={lbl}>Exhibition title *</label><input value={form.title} onChange={e=>set('title',e.target.value)} required className={inp} placeholder="Dubai Watch & Jewellery Show 2026"/></div>
                <div><label className={lbl}>Subtitle</label><input value={form.subtitle} onChange={e=>set('subtitle',e.target.value)} className={inp} placeholder="Exclusive VIP preview"/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>Start date *</label><input type="date" value={form.start_date} onChange={e=>set('start_date',e.target.value)} required className={inp}/></div>
                  <div><label className={lbl}>End date *</label><input type="date" value={form.end_date} onChange={e=>set('end_date',e.target.value)} required className={inp}/></div>
                  <div><label className={lbl}>Opening time</label><input type="time" value={form.start_time} onChange={e=>set('start_time',e.target.value)} className={inp}/></div>
                  <div><label className={lbl}>Closing time</label><input type="time" value={form.end_time} onChange={e=>set('end_time',e.target.value)} className={inp}/></div>
                </div>
                <div><label className={lbl}>Description</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} className={inp} rows={3} placeholder="What customers can expect at this exhibition…"/></div>
                <div><label className={lbl}>Hero image URL</label><input value={form.hero_image} onChange={e=>set('hero_image',e.target.value)} className={inp} placeholder="https://... (upload to media library first)"/>{form.hero_image&&<img src={form.hero_image} alt="" className="mt-2 h-24 rounded-lg object-cover"/>}</div>
              </>}

              {tab==='venue' && <>
                <div><label className={lbl}>Venue / Exhibition name</label><input value={form.venue_name} onChange={e=>set('venue_name',e.target.value)} className={inp} placeholder="Dubai World Trade Centre"/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>City</label><input value={form.venue_city} onChange={e=>set('venue_city',e.target.value)} className={inp} placeholder="Dubai"/></div>
                  <div><label className={lbl}>Country</label><input value={form.venue_country} onChange={e=>set('venue_country',e.target.value)} className={inp} placeholder="UAE"/></div>
                </div>
                <div><label className={lbl}>Address</label><textarea value={form.venue_address} onChange={e=>set('venue_address',e.target.value)} className={inp} rows={2} placeholder="Full venue address"/></div>
                <div><label className={lbl}>Booth / Stand number</label><input value={form.booth_number} onChange={e=>set('booth_number',e.target.value)} className={inp} placeholder="Hall 1 — Booth 201"/></div>
                <div><label className={lbl}>Google Maps embed URL</label><input value={form.venue_map_url} onChange={e=>set('venue_map_url',e.target.value)} className={inp} placeholder="https://maps.google.com/maps?..."/></div>
              </>}

              {tab==='settings' && <>
                <div className="space-y-3">
                  {[
                    { k:'is_vip',          l:'VIP / Invitation only', d:'Show VIP badge — customers must request access' },
                    { k:'is_published',     l:'Published on website',  d:'Visible on storefront /exhibitions page' },
                    { k:'registration_open',l:'Registration open',     d:'Allow customers to register' },
                  ].map(item=>(
                    <div key={item.k} className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                      <div><p className="text-sm font-medium text-ink-700 dark:text-ink-200">{item.l}</p><p className="text-xs text-ink-400">{item.d}</p></div>
                      <Toggle checked={!!form[item.k]} onChange={v=>set(item.k,v)}/>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>Registration closes</label><input type="date" value={form.reg_close_date} onChange={e=>set('reg_close_date',e.target.value)} className={inp}/></div>
                  <div><label className={lbl}>Max registrations</label><input type="number" value={form.max_registrations} onChange={e=>set('max_registrations',e.target.value)} className={inp} placeholder="No limit"/></div>
                </div>
                <div><label className={lbl}>SEO title</label><input value={form.seo_title} onChange={e=>set('seo_title',e.target.value)} className={inp}/></div>
                <div><label className={lbl}>SEO description</label><textarea value={form.seo_description} onChange={e=>set('seo_description',e.target.value)} className={inp} rows={2}/></div>
              </>}

              <div className="flex justify-end gap-2 pt-2 border-t border-ink-100 dark:border-ink-800">
                <button type="button" onClick={()=>setModal(null)} className="btn-ghost text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
                  <Save size={13}/>{saving?'Saving…':modal==='new'?'Create exhibition':'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registrations modal */}
      {regsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={()=>setRegsModal(null)}>
          <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
              <div>
                <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Registrations — {regsModal.title}</h3>
                <p className="text-xs text-ink-400 mt-0.5">{regs.length} total registrations</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{
                  const csv=['Name,Email,Phone,Company,Visit Date,Party Size,Status',...regs.map(r=>`${r.full_name},${r.email||''},${r.phone},${r.company||''},${r.visit_date||''},${r.party_size},${r.status}`)].join('\n');
                  const a=document.createElement('a'); a.href='data:text/csv,'+encodeURIComponent(csv); a.download=`${regsModal.slug}-registrations.csv`; a.click();
                }} className="btn-outline text-xs">Export CSV</button>
                <button onClick={()=>setRegsModal(null)} className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16}/></button>
              </div>
            </div>
            {regs.length===0 ? <p className="text-center py-12 text-sm text-ink-400">No registrations yet</p>
            : regs.map((r,i)=>(
              <div key={r.id} className={`flex items-center gap-4 px-5 py-3 text-xs ${i%2===0?'':'bg-ink-50/50 dark:bg-ink-800/30'} ${i<regs.length-1?'border-b border-ink-100 dark:border-ink-800':''}`}>
                <div className="flex-1">
                  <p className="font-medium text-ink-700 dark:text-ink-200">{r.full_name}</p>
                  <p className="text-ink-400">{r.phone}{r.email?` · ${r.email}`:''}{r.company?` · ${r.company}`:''}</p>
                </div>
                <div className="text-ink-400 text-right">
                  {r.visit_date&&<p>{r.visit_date} {r.visit_time||''}</p>}
                  <p>{r.party_size} person{r.party_size>1?'s':''}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status]||'bg-ink-100 text-ink-500'}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
