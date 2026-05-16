import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Topbar from "../components/layout/Topbar";

const LAST_UPDATED = "2026-05-16";
const PLATFORM = "Jewellery Commerce OS";

const S = {
  DONE:    { label: "Done",     cls: "status-done",    icon: "ti-circle-check" },
  PARTIAL: { label: "Partial",  cls: "status-partial", icon: "ti-clock"        },
  TODO:    { label: "Pending",  cls: "status-todo",    icon: "ti-circle-dashed"},
};

const MODULES = [
  { id:"infra", icon:"ti-server-2", name:"Infrastructure", phase:"Core", items:[
    { n:"Docker Compose — PostgreSQL · Redis · Backend · Admin · pgAdmin", s:"DONE" },
    { n:"PostgreSQL 16 (shared with Vantix ERP)", s:"DONE" },
    { n:"Redis cache + sessions", s:"DONE" },
    { n:"Nodemon hot-reload (backend)", s:"DONE" },
    { n:"Vite hot-reload (admin panel)", s:"DONE" },
    { n:"GitHub private repo + batch scripts (start / stop / migrate)", s:"DONE" },
    { n:"Nginx + SSL — production setup", s:"TODO", note:"Before first client goes live" },
    { n:"PM2 auto-restart on VPS", s:"TODO" },
    { n:"Automated daily DB backups", s:"TODO" },
    { n:"CI/CD pipeline + staging environment", s:"TODO" },
    { n:"Error tracking — Sentry", s:"TODO" },
    { n:"Admin 2FA — TOTP", s:"TODO" },
  ]},
  { id:"auth", icon:"ti-shield-lock", name:"Auth & Users", phase:"Core", items:[
    { n:"JWT login + logout", s:"DONE" },
    { n:"RBAC — 5 roles with hierarchy (super_admin → viewer)", s:"DONE" },
    { n:"Permissions matrix — 11 resources × 4 actions", s:"DONE" },
    { n:"Users admin — invite, edit, deactivate", s:"DONE" },
    { n:"Role guide + permissions matrix page", s:"DONE" },
    { n:"Audit log — all actions tracked", s:"DONE" },
    { n:"Forgot password / email reset", s:"TODO" },
    { n:"Admin 2FA", s:"TODO" },
    { n:"Workshop Manager role", s:"TODO", note:"For manufacturing module" },
  ]},
  { id:"inventory", icon:"ti-database", name:"Inventory Engine", phase:"Core", items:[
    { n:"inventory_type on products — JEWELLERY, NATURAL_DIAMOND, LAB_GROWN, GEMSTONE, PEARL, MOUNTING, CUSTOM_DESIGN, PARCEL", s:"DONE", note:"Migration 008" },
    { n:"inventory_mode — IN_HOUSE, MEMO, SUPPLIER, MADE_TO_ORDER, VIRTUAL", s:"DONE", note:"Migration 008" },
    { n:"Feature flags — 19 module on/off flags per client", s:"DONE", note:"Migration 008" },
    { n:"Feature flags admin page — enable/disable modules per client", s:"TODO" },
    { n:"Inventory type-routed product form", s:"TODO", note:"Form shows correct fields per type" },
    { n:"Dynamic attribute engine — admin creates new stone types without code", s:"TODO" },
    { n:"Bulk CSV/XLS import engine — RapNet format + supplier sheets", s:"TODO" },
    { n:"Import job tracking — status, errors, matched/skipped", s:"TODO" },
  ]},
  { id:"jewellery", icon:"ti-diamond", name:"Jewellery Module", phase:"Inventory", items:[
    { n:"Jewellery specs — metal, purity, gross/net weight", s:"DONE" },
    { n:"Making charges (flat AED + %)", s:"DONE" },
    { n:"Ring sizes, occasion tags, gender", s:"DONE" },
    { n:"Multi-image gallery with primary image", s:"DONE" },
    { n:"Jewellery BOM — component table (1 ring = diamond + side stones + gold)", s:"DONE", note:"Migration 008" },
    { n:"5-tab jewellery specs form (metal · certs · images · pricing · details)", s:"DONE" },
    { n:"Jewellery variants — size matrix, metal options", s:"TODO" },
    { n:"Custom jewellery flow — inquiry → CAD → approval → production", s:"TODO" },
  ]},
  { id:"diamonds", icon:"ti-hexagon", name:"Diamond Module", phase:"Inventory", items:[
    { n:"diamond_details table — 4Cs, measurements, polish, symmetry, fluorescence, laser inscription", s:"DONE", note:"Migration 008" },
    { n:"Natural vs lab-grown flag + CVD/HPHT type", s:"DONE", note:"Migration 008" },
    { n:"Rapaport pricing structure — rap_rate, discount %, final_rate", s:"DONE", note:"Migration 008" },
    { n:"Diamond hold system — hold_until, hold_by_customer", s:"DONE", note:"Migration 008" },
    { n:"Diamond admin form — full grading UI", s:"TODO" },
    { n:"Diamond search API — faceted (shape, carat, color, clarity, cut, lab, price)", s:"TODO" },
    { n:"Diamond comparison — up to 4 side by side", s:"TODO" },
    { n:"360° diamond viewer", s:"TODO" },
    { n:"Rapaport auto-pricing — fetch + markup rules", s:"TODO" },
    { n:"Supplier inventory sync", s:"TODO" },
  ]},
  { id:"gemstones", icon:"ti-oval", name:"Gemstone Module", phase:"Inventory", items:[
    { n:"gemstone_details table — species, variety, origin, treatment, saturation, tone", s:"DONE", note:"Migration 008" },
    { n:"Colour stone cert labs — GRS, SSEF, GIA, Gübelin, Lotus", s:"DONE", note:"Migration 008" },
    { n:"Gemstone admin form", s:"TODO" },
    { n:"Gemstone search + filter page", s:"TODO" },
  ]},
  { id:"pearls", icon:"ti-circle", name:"Pearl Module", phase:"Inventory", items:[
    { n:"pearl_details table — type, nacre, lustre, overtone, shape, size_mm, matching grade", s:"DONE", note:"Migration 008" },
    { n:"Pearl types — Akoya, South Sea, Tahitian, Freshwater", s:"DONE" },
    { n:"Pearl admin form", s:"TODO" },
  ]},
  { id:"mountings", icon:"ti-ring", name:"Mounting Module", phase:"Inventory", items:[
    { n:"mounting_details table — type, style, shank, head, prong, CAD file, metal options", s:"DONE", note:"Migration 008" },
    { n:"Compatible stone shapes + carat ranges", s:"DONE", note:"Migration 008" },
    { n:"Mounting admin form", s:"TODO" },
    { n:"Stone + mounting builder — customer picks both", s:"TODO" },
    { n:"Mounting catalogue storefront page", s:"TODO" },
  ]},
  { id:"certs", icon:"ti-certificate", name:"Certificate Engine", phase:"Trust", items:[
    { n:"Certificate storage — lab, number, date, PDF upload", s:"DONE" },
    { n:"Certifications UI on product form", s:"DONE" },
    { n:"Diamond cert URL + primary cert fields", s:"DONE", note:"Migration 008" },
    { n:"Public verification page — /verify/:cert_number", s:"TODO", note:"Critical for customer trust" },
    { n:"QR code generation per certificate", s:"TODO" },
  ]},
  { id:"suppliers", icon:"ti-building-store", name:"Supplier & Memo", phase:"Operations", items:[
    { n:"Suppliers table — name, contact, terms, currency, discount", s:"DONE", note:"Migration 008" },
    { n:"Memo tracking table — items, status, due date", s:"DONE", note:"Migration 008" },
    { n:"Suppliers admin page", s:"TODO" },
    { n:"Memo admin page — issue, mark returned/sold", s:"TODO" },
    { n:"Supplier inventory sync via CSV", s:"TODO" },
  ]},
  { id:"manufacturing", icon:"ti-tools", name:"Manufacturing & Custom Orders", phase:"Operations", items:[
    { n:"custom_orders table — full 10-stage workflow", s:"DONE", note:"Migration 008" },
    { n:"custom_order_cad table — versions, approval, customer feedback", s:"DONE", note:"Migration 008" },
    { n:"Workflow: INQUIRY → DESIGNING → APPROVAL_PENDING → APPROVED → MANUFACTURING → STONE_SETTING → POLISHING → QC → READY → SHIPPED", s:"DONE", note:"Migration 008" },
    { n:"Custom orders admin page", s:"TODO" },
    { n:"CAD file management — upload, versions, approve/reject", s:"TODO" },
    { n:"Workshop status board", s:"TODO" },
    { n:"Craftsman assignment", s:"TODO" },
    { n:"Customer custom order request flow (storefront)", s:"TODO" },
  ]},
  { id:"pricing", icon:"ti-currency-dollar", name:"Pricing Engine", phase:"Commerce", items:[
    { n:"Base price + making charges + discount calculation", s:"DONE" },
    { n:"Live gold rate table — manual entry", s:"DONE" },
    { n:"Price preview — weight × rate + making charges", s:"DONE" },
    { n:"Rapaport pricing structure in DB", s:"DONE", note:"Migration 008" },
    { n:"Auto gold rate fetch — cron job", s:"TODO" },
    { n:"Rapaport live feed integration", s:"TODO" },
    { n:"Markup rules engine — % above/below Rap", s:"TODO" },
    { n:"Dynamic pricing per country and currency", s:"TODO" },
  ]},
  { id:"crm", icon:"ti-messages", name:"CRM — Enquiries, Appointments, WhatsApp", phase:"Commerce", items:[
    { n:"Enquiry CRM — list, detail, status tracking", s:"DONE" },
    { n:"WhatsApp quick reply + link generator", s:"DONE" },
    { n:"Boutique appointment booking — 5-step Cartier-style flow", s:"DONE" },
    { n:"Appointments admin + today summary", s:"DONE" },
    { n:"Customer database — CRUD + import from enquiries", s:"DONE" },
    { n:"Auto-reply emails — enquiry + appointment confirmation", s:"DONE" },
    { n:"Saved diamond searches (customer portal)", s:"TODO" },
    { n:"Customer login portal", s:"TODO" },
  ]},
  { id:"commerce", icon:"ti-shopping-cart", name:"Commerce Engine", phase:"Commerce", items:[
    { n:"Orders admin — list, detail, status update", s:"DONE" },
    { n:"Promo codes — % + fixed, min order, expiry", s:"DONE" },
    { n:"Cart — guest + logged in + saved + reserved inventory", s:"TODO" },
    { n:"Checkout — address, shipping, payment, VAT", s:"TODO" },
    { n:"Payment gateways — Stripe, Telr, Tabby, Tamara", s:"TODO" },
    { n:"Shipping — Aramex, DHL, FedEx", s:"TODO" },
    { n:"Customer account portal", s:"TODO" },
    { n:"Invoice PDF generation", s:"TODO" },
  ]},
  { id:"admin_ui", icon:"ti-layout-dashboard", name:"Admin Panel — UI Pages", phase:"Frontend", items:[
    { n:"Login page — 65/35 split, jewellery showcase, remember me", s:"DONE" },
    { n:"Dashboard — real KPIs, activity feed, low stock alerts", s:"DONE" },
    { n:"Products list — paginated, filtered, 💎 specs button", s:"DONE" },
    { n:"Product form — inventory type aware, jewellery fields", s:"DONE" },
    { n:"Jewellery specs form — 5 tabs", s:"DONE" },
    { n:"Categories + collections manager", s:"DONE" },
    { n:"Media library — upload, gallery, preview", s:"DONE" },
    { n:"Enquiries CRM page", s:"DONE" },
    { n:"Appointments admin page", s:"DONE" },
    { n:"Customers page", s:"DONE" },
    { n:"Orders page", s:"DONE" },
    { n:"Inventory page — stock + ledger", s:"DONE" },
    { n:"Marketing — banners + promos", s:"DONE" },
    { n:"Store locations page", s:"DONE" },
    { n:"Trust badges page", s:"DONE" },
    { n:"Plugin marketplace — install, configure", s:"DONE" },
    { n:"Users + roles + permissions matrix", s:"DONE" },
    { n:"Settings page", s:"DONE" },
    { n:"Audit log viewer", s:"DONE" },
    { n:"Diamond inventory form — 4Cs, measurements, Rap pricing", s:"TODO" },
    { n:"Gemstone inventory form", s:"TODO" },
    { n:"Pearl inventory form", s:"TODO" },
    { n:"Mounting catalogue form", s:"TODO" },
    { n:"Suppliers admin page", s:"TODO" },
    { n:"Memo tracking page", s:"TODO" },
    { n:"Custom orders admin + CAD workflow", s:"TODO" },
    { n:"Import engine — CSV upload + field mapping", s:"TODO" },
    { n:"Feature flags — enable/disable modules per client", s:"TODO" },
    { n:"Certificate management + QR generator", s:"TODO" },
    { n:"Blog + education content manager", s:"TODO" },
    { n:"Visual page builder — drag and drop", s:"TODO" },
  ]},
  { id:"storefront", icon:"ti-world", name:"Next.js Storefront", phase:"Frontend", items:[
    { n:"Homepage — hero, collections, diamonds, gemstones, appointment CTA", s:"TODO" },
    { n:"Jewellery catalogue — filters by metal, purity, occasion, gender, price", s:"TODO" },
    { n:"Diamond search — live filters, shape, carat, color, clarity, cut, lab, price", s:"TODO" },
    { n:"Gemstone search page", s:"TODO" },
    { n:"Product detail page — gallery, zoom, 360, cert viewer, WhatsApp button", s:"TODO" },
    { n:"Mounting catalogue page", s:"TODO" },
    { n:"Stone + mounting builder", s:"TODO" },
    { n:"Custom jewellery request flow", s:"TODO" },
    { n:"Certificate verification — /verify/:cert_number", s:"TODO" },
    { n:"Cart + checkout + payment", s:"TODO" },
    { n:"Customer account portal", s:"TODO" },
    { n:"Blog / education hub", s:"TODO" },
    { n:"WhatsApp floating button + product enquiry", s:"TODO" },
    { n:"SEO — SSR, schema.org, sitemap, Open Graph, canonical", s:"TODO" },
    { n:"Arabic RTL support", s:"TODO" },
    { n:"Multi-currency — AED, USD, SAR, INR", s:"TODO" },
  ]},
];

const PHASES = ["Core","Inventory","Trust","Operations","Commerce","Frontend"];
const PHASE_COLORS = {
  Core:"#6366f1", Inventory:"#c9a84c", Trust:"#22c55e",
  Operations:"#f59e0b", Commerce:"#3b82f6", Frontend:"#8b5cf6"
};

function pct(items) {
  const d = items.filter(i=>i.s==="DONE").length;
  const p = items.filter(i=>i.s==="PARTIAL").length;
  return Math.round(((d + p*0.5)/items.length)*100);
}

export default function DevStatusPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [filter, setFilter]     = useState("ALL");
  const [phase,  setPhase]      = useState("ALL");
  const [open,   setOpen]       = useState({});

  const toggle = id => setOpen(o=>({...o,[id]:o[id]===false?true:false}));
  const isOpen = id => open[id] !== false;

  const allItems = MODULES.flatMap(m=>m.items);
  const done    = allItems.filter(i=>i.s==="DONE").length;
  const partial = allItems.filter(i=>i.s==="PARTIAL").length;
  const todo    = allItems.filter(i=>i.s==="TODO").length;
  const total   = allItems.length;
  const overall = Math.round(((done+partial*0.5)/total)*100);

  const visibleModules = MODULES.filter(m => {
    if (phase !== "ALL" && m.phase !== phase) return false;
    if (filter === "ALL") return true;
    return m.items.some(i=>i.s===filter);
  });

  return (
    <>
      <Topbar title="Development status" subtitle={`${PLATFORM} · Updated ${LAST_UPDATED}`}
        collapsed={collapsed} onToggle={toggleSidebar} />

      <div className="flex-1 overflow-y-auto">
        <div style={{maxWidth:860,margin:"0 auto",padding:"20px 20px 48px"}}>

          {/* ── OVERALL PROGRESS CARD ── */}
          <div className="card p-5 mb-5">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div>
                <p className="text-xs text-ink-400 uppercase tracking-wide font-medium mb-1">Overall progress</p>
                <p className="text-sm text-ink-600 dark:text-ink-300">{PLATFORM} · {total} tasks across {MODULES.length} modules</p>
              </div>
              <div style={{textAlign:"right"}}>
                <span style={{fontSize:36,fontWeight:500,color:"#c9a84c",lineHeight:1}}>{overall}%</span>
                <p className="text-xs text-ink-400 mt-1">complete</p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{height:6,background:"var(--color-border-tertiary)",borderRadius:6,overflow:"hidden",marginBottom:16}}>
              <div style={{height:"100%",width:`${overall}%`,background:"#c9a84c",borderRadius:6,transition:"width .5s"}}/>
            </div>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[
                {label:"Total tasks", val:total,   color:"var(--color-text-primary)"},
                {label:"Done",        val:done,    color:"#22c55e"},
                {label:"In progress", val:partial, color:"#f59e0b"},
                {label:"Pending",     val:todo,    color:"var(--color-text-secondary)"},
              ].map(s=>(
                <div key={s.label} style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px"}}>
                  <div style={{fontSize:24,fontWeight:500,color:s.color}}>{s.val}</div>
                  <div style={{fontSize:11,color:"var(--color-text-secondary)",marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PHASE PROGRESS MINI BARS ── */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:20}}>
            {PHASES.map(ph=>{
              const mods = MODULES.filter(m=>m.phase===ph);
              const items = mods.flatMap(m=>m.items);
              if(!items.length) return null;
              const p = pct(items);
              const col = PHASE_COLORS[ph];
              return (
                <button key={ph} onClick={()=>setPhase(phase===ph?"ALL":ph)}
                  style={{background:phase===ph?"var(--color-background-primary)":"var(--color-background-secondary)",
                    border:`0.5px solid ${phase===ph?col:"var(--color-border-tertiary)"}`,
                    borderRadius:"var(--border-radius-md)",padding:"10px 12px",cursor:"pointer",textAlign:"left"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:500,color:"var(--color-text-primary)"}}>{ph}</span>
                    <span style={{fontSize:12,fontWeight:500,color:col}}>{p}%</span>
                  </div>
                  <div style={{height:3,background:"var(--color-border-tertiary)",borderRadius:3}}>
                    <div style={{height:"100%",width:`${p}%`,background:col,borderRadius:3,transition:"width .4s"}}/>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── FILTERS ── */}
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:"var(--color-text-secondary)",marginRight:4}}>Status</span>
            {["ALL","DONE","PARTIAL","TODO"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:filter===f?500:400,cursor:"pointer",
                  background:filter===f?"var(--color-text-primary)":"transparent",
                  color:filter===f?"var(--color-background-primary)":"var(--color-text-secondary)",
                  border:"0.5px solid var(--color-border-secondary)"}}>
                {f==="ALL"?"All":S[f].label}
              </button>
            ))}
            {(filter!=="ALL"||phase!=="ALL") && (
              <button onClick={()=>{setFilter("ALL");setPhase("ALL");}}
                style={{padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",color:"var(--color-text-danger)",
                  border:"0.5px solid var(--color-border-danger)",background:"transparent",marginLeft:"auto"}}>
                Clear filters
              </button>
            )}
          </div>

          {/* ── MODULE CARDS ── */}
          {visibleModules.map(mod=>{
            const filtItems = filter==="ALL" ? mod.items : mod.items.filter(i=>i.s===filter);
            if(!filtItems.length && filter!=="ALL") return null;
            const p = pct(mod.items);
            const phCol = PHASE_COLORS[mod.phase] || "#888";
            const expanded = isOpen(mod.id);
            const doneCount = mod.items.filter(i=>i.s==="DONE").length;

            return (
              <div key={mod.id} className="card mb-3" style={{overflow:"hidden"}}>
                {/* Module header */}
                <div onClick={()=>toggle(mod.id)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",cursor:"pointer",
                    borderBottom:expanded?"0.5px solid var(--color-border-tertiary)":"none"}}>

                  {/* Icon */}
                  <div style={{width:36,height:36,borderRadius:"var(--border-radius-md)",
                    background:`${phCol}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <i className={`ti ${mod.icon}`} style={{fontSize:16,color:phCol}} aria-hidden="true"/>
                  </div>

                  {/* Name + progress */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)"}}>{mod.name}</span>
                      <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,fontWeight:500,
                        background:`${phCol}15`,color:phCol}}>{mod.phase}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1,height:3,background:"var(--color-border-tertiary)",borderRadius:3}}>
                        <div style={{height:"100%",width:`${p}%`,background:p===100?"#22c55e":p>30?"#c9a84c":"var(--color-border-secondary)",
                          borderRadius:3,transition:"width .4s"}}/>
                      </div>
                      <span style={{fontSize:11,color:"var(--color-text-secondary)",whiteSpace:"nowrap"}}>
                        {doneCount}/{mod.items.length}
                      </span>
                    </div>
                  </div>

                  {/* Percentage + chevron */}
                  <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                    <span style={{fontSize:14,fontWeight:500,
                      color:p===100?"#22c55e":p>30?"#c9a84c":"var(--color-text-secondary)"}}>{p}%</span>
                    <i className={`ti ti-chevron-${expanded?"up":"down"}`}
                      style={{fontSize:14,color:"var(--color-text-secondary)"}} aria-hidden="true"/>
                  </div>
                </div>

                {/* Items list */}
                {expanded && (
                  <div style={{padding:"4px 0 8px"}}>
                    {filtItems.map((item,idx)=>{
                      const st = S[item.s];
                      return (
                        <div key={idx}
                          style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 16px",
                            background:idx%2===0?"transparent":"var(--color-background-secondary)"}}>
                          <i className={`ti ${st.icon}`}
                            style={{fontSize:14,flexShrink:0,marginTop:2,
                              color:item.s==="DONE"?"#22c55e":item.s==="PARTIAL"?"#f59e0b":"var(--color-border-secondary)"}}
                            aria-hidden="true"/>
                          <div style={{flex:1,minWidth:0}}>
                            <span style={{fontSize:12,
                              color:item.s==="DONE"?"var(--color-text-secondary)":"var(--color-text-primary)",
                              textDecoration:item.s==="DONE"?"line-through":"none"}}>
                              {item.n}
                            </span>
                            {item.note && (
                              <span style={{fontSize:10,color:"var(--color-text-secondary)",marginLeft:6,
                                background:"var(--color-background-secondary)",padding:"1px 6px",
                                borderRadius:4,display:"inline-block",marginTop:2}}>
                                {item.note}
                              </span>
                            )}
                          </div>
                          <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,flexShrink:0,fontWeight:500,whiteSpace:"nowrap",
                            background:item.s==="DONE"?"#dcfce7":item.s==="PARTIAL"?"#fef9c3":"var(--color-background-secondary)",
                            color:item.s==="DONE"?"#15803d":item.s==="PARTIAL"?"#a16207":"var(--color-text-secondary)"}}>
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <p style={{fontSize:11,color:"var(--color-text-secondary)",textAlign:"center",marginTop:8}}>
            {PLATFORM} · KenTech Global · {LAST_UPDATED}
          </p>
        </div>
      </div>
    </>
  );
}
