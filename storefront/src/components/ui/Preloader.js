'use client';
import { useEffect, useState } from 'react';

const SPINNERS = {
  spinner:   () => <div style={S.spinner}><div style={S.spinnerInner}/></div>,
  dual_ring: () => <div style={S.dualRing}/>,
  dots:      () => <div style={S.dotsWrap}>{[0,1,2].map(i=><div key={i} style={{...S.dot,animationDelay:`${i*0.15}s`}}/>)}</div>,
  bars:      () => <div style={S.barsWrap}>{[0,1,2].map(i=><div key={i} style={{...S.bar,animationDelay:`${i*0.1}s`}}/>)}</div>,
  pulse:     () => <div style={S.pulse}/>,
  ripple:    () => <div style={S.rippleWrap}><div style={{...S.ripple,animationDelay:'0s'}}/><div style={{...S.ripple,animationDelay:'-0.5s'}}/></div>,
  diamond:   () => <div style={S.diamondWrap}><div style={S.diamond}/>  </div>,
};

export default function Preloader({ color = '#c9a84c', style = 'diamond', logo }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const SpinnerComponent = SPINNERS[style] || SPINNERS.diamond;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24,
      animation: visible ? 'none' : 'fadeOut .3s ease forwards',
    }}>
      {logo && <img src={logo} alt="Logo" style={{ height: 48, objectFit: 'contain', opacity: 0.9 }}/>}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.6} }
        @keyframes ripple { 0%{transform:scale(0);opacity:1} 100%{transform:scale(1);opacity:0} }
        @keyframes bounce { 0%,80%,100%{transform:scaleY(0.4)} 40%{transform:scaleY(1)} }
        @keyframes dots { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        @keyframes shimmer { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes fadeOut { to{opacity:0;pointer-events:none} }
      `}</style>
      <div style={{ color }}>
        <SpinnerComponent/>
      </div>
      <p style={{ fontSize: 10, letterSpacing: '0.3em', color: '#666', textTransform: 'uppercase' }}>Loading</p>
    </div>
  );
}

const C = (color = '#c9a84c') => color;
const S = {
  spinner:     { width:48,height:48,border:'4px solid #222',borderTop:'4px solid #c9a84c',borderRadius:'50%',animation:'spin 0.8s linear infinite' },
  spinnerInner:{ display:'none' },
  dualRing:    { width:48,height:48,border:'4px solid transparent',borderTopColor:'#c9a84c',borderBottomColor:'#c9a84c',borderRadius:'50%',animation:'spin 1s linear infinite' },
  dotsWrap:    { display:'flex',gap:8 },
  dot:         { width:10,height:10,borderRadius:'50%',background:'#c9a84c',animation:'dots 1.2s ease-in-out infinite' },
  barsWrap:    { display:'flex',gap:4,alignItems:'center',height:40 },
  bar:         { width:6,height:30,background:'#c9a84c',borderRadius:2,animation:'bounce 1.2s ease-in-out infinite' },
  pulse:       { width:40,height:40,borderRadius:'50%',background:'#c9a84c',animation:'pulse 1.2s ease-in-out infinite' },
  rippleWrap:  { position:'relative',width:56,height:56 },
  ripple:      { position:'absolute',inset:0,borderRadius:'50%',border:'3px solid #c9a84c',animation:'ripple 1.2s cubic-bezier(0,0.2,0.8,1) infinite' },
  diamondWrap: { display:'flex',alignItems:'center',justifyContent:'center' },
  diamond:     { width:24,height:24,background:'#c9a84c',transform:'rotate(45deg)',animation:'pulse 1.4s ease-in-out infinite' },
};
