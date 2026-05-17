'use client';
import { useState } from 'react';
import { customOrderAPI } from '@/lib/api';
import { CheckCircle, Upload } from 'lucide-react';

const STEPS = ['Tell us your idea','Stone & metal','Budget','Submit'];

export default function CustomPage() {
  const [step, setStep]       = useState(0);
  const [submitted, setSubmitted]= useState(false);
  const [submitting, setSubmitting]= useState(false);
  const [form, setForm]       = useState({
    customer_name:'', customer_phone:'', customer_email:'',
    description:'', metal_preference:'', stone_preference:'',
    budget_min:'', budget_max:'', currency:'AED',
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async() => {
    setSubmitting(true);
    try {
      await customOrderAPI.submit({ ...form, budget_min:parseFloat(form.budget_min)||null, budget_max:parseFloat(form.budget_max)||null });
      setSubmitted(true);
    } catch { alert('Submission failed. Please try WhatsApp instead.'); }
    setSubmitting(false);
  };

  if (submitted) return (
    <div className="pt-24 max-w-xl mx-auto px-4 py-20 text-center">
      <CheckCircle size={56} className="mx-auto text-green-500 mb-6"/>
      <h2 className="font-serif text-3xl text-ink-800 mb-3">Request Received!</h2>
      <p className="text-ink-400 mb-6">We'll review your custom jewellery request and contact you within 24 hours to discuss your design.</p>
      <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||''}`} target="_blank" rel="noreferrer" className="btn-gold">
        💬 Chat on WhatsApp now
      </a>
    </div>
  );

  const inp = 'input-field';
  const lbl = 'block text-sm font-medium text-ink-600 mb-2';

  return (
    <div className="pt-24 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl lg:text-4xl text-ink-800 mb-3">Custom Jewellery</h1>
        <p className="text-ink-400">Your design. Our craftsmanship. Tell us what you have in mind.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center mb-10">
        {STEPS.map((s,i)=>(
          <div key={s} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i<=step?'bg-gold-500 text-white':'bg-ink-100 text-ink-400'}`}>{i+1}</div>
            <div className="flex-1 ml-2">
              <p className={`text-xs font-medium ${i<=step?'text-gold-700':'text-ink-400'}`}>{s}</p>
            </div>
            {i<STEPS.length-1 && <div className={`h-0.5 flex-1 mx-2 ${i<step?'bg-gold-400':'bg-ink-200'}`}/>}
          </div>
        ))}
      </div>

      <div className="card p-8">
        {step===0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-ink-700 mb-6">Tell us about your idea</h3>
            <div><label className={lbl}>Your description *</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} className={inp} rows={5} placeholder="Describe what you have in mind. For example: An engagement ring with an oval diamond, set in a simple pave band. I'd like the band to be delicate and feminine..."/></div>
            <div><label className={lbl}>Reference images (optional)</label><div className="border-2 border-dashed border-ink-200 rounded-xl p-8 text-center cursor-pointer hover:border-gold-300 transition-colors"><Upload size={24} className="mx-auto text-ink-300 mb-2"/><p className="text-sm text-ink-400">Upload inspiration images</p><p className="text-xs text-ink-300 mt-1">Or share a Pinterest/Instagram link in the description</p></div></div>
          </div>
        )}

        {step===1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-ink-700 mb-6">Stone & metal preferences</h3>
            <div><label className={lbl}>Preferred metal</label>
              <div className="grid grid-cols-3 gap-2">
                {['18K Yellow Gold','18K White Gold','18K Rose Gold','22K Yellow Gold','Platinum 950','Platinum 900'].map(m=>(
                  <button key={m} type="button" onClick={()=>set('metal_preference',m)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all ${form.metal_preference===m?'border-gold-500 bg-gold-50 text-gold-700':'border-ink-200 text-ink-500 hover:border-gold-300'}`}>{m}</button>
                ))}
              </div>
            </div>
            <div><label className={lbl}>Centre stone preference</label>
              <div className="grid grid-cols-3 gap-2">
                {['Natural Diamond','Lab Diamond','Ruby','Sapphire','Emerald','Other gemstone','No stone','Not decided'].map(s=>(
                  <button key={s} type="button" onClick={()=>set('stone_preference',s)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all ${form.stone_preference===s?'border-gold-500 bg-gold-50 text-gold-700':'border-ink-200 text-ink-500 hover:border-gold-300'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step===2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-ink-700 mb-6">Budget & contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Budget from</label><input type="number" value={form.budget_min} onChange={e=>set('budget_min',e.target.value)} className={inp} placeholder="5,000"/></div>
              <div><label className={lbl}>Budget to</label><input type="number" value={form.budget_max} onChange={e=>set('budget_max',e.target.value)} className={inp} placeholder="15,000"/></div>
            </div>
            <div><label className={lbl}>Currency</label>
              <select value={form.currency} onChange={e=>set('currency',e.target.value)} className={inp}>
                {['AED','USD','SAR','INR','GBP','EUR'].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        {step===3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-ink-700 mb-6">Your contact details</h3>
            <div><label className={lbl}>Full name *</label><input value={form.customer_name} onChange={e=>set('customer_name',e.target.value)} className={inp} placeholder="Your name" required/></div>
            <div><label className={lbl}>WhatsApp / Phone *</label><input type="tel" value={form.customer_phone} onChange={e=>set('customer_phone',e.target.value)} className={inp} placeholder="+971 50 000 0000" required/></div>
            <div><label className={lbl}>Email (optional)</label><input type="email" value={form.customer_email} onChange={e=>set('customer_email',e.target.value)} className={inp} placeholder="your@email.com"/></div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step>0 && <button onClick={()=>setStep(s=>s-1)} className="btn-ghost px-6">Back</button>}
          {step<STEPS.length-1
            ? <button onClick={()=>setStep(s=>s+1)} className="btn-gold flex-1">Continue →</button>
            : <button onClick={handleSubmit} disabled={submitting||!form.customer_name||!form.customer_phone} className="btn-gold flex-1 disabled:opacity-50">{submitting?'Submitting…':'Submit Request'}</button>
          }
        </div>
      </div>
    </div>
  );
}
