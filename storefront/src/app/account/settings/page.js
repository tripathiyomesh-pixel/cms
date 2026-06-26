'use client';
import { useState } from 'react';

export default function AccountSettingsPage() {
  const [form,  setForm]  = useState({ current_password:'', new_password:'', confirm_password:'' });
  const [msg,   setMsg]   = useState('');
  const [error, setError] = useState('');
  const [saving,setSaving]= useState(false);
  const inp = { width:'100%', padding:'12px 16px', border:'1px solid #e5e0d8', fontSize:13, outline:'none', marginBottom:14, fontFamily:"'Inter',sans-serif", boxSizing:'border-box' };

  const save = async (e) => {
    e.preventDefault(); setMsg(''); setError('');
    if (form.new_password !== form.confirm_password) { setError('Passwords do not match'); return; }
    setSaving(true);
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    const token = localStorage.getItem('jcos_customer_token');
    try {
      const res = await fetch(`${api}/customer/change-password`, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify({ current_password:form.current_password, new_password:form.new_password }) });
      const data = await res.json();
      if (data.success) { setMsg('Password updated'); setForm({ current_password:'', new_password:'', confirm_password:'' }); }
      else setError(data.message);
    } catch { setError('Failed'); }
    setSaving(false);
  };

  return (
    <div>
      <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:300, color:'var(--color-text)', marginBottom:8 }}>Account Settings</h1>
      <div style={{ width:40, height:1, background:'var(--color-accent)', marginBottom:32 }}/>
      <div style={{ maxWidth:400 }}>
        <h3 style={{ fontSize:12, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'#4a4a4a', marginBottom:20 }}>Change Password</h3>
        <form onSubmit={save}>
          <input type="password" placeholder="Current password" value={form.current_password} onChange={e=>setForm(f=>({...f,current_password:e.target.value}))} style={inp} required/>
          <input type="password" placeholder="New password (min. 8 characters)" value={form.new_password} onChange={e=>setForm(f=>({...f,new_password:e.target.value}))} style={inp} required minLength={8}/>
          <input type="password" placeholder="Confirm new password" value={form.confirm_password} onChange={e=>setForm(f=>({...f,confirm_password:e.target.value}))} style={inp} required/>
          {error && <p style={{ fontSize:12, color:'#dc2626', marginBottom:12 }}>✗ {error}</p>}
          {msg   && <p style={{ fontSize:12, color:'#4caf70', marginBottom:12 }}>✓ {msg}</p>}
          <button type="submit" disabled={saving} style={{ padding:'13px 32px', background:'var(--color-text)', color:'#fff', border:'none', cursor:'pointer', fontSize:11, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase' }}>
            {saving?'Updating…':'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
