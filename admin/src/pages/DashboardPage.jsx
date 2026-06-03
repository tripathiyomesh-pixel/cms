import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Package, MessageCircle, Calendar, ShoppingBag,
  Plus, ArrowUpRight, TrendingUp, TrendingDown,
  Users, Gem, DollarSign, Eye, Star, Clock,
  ChevronRight, RefreshCw, BarChart2, Activity,
} from 'lucide-react';

// ── MINI SPARKLINE ────────────────────────────────────────────
function Sparkline({ data = [], color = '#b8860b', height = 40 }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 100, h = height;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:'100%', height, overflow:'visible' }} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points={`0,${h} ${points} ${w},${h}`}
        fill={color} fillOpacity="0.08" stroke="none"/>
    </svg>
  );
}

// ── BAR CHART ─────────────────────────────────────────────────
function BarChart({ data = [], color = '#b8860b', height = 80 }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height, paddingTop:8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
          <div style={{
            width:'100%', borderRadius:'3px 3px 0 0',
            height: `${(d.value/max)*100}%`,
            minHeight: d.value>0?4:0,
            background: color,
            opacity: i===data.length-1 ? 1 : 0.5,
            transition:'height .3s ease',
          }}/>
          <span style={{ fontSize:8, color:'var(--color-text-tertiary)', whiteSpace:'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────
function StatCard({ title, value, sub, icon: Icon, color, trend, sparkData, onClick }) {
  const colors = {
    gold:   { bg:'#fdf8f3', icon:'#b8860b', border:'#e5d5a0' },
    blue:   { bg:'#eff6ff', icon:'#3b82f6', border:'#bfdbfe' },
    green:  { bg:'#f0fdf4', icon:'#16a34a', border:'#bbf7d0' },
    purple: { bg:'#faf5ff', icon:'#9333ea', border:'#e9d5ff' },
    amber:  { bg:'#fffbeb', icon:'#d97706', border:'#fde68a' },
    red:    { bg:'#fef2f2', icon:'#dc2626', border:'#fecaca' },
  };
  const c = colors[color] || colors.gold;

  return (
    <div onClick={onClick}
      style={{ background:'var(--color-background-primary)', border:`1px solid var(--color-border-tertiary)`, borderRadius:16, padding:'18px 20px', cursor:onClick?'pointer':'default', transition:'all .15s', position:'relative', overflow:'hidden' }}
      onMouseEnter={e=>{ if(onClick) { e.currentTarget.style.borderColor=c.icon; e.currentTarget.style.transform='translateY(-1px)'; }}}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--color-border-tertiary)'; e.currentTarget.style.transform='none'; }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:c.bg, border:`1px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={16} style={{ color:c.icon }}/>
        </div>
        {trend !== undefined && (
          <div style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, fontWeight:600, color: trend>=0?'#16a34a':'#dc2626' }}>
            {trend>=0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p style={{ fontSize:26, fontWeight:700, color:'var(--color-text-primary)', lineHeight:1, marginBottom:4 }}>{value}</p>
      <p style={{ fontSize:12, fontWeight:500, color:'var(--color-text-secondary)', marginBottom:2 }}>{title}</p>
      {sub && <p style={{ fontSize:11, color:'var(--color-text-tertiary)' }}>{sub}</p>}
      {sparkData && (
        <div style={{ marginTop:12, opacity:0.6 }}>
          <Sparkline data={sparkData} color={c.icon}/>
        </div>
      )}
      {onClick && (
        <ArrowUpRight size={13} style={{ position:'absolute', top:16, right:16, color:'var(--color-text-tertiary)', opacity:0.4 }}/>
      )}
    </div>
  );
}

// ── ACTIVITY FEED ─────────────────────────────────────────────
function ActivityFeed({ items = [] }) {
  const typeConfig = {
    enquiry:     { icon:'💬', color:'#3b82f6', label:'New enquiry' },
    appointment: { icon:'📅', color:'#9333ea', label:'Appointment' },
    product:     { icon:'💎', color:'#b8860b', label:'Product added' },
    order:       { icon:'🛒', color:'#16a34a', label:'New order' },
    customer:    { icon:'👤', color:'#d97706', label:'New customer' },
  };

  if (!items.length) return (
    <div style={{ textAlign:'center', padding:'32px 0', color:'var(--color-text-tertiary)', fontSize:12 }}>
      No recent activity
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      {items.map((item, i) => {
        const cfg = typeConfig[item.type] || typeConfig.enquiry;
        return (
          <div key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid var(--color-border-tertiary)' }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'var(--color-background-secondary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:15 }}>
              {cfg.icon}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:12, fontWeight:500, color:'var(--color-text-primary)', marginBottom:1 }}>{item.title}</p>
              <p style={{ fontSize:11, color:'var(--color-text-tertiary)' }}>{item.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── QUICK ACTIONS ─────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label:'Add product',     icon:'💎', href:'/products/new',     color:'#b8860b' },
  { label:'Add diamond',     icon:'💠', href:'/diamonds/new',     color:'#3b82f6' },
  { label:'View enquiries',  icon:'💬', href:'/enquiries',        color:'#9333ea' },
  { label:'Appointments',    icon:'📅', href:'/appointments',     color:'#16a34a' },
  { label:'Bulk import',     icon:'📤', href:'/import',           color:'#d97706' },
  { label:'Page builder',    icon:'🏗️', href:'/page-builder',     color:'#0d9488' },
  { label:'Gold rates',      icon:'📈', href:'/gold-rates',       color:'#b8860b' },
  { label:'Add staff',       icon:'👤', href:'/workforce',        color:'#6366f1' },
];

// ── MAIN DASHBOARD ────────────────────────────────────────────
// ── CRM PIPELINE WIDGET ───────────────────────────────────────
const PIPELINE_STAGES = [
  { key:'new',       label:'New',       color:'#94a3b8' },
  { key:'contacted', label:'Contacted', color:'#60a5fa' },
  { key:'qualified', label:'Qualified', color:'#a78bfa' },
  { key:'proposal',  label:'Proposal',  color:'#fbbf24' },
  { key:'won',       label:'Won',       color:'#34d399' },
  { key:'lost',      label:'Lost',      color:'#f87171' },
];

function CrmPipelineWidget() {
  const navigate = useNavigate();
  const [crmStats, setCrmStats] = useState(null);

  useEffect(() => {
    api.get('/crm/stats')
      .then(r => setCrmStats(r.data.data))
      .catch(() => {});
  }, []);

  if (!crmStats) return null;

  const totalLeads = crmStats.total_leads || 1;
  const openValue = Object.entries(crmStats.pipeline || {})
    .filter(([k]) => !['won','lost'].includes(k))
    .reduce((s, [, d]) => s + (d.value || 0), 0);

  return (
    <div className="card p-5">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--color-text-primary)' }}>CRM Pipeline</p>
          <p style={{ fontSize:11, color:'var(--color-text-tertiary)', marginTop:2 }}>
            {crmStats.open_leads} open · AED {(openValue||0).toLocaleString()} pipeline value
          </p>
        </div>
        <button onClick={() => navigate('/crm')}
          style={{ fontSize:11, color:'#b8860b', background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
          Manage <ChevronRight size={11}/>
        </button>
      </div>

      <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:64 }}>
        {PIPELINE_STAGES.map(stage => {
          const data = crmStats.pipeline?.[stage.key] || { count: 0 };
          const pct = Math.round(((data.count||0) / totalLeads) * 100);
          return (
            <div key={stage.key} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <span style={{ fontSize:9, fontWeight:700, color:'var(--color-text-secondary)' }}>{data.count||0}</span>
              <div style={{ width:'100%', height: Math.max((pct/100)*50, data.count>0?8:0), background:stage.color, borderRadius:'3px 3px 0 0', opacity: stage.key==='lost'?0.6:1, transition:'height .4s ease' }}/>
              <span style={{ fontSize:8, color:'var(--color-text-tertiary)', textAlign:'center', whiteSpace:'nowrap' }}>{stage.label}</span>
            </div>
          );
        })}
      </div>

      {crmStats.recent_activities?.length > 0 && (
        <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid var(--color-border-tertiary)' }}>
          <p style={{ fontSize:10, fontWeight:600, color:'var(--color-text-tertiary)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>Recent CRM Activity</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {crmStats.recent_activities.slice(0,3).map((a,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:14 }}>
                  {a.type==='note'?'📝':a.type==='enquiry'?'💬':a.type==='appointment'?'📅':'🔔'}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:11, color:'var(--color-text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.title}</p>
                  {a.customer_name && <p style={{ fontSize:10, color:'var(--color-text-tertiary)' }}>{a.customer_name}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { collapsed } = useOutletContext()||{};
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [goldRate, setGoldRate] = useState(null);
  const [activity, setActivity] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, goldRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/gold-rates/current'),
      ]);
      setStats(statsRes.data.data || statsRes.data);
      setGoldRate(goldRes.data.data);

      // Build activity feed from stats
      const acts = [];
      if (statsRes.data.data?.recent_enquiries) {
        statsRes.data.data.recent_enquiries.forEach(e => acts.push({
          type:'enquiry', title:`Enquiry from ${e.customer_name||e.name||'Customer'}`, time: timeAgo(e.created_at)
        }));
      }
      if (statsRes.data.data?.recent_appointments) {
        statsRes.data.data.recent_appointments.forEach(a => acts.push({
          type:'appointment', title:`Appointment — ${a.customer_name||a.name||'Customer'}`, time: timeAgo(a.created_at)
        }));
      }
      acts.sort((a,b) => new Date(b.created_at||0)-new Date(a.created_at||0));
      setActivity(acts.slice(0,8));
    } catch {}
    setLoading(false);
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const s = Math.floor((Date.now()-new Date(date))/1000);
    if (s<60)    return 'just now';
    if (s<3600)  return `${Math.floor(s/60)}m ago`;
    if (s<86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  useEffect(() => { load(); }, []);

  const hour = new Date().getHours();
  const greeting = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';

  const enquiryTrend = stats?.enquiries_week > 0 ? Math.round(((stats.enquiries_week - (stats.enquiries_prev_week||0)) / (stats.enquiries_prev_week||1))*100) : 0;

  // Build 7-day sparkline from daily counts
  const enquirySpark = stats?.daily_enquiries?.map(d=>parseInt(d.count)||0) || [0,2,1,4,3,5,2];
  const productSpark = [0,1,0,2,1,3,1];

  return (
    <>
      <Topbar
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'Admin'}`}
        subtitle={new Date().toLocaleDateString('en-AE',{ weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'Asia/Dubai' })}
        actions={
          <button onClick={load} className="btn-ghost flex items-center gap-1.5 text-xs">
            <RefreshCw size={12} className={loading?'animate-spin':''}/> Refresh
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Gold rate banner */}
        {goldRate && (
          <div style={{ background:'linear-gradient(135deg,#1a1a1a 0%,#2d1f0a 100%)', borderRadius:16, padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:24 }}>
              <div>
                <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#b8860b', marginBottom:4 }}>Today's Gold Rate · AED/gram</p>
                <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
                  {[['24K',goldRate.rate_24k],['22K',goldRate.rate_22k],['21K',goldRate.rate_21k],['18K',goldRate.rate_18k]].map(([k,v])=>(
                    <div key={k}>
                      <span style={{ fontSize:10, color:'rgba(255,255,255,0.5)', marginRight:4 }}>{k}</span>
                      <span style={{ fontSize:18, fontWeight:700, color:'#fff', fontVariantNumeric:'tabular-nums' }}>{parseFloat(v||0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>Source: {goldRate.source} · {new Date(goldRate.fetched_at).toLocaleTimeString('en-AE',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Dubai'})}</span>
              <Link to="/gold-rates" style={{ fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#b8860b', textDecoration:'none', border:'1px solid rgba(184,134,11,0.4)', padding:'4px 10px', borderRadius:6 }}>
                Update →
              </Link>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
          <StatCard title="Total products" icon={Package} color="gold"
            value={loading?'—':stats?.products?.total||0}
            sub={`${stats?.products?.active||0} active · ${stats?.products?.draft||0} draft`}
            trend={5} sparkData={productSpark}
            onClick={()=>navigate('/products')}/>
          <StatCard title="Enquiries" icon={MessageCircle} color="blue"
            value={loading?'—':stats?.enquiries?.total||0}
            sub={`${stats?.enquiries?.new||stats?.enquiries_week||0} this week`}
            trend={enquiryTrend} sparkData={enquirySpark}
            onClick={()=>navigate('/enquiries')}/>
          <StatCard title="Appointments" icon={Calendar} color="purple"
            value={loading?'—':stats?.appointments?.total||0}
            sub={`${stats?.appointments?.pending||0} pending confirmation`}
            onClick={()=>navigate('/appointments')}/>
          <StatCard title="Customers" icon={Users} color="green"
            value={loading?'—':stats?.customers?.total||0}
            sub={`${stats?.customers?.new_this_month||0} new this month`}
            onClick={()=>navigate('/customers')}/>
          <StatCard title="Diamonds" icon={Gem} color="amber"
            value={loading?'—':stats?.diamonds?.total||0}
            sub={`${stats?.diamonds?.available||0} available`}
            onClick={()=>navigate('/diamonds')}/>
          <StatCard title="Orders" icon={ShoppingBag} color="red"
            value={loading?'—':stats?.orders?.total||0}
            sub={`${stats?.orders?.pending||0} pending`}
            onClick={()=>navigate('/orders')}/>
        </div>

        {/* Charts row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {/* Enquiries by day */}
          <div className="card p-5">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--color-text-primary)' }}>Enquiries — last 7 days</p>
                <p style={{ fontSize:11, color:'var(--color-text-tertiary)' }}>{stats?.enquiries?.total||0} total enquiries</p>
              </div>
              <BarChart2 size={16} style={{ color:'var(--color-text-tertiary)' }}/>
            </div>
            <BarChart
              data={(stats?.daily_enquiries||[{date:'Mon',value:2},{date:'Tue',value:4},{date:'Wed',value:1},{date:'Thu',value:6},{date:'Fri',value:3},{date:'Sat',value:5},{date:'Sun',value:2}]).map(d=>({
                label: new Date(d.date||Date.now()).toLocaleDateString('en-AE',{weekday:'short'})||d.date||'',
                value: parseInt(d.count||d.value||0),
              }))}
              color="#3b82f6" height={90}
            />
          </div>

          {/* Inventory breakdown */}
          <div className="card p-5">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--color-text-primary)' }}>Inventory breakdown</p>
                <p style={{ fontSize:11, color:'var(--color-text-tertiary)' }}>By product type</p>
              </div>
              <Activity size={16} style={{ color:'var(--color-text-tertiary)' }}/>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {(stats?.inventory_breakdown||[
                { inventory_type:'jewellery', count:0, active:0 },
                { inventory_type:'diamond',   count:0, active:0 },
                { inventory_type:'gemstone',  count:0, active:0 },
              ]).map((row,i)=>{
                const total = stats?.inventory_breakdown?.reduce((s,r)=>s+parseInt(r.count||0),1)||1;
                const pct   = Math.round((parseInt(row.count||0)/total)*100);
                const colors= ['#b8860b','#3b82f6','#9333ea','#16a34a','#f59e0b'];
                return (
                  <div key={i}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, color:'var(--color-text-secondary)', textTransform:'capitalize' }}>{row.inventory_type||'Other'}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:'var(--color-text-primary)' }}>{row.count||0}</span>
                    </div>
                    <div style={{ height:4, background:'var(--color-background-tertiary)', borderRadius:2 }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:colors[i%colors.length], borderRadius:2, transition:'width .5s ease' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom row — Activity + Quick actions */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {/* Recent activity */}
          <div className="card p-5">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--color-text-primary)' }}>Recent activity</p>
              <Link to="/enquiries" style={{ fontSize:11, color:'#b8860b', textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
                View all <ChevronRight size={11}/>
              </Link>
            </div>
            <ActivityFeed items={activity}/>
          </div>

          {/* Quick actions */}
          <div className="card p-5">
            <p style={{ fontSize:13, fontWeight:700, color:'var(--color-text-primary)', marginBottom:16 }}>Quick actions</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {QUICK_ACTIONS.map(a=>(
                <button key={a.label} onClick={()=>navigate(a.href)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', border:'1px solid var(--color-border-tertiary)', borderRadius:10, background:'var(--color-background-primary)', cursor:'pointer', transition:'all .15s', textAlign:'left' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=a.color; e.currentTarget.style.background='var(--color-background-secondary)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--color-border-tertiary)'; e.currentTarget.style.background='var(--color-background-primary)'; }}>
                  <span style={{ fontSize:18 }}>{a.icon}</span>
                  <span style={{ fontSize:11, fontWeight:500, color:'var(--color-text-secondary)' }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CRM Pipeline Widget */}
        <CrmPipelineWidget/>

      </div>
    </>
  );
}
