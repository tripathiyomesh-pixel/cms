'use client';
import { useState } from 'react';
import { enquiryAPI } from '@/lib/api';
import { CheckCircle, Calendar } from 'lucide-react';

const PURPOSES = ['Engagement ring consultation','Bridal jewellery','Diamond viewing','Custom jewellery','Repairs & resize','General viewing'];

export default function AppointmentPage() {
  const [form, setForm]           = useState({ customer_name:'', customer_email:'', customer_phone:'', preferred_date:'', preferred_time:'10:00', purpose:'', party_size:'1', notes:'' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting]= useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async(e) => {
    e.preventDefault(); setSubmitting(true);
    try { await enquiryAPI.appointment(form); setSubmitted(true); }
    catch { alert('Booking failed. Please WhatsApp us directly.'); }
    setSubmitting(false);
  };

  const inp = 'input-field';
  const lbl = 'block text-sm font-medium text-ink-600 mb-2';

  if (submitted) return (
    <div className="pt-24 max-w-xl mx-auto px-4 py-20 text-center">
      <CheckCircle size={56} className="mx-auto text-green-500 mb-6"/>
      <h2 className="font-serif text-3xl text-ink-800 mb-3">Appointment Requested!</h2>
      <p className="text-ink-400 mb-6">We'll confirm your appointment within a few hours. Check your WhatsApp for confirmation.</p>
    </div>
  );

  return (
    <div className="pt-24 max-w-xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <Calendar size={40} className="mx-auto text-gold-500 mb-4"/>
        <h1 className="font-serif text-3xl text-ink-800 mb-3">Book an Appointment</h1>
        <p className="text-ink-400">Private consultation at our boutique. View certified diamonds and jewellery in person.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-5">
        <div><label className={lbl}>Your name *</label><input value={form.customer_name} onChange={e=>set('customer_name',e.target.value)} required className={inp} placeholder="Full name"/></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lbl}>WhatsApp *</label><input type="tel" value={form.customer_phone} onChange={e=>set('customer_phone',e.target.value)} required className={inp} placeholder="+971 50 000 0000"/></div>
          <div><label className={lbl}>Email</label><input type="email" value={form.customer_email} onChange={e=>set('customer_email',e.target.value)} className={inp} placeholder="your@email.com"/></div>
        </div>
        <div><label className={lbl}>Purpose</label>
          <div className="grid grid-cols-2 gap-2">
            {PURPOSES.map(p=>(
              <button key={p} type="button" onClick={()=>set('purpose',p)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-left transition-all ${form.purpose===p?'border-gold-500 bg-gold-50 text-gold-700':'border-ink-200 text-ink-500 hover:border-gold-300'}`}>{p}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lbl}>Preferred date *</label><input type="date" value={form.preferred_date} onChange={e=>set('preferred_date',e.target.value)} required className={inp} min={new Date().toISOString().split('T')[0]}/></div>
          <div><label className={lbl}>Preferred time</label>
            <select value={form.preferred_time} onChange={e=>set('preferred_time',e.target.value)} className={inp}>
              {['10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div><label className={lbl}>Party size</label>
          <select value={form.party_size} onChange={e=>set('party_size',e.target.value)} className={inp}>
            {['1','2','3','4','5+'].map(n=><option key={n} value={n}>{n} {n==='1'?'person':'people'}</option>)}
          </select>
        </div>
        <div><label className={lbl}>Notes</label><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} className={inp} rows={3} placeholder="Any specific items you'd like to see, or anything else we should know"/></div>
        <button type="submit" disabled={submitting||!form.customer_name||!form.customer_phone||!form.preferred_date}
          className="btn-gold w-full justify-center text-base py-4 disabled:opacity-50">
          <Calendar size={18}/>{submitting?'Booking…':'Book Appointment'}
        </button>
      </form>
    </div>
  );
}
