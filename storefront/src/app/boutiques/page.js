'use client';
import { useEffect, useState } from 'react';
import { sfAPI } from '@/lib/api';
import { MapPin, Phone, Clock, Navigation, MessageCircle } from 'lucide-react';

export default function BoutiquesPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(()=>{
    sfAPI.store().then(r=>{
      const locs = r.data.data?.locations||[];
      setLocations(locs);
      if(locs.length) setActive(locs[0]);
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  return (
    <div className="pt-24">
      {/* Hero */}
      <div className="bg-ink-900 py-16 px-4 text-center">
        <p className="text-xs text-gold-400 font-semibold uppercase tracking-widest mb-3">Visit Us</p>
        <h1 className="font-serif text-3xl lg:text-5xl text-white mb-4">Find a Boutique</h1>
        <p className="text-ink-400 text-lg max-w-lg mx-auto">Multiple locations — we are never too far away. Visit us for a private consultation.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_,i)=><div key={i} className="card animate-pulse h-56"/>)}
          </div>
        ) : locations.length===0 ? (
          <div className="text-center py-20">
            <MapPin size={40} className="mx-auto text-ink-200 mb-4"/>
            <p className="text-ink-500 mb-2">Dubai, UAE</p>
            <p className="text-sm text-ink-400 mb-6">Contact us for boutique locations and directions</p>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||''}`} target="_blank" rel="noreferrer" className="btn-gold">
              <MessageCircle size={16}/> WhatsApp for directions
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Location cards */}
            <div className="space-y-4">
              {locations.map(loc=>(
                <div key={loc.id} onClick={()=>setActive(loc)}
                  className={`card p-5 cursor-pointer transition-all hover:shadow-md ${active?.id===loc.id?'border-gold-400 bg-gold-50/30':''}`}>
                  <div className="flex gap-4">
                    {loc.image_url && <img src={loc.image_url} alt={loc.name} className="w-24 h-20 object-cover rounded-xl flex-shrink-0"/>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-ink-700">{loc.name}</h3>
                        {loc.is_primary && <span className="text-[10px] badge badge-gold flex-shrink-0">Main</span>}
                      </div>
                      {loc.area && <p className="text-xs text-gold-600 font-medium mb-2">{loc.area}</p>}
                      {loc.address && <p className="text-xs text-ink-400 mb-2 flex items-start gap-1.5"><MapPin size={11} className="flex-shrink-0 mt-0.5"/>{loc.address}</p>}
                      <div className="flex gap-3 flex-wrap">
                        {loc.phone && <a href={`tel:${loc.phone}`} onClick={e=>e.stopPropagation()} className="text-xs text-ink-500 hover:text-gold-600 flex items-center gap-1"><Phone size={11}/>{loc.phone}</a>}
                        {loc.hours && <span className="text-xs text-ink-400 flex items-center gap-1"><Clock size={11}/>{loc.hours}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-ink-100">
                    {loc.map_url && <a href={loc.map_url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} className="flex-1 text-center text-xs text-blue-600 hover:text-blue-700 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"><Navigation size={11}/>Directions</a>}
                    {loc.whatsapp && <a href={`https://wa.me/${loc.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} className="flex-1 text-center text-xs text-green-700 py-1.5 border border-green-200 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-1"><MessageCircle size={11}/>WhatsApp</a>}
                  </div>
                </div>
              ))}
            </div>

            {/* Map embed */}
            <div className="lg:sticky lg:top-28">
              {active?.map_url ? (
                <div className="card overflow-hidden h-96 lg:h-full min-h-80">
                  <iframe src={active.map_url} width="100%" height="100%" style={{border:0,minHeight:320}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
                </div>
              ) : (
                <div className="card h-96 flex items-center justify-center bg-ink-50">
                  <div className="text-center">
                    <MapPin size={40} className="mx-auto text-ink-300 mb-3"/>
                    <p className="text-sm text-ink-400">Map preview — select a location</p>
                  </div>
                </div>
              )}
              {active && (
                <div className="card p-4 mt-4">
                  <p className="text-sm font-semibold text-ink-700 mb-1">{active.name}</p>
                  {active.address && <p className="text-xs text-ink-400 mb-3">{active.address}</p>}
                  <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||''}`} target="_blank" rel="noreferrer" className="btn-gold w-full justify-center text-sm py-3">
                    <MessageCircle size={15}/> Book appointment at this boutique
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

