'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin } from 'lucide-react';

const STATUS_COLORS = { confirmed:'#4caf70', pending:'#ff9800', cancelled:'#f44336', completed:'#2196f3' };

export default function AppointmentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    const token = localStorage.getItem('jcos_customer_token');
    fetch(`${api}/customer/appointments`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(res=>setItems(res.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#6b6b6b' }}>Loading…</div>;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:300, color:'#1a1a1a' }}>My Appointments</h1>
        <Link href="/appointment" style={{ fontSize:11, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:'#1a1a1a', borderBottom:'1px solid #1a1a1a', paddingBottom:1 }}>Book new →</Link>
      </div>
      <div style={{ width:40, height:1, background:'#b8860b', marginBottom:32 }}/>
      {items.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0' }}>
          <Calendar size={40} style={{ color:'#e5e0d8', marginBottom:16 }}/>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:300, color:'#1a1a1a', marginBottom:8 }}>No appointments yet</p>
          <Link href="/appointment" style={{ fontSize:11, fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase', color:'#1a1a1a', borderBottom:'1px solid #1a1a1a', paddingBottom:2 }}>Book a consultation →</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {items.map(apt=>(
            <div key={apt.id} style={{ padding:'20px 24px', border:'1px solid #e5e0d8', background:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:400, color:'#1a1a1a' }}>{apt.type||'Boutique Consultation'}</p>
                  <span style={{ fontSize:9, fontWeight:600, padding:'2px 8px', borderRadius:20, background:STATUS_COLORS[apt.status]||'#999', color:'#fff', textTransform:'uppercase', letterSpacing:'0.08em' }}>{apt.status}</span>
                </div>
                <div style={{ display:'flex', gap:16 }}>
                  <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#6b6b6b' }}><Calendar size={12}/>{new Date(apt.appointment_date).toLocaleDateString('en-AE',{day:'numeric',month:'long',year:'numeric'})}</span>
                  {apt.appointment_time && <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#6b6b6b' }}><Clock size={12}/>{apt.appointment_time}</span>}
                  {apt.branch && <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#6b6b6b' }}><MapPin size={12}/>{apt.branch}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
