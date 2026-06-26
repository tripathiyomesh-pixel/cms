'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [tab,   setTab]   = useState('login');
  const [form,  setForm]  = useState({ email:'', password:'', first_name:'', last_name:'', phone:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const api = process.env.NEXT_PUBLIC_API_URL || '/api';
  const inp = { width:'100%', padding:'14px 16px', border:'1px solid #e5e0d8', fontSize:13, outline:'none', marginBottom:14, fontFamily:"'Inter',sans-serif", boxSizing:'border-box', background:'#fff' };
  const btn = { width:'100%', padding:'14px', background:'var(--color-text)', color:'#fff', border:'none', cursor:'pointer', fontSize:11, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase' };

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${api}/customer/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:form.email, password:form.password }) });
      const data = await res.json();
      if (!data.success) { setError(data.message); setLoading(false); return; }
      localStorage.setItem('jcos_customer_token', data.data.token);
      localStorage.setItem('jcos_customer', JSON.stringify(data.data.account));
      router.push('/account');
    } catch { setError('Connection error. Please try again.'); }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${api}/customer/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) { setError(data.message); setLoading(false); return; }
      setTab('login');
    } catch { setError('Connection error. Please try again.'); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth:400, margin:'80px auto', padding:'0 24px' }}>
      <div style={{ textAlign:'center', marginBottom:40 }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:300, color:'var(--color-text)', marginBottom:12 }}>My Account</h1>
        <div style={{ width:40, height:1, background:'var(--color-accent)', margin:'0 auto' }}/>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid #e5e0d8', marginBottom:32 }}>
        {['login','register'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:'12px', background:'transparent', border:'none', borderBottom:tab===t?'2px solid #b8860b':'2px solid transparent', cursor:'pointer', fontSize:11, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:tab===t?'var(--color-accent)':'#6b6b6b', marginBottom:-1 }}>
            {t==='login'?'Sign In':'Create Account'}
          </button>
        ))}
      </div>
      {error && <div style={{ padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:12, marginBottom:16 }}>{error}</div>}
      {tab==='login' ? (
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email address" value={form.email} onChange={e=>set('email',e.target.value)} style={inp} required/>
          <input type="password" placeholder="Password" value={form.password} onChange={e=>set('password',e.target.value)} style={inp} required/>
          <button type="submit" disabled={loading} style={btn}>{loading?'Signing in…':'Sign In'}</button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <input placeholder="First name" value={form.first_name} onChange={e=>set('first_name',e.target.value)} style={{...inp,marginBottom:0}} required/>
            <input placeholder="Last name" value={form.last_name} onChange={e=>set('last_name',e.target.value)} style={{...inp,marginBottom:0}}/>
          </div>
          <input type="email" placeholder="Email address" value={form.email} onChange={e=>set('email',e.target.value)} style={inp} required/>
          <input placeholder="Phone (optional)" value={form.phone} onChange={e=>set('phone',e.target.value)} style={inp}/>
          <input type="password" placeholder="Password (min. 8 characters)" value={form.password} onChange={e=>set('password',e.target.value)} style={inp} required minLength={8}/>
          <button type="submit" disabled={loading} style={btn}>{loading?'Creating…':'Create Account'}</button>
        </form>
      )}
    </div>
  );
}
