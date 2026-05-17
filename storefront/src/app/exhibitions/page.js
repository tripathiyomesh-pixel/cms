'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock, Star } from 'lucide-react';

function Countdown({ targetDate }) {
  const [time, setTime] = useState({ d:0, h:0, m:0, s:0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return;
      setTime({ d:Math.floor(diff/86400000), h:Math.floor((diff%86400000)/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (new Date(targetDate) <= new Date()) return <span className="text-xs text-green-600 font-semibold">● Happening now</span>;
  return (
    <div className="flex gap-3">
      {[['d','Days'],['h','Hours'],['m','Mins'],['s','Secs']].map(([k,l]) => (
        <div key={k} className="text-center">
          <div className="text-lg font-bold text-ink-800 leading-none">{String(time[k]).padStart(2,'0')}</div>
          <div className="text-[10px] text-ink-400 uppercase tracking-wide">{l}</div>
        </div>
      ))}
    </div>
  );
}

export default function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/exhibitions/public`)
      .then(r => r.json()).then(r => setExhibitions(r.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div className="pt-32 text-center py-20 text-ink-400">Loading exhibitions…</div>;

  return (
    <div className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mb-3">Events & Exhibitions</p>
        <h1 className="font-serif text-3xl lg:text-5xl text-ink-800 mb-4">Meet Us In Person</h1>
        <p className="text-ink-400 text-lg max-w-xl mx-auto">Visit our booth at upcoming jewellery exhibitions. View rare pieces, meet our gemologists, and enjoy exclusive VIP previews.</p>
      </div>

      {exhibitions.length === 0 ? (
        <div className="card p-20 text-center">
          <Calendar size={40} className="mx-auto text-ink-200 mb-4"/>
          <p className="text-ink-400 text-lg">No upcoming exhibitions</p>
          <p className="text-sm text-ink-300 mt-2">Check back soon or follow us on Instagram</p>
        </div>
      ) : (
        <div className="space-y-6">
          {exhibitions.map(ex => {
            const isLive = new Date() >= new Date(ex.start_date) && new Date() <= new Date(ex.end_date);
            const isFull = ex.max_registrations && +ex.reg_count >= +ex.max_registrations;
            return (
              <div key={ex.id} className={`card overflow-hidden hover:shadow-xl transition-all duration-300 ${ex.is_vip ? 'border-gold-200' : ''}`}>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                  {/* Image */}
                  <div className="lg:col-span-2 relative">
                    {ex.hero_image ? (
                      <img src={ex.hero_image} alt={ex.title} className="w-full h-64 lg:h-full object-cover"/>
                    ) : (
                      <div className="w-full h-64 lg:h-full bg-gradient-to-br from-gold-50 to-ink-100 flex items-center justify-center">
                        <span className="text-6xl">💎</span>
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {isLive && <span className="badge bg-green-500 text-white text-[10px]">● Live Now</span>}
                      {ex.is_vip && <span className="badge bg-gold-500 text-white text-[10px] flex items-center gap-1"><Star size={9} fill="white"/>VIP</span>}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-3 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {!isLive && ex.start_date && (
                          <Countdown targetDate={ex.start_date}/>
                        )}
                      </div>

                      <h2 className="font-serif text-2xl text-ink-800 mb-2">{ex.title}</h2>
                      {ex.subtitle && <p className="text-gold-600 font-medium text-sm mb-3">{ex.subtitle}</p>}

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-ink-500">
                          <Calendar size={15} className="text-gold-500 flex-shrink-0"/>
                          <span>{new Date(ex.start_date).toLocaleDateString('en-AE',{day:'numeric',month:'long',year:'numeric'})}
                          {ex.end_date !== ex.start_date ? ` — ${new Date(ex.end_date).toLocaleDateString('en-AE',{day:'numeric',month:'long',year:'numeric'})}` : ''}</span>
                        </div>
                        {(ex.start_time||ex.end_time) && (
                          <div className="flex items-center gap-2 text-sm text-ink-500">
                            <Clock size={15} className="text-gold-500 flex-shrink-0"/>
                            <span>{ex.start_time} — {ex.end_time}</span>
                          </div>
                        )}
                        {ex.venue_name && (
                          <div className="flex items-center gap-2 text-sm text-ink-500">
                            <MapPin size={15} className="text-gold-500 flex-shrink-0"/>
                            <span>{ex.venue_name}{ex.venue_city ? `, ${ex.venue_city}` : ''}{ex.booth_number ? ` · Booth ${ex.booth_number}` : ''}</span>
                          </div>
                        )}
                        {ex.reg_count > 0 && (
                          <div className="flex items-center gap-2 text-sm text-ink-400">
                            <Users size={15} className="text-gold-500 flex-shrink-0"/>
                            <span>{ex.reg_count} {ex.max_registrations ? `/ ${ex.max_registrations}` : ''} registered</span>
                          </div>
                        )}
                      </div>

                      {ex.is_vip && (
                        <div className="bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 mb-4 text-sm text-gold-700">
                          <Star size={14} className="inline mr-1.5" fill="currentColor"/>
                          <strong>VIP Exhibition</strong> — Exclusive preview for invited guests and registered members.
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <Link href={`/exhibitions/${ex.slug}`} className="btn-gold px-6 py-3">
                        {isFull ? 'View details' : ex.registration_open ? 'Register to attend' : 'View details'}
                      </Link>
                      <Link href={`/exhibitions/${ex.slug}`} className="btn-outline-gold px-6 py-3 text-sm">
                        Learn more
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
