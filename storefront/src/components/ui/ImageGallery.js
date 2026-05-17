'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

export default function ImageGallery({ images = [], alt = '' }) {
  const [current, setCurrent] = useState(0);
  const [zoomed,  setZoomed]  = useState(false);

  const imgs = images.filter(Boolean);
  if (!imgs.length) return (
    <div className="aspect-square bg-gradient-to-br from-ink-50 to-ink-100 rounded-2xl flex items-center justify-center">
      <span className="text-6xl">💎</span>
    </div>
  );

  const prev = () => setCurrent(c => (c - 1 + imgs.length) % imgs.length);
  const next = () => setCurrent(c => (c + 1) % imgs.length);

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-ink-50 group">
          <img src={imgs[current]?.file_url || imgs[current]} alt={alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
          <button onClick={() => setZoomed(true)}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
            <ZoomIn size={16} className="text-ink-600"/>
          </button>
          {imgs.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                <ChevronLeft size={16} className="text-ink-600"/>
              </button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                <ChevronRight size={16} className="text-ink-600"/>
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {imgs.map((_,i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`h-1.5 rounded-full transition-all ${i === current ? 'w-4 bg-gold-500' : 'w-1.5 bg-white/60'}`}/>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {imgs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {imgs.map((img, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === current ? 'border-gold-500' : 'border-transparent hover:border-ink-200'}`}>
                <img src={img?.file_url || img} alt={`${alt} ${i+1}`} className="w-full h-full object-cover"/>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {zoomed && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setZoomed(false)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
            <X size={20}/>
          </button>
          <img src={imgs[current]?.file_url || imgs[current]} alt={alt}
            className="max-w-full max-h-full object-contain rounded-lg" onClick={e => e.stopPropagation()}/>
          {imgs.length > 1 && (
            <>
              <button onClick={e=>{e.stopPropagation();prev();}} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20"><ChevronLeft size={20}/></button>
              <button onClick={e=>{e.stopPropagation();next();}} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20"><ChevronRight size={20}/></button>
            </>
          )}
        </div>
      )}
    </>
  );
}
