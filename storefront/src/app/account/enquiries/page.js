'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default function EnquiriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    const token = localStorage.getItem('jcos_customer_token');
    fetch(`${api}/customer/enquiries`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(res=>setItems(res.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#6b6b6b' }}>Loading…</div>;

  return (
    <div>
      <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:300, color:'#1a1a1a', marginBottom:8 }}>My Enquiries</h1>
      <div style={{ width:40, height:1, background:'#b8860b', marginBottom:32 }}/>
      {items.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0' }}>
          <MessageSquare size={40} style={{ color:'#e5e0d8', marginBottom:16 }}/>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:300, color:'#1a1a1a', marginBottom:8 }}>No enquiries yet</p>
          <Link href="/jewellery" style={{ fontSize:11, fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase', color:'#1a1a1a', borderBottom:'1px solid #1a1a1a', paddingBottom:2 }}>Browse jewellery →</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {items.map(enq=>(
            <div key={enq.id} style={{ padding:'16px 20px', border:'1px solid #e5e0d8', background:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <p style={{ fontSize:14, fontWeight:500, color:'#1a1a1a', marginBottom:4 }}>{enq.subject||enq.product_name||'General Enquiry'}</p>
                <p style={{ fontSize:12, color:'#6b6b6b' }}>{new Date(enq.created_at).toLocaleDateString('en-AE',{day:'numeric',month:'long',year:'numeric'})}</p>
              </div>
              <span style={{ fontSize:10, fontWeight:600, padding:'3px 10px', borderRadius:20, background: enq.status==='replied'?'#e8f5e9':'#fdf8f3', color: enq.status==='replied'?'#4caf70':'#b8860b', border:`1px solid ${enq.status==='replied'?'#a5d6a7':'#e5d5a0'}` }}>
                {enq.status||'pending'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
