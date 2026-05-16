import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { jewelleryAPI } from "../services/api";
import toast from "react-hot-toast";

const STATUS_COLORS = { new:'#3b82f6', contacted:'#f59e0b', converted:'#22c55e', closed:'#6b7280' };
const STATUS_LIST = ['new','contacted','converted','closed'];

export default function EnquiriesPage() {
  const { dark } = useTheme();
  const [enquiries, setEnquiries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const bg = dark ? '#1a1a1a' : '#ffffff';
  const cardBg = dark ? '#242424' : '#f8f8f8';
  const border = dark ? '#333' : '#e5e5e5';
  const text = dark ? '#e0e0e0' : '#1a1a1a';
  const muted = dark ? '#888' : '#666';
  const gold = '#c9a84c';

  const load = async () => {
    setLoading(true);
    try {
      const r = await jewelleryAPI.getEnquiries({ status: filter || undefined, page, limit });
      setEnquiries(r.data?.data?.data || []);
      setTotal(r.data?.data?.total || 0);
    } catch(e) { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter, page]);

  const updateStatus = async (id, status) => {
    await jewelleryAPI.updateEnquiry(id, { status });
    toast.success('Status updated');
    load();
    if (selected?.id === id) setSelected(e => ({...e, status}));
  };

  const totalPages = Math.ceil(total / limit);

  const inputStyle = { background:dark?'#2a2a2a':'#fff', border:`1px solid ${border}`, borderRadius:8, padding:'8px 12px', color:text, fontSize:13 };

  return (
    <div style={{ background:bg, minHeight:'100vh', color:text, fontFamily:'Inter,sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:600, margin:0 }}>Enquiries</h1>
            <p style={{ fontSize:13, color:muted, margin:'4px 0 0' }}>{total} total enquiries</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {['','new','contacted','converted','closed'].map(s => (
              <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                style={{ padding:'6px 14px', borderRadius:20, fontSize:12, cursor:'pointer', fontWeight:filter===s?600:400,
                  background:filter===s?(s?STATUS_COLORS[s]:gold):'transparent',
                  color:filter===s?'#fff':muted, border:`1px solid ${filter===s?(s?STATUS_COLORS[s]:gold):border}` }}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap:16 }}>
          {/* List */}
          <div>
            {loading ? <p style={{color:muted,fontSize:13}}>Loading…</p> : enquiries.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:muted }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                <p>No enquiries yet</p>
              </div>
            ) : enquiries.map(enq => (
              <div key={enq.id} onClick={() => setSelected(enq)}
                style={{ background:selected?.id===enq.id?gold+'11':cardBg, border:`1px solid ${selected?.id===enq.id?gold:border}`, borderRadius:10, padding:'14px 18px', marginBottom:8, cursor:'pointer', transition:'all .15s' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:600 }}>{enq.customer_name || 'Anonymous'}</span>
                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:STATUS_COLORS[enq.status]+'22', color:STATUS_COLORS[enq.status], fontWeight:600 }}>
                        {enq.status}
                      </span>
                      <span style={{ fontSize:11, color:muted, padding:'2px 8px', borderRadius:20, background:dark?'#333':'#eee' }}>
                        {enq.channel}
                      </span>
                    </div>
                    {enq.product_name && <p style={{ fontSize:12, color:gold, margin:'0 0 4px' }}>Re: {enq.product_name} {enq.product_sku ? `(${enq.product_sku})` : ''}</p>}
                    <p style={{ fontSize:12, color:muted, margin:0 }}>{enq.message?.substring(0,80)}{enq.message?.length>80?'…':''}</p>
                  </div>
                  <div style={{ textAlign:'right', fontSize:11, color:muted, whiteSpace:'nowrap', marginLeft:12 }}>
                    <div>{enq.customer_phone}</div>
                    <div style={{ marginTop:4 }}>{new Date(enq.created_at).toLocaleDateString('en-AE',{day:'numeric',month:'short'})}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:16 }}>
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  style={{...inputStyle, padding:'6px 14px', cursor:'pointer', opacity:page===1?.4:1}}>Prev</button>
                <span style={{ fontSize:13, color:muted }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  style={{...inputStyle, padding:'6px 14px', cursor:'pointer', opacity:page===totalPages?.4:1}}>Next</button>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:12, padding:20, height:'fit-content', position:'sticky', top:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                <h3 style={{ fontSize:15, fontWeight:600, margin:0 }}>Enquiry #{selected.id}</h3>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:muted, cursor:'pointer', fontSize:18 }}>×</button>
              </div>
              <div style={{ fontSize:13, lineHeight:1.8 }}>
                <div><span style={{color:muted}}>Name: </span>{selected.customer_name||'—'}</div>
                <div><span style={{color:muted}}>Phone: </span><a href={`tel:${selected.customer_phone}`} style={{color:gold}}>{selected.customer_phone||'—'}</a></div>
                <div><span style={{color:muted}}>Email: </span>{selected.customer_email||'—'}</div>
                <div><span style={{color:muted}}>Country: </span>{selected.country_code}</div>
                <div><span style={{color:muted}}>Channel: </span>{selected.channel}</div>
                {selected.product_name && <div><span style={{color:muted}}>Product: </span><span style={{color:gold}}>{selected.product_name}</span></div>}
                {selected.product_price && <div><span style={{color:muted}}>Price: </span>AED {parseFloat(selected.product_price).toFixed(2)}</div>}
              </div>
              {selected.message && (
                <div style={{ marginTop:14, padding:'10px 14px', background:dark?'#1a1a1a':'#fff', borderRadius:8, border:`1px solid ${border}`, fontSize:13, lineHeight:1.7 }}>
                  {selected.message}
                </div>
              )}
              {/* WhatsApp quick reply */}
              {selected.customer_phone && (
                <a href={`https://wa.me/${selected.customer_phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hello ${selected.customer_name||''}! Thank you for your enquiry about ${selected.product_name||'our jewellery'}. `)}`}
                  target="_blank" rel="noreferrer"
                  style={{ display:'block', marginTop:12, background:'#22c55e', color:'#fff', borderRadius:8, padding:'10px', textAlign:'center', textDecoration:'none', fontSize:13, fontWeight:600 }}>
                  Reply on WhatsApp
                </a>
              )}
              <div style={{ marginTop:14 }}>
                <p style={{ fontSize:12, color:muted, marginBottom:6 }}>Update status</p>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {STATUS_LIST.map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      style={{ padding:'5px 12px', borderRadius:20, fontSize:11, cursor:'pointer', fontWeight:600,
                        background:selected.status===s?STATUS_COLORS[s]:'transparent',
                        color:selected.status===s?'#fff':muted,
                        border:`1px solid ${selected.status===s?STATUS_COLORS[s]:border}` }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
