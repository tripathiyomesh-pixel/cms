'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock, Star, ArrowLeft, Check } from 'lucide-react';

function Countdown({ targetDate }) {
  const [time, setTime] = useState({ d:0,h:0,m:0,s:0 });
  useEffect(()=>{
    const calc=()=>{ const d=new Date(targetDate)-new Date(); if(d<=0)return; setTime({d:Math.floor(d/86400000),h:Math.floor((d%86400000)/3600000),m:Math.floor((d%3600000)/60000),s:Math.floor((d%60000)/1000)}); };
    calc(); const t=setInterval(calc,1000); return()=>clearInterval(t);
  },[targetDate]);
  if(new Date(targetDate)<=new Date()) return null;
  return (
    <div className="bg-ink-900 rounded-2xl p-6 text-center">
      <p className="text-xs text-ink-400 uppercase tracking-widest mb-4">Exhibition starts in</p>
      <div className="flex justify-center gap-6">
        {[['d','Days'],['h','Hours'],['m','Minutes'],['s','Seconds']].map(([k,l])=>(
          <div key={k} className="text-center">
            <div className="text-4xl font-bold text-white leading-none">{String(time[k]).padStart(2,'0')}</div>
            <div className="text-xs text-ink-500 mt-2 uppercase tracking-wide">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExhibitionDetailPage({ params }) {
  const [ex, setEx]             = useState(null);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState({ full_name:'',email:'',phone:'',company:'',visit_date:'',visit_time:'',party_size:'1',notes:'' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [gallery, setGallery]       = useState(0);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/exhibitions/public/${params.slug}`)
      .then(r=>r.json()).then(r=>setEx(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  },[params.slug]);

  const handleRegister = async(e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exhibitions/public/${params.slug}/register`,{
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)
      });
      const data = await r.json();
      if(data.success) setSubmitted(true);
      else alert(data.message||'Registration failed');
    } catch { alert('Registration failed. Please try WhatsApp.'); }
    setSubmitting(false);
  };

  if(loading) return <div className="pt-32 text-center py-20 text-ink-400">Loading…</div>;
  if(!ex) return <div className="pt-32 text-center py-20"><p className="text-ink-500">Exhibition not found</p><Link href="/exhibitions" className="btn-gold mt-4 inline-block">Back</Link></div>;

  const isLive     = new Date()>=new Date(ex.start_date) && new Date()<=new Date(ex.end_date);
  const isUpcoming = new Date() < new Date(ex.start_date);
  const isFull     = ex.max_registrations && +ex.reg_count >= +ex.max_registrations;
  const galleries  = Array.isArray(ex.gallery_images) ? ex.gallery_images.filter(Boolean) : [];
  const products   = Array.isArray(ex.featured_products) ? ex.featured_products.filter(Boolean) : [];
  const inp        = 'w-full border border-ink-200 rounded-xl px-4 py-3 text-sm text-ink-700 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition-all';
  const lbl        = 'block text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2';

  return (
    <div className="pt-24">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        {ex.hero_image
          ? <img src={ex.hero_image} alt={ex.title} className="w-full h-full object-cover"/>
          : <div className="w-full h-full bg-gradient-to-br from-ink-900 to-ink-800"/>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"/>
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-6xl mx-auto">
          <Link href="/exhibitions" className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors w-fit"><ArrowLeft size={14}/>All exhibitions</Link>
          <div className="flex gap-2 mb-3">
            {isLive && <span className="badge bg-green-500 text-white">● Live Now</span>}
            {ex.is_vip && <span className="badge bg-gold-500 text-white flex items-center gap-1"><Star size={11} fill="white"/>VIP Exclusive</span>}
          </div>
          <h1 className="font-serif text-3xl lg:text-5xl text-white mb-2">{ex.title}</h1>
          {ex.subtitle && <p className="text-gold-300 text-lg font-medium">{ex.subtitle}</p>}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Key info */}
            <div className="card p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon:<Calendar size={18} className="text-gold-500"/>, label:'Dates', value:`${new Date(ex.start_date).toLocaleDateString('en-AE',{day:'numeric',month:'short',year:'numeric'})} — ${new Date(ex.end_date).toLocaleDateString('en-AE',{day:'numeric',month:'short',year:'numeric'})}` },
                  { icon:<Clock size={18} className="text-gold-500"/>, label:'Hours', value:`${ex.start_time||'10:00'} — ${ex.end_time||'20:00'}` },
                  { icon:<MapPin size={18} className="text-gold-500"/>, label:'Venue', value:ex.venue_name||(ex.venue_city||'TBA') },
                  ex.booth_number ? { icon:<span className="text-gold-500 font-bold text-lg">#</span>, label:'Booth', value:ex.booth_number } : null,
                  { icon:<Users size={18} className="text-gold-500"/>, label:'Registered', value:`${ex.reg_count||0}${ex.max_registrations?` / ${ex.max_registrations}`:''}` },
                ].filter(Boolean).map((item,i)=>(
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                    <div><p className="text-xs text-ink-400 uppercase tracking-wide">{item.label}</p><p className="text-sm font-medium text-ink-700 mt-0.5">{item.value}</p></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Countdown */}
            {isUpcoming && <Countdown targetDate={ex.start_date}/>}

            {/* Description */}
            {ex.description && (
              <div>
                <h2 className="font-serif text-2xl text-ink-800 mb-4">About this exhibition</h2>
                <p className="text-ink-500 leading-relaxed text-base whitespace-pre-line">{ex.description}</p>
              </div>
            )}

            {/* Gallery */}
            {galleries.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl text-ink-800 mb-4">Gallery</h2>
                <div className="grid grid-cols-3 gap-2">
                  {galleries.map((img,i)=>(
                    <div key={i} onClick={()=>setGallery(i)}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                      <img src={img} alt={`Gallery ${i+1}`} className="w-full h-full object-cover"/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured products */}
            {products.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl text-ink-800 mb-4">Featured at this exhibition</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.map(p=>(
                    <Link key={p.id} href={`/jewellery/${p.slug||p.id}`} className="card overflow-hidden hover:shadow-md transition-all group">
                      <div className="aspect-square bg-ink-50 overflow-hidden">
                        {p.thumb_url ? <img src={p.thumb_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        : <div className="w-full h-full flex items-center justify-center text-3xl">💍</div>}
                        {p.is_featured && <div className="absolute top-2 left-2 badge badge-gold text-[9px]">Featured</div>}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium text-ink-700 line-clamp-2">{p.name}</p>
                        <p className="text-sm font-bold text-gold-600 mt-1">{p.currency} {Number(p.final_price||0).toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {ex.venue_map_url && (
              <div>
                <h2 className="font-serif text-2xl text-ink-800 mb-4">Location</h2>
                <div className="rounded-2xl overflow-hidden border border-ink-100 h-64">
                  <iframe src={ex.venue_map_url} width="100%" height="100%" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
                </div>
                {ex.venue_address && <p className="text-sm text-ink-400 mt-2 flex items-center gap-2"><MapPin size={13}/>{ex.venue_address}</p>}
              </div>
            )}
          </div>

          {/* Sidebar — Registration */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-28">
              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={28} className="text-green-500"/></div>
                  <h3 className="font-serif text-lg text-ink-800 mb-2">Registration confirmed!</h3>
                  <p className="text-sm text-ink-400">We will confirm via WhatsApp. See you at the exhibition.</p>
                </div>
              ) : isFull ? (
                <div className="text-center py-6">
                  <p className="text-base font-semibold text-ink-700 mb-2">Exhibition fully booked</p>
                  <p className="text-sm text-ink-400 mb-4">Join the waitlist via WhatsApp</p>
                  <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||''}?text=${encodeURIComponent(`Hi, I'd like to join the waitlist for ${ex.title}`)}`}
                    target="_blank" rel="noreferrer" className="btn-gold w-full justify-center text-sm">WhatsApp waitlist</a>
                </div>
              ) : !ex.registration_open ? (
                <div className="text-center py-4">
                  <p className="text-sm text-ink-500">Registration is currently closed.</p>
                </div>
              ) : (
                <>
                  <h3 className="font-serif text-xl text-ink-800 mb-1">
                    {ex.is_vip ? '✦ VIP Registration' : 'Register to attend'}
                  </h3>
                  {ex.is_vip && <p className="text-xs text-gold-600 mb-4">Exclusive access — limited spaces</p>}
                  {ex.reg_close_date && <p className="text-xs text-amber-600 mb-4">Registration closes {new Date(ex.reg_close_date).toLocaleDateString('en-AE',{day:'numeric',month:'short'})}</p>}

                  <form onSubmit={handleRegister} className="space-y-3">
                    <div><label className={lbl}>Full name *</label><input value={form.full_name} onChange={e=>set('full_name',e.target.value)} required className={inp} placeholder="Your name"/></div>
                    <div><label className={lbl}>Phone / WhatsApp *</label><input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} required className={inp} placeholder="+971 50 000 0000"/></div>
                    <div><label className={lbl}>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} className={inp} placeholder="your@email.com"/></div>
                    <div><label className={lbl}>Company</label><input value={form.company} onChange={e=>set('company',e.target.value)} className={inp} placeholder="Optional"/></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={lbl}>Visit date</label><input type="date" value={form.visit_date} onChange={e=>set('visit_date',e.target.value)} min={ex.start_date} max={ex.end_date} className={inp}/></div>
                      <div><label className={lbl}>Preferred time</label>
                        <select value={form.visit_time} onChange={e=>set('visit_time',e.target.value)} className={inp}>
                          <option value="">Any time</option>
                          {['10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'].map(t=><option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div><label className={lbl}>Party size</label>
                      <select value={form.party_size} onChange={e=>set('party_size',e.target.value)} className={inp}>
                        {['1','2','3','4','5+'].map(n=><option key={n} value={n}>{n} {n==='1'?'person':'people'}</option>)}
                      </select>
                    </div>
                    <div><label className={lbl}>Notes</label><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} className={inp} rows={2} placeholder="Any specific interests or requirements"/></div>
                    <button type="submit" disabled={submitting} className="btn-gold w-full justify-center py-3.5 text-sm disabled:opacity-50">
                      {submitting ? 'Registering…' : ex.is_vip ? '✦ Request VIP access' : 'Confirm registration'}
                    </button>
                    <p className="text-[10px] text-ink-300 text-center">We will confirm via WhatsApp within a few hours</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
