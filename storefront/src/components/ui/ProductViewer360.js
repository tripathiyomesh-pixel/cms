'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

/**
 * 360° Product Viewer
 * 
 * Usage: Pass array of frame images (e.g. 36 frames = 10° per frame)
 * User drags left/right to rotate
 * Fallback: single image with zoom if no frames
 */
export default function ProductViewer360({ frames = [], mainImage, alt = 'Product' }) {
  const [frameIdx,  setFrameIdx]  = useState(0);
  const [dragging,  setDragging]  = useState(false);
  const [startX,    setStartX]    = useState(0);
  const [zoom,      setZoom]      = useState(1);
  const [fullscreen,setFullscreen]= useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [mode,      setMode]      = useState(frames.length > 1 ? '360' : 'zoom');
  const containerRef = useRef(null);

  const total = frames.length;

  const onMouseDown = useCallback((e) => {
    if (mode !== '360') return;
    setDragging(true);
    setStartX(e.clientX || e.touches?.[0]?.clientX || 0);
  }, [mode]);

  const onMouseMove = useCallback((e) => {
    if (!dragging || mode !== '360') return;
    const x    = e.clientX || e.touches?.[0]?.clientX || 0;
    const diff = x - startX;
    if (Math.abs(diff) > 8) {
      const step = diff > 0 ? -1 : 1;
      setFrameIdx(i => (i + step + total) % total);
      setStartX(x);
    }
  }, [dragging, startX, total, mode]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [onMouseUp]);

  const currentSrc = frames.length > 0 ? frames[frameIdx] : mainImage;

  const zoomIn  = () => setZoom(z => Math.min(3, z + 0.5));
  const zoomOut = () => setZoom(z => Math.max(1, z - 0.5));
  const reset   = () => { setFrameIdx(0); setZoom(1); };

  const containerStyle = {
    position:'relative', background:'#f5ede2', overflow:'hidden',
    aspectRatio:'1', userSelect:'none',
    cursor: mode==='360' ? (dragging?'grabbing':'grab') : 'zoom-in',
  };

  const imgStyle = {
    width:'100%', height:'100%', objectFit:'cover',
    transform:`scale(${zoom})`,
    transition: dragging ? 'none' : 'transform .2s ease',
    pointerEvents:'none',
  };

  return (
    <div style={{ position:'relative' }}>
      <div ref={containerRef} style={containerStyle}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove}
        onTouchStart={e=>onMouseDown(e.touches[0])}
        onTouchMove={e=>onMouseMove(e.touches[0])}
        onClick={mode==='zoom'?zoomIn:undefined}>

        {currentSrc && (
          <img src={currentSrc} alt={alt} style={imgStyle}
            onLoad={() => setImgLoaded(true)}
            draggable={false}/>
        )}

        {/* 360 indicator */}
        {mode === '360' && (
          <div style={{ position:'absolute', top:12, left:12, background:'rgba(26,26,26,0.7)', borderRadius:6, padding:'4px 10px', display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:10, color:'#fff', fontWeight:600, letterSpacing:'0.1em' }}>360°</span>
          </div>
        )}

        {/* Frame indicator dots */}
        {mode === '360' && total > 1 && (
          <div style={{ position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)', display:'flex', gap:3 }}>
            {Array(Math.min(12, total)).fill(0).map((_,i) => {
              const active = Math.floor(frameIdx / total * 12) === i;
              return <div key={i} style={{ width:active?12:4, height:4, borderRadius:2, background:active?'#b8860b':'rgba(255,255,255,0.5)', transition:'all .2s' }}/>;
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', marginTop:8 }}>
        <div style={{ display:'flex', gap:6 }}>
          {frames.length > 1 && (
            <>
              <button onClick={()=>setMode('360')}
                style={{ padding:'5px 10px', fontSize:10, fontWeight:600, border:'1px solid', borderColor:mode==='360'?'#b8860b':'#e5e0d8', background:mode==='360'?'#fdf8f3':'#fff', color:mode==='360'?'#b8860b':'#6b6b6b', cursor:'pointer', borderRadius:4 }}>
                360°
              </button>
              <button onClick={()=>setMode('zoom')}
                style={{ padding:'5px 10px', fontSize:10, fontWeight:600, border:'1px solid', borderColor:mode==='zoom'?'#b8860b':'#e5e0d8', background:mode==='zoom'?'#fdf8f3':'#fff', color:mode==='zoom'?'#b8860b':'#6b6b6b', cursor:'pointer', borderRadius:4 }}>
                Zoom
              </button>
            </>
          )}
        </div>
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={zoomOut} disabled={zoom<=1} style={{ padding:6, border:'1px solid #e5e0d8', background:'#fff', cursor:zoom<=1?'not-allowed':'pointer', borderRadius:4, opacity:zoom<=1?0.4:1 }}><ZoomOut size={13} color="#4a4a4a"/></button>
          <button onClick={zoomIn}  disabled={zoom>=3} style={{ padding:6, border:'1px solid #e5e0d8', background:'#fff', cursor:zoom>=3?'not-allowed':'pointer', borderRadius:4, opacity:zoom>=3?0.4:1 }}><ZoomIn  size={13} color="#4a4a4a"/></button>
          <button onClick={reset} style={{ padding:6, border:'1px solid #e5e0d8', background:'#fff', cursor:'pointer', borderRadius:4 }}><RotateCcw size={13} color="#4a4a4a"/></button>
        </div>
      </div>

      {mode === '360' && frames.length > 1 && (
        <p style={{ fontSize:10, color:'#6b6b6b', textAlign:'center', marginTop:4, letterSpacing:'0.05em' }}>← Drag to rotate →</p>
      )}
    </div>
  );
}
