'use client';
import { useState } from 'react';
import { certAPI } from '@/lib/api';
import { Search, CheckCircle, XCircle, Shield, ExternalLink } from 'lucide-react';

const GOLD = 'var(--color-accent)';
const TEXT = 'var(--color-text)';
const MUTED = 'var(--color-text-muted)';
const BG = 'var(--color-bg)';
const BORDER = '#e5e0d8';

export default function VerifyPage() {
  const [certNo, setCertNo]   = useState('');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleVerify = async () => {
    if (!certNo.trim()) return;
    setLoading(true); setResult(null); setError('');
    try {
      const r = await certAPI.verify(certNo.trim());
      setResult(r.data.data);
    } catch (e) {
      setError(e.response?.status === 404
        ? 'Certificate not found. Please check the number and try again.'
        : 'Verification failed. Please try again.');
    }
    setLoading(false);
  };

  const SpecRow = ({ label, value, mono }) => (
    <div style={{ padding:'12px 0', borderBottom:`1px solid ${BORDER}`, display:'grid', gridTemplateColumns:'140px 1fr', gap:16 }}>
      <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:MUTED }}>{label}</span>
      <span style={{ fontSize:13, color:TEXT, fontWeight:500, ...(mono?{fontFamily:"'Courier New',monospace"}:{}) }}>{value}</span>
    </div>
  );

  return (
    <div style={{ background:BG, minHeight:'100vh' }}>
      {/* Hero */}
      <div style={{ background:'var(--color-text)', color:'#fff', textAlign:'center', padding:'72px 24px 56px', position:'relative' }}>
        <div style={{ position:'absolute', top:28, left:28, width:40, height:40, borderTop:`1px solid rgba(184,134,11,0.4)`, borderLeft:`1px solid rgba(184,134,11,0.4)` }}/>
        <div style={{ position:'absolute', top:28, right:28, width:40, height:40, borderTop:`1px solid rgba(184,134,11,0.4)`, borderRight:`1px solid rgba(184,134,11,0.4)` }}/>
        <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:64, height:64, border:`1px solid rgba(184,134,11,0.4)`, marginBottom:20 }}>
          <Shield size={28} color={GOLD}/>
        </div>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:GOLD, marginBottom:14 }}>Tejori · Authenticity</p>
        <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:400, color:'#fff', letterSpacing:'0.06em', marginBottom:12 }}>Certificate Verification</h1>
        <div style={{ width:40, height:1, background:GOLD, margin:'0 auto 16px' }}/>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', maxWidth:480, margin:'0 auto', lineHeight:1.8 }}>
          Enter a GIA, IGI, or gemstone certificate number to verify authenticity
        </p>
      </div>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'48px 32px 80px' }}>
        {/* Search card */}
        <div style={{ border:`1px solid ${BORDER}`, padding:'28px 32px', background:BG, marginBottom:24 }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:MUTED, marginBottom:16 }}>Certificate Number</p>
          <div style={{ display:'flex', gap:12 }}>
            <input
              type="text"
              value={certNo}
              onChange={e => setCertNo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              placeholder="e.g. 2141234567"
              style={{
                flex:1, padding:'13px 16px', border:`1px solid ${BORDER}`, fontSize:15, outline:'none', background:'#f9f7f4',
                fontFamily:"'Courier New',monospace", letterSpacing:'0.06em', color:TEXT,
                transition:'border-color 150ms ease',
              }}
              onFocus={e => e.target.style.borderColor = GOLD}
              onBlur={e => e.target.style.borderColor = BORDER}
            />
            <button
              onClick={handleVerify}
              disabled={loading || !certNo.trim()}
              style={{
                padding:'13px 28px', background:GOLD, color:'#fff', border:'none', cursor:'pointer',
                fontSize:11, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase',
                display:'flex', alignItems:'center', gap:8,
                opacity:loading || !certNo.trim() ? 0.5 : 1, transition:'opacity 200ms ease',
              }}
            >
              <Search size={15}/>
              {loading ? 'Checking…' : 'Verify'}
            </button>
          </div>
          <p style={{ fontSize:11, color:MUTED, marginTop:10 }}>
            Supports GIA, IGI, HRD diamond certificates and GRS, SSEF, Gübelin gemstone certificates
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ border:'1px solid #fecaca', background:'#fef2f2', padding:'20px 24px', display:'flex', alignItems:'flex-start', gap:12, marginBottom:24 }}>
            <XCircle size={20} color="#dc2626" style={{ flexShrink:0, marginTop:1 }}/>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:'#dc2626', marginBottom:4 }}>Not found</p>
              <p style={{ fontSize:12, color:'#ef4444' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ border:`1px solid #c8e6c9`, background:'#f1f8f1', padding:'28px 32px', marginBottom:24 }}>
            {/* Verified header */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24, paddingBottom:20, borderBottom:'1px solid #c8e6c9' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:48, height:48, background:'#e8f5e9', border:'1px solid #c8e6c9', flexShrink:0 }}>
                <CheckCircle size={22} color="#2e7d32"/>
              </div>
              <div>
                <p style={{ fontSize:15, fontWeight:600, color:'#1b5e20', marginBottom:2 }}>Certificate Verified</p>
                <p style={{ fontSize:12, color:'#4caf50' }}>This certificate exists in our authenticated database</p>
              </div>
            </div>

            {/* Specs */}
            <div>
              {result.product_name && <SpecRow label="Product" value={result.product_name}/>}
              {result.sku && <SpecRow label="SKU" value={result.sku} mono/>}
              {(result.cert_lab||result.primary_cert_lab) && <SpecRow label="Grading Lab" value={result.cert_lab||result.primary_cert_lab}/>}
              {(result.cert_number||result.primary_cert_no) && <SpecRow label="Certificate No." value={result.cert_number||result.primary_cert_no} mono/>}
              {result.shape && <SpecRow label="Shape" value={result.shape}/>}
              {result.carat && <SpecRow label="Carat Weight" value={`${Number(result.carat).toFixed(2)} ct`}/>}
              {result.color && <SpecRow label="Color Grade" value={result.color} mono/>}
              {result.clarity && <SpecRow label="Clarity Grade" value={result.clarity} mono/>}
              {result.cut && <SpecRow label="Cut Grade" value={result.cut}/>}
              {result.polish && <SpecRow label="Polish" value={result.polish}/>}
              {result.symmetry && <SpecRow label="Symmetry" value={result.symmetry}/>}
              {result.fluorescence && <SpecRow label="Fluorescence" value={result.fluorescence}/>}
              {result.diamond_type && <SpecRow label="Diamond Type" value={result.diamond_type==='LAB_GROWN'?'Lab-Grown Diamond':'Natural Diamond'}/>}
              {result.gemstone_type && <SpecRow label="Gemstone" value={result.gemstone_type}/>}
              {result.country_of_origin && <SpecRow label="Country of Origin" value={result.country_of_origin}/>}
            </div>

            {result.cert_url && (
              <a href={result.cert_url} target="_blank" rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:20, fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'#2e7d32', textDecoration:'none', border:'1px solid #c8e6c9', padding:'10px 20px', transition:'border-color 150ms ease' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#2e7d32'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#c8e6c9'}
              >
                <ExternalLink size={13}/>
                View on {result.cert_lab||result.primary_cert_lab} website
              </a>
            )}
          </div>
        )}

        {/* How it works */}
        {!result && !error && (
          <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:40, marginTop:8 }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:MUTED, marginBottom:32, textAlign:'center' }}>How it works</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
              {[
                ['01','Enter certificate number','Find it on your stone grading report or jewellery paperwork'],
                ['02','Instant verification','Our system checks the certificate against our authenticated database'],
                ['03','View full report','See complete stone specifications, lab grading, and origin details'],
              ].map(([n, title, desc]) => (
                <div key={n} style={{ textAlign:'center', padding:'24px 16px', border:`1px solid ${BORDER}` }}>
                  <div style={{ fontFamily:'var(--font-heading)', fontSize:28, color:GOLD, marginBottom:12, opacity:0.7 }}>{n}</div>
                  <p style={{ fontSize:12, fontWeight:600, color:TEXT, marginBottom:8, letterSpacing:'0.04em' }}>{title}</p>
                  <p style={{ fontSize:11, color:MUTED, lineHeight:1.7 }}>{desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop:40, padding:'20px 24px', background:'#f9f7f4', border:`1px solid ${BORDER}`, display:'flex', alignItems:'flex-start', gap:12 }}>
              <Shield size={16} color={GOLD} style={{ flexShrink:0, marginTop:2 }}/>
              <p style={{ fontSize:12, color:MUTED, lineHeight:1.8 }}>
                <strong style={{ color:TEXT }}>Tejori Authenticity Guarantee.</strong> All our diamonds and gemstones are certified by world-recognised grading laboratories including GIA, IGI, HRD, GRS, and Gübelin. Certificate numbers are registered in our system at point of sale.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}