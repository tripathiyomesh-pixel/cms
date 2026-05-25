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

  if (new Date(targetDate) <= new Date()) {
    return <span style={{ fontSize:11, fontWeight:600, color:'#16a34a', letterSpacing:'0.05em' }}>● Happening now</span>;
  }
  return (
    <div style={{ display:'flex', gap:12 }}>
      {[['d','Days'],['h','Hrs'],['m','Min'],['s','Sec']].map(([k,l]) => (
        <div key={k} style={{ textAlign:'center' }}>
          <div style={{ fontSize:20, fontWeight:700, color:'#1a1a1a', lineHeight:1 }}>{String(time[k]).padStart(2,'0')}</div>
          <div style={{ fontSize:9, color:'#888', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:2 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

export default function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);

  useEffect(() => {
    // Use /api proxy (rewrites in next.config.js → backend:4000)
    // Falls back to NEXT_PUBLIC_API_URL if set, otherwise relative /api
    const base = process.env.NEXT_PUBLIC_API_URL || '/api';
    fetch(`${base}/exhibitions/public`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(r => setExhibitions(r.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily:"'Inter', system-ui, sans-serif", paddingTop:96 }}>

      {/* ── Hero ── */}
      <div style={{ background:'#1a1a1a', padding:'72px 40px', textAlign:'center' }}>
        <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', color:'#b8860b', marginBottom:14 }}>
          Events & Exhibitions
        </p>
        <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'clamp(36px,5vw,64px)', fontWeight:300, color:'#fff', lineHeight:1.1, marginBottom:16 }}>
          Meet Us In Person
        </h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, maxWidth:500, margin:'0 auto', lineHeight:1.8 }}>
          Visit our booth at upcoming jewellery exhibitions. View rare pieces, meet our gemologists, and enjoy exclusive previews.
        </p>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 32px' }}>
        {loading && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[1,2].map(i => (
              <div key={i} style={{ height:220, background:'#f5f0e8', borderRadius:4, animation:'pulse 1.5s ease-in-out infinite' }}/>
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign:'center', padding:'80px 40px', background:'#faf8f3', border:'1px solid #e5e0d8' }}>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:300, color:'#1a1a1a', marginBottom:8 }}>
              Unable to load exhibitions
            </p>
            <p style={{ fontSize:13, color:'#888', marginBottom:24 }}>
              Please check back shortly or contact us on WhatsApp.
            </p>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '971501234567'}`}
              target="_blank" rel="noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#25D366', color:'#fff', padding:'12px 28px', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', textDecoration:'none' }}>
              💬 WhatsApp Us
            </a>
          </div>
        )}

        {!loading && !error && exhibitions.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 40px', border:'1px solid #e5e0d8' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:8 }}>
              No upcoming exhibitions
            </p>
            <p style={{ fontSize:13, color:'#888', marginBottom:24 }}>
              Follow us on Instagram to be the first to know about upcoming events.
            </p>
            <Link href="/jewellery"
              style={{ display:'inline-block', background:'#1a1a1a', color:'#fff', padding:'12px 28px', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', textDecoration:'none' }}>
              Explore Collection
            </Link>
          </div>
        )}

        {!loading && !error && exhibitions.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            {exhibitions.map(ex => {
              const now      = new Date();
              const start    = new Date(ex.start_date);
              const end      = new Date(ex.end_date);
              const isLive   = now >= start && now <= end;
              const isFull   = ex.max_registrations && +ex.reg_count >= +ex.max_registrations;
              const canReg   = ex.registration_open && !isFull && !isLive;
              return (
                <div key={ex.id} style={{
                  display:'grid', gridTemplateColumns:'2fr 3fr', border:'1px solid #e5e0d8',
                  overflow:'hidden', transition:'box-shadow 0.2s',
                  boxShadow: ex.is_vip ? '0 0 0 1px #b8860b' : 'none',
                }}>
                  {/* Image */}
                  <div style={{ position:'relative', minHeight:260, background:'#1a1a1a', overflow:'hidden' }}>
                    {ex.hero_image
                      ? <img src={ex.hero_image} alt={ex.title}
                          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:56 }}>💎</div>
                    }
                    {/* Status badges */}
                    <div style={{ position:'absolute', top:16, left:16, display:'flex', gap:8 }}>
                      {isLive && (
                        <span style={{ background:'#16a34a', color:'#fff', fontSize:10, fontWeight:700, padding:'4px 10px', letterSpacing:'0.08em' }}>
                          ● LIVE NOW
                        </span>
                      )}
                      {ex.is_vip && (
                        <span style={{ background:'#b8860b', color:'#fff', fontSize:10, fontWeight:700, padding:'4px 10px', letterSpacing:'0.08em', display:'flex', alignItems:'center', gap:4 }}>
                          ✦ VIP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding:'36px 40px', background:'#fff', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                    <div>
                      {/* Countdown — only for upcoming */}
                      {!isLive && start > now && (
                        <div style={{ marginBottom:20 }}>
                          <Countdown targetDate={ex.start_date}/>
                        </div>
                      )}

                      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(20px,2.5vw,32px)', fontWeight:300, color:'#1a1a1a', marginBottom:6, lineHeight:1.2 }}>
                        {ex.title}
                      </h2>
                      {ex.subtitle && (
                        <p style={{ fontSize:13, color:'#b8860b', fontWeight:500, marginBottom:16 }}>{ex.subtitle}</p>
                      )}

                      {/* Key info */}
                      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'#555' }}>
                          <Calendar size={14} style={{ color:'#b8860b', flexShrink:0 }}/>
                          <span>
                            {new Date(ex.start_date).toLocaleDateString('en-AE',{day:'numeric',month:'long',year:'numeric'})}
                            {ex.end_date !== ex.start_date && ` — ${new Date(ex.end_date).toLocaleDateString('en-AE',{day:'numeric',month:'long',year:'numeric'})}`}
                          </span>
                        </div>
                        {(ex.start_time || ex.end_time) && (
                          <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'#555' }}>
                            <Clock size={14} style={{ color:'#b8860b', flexShrink:0 }}/>
                            <span>{ex.start_time} — {ex.end_time}</span>
                          </div>
                        )}
                        {ex.venue_name && (
                          <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'#555' }}>
                            <MapPin size={14} style={{ color:'#b8860b', flexShrink:0 }}/>
                            <span>
                              {ex.venue_name}
                              {ex.venue_city && `, ${ex.venue_city}`}
                              {ex.booth_number && ` · Booth ${ex.booth_number}`}
                            </span>
                          </div>
                        )}
                        {+ex.reg_count > 0 && (
                          <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:12, color:'#888' }}>
                            <Users size={13} style={{ color:'#b8860b', flexShrink:0 }}/>
                            <span>
                              {ex.reg_count} registered
                              {ex.max_registrations ? ` · ${ex.max_registrations - ex.reg_count} spots remaining` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {ex.is_vip && (
                        <div style={{ background:'#fdf8ee', border:'1px solid #e8d5a0', padding:'10px 14px', fontSize:12, color:'#7a5c00', marginBottom:20 }}>
                          ✦ <strong>VIP Exhibition</strong> — Exclusive preview for invited guests and registered members.
                        </div>
                      )}

                      {isFull && (
                        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', padding:'10px 14px', fontSize:12, color:'#991b1b', marginBottom:20 }}>
                          This exhibition is fully booked. Join the waitlist via WhatsApp.
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                      <Link href={`/exhibitions/${ex.slug}`}
                        style={{ background:'#1a1a1a', color:'#fff', padding:'12px 28px', fontSize:11, fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase', textDecoration:'none', display:'inline-block' }}>
                        {isFull ? 'View Details' : canReg ? 'Register Now' : 'View Details'}
                      </Link>
                      {isFull && (
                        <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '971501234567'}?text=${encodeURIComponent(`Hi, I'd like to join the waitlist for ${ex.title}`)}`}
                          target="_blank" rel="noreferrer"
                          style={{ background:'#25D366', color:'#fff', padding:'12px 20px', fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
                          💬 Waitlist
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
