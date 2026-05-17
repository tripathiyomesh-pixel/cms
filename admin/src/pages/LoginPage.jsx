import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Animated jewellery showcase — rotating product cards ── */
const SHOWCASE = [
  {
    name: 'Solitaire Diamond Ring',
    label: '1.2ct · D · VVS1 · IGI Certified',
    badge: 'NEW ARRIVAL',
    price: 'AED 18,500',
    color: '#c9a84c',
    shape: (
      <svg viewBox="0 0 120 100" style={{width:80,height:67}}>
        <polygon points="60,10 90,35 60,85 30,35" fill="url(#d1)" stroke="#e8d98a" strokeWidth="0.8"/>
        <polygon points="60,10 30,35 15,20 45,5" fill="url(#d2)" stroke="#e8d98a" strokeWidth="0.8"/>
        <polygon points="60,10 90,35 105,20 75,5" fill="url(#d3)" stroke="#e8d98a" strokeWidth="0.8"/>
        <polygon points="45,5 75,5 105,20 90,35 60,10 30,35 15,20" fill="url(#d4)" stroke="#e8d98a" strokeWidth="0.6"/>
        <defs>
          <linearGradient id="d1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#b8d8f0"/><stop offset="100%" stopColor="#6aa8d0"/></linearGradient>
          <linearGradient id="d2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#daeeff"/><stop offset="100%" stopColor="#8ac0e0"/></linearGradient>
          <linearGradient id="d3" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="#a8d0f0"/></linearGradient>
          <linearGradient id="d4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="#d0ecff"/></linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: '22K Gold Bridal Set',
    label: '3-piece · 42g · Hallmarked',
    badge: 'BRIDAL',
    price: 'AED 12,800',
    color: '#d4aa3a',
    shape: (
      <svg viewBox="0 0 120 100" style={{width:80,height:67}}>
        {/* Necklace pendant */}
        <ellipse cx="60" cy="50" rx="28" ry="28" fill="none" stroke="url(#g1)" strokeWidth="6"/>
        <ellipse cx="60" cy="50" rx="18" ry="18" fill="url(#g2)" stroke="#f5d98a" strokeWidth="1"/>
        <circle cx="60" cy="50" r="8" fill="#f5d98a" opacity="0.6"/>
        <line x1="60" y1="22" x2="60" y2="10" stroke="url(#g1)" strokeWidth="4" strokeLinecap="round"/>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f5d98a"/><stop offset="50%" stopColor="#c9a84c"/><stop offset="100%" stopColor="#8b6914"/></linearGradient>
          <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f5d98a" stopOpacity="0.3"/><stop offset="100%" stopColor="#c9a84c" stopOpacity="0.1"/></linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: 'Diamond Tennis Bracelet',
    label: '18K White Gold · 28 stones · GIA',
    badge: 'BESTSELLER',
    price: 'AED 32,000',
    color: '#a0c4d8',
    shape: (
      <svg viewBox="0 0 120 100" style={{width:80,height:67}}>
        <path d="M10,50 Q30,30 60,50 Q90,70 110,50" fill="none" stroke="url(#b1)" strokeWidth="7" strokeLinecap="round"/>
        {[10,27,44,60,76,93,110].map((x,i)=>(
          <polygon key={i} points={`${x},${50+[0,-20,10,-15,10,-18,0][i]} ${x-5},${50+[0,-20,10,-15,10,-18,0][i]+8} ${x},${50+[0,-20,10,-15,10,-18,0][i]+16} ${x+5},${50+[0,-20,10,-15,10,-18,0][i]+8}`}
            fill="url(#b2)" stroke="#e8f4ff" strokeWidth="0.5" opacity="0.9"/>
        ))}
        <defs>
          <linearGradient id="b1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#d0d8e0"/><stop offset="50%" stopColor="#ffffff"/><stop offset="100%" stopColor="#c0c8d8"/></linearGradient>
          <linearGradient id="b2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#eef8ff"/><stop offset="100%" stopColor="#b8d8f8"/></linearGradient>
        </defs>
      </svg>
    ),
  },
];

const Stats = [
  { num: '2,400+', label: 'Products managed' },
  { num: '18',     label: 'GCC boutiques' },
  { num: '99.9%',  label: 'Uptime' },
];

export default function LoginPage() {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [remember,    setRemember]    = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [fpEmail, setFpEmail] = useState('');
  const [fpSent, setFpSent] = useState(false);
  const [fpLoading, setFpLoading] = useState(false);
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [activeCard,  setActiveCard]  = useState(0);
  const { login } = useAuth();
  const navigate  = useNavigate();

  // Load saved credentials
  useEffect(() => {
    const saved = localStorage.getItem('jcms_remember');
    if (saved) {
      try {
        const { email: e, password: p } = JSON.parse(saved);
        setEmail(e); setPassword(p); setRemember(true);
      } catch {}
    }
  }, []);

  // Rotate showcase cards
  useEffect(() => {
    const t = setInterval(() => setActiveCard(c => (c + 1) % SHOWCASE.length), 3500);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      if (remember) {
        localStorage.setItem('jcms_remember', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('jcms_remember');
      }
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const card = SHOWCASE[activeCard];

  /* ── Styles ──────────────────────────────────────────────── */
  const inp = {
    width: '100%', border: '1.5px solid #e8e8e8', borderRadius: 10,
    padding: '11px 14px', fontSize: 14, color: '#1a1a1a', outline: 'none',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
    background: '#fff', transition: 'border-color .15s, box-shadow .15s',
  };

  return (
    <>
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:'Inter, sans-serif' }}>

      {/* ════════════════════════════════════════════════════
          LEFT PANEL — 65% showcase
          ════════════════════════════════════════════════════ */}
      <div style={{
        width:'60%', minHeight:'100vh', position:'relative', overflow:'hidden',
        background:'linear-gradient(160deg,#0c0b08 0%,#161410 45%,#1e1a10 100%)',
        display:'flex', flexDirection:'column',
      }} className="left-panel">

        {/* ── Hex tile background ── */}
        <div style={{ position:'absolute', inset:0, opacity:0.05,
          backgroundImage:`url("data:image/svg+xml,%3Csvg width='80' height='92' viewBox='0 0 80 92' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='40,4 76,24 76,68 40,88 4,68 4,24' fill='none' stroke='%23c9a84c' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize:'80px 92px',
        }}/>

        {/* ── Ambient glows ── */}
        <div style={{ position:'absolute', top:-120, left:-120, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-160, right:-100, width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)', pointerEvents:'none' }}/>

        {/* ── TOP: Our branding ── */}
        <div style={{ position:'relative', zIndex:10, padding:'32px 40px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, background:'#c9a84c', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.4"/>
                <polyline points="1,5 8,9 15,5" fill="none" stroke="#fff" strokeWidth="0.9"/>
                <line x1="8" y1="9" x2="8" y2="15" stroke="#fff" strokeWidth="0.9"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:'#fff', letterSpacing:'-0.01em', lineHeight:1 }}>
                Jewel<span style={{ color:'#c9a84c' }}>CMS</span>
              </div>
              <div style={{ fontSize:10, color:'#4d4530', marginTop:2, letterSpacing:'0.06em', textTransform:'uppercase' }}>by KenTech Global</div>
            </div>
          </div>
          <div style={{ fontSize:10, color:'#3d3624', letterSpacing:'0.05em', textTransform:'uppercase', border:'1px solid #2a2318', borderRadius:20, padding:'5px 12px' }}>
            GCC Edition
          </div>
        </div>

        {/* ── MIDDLE: Jewellery showcase card ── */}
        <div style={{ position:'relative', zIndex:10, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px 40px' }}>

          {/* Floating product showcase card */}
          <div style={{
            background:'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            border:'1px solid rgba(201,168,76,0.2)', borderRadius:20, padding:'28px',
            width:'100%', maxWidth:380, marginBottom:28,
            backdropFilter:'blur(10px)',
            boxShadow:'0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,168,76,0.1)',
            transition:'all .6s cubic-bezier(0.4,0,0.2,1)',
          }}>
            {/* Card header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.08em', color:'#c9a84c', textTransform:'uppercase',
                background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:20, padding:'3px 10px' }}>
                {card.badge}
              </span>
              <div style={{ display:'flex', gap:4 }}>
                {SHOWCASE.map((_,i) => (
                  <div key={i} onClick={() => setActiveCard(i)} style={{ width: i===activeCard?20:6, height:6, borderRadius:3,
                    background: i===activeCard?'#c9a84c':'rgba(201,168,76,0.2)', cursor:'pointer', transition:'all .3s' }}/>
                ))}
              </div>
            </div>

            {/* Product visual + info */}
            <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:20 }}>
              <div style={{ width:90, height:90, borderRadius:14, background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.15)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {card.shape}
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:600, color:'#f0e8d0', marginBottom:4, lineHeight:1.3 }}>{card.name}</div>
                <div style={{ fontSize:11, color:'#6b5f40', lineHeight:1.5 }}>{card.label}</div>
                <div style={{ fontSize:18, fontWeight:700, color:'#c9a84c', marginTop:8 }}>{card.price}</div>
              </div>
            </div>

            {/* Mini spec tags */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['In stock', 'IGI Cert', 'Free shipping', 'WhatsApp'].map(t => (
                <span key={t} style={{ fontSize:10, padding:'3px 8px', borderRadius:6, background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(255,255,255,0.08)', color:'#6b6045' }}>{t}</span>
              ))}
            </div>

            {/* Admin action row */}
            <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.05)',
              display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', gap:6 }}>
                {['Edit','Specs','Enquiries'].map(a => (
                  <div key={a} style={{ fontSize:10, padding:'4px 10px', borderRadius:6, background:'rgba(201,168,76,0.08)',
                    border:'1px solid rgba(201,168,76,0.15)', color:'#c9a84c', cursor:'pointer' }}>{a}</div>
                ))}
              </div>
              <div style={{ fontSize:10, color:'#3d3624' }}>JewelCMS Admin</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ textAlign:'center', maxWidth:360 }}>
            <h2 style={{ fontSize:24, fontWeight:700, color:'#fff', margin:'0 0 10px', letterSpacing:'-0.02em', lineHeight:1.25 }}>
              The CMS built for<br/>
              <span style={{ color:'#c9a84c' }}>GCC jewellery brands</span>
            </h2>
            <p style={{ fontSize:12, color:'#5a5035', lineHeight:1.7, margin:0 }}>
              Diamond specs, certifications, live gold rates, boutique appointments, WhatsApp enquiries — all in one admin panel.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display:'flex', gap:0, marginTop:28, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(201,168,76,0.1)', borderRadius:14, overflow:'hidden', width:'100%', maxWidth:360 }}>
            {Stats.map((s, i) => (
              <div key={s.label} style={{ flex:1, textAlign:'center', padding:'14px 8px',
                borderRight: i < Stats.length-1 ? '1px solid rgba(201,168,76,0.1)' : 'none' }}>
                <div style={{ fontSize:16, fontWeight:700, color:'#c9a84c' }}>{s.num}</div>
                <div style={{ fontSize:10, color:'#4d4530', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM: Client branding strip ── */}
        <div style={{ position:'relative', zIndex:10, padding:'20px 40px', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize:10, color:'#3a3020', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12, textAlign:'center' }}>
            Trusted by leading jewellers
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, flexWrap:'wrap' }}>
            {/* Client brand logos — text-based placeholders (replace with real logos) */}
            {[
              { name:'Tejori', sub:'Dubai' },
              { name:'Cara',   sub:'Gold Souk' },
              { name:'Mukund', sub:'Jewellers' },
              { name:'Al Romaizan', sub:'KSA' },
            ].map(b => (
              <div key={b.name} style={{ textAlign:'center', opacity:0.5 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#c9a84c', letterSpacing:'0.02em' }}>{b.name}</div>
                <div style={{ fontSize:9, color:'#3d3220', letterSpacing:'0.04em' }}>{b.sub}</div>
              </div>
            ))}
          </div>
          {/* Powered by strip */}
          <div style={{ marginTop:14, textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <div style={{ height:1, flex:1, maxWidth:60, background:'rgba(201,168,76,0.1)' }}/>
            <span style={{ fontSize:10, color:'#2e2818' }}>Powered by</span>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:14, height:14, background:'#c9a84c', borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="7" height="7" viewBox="0 0 16 16" fill="none">
                  <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.8"/>
                </svg>
              </div>
              <span style={{ fontSize:10, fontWeight:700, color:'#4d3f20', letterSpacing:'0.02em' }}>
                Jewel<span style={{ color:'#6b5530' }}>CMS</span>
              </span>
            </div>
            <div style={{ height:1, flex:1, maxWidth:60, background:'rgba(201,168,76,0.1)' }}/>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          RIGHT PANEL — 35% login form
          ════════════════════════════════════════════════════ */}
      <div style={{
        width:'40%', minHeight:'100vh', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        background:'#fafaf8', padding:'40px 32px',
      }} className="right-panel">

        <div style={{ width:'100%', maxWidth:320 }}>

          {/* Mobile-only logo */}
          <div className="mobile-logo" style={{ display:'none', alignItems:'center', gap:10, marginBottom:32 }}>
            <div style={{ width:30, height:30, background:'#c9a84c', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.5"/>
              </svg>
            </div>
            <span style={{ fontSize:17, fontWeight:700, color:'#1a1a1a' }}>
              Jewel<span style={{ color:'#c9a84c' }}>CMS</span>
            </span>
          </div>

          {/* Client store branding — shown on right panel */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#f5d98a,#c9a84c)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px',
              boxShadow:'0 4px 16px rgba(201,168,76,0.3)' }}>
              <svg width="26" height="26" viewBox="0 0 16 16" fill="none">
                <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.4"/>
                <polyline points="1,5 8,9 15,5" fill="none" stroke="#fff" strokeWidth="0.9"/>
                <line x1="8" y1="9" x2="8" y2="15" stroke="#fff" strokeWidth="0.9"/>
              </svg>
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:'#2a2218', letterSpacing:'0.01em' }}>Your Store Name</div>
            <div style={{ fontSize:11, color:'#bbb', marginTop:2 }}>Admin Portal</div>
          </div>

          {/* Form heading */}
          <div style={{ marginBottom:24 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:'#111', margin:'0 0 5px', letterSpacing:'-0.02em' }}>
              Welcome back
            </h1>
            <p style={{ fontSize:13, color:'#aaa', margin:0 }}>Sign in to your admin account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#666', marginBottom:6 }}>
                Email address
              </label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@yourbrand.com"
                style={inp}
                onFocus={e => { e.target.style.borderColor='#c9a84c'; e.target.style.boxShadow='0 0 0 3px rgba(201,168,76,0.1)'; }}
                onBlur={e => { e.target.style.borderColor='#e8e8e8'; e.target.style.boxShadow='none'; }}
              />
            </div>

            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#666', marginBottom:6 }}>
                Password
              </label>
              <div style={{ position:'relative' }}>
                <input type={showPw?'text':'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ ...inp, paddingRight:42 }}
                  onFocus={e => { e.target.style.borderColor='#c9a84c'; e.target.style.boxShadow='0 0 0 3px rgba(201,168,76,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor='#e8e8e8'; e.target.style.boxShadow='none'; }}
                />
                <button type="button" onClick={() => setShowPw(v=>!v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#ccc', padding:0 }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }}>
              <div onClick={() => setRemember(v=>!v)}
                style={{ width:18, height:18, borderRadius:5, border:`2px solid ${remember?'#c9a84c':'#ddd'}`,
                  background:remember?'#c9a84c':'transparent', display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0, transition:'all .15s', cursor:'pointer' }}>
                {remember && <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L4 7L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>}
              </div>
              <span style={{ fontSize:12, color:'#888' }}>Remember me on this device</span>
            </label>

            {/* Sign in button */}
            <button type="submit" disabled={loading}
              style={{
                width:'100%', background: loading?'#d4aa5a':'#c9a84c', color:'#000',
                border:'none', borderRadius:10, padding:'13px', fontSize:14, fontWeight:700,
                cursor: loading?'not-allowed':'pointer', display:'flex', alignItems:'center',
                justifyContent:'center', gap:8, fontFamily:'Inter, sans-serif',
                transition:'background .15s, transform .1s', letterSpacing:'0.01em',
                marginTop:4,
              }}
              onMouseEnter={e => { if(!loading) e.currentTarget.style.background='#b8972e'; }}
              onMouseLeave={e => { if(!loading) e.currentTarget.style.background='#c9a84c'; }}>
              {loading ? (
                <><span style={{ width:16,height:16,border:'2px solid rgba(0,0,0,0.15)',borderTopColor:'#000',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite' }}/> Signing in…</>
              ) : 'Sign in →'}
            </button>
          </form>

          {/* Status + powered by */}
          <div style={{ marginTop:32, paddingTop:20, borderTop:'1px solid #f0f0f0' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px rgba(34,197,94,0.5)' }}/>
                <span style={{ fontSize:11, color:'#ccc' }}>All systems operational</span>
              </div>
            </div>
            {/* Powered by — like Shopify/Webflow style */}
            <div style={{ marginTop:14, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <span style={{ fontSize:11, color:'#ddd' }}>Powered by</span>
              <div style={{ display:'flex', alignItems:'center', gap:5, background:'#f5f0e8', borderRadius:6, padding:'3px 8px' }}>
                <div style={{ width:12, height:12, background:'#c9a84c', borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="6" height="6" viewBox="0 0 16 16" fill="none">
                    <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="2"/>
                  </svg>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:'#8b6914', letterSpacing:'0.01em' }}>JewelCMS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1023px) {
          .left-panel  { display: none !important; }
          .right-panel { width: 100% !important; }
          .mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>

      {/* Forgot password modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-ink-900 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            {fpSent ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 14l8 8L24 6" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="text-base font-semibold text-ink-700 mb-2">Check your email</h3>
                <p className="text-sm text-ink-400 mb-6">If this email is registered, you will receive a password reset link.</p>
                <button onClick={()=>{ setShowForgot(false); setFpSent(false); setFpEmail(''); }} className="btn-gold w-full justify-center">Done</button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-semibold text-ink-700 mb-2">Reset your password</h3>
                <p className="text-sm text-ink-400 mb-6">Enter your email address and we will send you a reset link.</p>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <input type="email" required value={fpEmail} onChange={e=>setFpEmail(e.target.value)}
                    className="input-field" placeholder="your@email.com"/>
                  <div className="flex gap-3">
                    <button type="button" onClick={()=>setShowForgot(false)} className="btn-ghost flex-1 justify-center text-sm">Cancel</button>
                    <button type="submit" disabled={fpLoading} className="btn-gold flex-1 justify-center text-sm disabled:opacity-50">
                      {fpLoading ? 'Sending…' : 'Send reset link'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
