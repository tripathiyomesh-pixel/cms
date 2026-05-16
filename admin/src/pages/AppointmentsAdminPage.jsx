import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { jewelleryAPI } from "../services/api";
import toast from "react-hot-toast";

const STATUS_COLORS = { pending:'#f59e0b', confirmed:'#22c55e', completed:'#6366f1', cancelled:'#ef4444' };
const STATUS_LIST = ['pending','confirmed','completed','cancelled'];

export default function AppointmentsAdminPage() {
  const { dark } = useTheme();
  const [appts, setAppts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ today: [], upcoming: [] });
  const limit = 20;

  const bg = dark ? '#1a1a1a' : '#fff';
  const cardBg = dark ? '#242424' : '#f8f8f8';
  const border = dark ? '#333' : '#e5e5e5';
  const text = dark ? '#e0e0e0' : '#1a1a1a';
  const muted = dark ? '#888' : '#666';
  const gold = '#c9a84c';
  const inp = { background:dark?'#2a2a2a':'#fff', border:`1px solid ${border}`, borderRadius:8, padding:'8px 12px', color:text, fontSize:13 };

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filter) params.status = filter;
      if (dateFilter) params.date = dateFilter;
      const r = await jewelleryAPI.getAppointments(params);
      setAppts(r.data?.data?.data || []);
      setTotal(r.data?.data?.total || 0);
    } catch(e) {}
    setLoading(false);
  };

  const loadSummary = async () => {
    try {
      const r = await jewelleryAPI.getAppointmentSummary();
      setSummary(r.data?.data || { today:[], upcoming:[] });
    } catch(e) {}
  };

  useEffect(() => { load(); loadSummary(); }, [filter, dateFilter, page]);

  const updateStatus = async (id, status) => {
    await jewelleryAPI.updateAppt(id, { status });
    toast.success(`Marked as ${status}`);
    load();
    if (selected?.id === id) setSelected(a => ({...a, status}));
  };

  const todayCount = summary.today?.reduce((acc,r) => acc + parseInt(r.count||0), 0) || 0;
  const confirmedToday = summary.today?.find(r => r.status==='confirmed')?.count || 0;
  const pendingCount = summary.today?.find(r => r.status==='pending')?.count || 0;

  return (
    <div style={{ background:bg, minHeight:'100vh', color:text, fontFamily:'Inter,sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 20px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:600, margin:0 }}>Appointments</h1>
            <p style={{ fontSize:13, color:muted, margin:'4px 0 0' }}>Boutique visit bookings</p>
          </div>
        </div>

        {/* Today's summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          {[
            { label:"Today's bookings", value:todayCount, color:gold },
            { label:"Confirmed", value:confirmedToday, color:'#22c55e' },
            { label:"Pending confirmation", value:pendingCount, color:'#f59e0b' },
            { label:"Total all time", value:total, color:'#6366f1' },
          ].map(s => (
            <div key={s.label} style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:12, padding:'16px 18px' }}>
              <p style={{ fontSize:12, color:muted, margin:'0 0 6px' }}>{s.label}</p>
              <p style={{ fontSize:26, fontWeight:700, color:s.color, margin:0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Upcoming confirmed */}
        {summary.upcoming?.length > 0 && (
          <div style={{ background:cardBg, border:`1px solid ${gold}44`, borderRadius:12, padding:'16px 20px', marginBottom:20 }}>
            <p style={{ fontSize:13, fontWeight:600, color:gold, margin:'0 0 12px' }}>Upcoming confirmed appointments</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
              {summary.upcoming.map(a => (
                <div key={a.id} style={{ background:dark?'#1a1a1a':'#fff', border:`1px solid ${border}`, borderRadius:10, padding:'12px' }}>
                  <p style={{ fontSize:13, fontWeight:600, margin:'0 0 2px' }}>{a.customer_name}</p>
                  <p style={{ fontSize:12, color:gold, margin:'0 0 2px' }}>{new Date(a.preferred_date).toLocaleDateString('en-AE',{day:'numeric',month:'short'})} · {a.preferred_time}</p>
                  <p style={{ fontSize:11, color:muted, margin:0 }}>{a.location_name || 'Any boutique'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {['','pending','confirmed','completed','cancelled'].map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }}
              style={{ padding:'6px 14px', borderRadius:20, fontSize:12, cursor:'pointer', fontWeight:filter===s?600:400,
                background:filter===s?(s?STATUS_COLORS[s]:gold):'transparent',
                color:filter===s?'#fff':muted, border:`1px solid ${filter===s?(s?STATUS_COLORS[s]:gold):border}` }}>
              {s || 'All'}
            </button>
          ))}
          <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }}
            style={{ ...inp, marginLeft:'auto' }} />
          {dateFilter && <button onClick={() => setDateFilter('')} style={{ ...inp, cursor:'pointer', color:'#ef4444' }}>Clear date</button>}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:selected?'1fr 380px':'1fr', gap:16 }}>
          {/* List */}
          <div>
            {loading ? <p style={{color:muted,fontSize:13,padding:20}}>Loading…</p>
            : appts.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:muted }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
                <p>No appointments found</p>
              </div>
            ) : appts.map(a => (
              <div key={a.id} onClick={() => setSelected(a)}
                style={{ background:selected?.id===a.id?gold+'11':cardBg, border:`1px solid ${selected?.id===a.id?gold:border}`, borderRadius:10, padding:'14px 18px', marginBottom:8, cursor:'pointer', transition:'all .15s' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:600 }}>{a.customer_name}</span>
                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:STATUS_COLORS[a.status]+'22', color:STATUS_COLORS[a.status], fontWeight:600 }}>{a.status}</span>
                      {a.party_size > 1 && <span style={{ fontSize:11, color:muted }}>👥 {a.party_size}</span>}
                    </div>
                    <p style={{ fontSize:12, color:gold, margin:'0 0 2px', fontWeight:500 }}>
                      📅 {new Date(a.preferred_date).toLocaleDateString('en-AE',{weekday:'short',day:'numeric',month:'short'})} · {a.preferred_time}
                    </p>
                    <p style={{ fontSize:12, color:muted, margin:0 }}>{a.purpose}{a.location_name ? ` · ${a.location_name}` : ''}</p>
                    {a.product_name && <p style={{ fontSize:11, color:muted, margin:'2px 0 0' }}>Re: {a.product_name}</p>}
                  </div>
                  <div style={{ textAlign:'right', fontSize:11, color:muted, whiteSpace:'nowrap', marginLeft:12 }}>
                    <div>{a.customer_phone}</div>
                    {a.booking_ref && <div style={{ color:gold, fontWeight:600, marginTop:4 }}>{a.booking_ref}</div>}
                  </div>
                </div>
              </div>
            ))}

            {Math.ceil(total/limit) > 1 && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:16 }}>
                <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{...inp,padding:'6px 14px',cursor:'pointer',opacity:page===1?.4:1}}>Prev</button>
                <span style={{fontSize:13,color:muted}}>Page {page} of {Math.ceil(total/limit)}</span>
                <button onClick={() => setPage(p=>Math.min(Math.ceil(total/limit),p+1))} disabled={page===Math.ceil(total/limit)} style={{...inp,padding:'6px 14px',cursor:'pointer',opacity:page===Math.ceil(total/limit)?.4:1}}>Next</button>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:12, padding:20, height:'fit-content', position:'sticky', top:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:600, margin:0 }}>{selected.customer_name}</h3>
                  {selected.booking_ref && <p style={{ fontSize:12, color:gold, fontWeight:700, margin:'2px 0 0', fontFamily:'monospace' }}>{selected.booking_ref}</p>}
                </div>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:muted, cursor:'pointer', fontSize:18 }}>×</button>
              </div>

              <div style={{ fontSize:13, lineHeight:2 }}>
                {[
                  ['📅 Date', `${new Date(selected.preferred_date).toLocaleDateString('en-AE',{weekday:'long',day:'numeric',month:'long'})} at ${selected.preferred_time}`],
                  ['📍 Location', selected.location_name || 'Any boutique'],
                  ['🎯 Purpose', selected.purpose],
                  ['📞 Phone', selected.customer_phone],
                  selected.customer_email ? ['✉ Email', selected.customer_email] : null,
                  selected.party_size > 1 ? ['👥 Party', `${selected.party_size} people`] : null,
                  selected.product_name ? ['💎 Product', selected.product_name] : null,
                  selected.special_requests ? ['📝 Requests', selected.special_requests] : null,
                ].filter(Boolean).map(([k,v]) => (
                  <div key={k} style={{ display:'flex', gap:8 }}>
                    <span style={{ color:muted, minWidth:100 }}>{k}</span>
                    <span style={{ fontWeight:500 }}>{v}</span>
                  </div>
                ))}
              </div>

              <a href={`https://wa.me/${selected.customer_phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hello ${selected.customer_name}! Your appointment is confirmed for ${selected.preferred_date} at ${selected.preferred_time}. Booking ref: ${selected.booking_ref||''}. We look forward to seeing you.`)}`}
                target="_blank" rel="noreferrer"
                style={{ display:'block', marginTop:14, background:'#22c55e', color:'#fff', borderRadius:8, padding:'10px', textAlign:'center', textDecoration:'none', fontSize:13, fontWeight:600 }}>
                💬 Confirm via WhatsApp
              </a>

              <div style={{ marginTop:14 }}>
                <p style={{ fontSize:12, color:muted, marginBottom:6 }}>Update status</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  {STATUS_LIST.map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      style={{ padding:'8px', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:600,
                        background:selected.status===s?STATUS_COLORS[s]:'transparent',
                        color:selected.status===s?'#fff':muted,
                        border:`1px solid ${selected.status===s?STATUS_COLORS[s]:border}` }}>
                      {s.charAt(0).toUpperCase()+s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {selected.notes && (
                <div style={{ marginTop:14, padding:'10px 14px', background:dark?'#1a1a1a':'#fff', borderRadius:8, border:`1px solid ${border}`, fontSize:12, color:muted }}>
                  {selected.notes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
