'use client';
// BUSINESS RULE: Related products ONLY show lab-grown diamonds. Never natural.
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { diamondAPI } from '@/lib/api';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

const API  = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const GOLD = 'var(--color-accent)';

export default function LabGrownDetailPage() {
  const { slug }           = useParams();
  const [diamond, setD]    = useState(null);
  const [related, setRel]  = useState([]);
  const [loading, setLoad] = useState(true);
  const [waNumber, setWA]  = useState('');
  const [imgIdx, setImg]   = useState(0);

  useEffect(() => {
    fetch(`${API}/settings/public`).then(r=>r.json()).then(d=>{
      const n=(d.data?.store_whatsapp||d.data?.whatsapp_number||'').replace(/\D/g,'');
      if(n) setWA(n);
    }).catch(()=>{});
  },[]);

  useEffect(() => {
    if (!slug) return;
    setLoad(true);
    diamondAPI.get(slug)
      .then(r => {
        const d = r.data.data || r.data;
        setD(d);
        // Related: ONLY lab_grown — never suggest natural
        if (d?.id) {
          diamondAPI.search({ diamond_type:'LAB_GROWN', limit:4, exclude:d.id, ...(d.shape?{shape:d.shape}:{}) })
            .then(rr => setRel(rr.data.data?.data || []))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoad(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-heading)', fontSize:18, color:'var(--color-text-muted)' }}>
      Loading…
    </div>
  );
  if (!diamond) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <p style={{ fontFamily:'var(--font-heading)', fontSize:24, color:'var(--color-text)' }}>Diamond not found</p>
      <Link href="/lab-grown" style={{ color:GOLD, fontSize:12, letterSpacing:'0.14em', textTransform:'uppercase' }}>← Lab-Grown Diamonds</Link>
    </div>
  );

  const name  = diamond.name || `Lab-Grown ${diamond.shape||''} ${diamond.carat?Number(diamond.carat).toFixed(2):''}ct ${diamond.color||''} ${diamond.clarity||''}`.trim();
  const price = diamond.final_price && Number(diamond.final_price) > 0
    ? `${diamond.currency||'AED'} ${Number(diamond.final_price).toLocaleString()}` : 'Price on Request';
  const isPOR = !diamond.final_price || Number(diamond.final_price) === 0;
  const images = diamond.images || (diamond.image_url?[diamond.image_url]:[]);
  const msg   = encodeURIComponent(`Hi Tejori, I am interested in ${name}${diamond.primary_cert_lab?` | Cert: ${diamond.primary_cert_lab} ${diamond.primary_cert_no||''}`:''}. Please share pricing and availability.`);
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${msg}` : null;

  const specs = [
    ['Shape',      diamond.shape],
    ['Carat',      diamond.carat ? `${Number(diamond.carat).toFixed(2)} ct` : null],
    ['Color',      diamond.color],
    ['Clarity',    diamond.clarity],
    ['Cut',        diamond.cut],
    ['Polish',     diamond.polish],
    ['Symmetry',   diamond.symmetry],
    ['Fluorescence', diamond.fluorescence],
    ['Measurements', diamond.measurements],
    ['Lab',        diamond.primary_cert_lab],
    ['Cert No.',   diamond.primary_cert_no],
    ['Depth %',    diamond.depth_pct ? `${diamond.depth_pct}%` : null],
    ['Table %',    diamond.table_pct ? `${diamond.table_pct}%` : null],
    ['SKU',        diamond.sku],
  ].filter(([,v]) => v);

  return (
    <div style={{ background:'var(--color-bg)', minHeight:'100vh' }}>
      {/* Breadcrumb */}
      <nav style={{ borderBottom:'1px solid #f0ebe3', padding:'12px 48px', background:'var(--color-bg)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', fontSize:11, color:'var(--color-text-muted)', display:'flex', gap:8 }}>
          <Link href="/" style={{ color:'var(--color-text-muted)', textDecoration:'none' }}>Home</Link>
          <span>/</span>
          <Link href="/lab-grown" style={{ color:'var(--color-text-muted)', textDecoration:'none' }}>Lab-Grown Diamonds</Link>
          <span>/</span>
          <span style={{ color:'var(--color-text)' }}>{name}</span>
        </div>
      </nav>

      {/* Main layout */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'48px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64 }}>
        {/* Left: image */}
        <div>
          <div style={{ position:'relative', aspectRatio:'1', overflow:'hidden', background:'#f5f0e8' }}>
            {images[imgIdx] ? (
              <Image src={images[imgIdx]} alt={name} fill priority sizes="(max-width:900px) 100vw, 50vw" style={{ objectFit:'cover' }}/>
            ) : (
              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #e0f7fa, #b2ebf2)' }}>
                <span style={{ fontSize:80, opacity:0.3 }}>💎</span>
              </div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setImg(i=>Math.max(0,i-1))} disabled={imgIdx===0}
                  style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.88)', border:'none', borderRadius:'50%', width:36, height:36, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:imgIdx===0?0.3:1 }}>
                  <ChevronLeft size={16}/>
                </button>
                <button onClick={() => setImg(i=>Math.min(images.length-1,i+1))} disabled={imgIdx===images.length-1}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.88)', border:'none', borderRadius:'50%', width:36, height:36, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:imgIdx===images.length-1?0.3:1 }}>
                  <ChevronRight size={16}/>
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              {images.map((img,i)=>(
                <button key={i} onClick={()=>setImg(i)}
                  style={{ width:64, height:64, border:`2px solid ${imgIdx===i?'#00796b':'transparent'}`, padding:2, background:'#f5f0e8', cursor:'pointer', flexShrink:0 }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: info */}
        <div style={{ position:'sticky', top:100 }}>
          {/* Lab Grown badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', background:'#e0f7fa', border:'1px solid #b2ebf2', marginBottom:16 }}>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#00796b' }}>Lab-Grown Diamond</span>
            <span style={{ fontSize:9, color:'#00796b' }}>✓ IGI/GIA Certified</span>
          </div>

          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.4em', textTransform:'uppercase', color:GOLD, marginBottom:10 }}>TEJORI</p>
          <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(20px,3vw,32px)', fontWeight:400, color:'var(--color-text)', lineHeight:1.2, marginBottom:16 }}>{name}</h1>

          <div style={{ marginBottom:24 }}>
            {isPOR ? (
              <p style={{ fontFamily:'var(--font-heading)', fontSize:22, color:GOLD, fontStyle:'italic' }}>Price on Request</p>
            ) : (
              <p style={{ fontFamily:'var(--font-heading)', fontSize:28, fontWeight:500, color:'var(--color-text)' }}>{price}</p>
            )}
          </div>

          {/* Specs table */}
          <div style={{ borderTop:'1px solid #e8ddd0', paddingTop:16, marginBottom:24 }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <tbody>
                {specs.map(([k,v])=>(
                  <tr key={k} style={{ borderBottom:'1px solid #f0ebe3' }}>
                    <td style={{ padding:'8px 0', color:'var(--color-text-muted)', width:'40%' }}>{k}</td>
                    <td style={{ padding:'8px 0', color:'var(--color-text)', fontWeight:500 }}>
                      {k === 'Cert No.' && diamond.cert_url ? (
                        <a href={diamond.cert_url} target="_blank" rel="noreferrer" style={{ color:'#00796b', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4 }}>
                          {v} <ExternalLink size={10}/>
                        </a>
                      ) : v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CTA */}
          {waHref && (
            <a href={waHref} target="_blank" rel="noreferrer"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, width:'100%', padding:'15px 24px', background:'#25D366', color:'#fff', textDecoration:'none', fontSize:11, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Enquire on WhatsApp
            </a>
          )}
          <Link href="/appointment" style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', padding:'13px 24px', border:`1px solid ${GOLD}`, color:GOLD, textDecoration:'none', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase' }}>
            Book a Private Viewing
          </Link>

          {diamond.primary_cert_no && (
            <div style={{ marginTop:20, padding:'14px 16px', background:'#e0f7fa', border:'1px solid #b2ebf2' }}>
              <p style={{ fontSize:11, color:'#00796b', marginBottom:6 }}>This diamond comes with an authentic {diamond.primary_cert_lab||'IGI'} certificate verifying its lab-grown origin and quality.</p>
              <Link href={`/verify/${diamond.primary_cert_no}`} style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#00796b', textDecoration:'none' }}>
                Verify Certificate #{diamond.primary_cert_no} →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Related lab-grown only */}
      {related.length > 0 && (
        <section style={{ padding:'56px 48px', background:'#f9fafa' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(20px,3vw,32px)', fontWeight:400, color:'var(--color-text)', marginBottom:8 }}>Similar Lab-Grown Diamonds</h2>
            <p style={{ fontSize:11, color:'#00796b', marginBottom:32, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>Lab-Grown Only · Ethically Sourced</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:20 }}>
              {related.map(d => {
                const rname = d.name || `Lab-Grown ${d.shape||''} ${d.carat?Number(d.carat).toFixed(2):''}ct`.trim();
                const rprice = d.final_price && Number(d.final_price) > 0 ? `${d.currency||'AED'} ${Number(d.final_price).toLocaleString()}` : 'Price on Request';
                return (
                  <Link key={d.id} href={`/lab-grown/${d.id}`} style={{ textDecoration:'none', display:'block' }}>
                    <div style={{ background:'#fff', border:'1px solid #e5e0d8', padding:16, transition:'box-shadow 200ms ease' }}
                      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)'}
                      onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                      <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', padding:'2px 7px', background:'#e0f7fa', color:'#00796b', border:'1px solid #b2ebf2', display:'inline-block', marginBottom:10 }}>Lab Grown</span>
                      <p style={{ fontFamily:'var(--font-heading)', fontSize:14, fontWeight:400, color:'var(--color-text)', marginBottom:4 }}>{rname}</p>
                      <p style={{ fontSize:13, fontWeight:600, color:(!d.final_price||Number(d.final_price)===0)?GOLD:'var(--color-text)' }}>{rprice}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <style>{`@media (max-width:900px) { div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}