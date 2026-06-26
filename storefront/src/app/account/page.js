'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, EyeOff } from 'lucide-react';

const API  = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const GOLD = 'var(--color-accent)';
const INP  = { width:'100%', padding:'12px 16px', border:'1px solid #e5e0d8', fontSize:13, outline:'none', background:'var(--color-bg)', boxSizing:'border-box' };
const LBL  = { display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--color-text-muted)', marginBottom:8 };

function LoginRegisterPortal({ onAuth }) {
  const [tab, setTab]   = useState('login');
  const [form, setForm] = useState({ email:'', password:'', first_name:'', last_name:'', phone:'' });
  const [loading, setL] = useState(false);
  const [error, setErr] = useState('');
  const [showPw, setPw] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setL(true); setErr('');
    try {
      const endpoint = tab === 'login' ? '/customer/login' : '/customer/register';
      const body     = tab === 'login'
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, first_name: form.first_name, last_name: form.last_name, phone: form.phone };
      const r = await fetch(`${API}${endpoint}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || (tab==='login'?'Invalid credentials':'Registration failed'));
      const token = d.data?.token || d.token;
      const cust  = d.data?.customer || d.customer || d.data;
      localStorage.setItem('jcos_customer_token', token);
      localStorage.setItem('jcos_customer', JSON.stringify(cust));
      onAuth(cust);
    } catch (e) { setErr(e.message); }
    setL(false);
  };

  return (
    <div style={{ background:'var(--color-bg)', minHeight:'100vh' }}>
      <div style={{ background:'var(--color-text)', color:'#fff', textAlign:'center', padding:'64px 24px 48px', position:'relative' }}>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:GOLD, marginBottom:14 }}>Tejori · Member Portal</p>
        <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:400, color:'#fff', letterSpacing:'0.06em' }}>My Account</h1>
      </div>

      <div style={{ maxWidth:440, margin:'48px auto', padding:'0 24px 80px' }}>
        {/* Tab switcher */}
        <div style={{ display:'flex', border:'1px solid #e5e0d8', marginBottom:32 }}>
          {['login','register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setErr(''); }}
              style={{ flex:1, padding:'13px', border:'none', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', background:tab===t?GOLD:'var(--color-bg)', color:tab===t?'#fff':'var(--color-text-muted)', transition:'all 200ms ease' }}>
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ padding:'12px 16px', background:'#fef2f2', border:'1px solid #fecaca', fontSize:12, color:'#dc2626', marginBottom:20 }}>
            {error}
          </div>
        )}

        {tab === 'register' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div>
              <label style={LBL}>First name</label>
              <input value={form.first_name} onChange={e=>set('first_name',e.target.value)} style={INP} placeholder="Sarah"/>
            </div>
            <div>
              <label style={LBL}>Last name</label>
              <input value={form.last_name} onChange={e=>set('last_name',e.target.value)} style={INP} placeholder="Al-Ahmad"/>
            </div>
          </div>
        )}

        <div style={{ marginBottom:16 }}>
          <label style={LBL}>Email address</label>
          <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} style={INP} placeholder="you@example.com" onKeyDown={e=>e.key==='Enter'&&submit()}/>
        </div>

        <div style={{ marginBottom:16, position:'relative' }}>
          <label style={LBL}>Password</label>
          <input type={showPw?'text':'password'} value={form.password} onChange={e=>set('password',e.target.value)} style={{ ...INP, paddingRight:44 }} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&submit()}/>
          <button onClick={()=>setPw(p=>!p)} style={{ position:'absolute', right:12, top:'50%', marginTop:8, background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)' }}>
            {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
          </button>
        </div>

        {tab === 'register' && (
          <div style={{ marginBottom:16 }}>
            <label style={LBL}>Phone (optional)</label>
            <input value={form.phone} onChange={e=>set('phone',e.target.value)} style={INP} placeholder="+971 50 000 0000"/>
          </div>
        )}

        <button onClick={submit} disabled={loading || !form.email || !form.password}
          style={{ width:'100%', padding:'15px', background:GOLD, color:'#fff', border:'none', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', opacity:loading||!form.email||!form.password?0.5:1, marginBottom:20 }}>
          {loading ? 'Please wait…' : (tab==='login' ? 'Sign In' : 'Create Account')}
        </button>

        <p style={{ fontSize:11, color:'var(--color-text-muted)', textAlign:'center', lineHeight:1.8 }}>
          {tab === 'login'
            ? <>New to Tejori? <button onClick={()=>setTab('register')} style={{ background:'none', border:'none', cursor:'pointer', color:GOLD, fontWeight:600 }}>Create an account</button></>
            : <>Already a member? <button onClick={()=>setTab('login')} style={{ background:'none', border:'none', cursor:'pointer', color:GOLD, fontWeight:600 }}>Sign in</button></>
          }
        </p>
      </div>
    </div>
  );
}

function ProfilePortal({ account, onUpdate }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm]           = useState({ first_name: account?.first_name||'', last_name: account?.last_name||'', phone: account?.phone||'', email: account?.email||'' });
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState('');
  const [appointments, setAppts]  = useState([]);
  const [enquiries, setEnqs]      = useState([]);
  const [wishlistItems, setWL]    = useState([]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const token = localStorage.getItem('jcos_customer_token');
    if (!token) return;
    const headers = { Authorization:`Bearer ${token}` };

    // Load wishlist from localStorage
    try {
      const wl = JSON.parse(localStorage.getItem('jcms_wishlist') || '[]');
      setWL(wl);
    } catch {}

    // Load appointments
    fetch(`${API}/appointments?customer_token=${token}`, { headers }).then(r=>r.json()).then(d=>setAppts(d.data||[])).catch(()=>{});
    // Load enquiries
    fetch(`${API}/customer/enquiries`, { headers }).then(r=>r.json()).then(d=>setEnqs(d.data||[])).catch(()=>{});
  }, [activeTab]);

  const save = async () => {
    setSaving(true); setMsg('');
    const token = localStorage.getItem('jcos_customer_token');
    try {
      const r = await fetch(`${API}/customer/profile`, { method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify(form) });
      const d = await r.json();
      if (d.data) { localStorage.setItem('jcos_customer', JSON.stringify(d.data)); onUpdate(d.data); }
      setMsg('Profile updated successfully');
    } catch { setMsg('Failed to save changes'); }
    setSaving(false);
  };

  const TABS = [
    { key:'profile',      label:'Profile'       },
    { key:'wishlist',     label:'Wishlist'      },
    { key:'appointments', label:'Appointments'  },
    { key:'enquiries',    label:'Enquiries'     },
  ];

  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-heading)', fontSize:32, fontWeight:300, color:'var(--color-text)', marginBottom:8 }}>Welcome, {account?.first_name}</h1>
      <div style={{ width:40, height:1, background:GOLD, marginBottom:32 }}/>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #e5e0d8', marginBottom:32, gap:0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setActiveTab(t.key)}
            style={{ padding:'10px 20px', border:'none', background:'none', cursor:'pointer', fontSize:12, fontWeight:activeTab===t.key?700:400, color:activeTab===t.key?GOLD:'var(--color-text-muted)', borderBottom:activeTab===t.key?`2px solid ${GOLD}`:'2px solid transparent', letterSpacing:'0.08em', textTransform:'uppercase', transition:'all 150ms ease' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
            <div>
              <label style={LBL}>First name</label>
              <input value={form.first_name} onChange={e=>set('first_name',e.target.value)} style={INP}/>
            </div>
            <div>
              <label style={LBL}>Last name</label>
              <input value={form.last_name} onChange={e=>set('last_name',e.target.value)} style={INP}/>
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={LBL}>Email</label>
            <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} style={INP}/>
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={LBL}>Phone</label>
            <input value={form.phone} onChange={e=>set('phone',e.target.value)} style={INP}/>
          </div>
          {msg && <p style={{ fontSize:12, color:msg.includes('Failed')?'#dc2626':'#2e7d32', marginBottom:16 }}>{msg.includes('Failed')?'✕':' ✓'} {msg}</p>}
          <button onClick={save} disabled={saving}
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 32px', background:'var(--color-text)', color:'#fff', border:'none', cursor:'pointer', fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', opacity:saving?0.6:1 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Wishlist tab */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistItems.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--color-text-muted)' }}>
              <p style={{ fontFamily:'var(--font-heading)', fontSize:22, marginBottom:12 }}>Your wishlist is empty</p>
              <p style={{ fontSize:13, marginBottom:24 }}>Save pieces you love while browsing</p>
              <a href="/jewellery" style={{ fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:GOLD, textDecoration:'none', border:`1px solid ${GOLD}`, padding:'11px 24px' }}>Browse Jewellery</a>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:20 }}>
              {wishlistItems.map((item, i) => (
                <div key={i} style={{ border:'1px solid #e5e0d8', padding:16 }}>
                  <p style={{ fontFamily:'var(--font-heading)', fontSize:14, color:'var(--color-text)', marginBottom:4 }}>{item.name||item.title||'Item'}</p>
                  <a href={item.slug?`/jewellery/${item.slug}`:'/jewellery'} style={{ fontSize:10, color:GOLD, textDecoration:'none', fontWeight:600 }}>View →</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Appointments tab */}
      {activeTab === 'appointments' && (
        <div>
          {appointments.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--color-text-muted)' }}>
              <p style={{ fontFamily:'var(--font-heading)', fontSize:22, marginBottom:12 }}>No appointments yet</p>
              <a href="/appointment" style={{ fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:GOLD, textDecoration:'none', border:`1px solid ${GOLD}`, padding:'11px 24px' }}>Book an Appointment</a>
            </div>
          ) : appointments.map((a, i) => (
            <div key={i} style={{ border:'1px solid #e5e0d8', padding:'16px 20px', marginBottom:12, display:'flex', justifyContent:'space-between' }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--color-text)' }}>{a.type || 'Private Viewing'}</p>
                <p style={{ fontSize:11, color:'var(--color-text-muted)' }}>{a.date} {a.time}</p>
              </div>
              <span style={{ fontSize:10, padding:'4px 10px', background:a.status==='confirmed'?'#e8f5e9':'#f5f0e8', color:a.status==='confirmed'?'#2e7d32':'var(--color-text-muted)', border:'1px solid', borderColor:a.status==='confirmed'?'#c8e6c9':'#e5e0d8', alignSelf:'center', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.1em' }}>
                {a.status || 'Pending'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Enquiries tab */}
      {activeTab === 'enquiries' && (
        <div>
          {enquiries.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--color-text-muted)' }}>
              <p style={{ fontFamily:'var(--font-heading)', fontSize:22, marginBottom:12 }}>No enquiries yet</p>
              <p style={{ fontSize:13 }}>Your WhatsApp enquiries and requests will appear here</p>
            </div>
          ) : enquiries.map((e, i) => (
            <div key={i} style={{ border:'1px solid #e5e0d8', padding:'16px 20px', marginBottom:12 }}>
              <p style={{ fontSize:13, fontWeight:500, color:'var(--color-text)', marginBottom:4 }}>{e.subject || 'Enquiry'}</p>
              <p style={{ fontSize:11, color:'var(--color-text-muted)' }}>{e.created_at ? new Date(e.created_at).toLocaleDateString('en-AE',{year:'numeric',month:'long',day:'numeric'}) : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  const [authed,  setAuthed]  = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('jcos_customer_token');
    const acc   = localStorage.getItem('jcos_customer');
    if (token) {
      setAuthed(true);
      if (acc) { try { setAccount(JSON.parse(acc)); } catch {} }
    } else {
      setAuthed(false);
    }
  }, []);

  if (authed === null) return null;
  if (!authed) return <LoginRegisterPortal onAuth={a => { setAccount(a); setAuthed(true); }}/>;
  return <ProfilePortal account={account} onUpdate={a => setAccount(a)}/>;
}