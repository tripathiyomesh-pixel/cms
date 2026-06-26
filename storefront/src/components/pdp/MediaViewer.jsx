'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Video, RefreshCw, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

const G = 'var(--color-accent)';
const M = 'var(--color-text-muted)';

function PhotoViewer({ images, onLightbox }) {
  const [active, setActive] = useState(0);
  const prev = () => setActive(i => Math.max(0,i-1));
  const next = () => setActive(i => Math.min(images.length-1,i+1));

  if (!images.length) return (
    <div style={{ position:'relative',aspectRatio:'1',overflow:'hidden',background:'#f5ede2',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ width:'100%',height:'100%',background:'linear-gradient(135deg,#1a1208,#2d1f0e)',display:'flex',alignItems:'center',justifyContent:'center',color:'#b8860b',fontSize:80,fontFamily:'var(--font-heading)',letterSpacing:4 }}>T</div>
    </div>
  );

  return (
    <div>
      <div style={{ position:'relative',aspectRatio:'1',overflow:'hidden',background:'#f5ede2',cursor:'zoom-in' }} onClick={()=>onLightbox&&onLightbox(active)}>
        <img src={images[active]} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 400ms ease' }}
          onMouseEnter={e=>e.target.style.transform='scale(1.03)'}
          onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
        {images.length > 1 && (
          <>
            <button onClick={e=>{e.stopPropagation();prev();}}
              style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',width:36,height:36,background:'rgba(255,255,255,0.9)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <ChevronLeft size={16}/>
            </button>
            <button onClick={e=>{e.stopPropagation();next();}}
              style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',width:36,height:36,background:'rgba(255,255,255,0.9)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <ChevronRight size={16}/>
            </button>
          </>
        )}
        <button onClick={e=>{e.stopPropagation();onLightbox&&onLightbox(active);}}
          style={{ position:'absolute',bottom:12,right:12,background:'rgba(255,255,255,0.88)',border:'none',padding:'6px 8px',cursor:'pointer',display:'flex',alignItems:'center',gap:4 }}>
          <Maximize2 size={12}/><span style={{ fontSize:10 }}>Zoom</span>
        </button>
      </div>
      {images.length > 1 && (
        <div className="thumb-strip">
          {images.map((img,i) => (
            <button key={i} onClick={()=>setActive(i)} className={active===i?'active':''}>
              <img src={img} alt=""/>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoViewer({ src }) {
  const ref = useRef();
  return (
    <div style={{ position:'relative',aspectRatio:'16/9',background:'#000',overflow:'hidden' }}>
      <video ref={ref} src={src} autoPlay muted loop playsInline controls
        style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
    </div>
  );
}

function Viewer360({ frames }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [dragging, setDragging]     = useState(false);
  const [showHint, setShowHint]     = useState(true);
  const startX = useRef(0);
  const autoTimer = useRef(null);

  useEffect(() => {
    if (!frames.length) return;
    autoTimer.current = setInterval(() => {
      setFrameIndex(i => (i + 1) % frames.length);
    }, 80);
    const t = setTimeout(() => clearInterval(autoTimer.current), 3000);
    return () => { clearInterval(autoTimer.current); clearTimeout(t); };
  }, [frames.length]);

  const onMouseDown = (e) => { setDragging(true); startX.current = e.clientX; clearInterval(autoTimer.current); setShowHint(false); };
  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 8) {
      const dir = dx > 0 ? -1 : 1;
      setFrameIndex(i => ((i + dir) + frames.length) % frames.length);
      startX.current = e.clientX;
    }
  }, [dragging, frames.length]);
  const onEnd = () => setDragging(false);

  if (!frames.length) return <div style={{ padding:40,textAlign:'center',color:M }}>No 360° frames available</div>;

  return (
    <div className="viewer-360" onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onEnd} onMouseLeave={onEnd}
      style={{ position:'relative',aspectRatio:'1',overflow:'hidden',background:'#f5ede2',userSelect:'none' }}>
      <img src={frames[frameIndex]} alt="360 view" style={{ width:'100%',height:'100%',objectFit:'cover',pointerEvents:'none',transition:'opacity 50ms' }}/>
      {showHint && <div className="viewer-360-hint">↔ Drag to rotate</div>}
      <div style={{ position:'absolute',bottom:12,left:12,background:'rgba(0,0,0,0.5)',color:'#fff',padding:'3px 10px',fontSize:10,letterSpacing:'0.1em' }}>360°</div>
    </div>
  );
}

// Lightbox
function Lightbox({ images, index, onClose }) {
  const [active, setActive] = useState(index);
  useEffect(() => { setActive(index); }, [index]);
  useEffect(() => {
    const fn = e => { if(e.key==='Escape') onClose(); if(e.key==='ArrowRight') setActive(i=>Math.min(images.length-1,i+1)); if(e.key==='ArrowLeft') setActive(i=>Math.max(0,i-1)); };
    document.addEventListener('keydown',fn);
    return ()=>document.removeEventListener('keydown',fn);
  }, [images.length,onClose]);

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <button onClick={onClose} style={{ position:'absolute',top:20,right:20,background:'none',border:'none',cursor:'pointer',color:'#fff' }}><X size={24}/></button>
      <button onClick={()=>setActive(i=>Math.max(0,i-1))} style={{ position:'absolute',left:20,background:'none',border:'none',cursor:'pointer',color:'#fff' }}><ChevronLeft size={32}/></button>
      <img src={images[active]} alt="" style={{ maxWidth:'90vw',maxHeight:'90vh',objectFit:'contain' }}/>
      <button onClick={()=>setActive(i=>Math.min(images.length-1,i+1))} style={{ position:'absolute',right:20,background:'none',border:'none',cursor:'pointer',color:'#fff' }}><ChevronRight size={32}/></button>
      <div style={{ position:'absolute',bottom:20,left:'50%',transform:'translateX(-50%)',color:'rgba(255,255,255,0.5)',fontSize:12 }}>{active+1} / {images.length}</div>
    </div>
  );
}

export default function MediaViewer({ images = [], videoUrl, frames = [] }) {
  const hasPhotos = images.length > 0;
  const hasVideo  = !!videoUrl;
  const has360    = frames.length > 0;
  const tabs      = [
    hasPhotos && { key:'photos', icon:Camera,    label:'Photos' },
    hasVideo  && { key:'video',  icon:Video,     label:'Video'  },
    has360    && { key:'360',    icon:RefreshCw, label:'360°'   },
  ].filter(Boolean);

  const [tab,       setTab]       = useState(tabs[0]?.key || 'photos');
  const [lightbox,  setLightbox]  = useState(null);

  return (
    <div>
      {tabs.length > 1 && (
        <div style={{ display:'flex',gap:0,marginBottom:12,borderBottom:'1px solid var(--color-border)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{ display:'flex',alignItems:'center',gap:6,padding:'10px 16px',border:'none',background:'none',cursor:'pointer',fontSize:11,fontWeight:tab===t.key?700:400,letterSpacing:'0.1em',textTransform:'uppercase',color:tab===t.key?G:M,borderBottom:tab===t.key?`2px solid ${G}`:'2px solid transparent',marginBottom:-1,transition:'all 150ms ease' }}>
              <t.icon size={13}/>{t.label}
            </button>
          ))}
        </div>
      )}
      {tab === 'photos' && <PhotoViewer images={hasPhotos?images:[]} onLightbox={setLightbox}/>}
      {tab === 'video'  && <VideoViewer src={videoUrl}/>}
      {tab === '360'    && <Viewer360 frames={frames}/>}
      {lightbox !== null && <Lightbox images={images} index={lightbox} onClose={()=>setLightbox(null)}/>}
    </div>
  );
}