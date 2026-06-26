'use client';
import { useState } from 'react';
import { Award, ExternalLink, X, Shield, CheckCircle } from 'lucide-react';

const LAB_COLORS = {
  GIA:   { bg:'#e8f4fd', border:'#90caf9', text:'#1565c0', badge:'GIA' },
  IGI:   { bg:'#f3e5f5', border:'#ce93d8', text:'#6a1b9a', badge:'IGI' },
  HRD:   { bg:'#e8f5e9', border:'#a5d6a7', text:'#2e7d32', badge:'HRD' },
  AGS:   { bg:'#fff3e0', border:'#ffcc80', text:'#e65100', badge:'AGS' },
  GCAL:  { bg:'#fce4ec', border:'#f48fb1', text:'#880e4f', badge:'GCAL' },
};

const LAB_URLS = {
  GIA:  (n) => `https://www.gia.edu/report-check?reportno=${n}`,
  IGI:  (n) => `https://www.igiworldwide.com/verify.php?r=${n}`,
  HRD:  (n) => `https://www.hrdantwerp.com/en/services/certificate-verification?certificate_number=${n}`,
};

export default function CertificateViewer({ certifications = [], productName = '' }) {
  const [selected, setSelected] = useState(null);

  if (!certifications?.length) return null;

  const certs = Array.isArray(certifications) ? certifications
    : typeof certifications === 'string' ? JSON.parse(certifications)
    : [];

  if (!certs.length) return null;

  return (
    <div style={{ marginTop:24 }}>
      <h3 style={{ fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#4a4a4a', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
        <Shield size={13} style={{ color:'var(--color-accent)' }}/> Certifications
      </h3>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {certs.map((cert, i) => {
          const lab    = cert.lab || cert.laboratory || 'GIA';
          const number = cert.number || cert.cert_number || cert.certificate_number || '';
          const c      = LAB_COLORS[lab] || LAB_COLORS.GIA;
          const verifyUrl = LAB_URLS[lab]?.(number);

          return (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', border:`1px solid ${c.border}`, background:c.bg, borderRadius:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <CheckCircle size={14} style={{ color:c.text }}/>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:c.text, letterSpacing:'0.05em' }}>{lab} Certified</span>
                    {cert.shape && <span style={{ fontSize:9, color:c.text, opacity:0.7 }}>· {cert.shape}</span>}
                  </div>
                  {number && <p style={{ fontSize:10, color:c.text, opacity:0.8, marginTop:1, fontFamily:'monospace' }}>#{number}</p>}
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {verifyUrl && (
                  <a href={verifyUrl} target="_blank" rel="noreferrer"
                    style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', background:'#fff', border:`1px solid ${c.border}`, color:c.text, fontSize:10, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', textDecoration:'none', borderRadius:4 }}>
                    <ExternalLink size={10}/> Verify
                  </a>
                )}
                <button onClick={()=>setSelected(cert)}
                  style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', background:c.text, color:'#fff', border:'none', fontSize:10, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer', borderRadius:4 }}>
                  <Award size={10}/> View
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificate modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.7)', padding:24 }}>
          <div style={{ background:'#fff', maxWidth:600, width:'100%', maxHeight:'90vh', overflow:'auto', borderRadius:4 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid #e5e0d8' }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, color:'var(--color-text)' }}>
                {selected.lab} Certificate
              </h3>
              <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b6b6b' }}><X size={18}/></button>
            </div>
            <div style={{ padding:24 }}>
              {/* Certificate details table */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                {[
                  ['Laboratory',  selected.lab],
                  ['Report No',   selected.number||selected.cert_number||'—'],
                  ['Shape',       selected.shape||'—'],
                  ['Carat',       selected.carat||selected.weight||'—'],
                  ['Color',       selected.color||'—'],
                  ['Clarity',     selected.clarity||'—'],
                  ['Cut',         selected.cut||'—'],
                  ['Polish',      selected.polish||'—'],
                  ['Symmetry',    selected.symmetry||'—'],
                  ['Fluorescence',selected.fluorescence||'—'],
                ].filter(([,v])=>v&&v!=='—').map(([label,value])=>(
                  <div key={label} style={{ padding:'10px 12px', background:'#f9fafb', borderRadius:4 }}>
                    <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#9ca3af', marginBottom:3 }}>{label}</p>
                    <p style={{ fontSize:14, fontWeight:500, color:'var(--color-text)' }}>{value}</p>
                  </div>
                ))}
              </div>
              {/* Verify button */}
              {LAB_URLS[selected.lab] && (selected.number||selected.cert_number) && (
                <a href={LAB_URLS[selected.lab](selected.number||selected.cert_number)} target="_blank" rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'13px', background:'var(--color-text)', color:'#fff', textDecoration:'none', fontSize:11, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase' }}>
                  <ExternalLink size={13}/> Verify on {selected.lab} Website
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
