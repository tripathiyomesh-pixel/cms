'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, MessageCircle } from 'lucide-react';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;

  const load = () => {
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    const token = localStorage.getItem('jcos_customer_token');
    fetch(`${api}/customer/wishlist`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(res=>setItems(res.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); },[]);

  const remove = async (id) => {
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    const token = localStorage.getItem('jcos_customer_token');
    await fetch(`${api}/customer/wishlist/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } });
    setItems(prev=>prev.filter(i=>i.id!==id));
  };

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#6b6b6b' }}>Loading…</div>;

  return (
    <div>
      <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:300, color:'#1a1a1a', marginBottom:8 }}>My Wishlist</h1>
      <div style={{ width:40, height:1, background:'#b8860b', marginBottom:32 }}/>
      {items.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0' }}>
          <Heart size={40} style={{ color:'#e5e0d8', marginBottom:16 }}/>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:300, color:'#1a1a1a', marginBottom:8 }}>Your wishlist is empty</p>
          <Link href="/jewellery" style={{ fontSize:11, fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase', color:'#1a1a1a', borderBottom:'1px solid #1a1a1a', paddingBottom:2 }}>Explore Collection →</Link>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:24 }}>
          {items.map(item=>(
            <div key={item.id} style={{ border:'1px solid #e5e0d8', background:'#fff' }}>
              <Link href={`/jewellery/${item.slug||item.product_id}`}>
                <div style={{ aspectRatio:'1', background:'#f5ede2', overflow:'hidden' }}>
                  {item.thumb_url ? <img src={item.thumb_url} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>💎</div>}
                </div>
              </Link>
              <div style={{ padding:16 }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:'#1a1a1a', marginBottom:12 }}>{item.name}</p>
                <div style={{ display:'flex', gap:8 }}>
                  {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi Tejori, I am interested in ${item.name}`)}`} target="_blank" rel="noreferrer" style={{ flex:1, padding:'9px', background:'#1a1a1a', color:'#fff', fontSize:9, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', textAlign:'center', textDecoration:'none' }}>Enquire</a>}
                  <button onClick={()=>remove(item.id)} style={{ padding:'9px', border:'1px solid #e5e0d8', background:'#fff', cursor:'pointer', color:'#999' }}><Trash2 size={13}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
