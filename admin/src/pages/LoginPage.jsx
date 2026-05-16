import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Inline jewellery scene SVG ─────────────────────────────
   Diamond ring on a dark surface, warm gold lighting, subtle
   sparkle details. Pure SVG — no external image needed.      */
const JewelleryScene = () => (
  <svg viewBox="0 0 520 560" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', maxWidth: 420, height: 'auto' }}>

    {/* ── Background glow ── */}
    <ellipse cx="260" cy="340" rx="180" ry="60" fill="#c9a84c" fillOpacity="0.08"/>

    {/* ── Ring band shadow ── */}
    <ellipse cx="260" cy="390" rx="90" ry="18" fill="#000" fillOpacity="0.35"/>

    {/* ── Ring band left arc ── */}
    <path d="M180 340 Q160 390 185 400 Q220 415 260 415 Q300 415 335 400 Q360 390 340 340"
      fill="none" stroke="url(#goldGrad)" strokeWidth="22" strokeLinecap="round"/>

    {/* ── Ring band right arc (top) ── */}
    <path d="M180 340 Q220 328 260 326 Q300 328 340 340"
      fill="none" stroke="url(#goldGradLight)" strokeWidth="22" strokeLinecap="round"/>

    {/* ── Band inner shine ── */}
    <path d="M195 352 Q230 340 260 338 Q290 340 325 352"
      fill="none" stroke="#f5d98a" strokeWidth="5" strokeLinecap="round" opacity="0.5"/>

    {/* ── Diamond base (pavilion) ── */}
    <polygon points="260,310 230,275 260,245 290,275"
      fill="url(#diamondBase)" stroke="#e8d98a" strokeWidth="0.8"/>

    {/* ── Diamond crown left ── */}
    <polygon points="260,245 230,275 220,240 245,218"
      fill="url(#diamondLeft)" stroke="#e8d98a" strokeWidth="0.8"/>

    {/* ── Diamond crown right ── */}
    <polygon points="260,245 290,275 300,240 275,218"
      fill="url(#diamondRight)" stroke="#e8d98a" strokeWidth="0.8"/>

    {/* ── Diamond crown top left ── */}
    <polygon points="260,200 245,218 220,240 238,205"
      fill="url(#diamondTopL)" stroke="#e8d98a" strokeWidth="0.8"/>

    {/* ── Diamond crown top right ── */}
    <polygon points="260,200 275,218 300,240 282,205"
      fill="url(#diamondTopR)" stroke="#e8d98a" strokeWidth="0.8"/>

    {/* ── Diamond table (top face) ── */}
    <polygon points="260,200 238,205 230,220 260,215 290,220 282,205"
      fill="url(#diamondTable)" stroke="#fff" strokeWidth="1"/>

    {/* ── Diamond culet line ── */}
    <line x1="260" y1="310" x2="260" y2="245" stroke="#fff" strokeWidth="0.5" opacity="0.4"/>
    <line x1="230" y1="275" x2="290" y2="275" stroke="#fff" strokeWidth="0.5" opacity="0.4"/>

    {/* ── Setting prongs ── */}
    {[[-16,-8],[-10,16],[10,16],[16,-8]].map(([dx,dy],i) => (
      <ellipse key={i} cx={260+dx} cy={240+dy} rx="5" ry="8"
        fill="url(#goldGrad)" stroke="#f5d98a" strokeWidth="0.8"
        transform={`rotate(${[-20,20,-20,20][i]} ${260+dx} ${240+dy})`}/>
    ))}

    {/* ── Sparkles ── */}
    {[
      [155,185,14], [355,200,10], [130,270,8], [390,255,12],
      [175,145,6],  [340,155,8], [410,310,6], [120,320,7],
    ].map(([x,y,s],i) => (
      <g key={i} transform={`translate(${x},${y})`} opacity="0.7">
        <line x1="0" y1={-s} x2="0" y2={s} stroke="#f5d98a" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1={-s} y1="0" x2={s} y2="0" stroke="#f5d98a" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1={-s*.6} y1={-s*.6} x2={s*.6} y2={s*.6} stroke="#f5d98a" strokeWidth="0.7" strokeLinecap="round"/>
        <line x1={s*.6} y1={-s*.6} x2={-s*.6} y2={s*.6} stroke="#f5d98a" strokeWidth="0.7" strokeLinecap="round"/>
      </g>
    ))}

    {/* ── Small accent gems ── */}
    <polygon points="155,360 148,370 155,378 162,370" fill="#a8d8ea" stroke="#c8eeff" strokeWidth="0.6" opacity="0.8"/>
    <polygon points="365,360 358,370 365,378 372,370" fill="#a8d8ea" stroke="#c8eeff" strokeWidth="0.6" opacity="0.8"/>
    <polygon points="140,310 135,317 140,323 145,317" fill="#f9a8d4" stroke="#ffc8e8" strokeWidth="0.6" opacity="0.7"/>
    <polygon points="380,300 375,307 380,313 385,307" fill="#f9a8d4" stroke="#ffc8e8" strokeWidth="0.6" opacity="0.7"/>

    {/* ── Subtle surface reflection ── */}
    <ellipse cx="260" cy="405" rx="65" ry="8" fill="url(#goldGrad)" opacity="0.12"/>

    {/* ── Gradients ── */}
    <defs>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f5d98a"/>
        <stop offset="50%" stopColor="#c9a84c"/>
        <stop offset="100%" stopColor="#8b6914"/>
      </linearGradient>
      <linearGradient id="goldGradLight" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#8b6914"/>
        <stop offset="50%" stopColor="#f5d98a"/>
        <stop offset="100%" stopColor="#8b6914"/>
      </linearGradient>
      <linearGradient id="diamondBase" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#b8d8f0" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#6aa8d0" stopOpacity="0.7"/>
      </linearGradient>
      <linearGradient id="diamondLeft" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#daeeff"/>
        <stop offset="100%" stopColor="#8ac0e0"/>
      </linearGradient>
      <linearGradient id="diamondRight" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95"/>
        <stop offset="100%" stopColor="#a8d0f0"/>
      </linearGradient>
      <linearGradient id="diamondTopL" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#eef8ff"/>
        <stop offset="100%" stopColor="#b8dcf8"/>
      </linearGradient>
      <linearGradient id="diamondTopR" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="100%" stopColor="#c8e8ff"/>
      </linearGradient>
      <linearGradient id="diamondTable" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="100%" stopColor="#d0ecff"/>
      </linearGradient>
    </defs>
  </svg>
);

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* ── LEFT PANEL — 65% jewellery visual ─────────────── */}
      <div style={{
        display: 'none',
        width: '65%',
        background: 'linear-gradient(145deg, #0f0e0a 0%, #1a1710 40%, #141208 100%)',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="lg-flex">

        {/* Hex pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='92' viewBox='0 0 80 92' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='40,4 76,24 76,68 40,88 4,68 4,24' fill='none' stroke='%23c9a84c' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 92px',
        }}/>

        {/* Top-left corner glow */}
        <div style={{ position:'absolute', top:'-60px', left:'-60px', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)' }}/>
        {/* Bottom-right corner glow */}
        <div style={{ position:'absolute', bottom:'-80px', right:'-80px', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)' }}/>

        {/* Logo */}
        <div style={{ position:'relative', zIndex:10, textAlign:'center', width:'100%' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:48 }}>
            <div style={{ width:36, height:36, background:'#c9a84c', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.4"/>
                <polyline points="1,5 8,9 15,5" fill="none" stroke="#fff" strokeWidth="0.9"/>
                <line x1="8" y1="9" x2="8" y2="15" stroke="#fff" strokeWidth="0.9"/>
              </svg>
            </div>
            <span style={{ fontSize:20, fontWeight:600, color:'#fff', letterSpacing:'-0.01em' }}>
              Jewel<span style={{ color:'#c9a84c' }}>CMS</span>
            </span>
          </div>

          {/* Diamond ring illustration */}
          <div style={{ margin: '0 auto 40px', maxWidth: 320 }}>
            <JewelleryScene />
          </div>

          {/* Headline */}
          <h2 style={{ fontSize:28, fontWeight:600, color:'#fff', margin:'0 0 12px', letterSpacing:'-0.02em', lineHeight:1.2 }}>
            Manage your<br/>
            <span style={{ color:'#c9a84c' }}>jewellery brand</span><br/>
            with precision
          </h2>
          <p style={{ fontSize:13, color:'#8b8570', maxWidth:320, margin:'0 auto 40px', lineHeight:1.7 }}>
            From diamond specs to boutique appointments — everything your jewellery business needs in one place.
          </p>

          {/* Trust points */}
          <div style={{ display:'flex', flexDirection:'column', gap:12, maxWidth:280, margin:'0 auto' }}>
            {[
              { icon: '💎', text: 'Diamond 4Cs & certifications (IGI, GIA, SGL)' },
              { icon: '📅', text: 'Boutique appointment booking system' },
              { icon: '💬', text: 'WhatsApp enquiry management' },
              { icon: '📍', text: 'Multi-showroom & multi-country support' },
            ].map(item => (
              <div key={item.text} style={{ display:'flex', alignItems:'center', gap:10, textAlign:'left' }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
                <span style={{ fontSize:12, color:'#6b6450', lineHeight:1.4 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom tag */}
          <p style={{ marginTop:40, fontSize:11, color:'#3d3928', letterSpacing:'0.08em', textTransform:'uppercase' }}>
            Built by KenTech Global · GCC Edition
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — 35% login form ──────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        background: '#ffffff',
      }}
        className="login-right">

        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Mobile logo */}
          <div className="lg-hide" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:36 }}>
            <div style={{ width:32, height:32, background:'#c9a84c', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.4"/>
              </svg>
            </div>
            <span style={{ fontSize:18, fontWeight:600, color:'#1a1a1a' }}>
              Jewel<span style={{ color:'#c9a84c' }}>CMS</span>
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontSize:26, fontWeight:700, color:'#111', margin:'0 0 6px', letterSpacing:'-0.02em' }}>
              Welcome back
            </h1>
            <p style={{ fontSize:13, color:'#999', margin:0 }}>
              Sign in to your admin account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:6 }}>
                Email address
              </label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@kentech.dev"
                style={{
                  width:'100%', border:'1.5px solid #e5e5e5', borderRadius:10,
                  padding:'11px 14px', fontSize:14, color:'#1a1a1a', outline:'none',
                  transition:'border-color .15s', boxSizing:'border-box',
                  fontFamily:'Inter, sans-serif',
                }}
                onFocus={e => e.target.style.borderColor = '#c9a84c'}
                onBlur={e => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:6 }}>
                Password
              </label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width:'100%', border:'1.5px solid #e5e5e5', borderRadius:10,
                    padding:'11px 42px 11px 14px', fontSize:14, color:'#1a1a1a', outline:'none',
                    transition:'border-color .15s', boxSizing:'border-box',
                    fontFamily:'Inter, sans-serif',
                  }}
                  onFocus={e => e.target.style.borderColor = '#c9a84c'}
                  onBlur={e => e.target.style.borderColor = '#e5e5e5'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#bbb', padding:0 }}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width:'100%', background: loading ? '#d4aa5a' : '#c9a84c',
                color:'#000', border:'none', borderRadius:10, padding:'13px',
                fontSize:14, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                transition:'background .15s, transform .1s', letterSpacing:'0.01em',
                fontFamily:'Inter, sans-serif',
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#b8972e'; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#c9a84c'; }}>
              {loading ? (
                <>
                  <span style={{ width:16, height:16, border:'2px solid rgba(0,0,0,0.2)', borderTopColor:'#000', borderRadius:'50%', display:'inline-block', animation:'spin .7s linear infinite' }}/>
                  Signing in…
                </>
              ) : 'Sign in →'}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop:32, paddingTop:24, borderTop:'1px solid #f0f0f0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e' }}/>
              <span style={{ fontSize:11, color:'#bbb' }}>System operational</span>
            </div>
            <p style={{ fontSize:11, color:'#ccc', margin:0 }}>
              JewelleryCMS · KenTech Global · GCC Edition
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          .lg-flex { display: flex !important; }
          .lg-hide { display: none !important; }
          .login-right { background: #fafaf8 !important; }
        }
      `}</style>
    </div>
  );
}
