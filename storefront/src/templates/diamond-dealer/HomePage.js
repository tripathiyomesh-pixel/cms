'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Shield, Globe, TrendingUp } from 'lucide-react';

const SHAPES = ['Round','Oval','Princess','Cushion','Pear','Emerald','Marquise','Asscher','Radiant','Heart'];
const COLORS = ['D','E','F','G','H','I','J','K'];
const CLARITIES = ['FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2'];

function DiamondSearch() {
  const router = useRouter();
  const [f, setF] = useState({ type:'NATURAL', shape:'', color_from:'D', clarity_from:'IF', size_from:'', size_to:'', price_from:'', price_to:'' });
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  const search = () => {
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k,v]) => { if(v) params.set(k,v); });
    router.push(`/diamonds?${params}`);
  };

  return (
    <div style={{ background:'#0f172a', padding:'80px 40px', paddingTop:160 }}>
      <div style={{ maxWidth:960, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:50, padding:'6px 16px', marginBottom:20 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#3b82f6' }}/>
            <span style={{ color:'#93bbfc', fontSize:12, fontWeight:500 }}>Live inventory — 10,000+ certified diamonds</span>
          </div>
          <h1 style={{ color:'#f8fafc', fontSize:'clamp(36px,5vw,64px)', fontWeight:700, lineHeight:1.1, marginBottom:12, letterSpacing:'-0.03em' }}>
            Find Your Perfect<br/>
            <span style={{ color:'#3b82f6' }}>Diamond</span>
          </h1>
          <p style={{ color:'#64748b', fontSize:16, maxWidth:500, margin:'0 auto' }}>
            GIA & IGI certified. Natural and lab-grown. Compare up to 4 diamonds side by side.
          </p>
        </div>

        {/* Search panel */}
        <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:16, overflow:'hidden' }}>
          {/* Type tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #334155' }}>
            {[['NATURAL','Natural Diamonds'],['LAB_GROWN','Lab-Grown Diamonds']].map(([v,l])=>(
              <button key={v} onClick={()=>set('type',v)}
                style={{ flex:1, padding:'16px 24px', fontSize:14, fontWeight:500, border:'none', cursor:'pointer', transition:'all .2s',
                  background:f.type===v?'#1d4ed8':'transparent',
                  color:f.type===v?'#fff':'#64748b',
                  borderBottom:f.type===v?'2px solid #3b82f6':'2px solid transparent' }}>
                {l}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div style={{ padding:24 }}>
            {/* Shape */}
            <div style={{ marginBottom:20 }}>
              <div style={{ color:'#94a3b8', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:500, marginBottom:10 }}>Shape</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {SHAPES.map(s=>(
                  <button key={s} onClick={()=>set('shape',f.shape===s?'':s)}
                    style={{ padding:'8px 14px', borderRadius:8, border:`1px solid ${f.shape===s?'#3b82f6':'#334155'}`, background:f.shape===s?'#1d4ed8':'transparent', color:f.shape===s?'#fff':'#94a3b8', fontSize:13, cursor:'pointer', transition:'all .15s' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color + Clarity + Carat range */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:16, marginBottom:20 }}>
              {[
                { label:'Color from', opts:COLORS, key:'color_from' },
                { label:'Clarity from', opts:CLARITIES, key:'clarity_from' },
              ].map(f2=>(
                <div key={f2.key}>
                  <div style={{ color:'#94a3b8', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:500, marginBottom:8 }}>{f2.label}</div>
                  <select value={f[f2.key]} onChange={e=>set(f2.key,e.target.value)}
                    style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'10px 12px', color:'#f8fafc', fontSize:14, outline:'none' }}>
                    {f2.opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              {[['Min carat','size_from','0.30'],['Max carat','size_to','3.00']].map(([l,k,ph])=>(
                <div key={k}>
                  <div style={{ color:'#94a3b8', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:500, marginBottom:8 }}>{l}</div>
                  <input type="number" step="0.1" value={f[k]} onChange={e=>set(k,e.target.value)} placeholder={ph}
                    style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'10px 12px', color:'#f8fafc', fontSize:14, outline:'none' }}/>
                </div>
              ))}
            </div>

            <button onClick={search}
              style={{ width:'100%', background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', color:'#fff', padding:'16px', borderRadius:10, border:'none', fontSize:15, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <Search size={18}/> Search Diamonds
            </button>
          </div>
        </div>

        {/* Quick links below search */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginTop:16 }}>
          {[
            { l:'Best value D-F VS', href:'/diamonds?color_from=D&color_to=F&clarity_from=VS1' },
            { l:'1ct+ Round Excellent', href:'/diamonds?shape=Round&size_from=1&cut=Excellent' },
            { l:'Lab-grown under $3K', href:'/diamonds?type=LAB_GROWN&price_total_to=3000' },
            { l:'GIA certified only', href:'/diamonds?cert_lab=GIA' },
          ].map(q=>(
            <Link key={q.l} href={q.href}
              style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:'12px 16px', color:'#94a3b8', fontSize:12, textDecoration:'none', textAlign:'center', transition:'all .2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='#3b82f6'; e.currentTarget.style.color='#93bbfc'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='#334155'; e.currentTarget.style.color='#94a3b8'; }}>
              {q.l}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrustBadges() {
  return (
    <div style={{ background:'#1e293b', borderTop:'1px solid #334155', padding:'24px 40px' }}>
      <div style={{ maxWidth:960, margin:'0 auto', display:'flex', justifyContent:'center', gap:48, flexWrap:'wrap' }}>
        {[
          { icon:<Shield size={16}/>, label:'GIA & IGI Certified', sub:'Every stone verified' },
          { icon:<Globe size={16}/>, label:'RapNet Integrated', sub:'Live global inventory' },
          { icon:<TrendingUp size={16}/>, label:'Rapaport Pricing', sub:'Transparent market rates' },
          { icon:<Shield size={16}/>, label:'Certificate Verify', sub:'Public verification page' },
        ].map(b=>(
          <div key={b.label} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ color:'#3b82f6' }}>{b.icon}</div>
            <div>
              <div style={{ color:'#f8fafc', fontSize:13, fontWeight:500 }}>{b.label}</div>
              <div style={{ color:'#64748b', fontSize:11 }}>{b.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickLinks() {
  return (
    <section style={{ background:'#0f172a', padding:'60px 40px' }}>
      <div style={{ maxWidth:960, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {[
          { title:'Certificate Verify', desc:'Verify any GIA or IGI certificate number instantly.', href:'/verify', cta:'Verify now' },
          { title:'Mountings Catalogue', desc:'Browse settings. Pick a diamond and mounting together.', href:'/mountings', cta:'View mountings' },
          { title:'Custom Order', desc:'Need something specific? Contact us with your requirements.', href:'/custom', cta:'Get started' },
        ].map(c=>(
          <Link key={c.title} href={c.href}
            style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:14, padding:'28px 24px', textDecoration:'none', display:'block', transition:'all .2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor='#3b82f6'; e.currentTarget.style.transform='translateY(-2px)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='#334155'; e.currentTarget.style.transform='none'; }}>
            <h3 style={{ color:'#f8fafc', fontSize:16, fontWeight:600, marginBottom:8 }}>{c.title}</h3>
            <p style={{ color:'#64748b', fontSize:13, lineHeight:1.5, marginBottom:16 }}>{c.desc}</p>
            <span style={{ color:'#3b82f6', fontSize:13, fontWeight:500 }}>{c.cta} →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function DiamondDealerHomePage() {
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh' }}>
      <DiamondSearch/>
      <TrustBadges/>
      <QuickLinks/>
    </div>
  );
}
