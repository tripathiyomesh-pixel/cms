'use client';
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function AccountPage() {
  const [form,   setForm]   = useState({ first_name:'', last_name:'', phone:'', country_code:'AE' });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState('');

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    const token = localStorage.getItem('jcos_customer_token');
    if (!token) return;
    fetch(`${api}/customer/profile`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(res=>{
        if (res.data) setForm({ first_name:res.data.first_name||'', last_name:res.data.last_name||'', phone:res.data.phone||'', country_code:res.data.country_code||'AE' });
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    const token = localStorage.getItem('jcos_customer_token');
    try {
      await fetch(`${api}/customer/profile`, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify(form) });
      setMsg('Profile updated successfully');
    } catch { setMsg('Failed to save'); }
    setSaving(false);
  };

  const inp = { width:'100%', padding:'12px 16px', border:'1px solid #e5e0d8', fontSize:13, outline:'none', fontFamily:"'Inter',sans-serif" };

  return (
    <div>
      <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:300, color:'var(--color-text)', marginBottom:8 }}>My Profile</h1>
      <div style={{ width:40, height:1, background:'var(--color-accent)', marginBottom:32 }}/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div>
          <label style={{ display:'block', fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#6b6b6b', marginBottom:8 }}>First name</label>
          <input value={form.first_name} onChange={e=>setForm(f=>({...f,first_name:e.target.value}))} style={inp} placeholder="Sarah"/>
        </div>
        <div>
          <label style={{ display:'block', fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#6b6b6b', marginBottom:8 }}>Last name</label>
          <input value={form.last_name} onChange={e=>setForm(f=>({...f,last_name:e.target.value}))} style={inp} placeholder="Al-Ahmad"/>
        </div>
      </div>
      <div style={{ marginBottom:20 }}>
        <label style={{ display:'block', fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#6b6b6b', marginBottom:8 }}>Phone</label>
        <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} style={inp} placeholder="+971 50 000 0000"/>
      </div>
      {msg && <p style={{ fontSize:12, color:'#4caf70', marginBottom:16 }}>✓ {msg}</p>}
      <button onClick={save} disabled={saving}
        style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 32px', background:'var(--color-text)', color:'#fff', border:'none', cursor:'pointer', fontSize:11, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase' }}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}
