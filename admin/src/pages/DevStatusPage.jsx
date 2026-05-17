import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import api from "../services/api";

const LAST_UPDATED = "2026-05-16";
const PLATFORM = "Jewellery Commerce OS";

const PHASE_COLORS = {
  Core:"#6366f1", Inventory:"#c9a84c", Trust:"#22c55e",
  Operations:"#f59e0b", Commerce:"#3b82f6", Frontend:"#8b5cf6"
};

const MODULES = [
  { id:"infra",         icon:"ti-server-2",        name:"Infrastructure",      phase:"Core",       total:12, done:7  },
  { id:"auth",          icon:"ti-shield-lock",      name:"Auth & Users",        phase:"Core",       total:9,  done:6  },
  { id:"inventory",     icon:"ti-database",         name:"Inventory Engine",    phase:"Inventory",  total:8,  done:3  },
  { id:"jewellery",     icon:"ti-diamond",          name:"Jewellery Module",    phase:"Inventory",  total:8,  done:6  },
  { id:"diamonds",      icon:"ti-hexagon",          name:"Diamond Module",      phase:"Inventory",  total:11, done:5  },
  { id:"gemstones",     icon:"ti-oval",             name:"Gemstone Module",     phase:"Inventory",  total:4,  done:3  },
  { id:"pearls",        icon:"ti-circle",           name:"Pearl Module",        phase:"Inventory",  total:3,  done:3  },
  { id:"mountings",     icon:"ti-ring",             name:"Mounting Module",     phase:"Inventory",  total:5,  done:3  },
  { id:"certs",         icon:"ti-certificate",      name:"Certificate Engine",  phase:"Trust",      total:5,  done:3  },
      { id:"pricing",       icon:"ti-currency-dollar",  name:"Pricing Engine",      phase:"Commerce",   total:8,  done:4  },
  { id:"crm",           icon:"ti-messages",         name:"CRM & Appointments",  phase:"Commerce",   total:8,  done:6  },
  { id:"commerce",      icon:"ti-shopping-cart",    name:"Commerce Engine",     phase:"Commerce",   total:8,  done:2  },
  { id:"admin_ui",      icon:"ti-layout-dashboard", name:"Admin Panel UI",      phase:"Frontend",   total:32, done:32 },
  { id:"storefront",    icon:"ti-world",            name:"Next.js Storefront",  phase:"Frontend",   total:16, done:10 },
];

const INTEGRATIONS = [
  { name:"PostgreSQL 16",      status:"live",    note:"Shared with Vantix ERP" },
  { name:"Redis Cache",        status:"live",    note:"Session + API cache" },
  { name:"Cloudinary Media",   status:"live",    note:"Images, PDFs, CAD files" },
  { name:"WhatsApp Enquiry",   status:"live",    note:"Pre-filled product links" },
  { name:"Email / SMTP",       status:"live",    note:"Nodemailer — lazy loaded" },
  { name:"Docker Compose",     status:"live",    note:"Full dev environment" },
  { name:"Meilisearch",        status:"planned", note:"Diamond faceted search" },
  { name:"Rapaport Pricing",   status:"planned", note:"Diamond rap rate feed" },
  { name:"Payment Gateways",   status:"planned", note:"Stripe · Telr · Tabby · Tamara" },
  { name:"Shipping APIs",      status:"planned", note:"Aramex · DHL · FedEx" },
  { name:"RapNet Import",      status:"planned", note:"Bulk diamond CSV import" },
  { name:"Google Calendar",    status:"planned", note:"Appointment sync" },
  { name:"2FA / TOTP",         status:"planned", note:"Admin security" },
  { name:"Nginx + SSL",        status:"planned", note:"Production deployment" },
  { name:"Sentry",             status:"planned", note:"Error tracking" },
  { name:"CI/CD Pipeline",     status:"planned", note:"Staging + auto deploy" },
];

const GAPS = [
  { path:"Diamond inventory form",    note:"Admin UI for diamond_details table — 4Cs, measurements, Rap pricing" },
  { path:"Gemstone / Pearl / Mounting forms", note:"Inventory type-specific admin forms not built" },
  { path:"Public /verify/:cert_number", note:"Certificate verification page — critical for customer trust" },
  { path:"Next.js storefront",        note:"Public website not started — needed for first client go-live" },
  { path:"Feature flags admin UI",    note:"Enable/disable modules per client — DB done, page missing" },
  { path:"Cart + Checkout",           note:"Commerce engine not started" },
  { path:"Suppliers + Memo pages",    note:"DB tables exist, admin UI not built" },
  { path:"Custom orders workflow",    note:"Manufacturing tables exist, admin UI not built" },
];

const DB_TABLES = [
  "users","categories","collections","products","media","inventory_ledger",
  "orders","banners","promo_codes","audit_logs","plugins","installed_plugins",
  "product_extensions","product_jewellery_specs","product_certifications",
  "product_images","metal_rates","enquiries","wishlists","trust_badges",
  "content_pages","store_locations","appointments","customers","settings",
  "diamond_details","gemstone_details","pearl_details","mounting_details",
  "jewellery_components","suppliers","memos","memo_items","custom_orders",
  "custom_order_cad","import_jobs","feature_flags",
];

const totalDone = MODULES.reduce((a,m)=>a+m.done,0);
const totalAll  = MODULES.reduce((a,m)=>a+m.total,0);
const overall   = Math.round((totalDone/totalAll)*100);

export default function DevStatusPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [dbCounts, setDbCounts] = useState({});
  const [apiOk,    setApiOk]    = useState(null);
  const [dbOk,     setDbOk]     = useState(null);
  const [now,      setNow]      = useState(new Date());
  const [refreshed,setRefreshed]= useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);

  const check = async () => {
    setRefreshed(true);
    setTimeout(()=>setRefreshed(false),1200);
    try {
      await api.get("/health").catch(()=>api.get("/auth/me").catch(()=>{}));
      setApiOk(true);
    } catch { setApiOk(false); }
    try {
      const r = await api.get("/dashboard/stats");
      setDbOk(true);
      if (r.data?.data) {
        setDbCounts({
          products: r.data.data.products?.total || 0,
          enquiries: r.data.data.enquiries?.total || 0,
          appointments: r.data.data.appointments?.total || 0,
          orders: r.data.data.orders?.total || 0,
          users: r.data.data.users || 0,
        });
      }
    } catch { setDbOk(false); }
    setNow(new Date());
  };

  useEffect(() => { check(); }, []);

  const phases = [...new Set(MODULES.map(m=>m.phase))];
  const visibleModules = selectedPhase ? MODULES.filter(m=>m.phase===selectedPhase) : MODULES;

  const S = {
    live:    { label:"Live",    bg:"#dcfce7", color:"#15803d" },
    planned: { label:"Planned", bg:"#e0e7ff", color:"#3730a3" },
    local:   { label:"Local",   bg:"#fef9c3", color:"#a16207" },
  };

  return (
    <>
      <Topbar title="System status"
        subtitle={`${PLATFORM} — live build progress and database health`}
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={
          <button onClick={check}
            className="btn-outline flex items-center gap-1.5 text-xs">
            <i className={`ti ti-refresh ${refreshed?"animate-spin":""}`} aria-hidden="true"/>
            Refresh
          </button>
        }/>

      <div className="flex-1 overflow-y-auto">
        <div style={{maxWidth:940,margin:"0 auto",padding:"20px 20px 48px"}}>

          {/* ── HERO CARD ── */}
          <div style={{background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e3a5f 100%)",
            borderRadius:16,padding:"28px 32px",marginBottom:20,color:"#fff",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",
              background:"rgba(255,255,255,0.04)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:-60,left:200,width:300,height:300,borderRadius:"50%",
              background:"rgba(255,255,255,0.03)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
              <div>
                <p style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase"}}>
                  Overall completion
                </p>
                <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:8}}>
                  <span style={{fontSize:52,fontWeight:600,color:"#c9a84c",lineHeight:1}}>{overall}%</span>
                </div>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>
                  {MODULES.length} modules · {totalDone} / {totalAll} tasks done
                </p>
              </div>
              <div style={{minWidth:220}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>Build progress</span>
                  <span style={{fontSize:12,color:"rgba(255,255,255,0.7)"}}>{overall}%</span>
                </div>
                <div style={{height:6,background:"rgba(255,255,255,0.1)",borderRadius:6,marginBottom:8}}>
                  <div style={{height:"100%",width:`${overall}%`,background:"#c9a84c",borderRadius:6}}/>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e"}}/>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>
                    Status: {apiOk===null?"checking…":apiOk?"healthy":"backend offline"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── SYSTEM HEALTH ── */}
          <div style={{marginBottom:20}}>
            <p style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)",marginBottom:10}}>System health</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {[
                { icon:"ti-api",      label:"Backend API",        ok:apiOk,  sub:apiOk?"Running on port 4000":"Not reachable" },
                { icon:"ti-database", label:"Database",           ok:dbOk,   sub:dbOk?"PostgreSQL 16 connected":"Connection failed" },
                { icon:"ti-clock",    label:"Server time (UTC)",  ok:true,   sub:now.toUTCString().slice(0,25) },
              ].map(h=>(
                <div key={h.label} className="card" style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:34,height:34,borderRadius:"var(--border-radius-md)",
                      background:h.ok===null?"var(--color-background-secondary)":h.ok?"#dcfce7":"#fee2e2",
                      display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <i className={`ti ${h.icon}`}
                        style={{fontSize:16,color:h.ok===null?"var(--color-text-secondary)":h.ok?"#15803d":"#b91c1c"}}
                        aria-hidden="true"/>
                    </div>
                    <div>
                      <p style={{fontSize:12,fontWeight:500,color:"var(--color-text-primary)",margin:0}}>{h.label}</p>
                      <p style={{fontSize:11,color:h.ok===null?"var(--color-text-secondary)":h.ok?"#15803d":"#b91c1c",margin:0,marginTop:2}}>
                        {h.ok===null?"Checking…":h.ok?"● Online":"● Offline"} — {h.sub}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── MODULE COMPLETION ── */}
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <p style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)"}}>Module completion</p>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setSelectedPhase(null)}
                  style={{padding:"3px 10px",borderRadius:20,fontSize:11,cursor:"pointer",
                    background:!selectedPhase?"var(--color-text-primary)":"transparent",
                    color:!selectedPhase?"var(--color-background-primary)":"var(--color-text-secondary)",
                    border:"0.5px solid var(--color-border-secondary)"}}>All</button>
                {phases.map(ph=>(
                  <button key={ph} onClick={()=>setSelectedPhase(selectedPhase===ph?null:ph)}
                    style={{padding:"3px 10px",borderRadius:20,fontSize:11,cursor:"pointer",
                      background:selectedPhase===ph?PHASE_COLORS[ph]:"transparent",
                      color:selectedPhase===ph?"#fff":"var(--color-text-secondary)",
                      border:`0.5px solid ${selectedPhase===ph?PHASE_COLORS[ph]:"var(--color-border-secondary)"}`}}>
                    {ph}
                  </button>
                ))}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {visibleModules.map(m=>{
                const p = Math.round((m.done/m.total)*100);
                const col = PHASE_COLORS[m.phase];
                return (
                  <div key={m.id} className="card"
                    style={{padding:"14px 14px 12px",cursor:"pointer",transition:"border-color .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=col}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=""}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                      <div style={{width:30,height:30,borderRadius:"var(--border-radius-md)",
                        background:`${col}15`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <i className={`ti ${m.icon}`} style={{fontSize:14,color:col}} aria-hidden="true"/>
                      </div>
                      <span style={{fontSize:16,fontWeight:500,color:p===100?"#22c55e":p>50?col:"var(--color-text-secondary)"}}>{p}%</span>
                    </div>
                    <p style={{fontSize:12,fontWeight:500,color:"var(--color-text-primary)",marginBottom:2,lineHeight:1.3}}>{m.name}</p>
                    <p style={{fontSize:10,color:"var(--color-text-secondary)",marginBottom:8}}>{m.done}/{m.total} tasks</p>
                    <div style={{height:3,background:"var(--color-border-tertiary)",borderRadius:3}}>
                      <div style={{height:"100%",width:`${p}%`,
                        background:p===100?"#22c55e":p>50?col:"var(--color-border-secondary)",
                        borderRadius:3,transition:"width .4s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── INTEGRATION STATUS ── */}
          <div style={{marginBottom:20}}>
            <p style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)",marginBottom:10}}>Integration status</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {INTEGRATIONS.map(ig=>{
                const st = S[ig.status];
                return (
                  <div key={ig.name} className="card" style={{padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:500,color:"var(--color-text-primary)"}}>{ig.name}</span>
                      <span style={{fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:20,
                        background:st.bg,color:st.color,whiteSpace:"nowrap"}}>{st.label}</span>
                    </div>
                    <p style={{fontSize:10,color:"var(--color-text-secondary)",margin:0,lineHeight:1.4}}>{ig.note}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── KNOWN GAPS ── */}
          <div style={{marginBottom:20}}>
            <p style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)",marginBottom:10}}>
              Known gaps — {GAPS.length} items pending
            </p>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              {GAPS.map((g,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 16px",
                  borderBottom:i<GAPS.length-1?"0.5px solid var(--color-border-tertiary)":"none",
                  background:i%2===0?"transparent":"var(--color-background-secondary)"}}>
                  <i className="ti ti-alert-triangle" style={{fontSize:13,color:"#f59e0b",flexShrink:0,marginTop:2}} aria-hidden="true"/>
                  <div style={{flex:1,minWidth:0}}>
                    <span style={{fontSize:12,fontWeight:500,color:"var(--color-text-warning)",fontFamily:"var(--font-mono)"}}>{g.path}</span>
                    <span style={{fontSize:11,color:"var(--color-text-secondary)",marginLeft:12}}>{g.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── DATABASE TABLE COUNTS ── */}
          <div>
            <p style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)",marginBottom:10}}>
              Database tables — {DB_TABLES.length} tables created
            </p>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",
                padding:"8px 16px",borderBottom:"0.5px solid var(--color-border-tertiary)",
                background:"var(--color-background-secondary)"}}>
                {["Table","Row count","Exists"].map(h=>(
                  <span key={h} style={{fontSize:10,fontWeight:500,color:"var(--color-text-secondary)",
                    textTransform:"uppercase",letterSpacing:"0.06em",
                    textAlign:h==="Table"?"left":"right"}}>{h}</span>
                ))}
              </div>
              {DB_TABLES.map((t,i)=>{
                const count = dbCounts[t] ?? 0;
                return (
                  <div key={t} style={{display:"grid",gridTemplateColumns:"1fr auto auto",
                    padding:"7px 16px",alignItems:"center",
                    borderBottom:i<DB_TABLES.length-1?"0.5px solid var(--color-border-tertiary)":"none",
                    background:i%2===0?"transparent":"var(--color-background-secondary)"}}>
                    <span style={{fontSize:12,color:"var(--color-text-primary)",fontFamily:"var(--font-mono)"}}>{t}</span>
                    <span style={{fontSize:12,color:"var(--color-text-secondary)",textAlign:"right",paddingRight:32,
                      minWidth:60}}>{count}</span>
                    <span style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4}}>
                      <i className="ti ti-circle-check" style={{fontSize:14,color:"#22c55e"}} aria-hidden="true"/>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p style={{fontSize:10,color:"var(--color-text-secondary)",textAlign:"center",marginTop:16}}>
            {PLATFORM} · KenTech Global · Last updated {LAST_UPDATED}
          </p>
        </div>
      </div>
    </>
  );
}
