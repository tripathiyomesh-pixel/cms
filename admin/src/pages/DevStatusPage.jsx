import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import api from "../services/api";

const LAST_UPDATED = "2026-05-17 — All detail pages + ring builder + blog built";
const PLATFORM     = "Jewellery Commerce OS";
const VERSION      = "v0.9";

// ─── BACKEND MODULES ──────────────────────────────────────────
const BACKEND = [
  { id:"infra",     phase:"Core",       icon:"ti-server-2",       name:"Infrastructure",
    items:[
      { n:"Docker Compose — PostgreSQL · Redis · Backend · Admin · Storefront · pgAdmin", s:1 },
      { n:"PostgreSQL 16 — shared schema with Vantix ERP", s:1 },
      { n:"Redis cache + sessions", s:1 },
      { n:"Nodemon hot-reload (backend)", s:1 },
      { n:"GitHub private repo + batch scripts (start/stop/migrate)", s:1 },
      { n:"Gold rate auto-fetch cron (goldapi.io, every hour)", s:1 },
      { n:"Migration scripts 001–011 (all run)", s:1 },
      { n:"Nginx + SSL — production setup", s:0 },
      { n:"PM2 auto-restart on VPS", s:0 },
      { n:"CI/CD pipeline + staging environment", s:0 },
      { n:"Automated daily DB backups", s:0 },
      { n:"Error tracking — Sentry", s:0 },
    ]},

  { id:"auth",      phase:"Core",       icon:"ti-shield-lock",    name:"Auth & Users",
    items:[
      { n:"JWT login + logout + refresh token", s:1 },
      { n:"RBAC — 5 roles (super_admin → viewer) with hierarchy", s:1 },
      { n:"Permissions matrix — 11 resources × 4 actions", s:1 },
      { n:"Users admin — invite, edit, deactivate", s:1 },
      { n:"Role guide + permissions matrix page", s:1 },
      { n:"Audit log — all actions tracked with user + timestamp", s:1 },
      { n:"Forgot password / email reset flow", s:0 },
      { n:"Admin 2FA (TOTP)", s:0 },
    ]},

  { id:"inventory", phase:"Inventory",  icon:"ti-database",       name:"Inventory Engine",
    items:[
      { n:"inventory_type: JEWELLERY · NATURAL_DIAMOND · LAB_GROWN_DIAMOND · GEMSTONE · PEARL · MOUNTING · CUSTOM_DESIGN · PARCEL", s:1 },
      { n:"inventory_mode: IN_HOUSE · MEMO · SUPPLIER · MADE_TO_ORDER · VIRTUAL", s:1 },
      { n:"Product variants — size × metal × stone (Shopify-style)", s:1 },
      { n:"Product attributes — occasion, gender, style, tags, is_featured", s:1 },
      { n:"Feature flags — 19 module on/off toggles per client", s:1 },
      { n:"Bulk CSV import — template download + preview + process", s:1 },
      { n:"Import job tracking — status, errors, imported/skipped counts", s:1 },
      { n:"Full-text search index on products table", s:1 },
    ]},

  { id:"diamonds",  phase:"Inventory",  icon:"ti-hexagon",        name:"Diamond Module",
    items:[
      { n:"diamond_details table — 4Cs, measurements, polish, symmetry, fluorescence, laser inscription", s:1 },
      { n:"Natural vs lab-grown + CVD/HPHT type", s:1 },
      { n:"Rapaport pricing — rap_rate, discount %, final_rate", s:1 },
      { n:"Diamond hold system — hold_until, hold_by_customer", s:1 },
      { n:"Faceted search API — shape, carat, color, clarity, cut, lab, price, availability", s:1 },
      { n:"Diamond comparison — up to 4 side by side (POST /diamonds/compare)", s:1 },
      { n:"Admin form — 6-tab (identity, 4Cs, measurements, pricing/Rap, cert, availability)", s:1 },
      { n:"Bulk CSV import with RapNet column mapping", s:1 },
      { n:"Rapaport live feed integration (GOLD_API_KEY env)", s:0 },
      { n:"360° diamond viewer", s:0 },
    ]},

  { id:"gemstones", phase:"Inventory",  icon:"ti-oval",           name:"Gemstone Module",
    items:[
      { n:"gemstone_details — species, variety, origin, treatment, saturation, tone", s:1 },
      { n:"Cert labs — GRS, SSEF, GIA, Gübelin, Lotus", s:1 },
      { n:"Search API — filter by type, origin, treatment", s:1 },
      { n:"Admin form — 4-tab (identity, quality/colour, certification, pricing)", s:1 },
    ]},

  { id:"pearls",    phase:"Inventory",  icon:"ti-circle",         name:"Pearl Module",
    items:[
      { n:"pearl_details — type, nacre, lustre, overtone, shape, size_mm, matching grade", s:1 },
      { n:"Types — Akoya, South Sea, Tahitian, Freshwater", s:1 },
      { n:"Admin form + list page with type filters", s:1 },
    ]},

  { id:"jewellery", phase:"Inventory",  icon:"ti-diamond",        name:"Jewellery Module",
    items:[
      { n:"Jewellery specs — metal, purity, gross/net weight, making charges", s:1 },
      { n:"BOM (bill of materials) — centre stone + side stones + gold weight", s:1 },
      { n:"5-tab admin form — metal, certs, images, pricing, details", s:1 },
      { n:"Occasion, gender, style, is_featured, tags fields", s:1 },
      { n:"Product variants — ring sizes × metal options", s:1 },
      { n:"Collections + categories organisation", s:1 },
      { n:"Bulk import template", s:1 },
    ]},

  { id:"mountings", phase:"Inventory",  icon:"ti-ring",           name:"Mounting Module",
    items:[
      { n:"mounting_details — type, style, shank, head, prong, compatible shapes/carats", s:1 },
      { n:"CAD file URL + production days + metal options JSON", s:1 },
      { n:"Admin form — 6-tab (structure, compatibility, metals, sizes, manufacturing, pricing)", s:1 },
      { n:"Ring builder API — POST /api/storefront/ring-builder (diamond + mounting → price)", s:1 },
      { n:"Compatible diamonds auto-suggestion on mounting detail", s:1 },
    ]},

  { id:"certs",     phase:"Trust",      icon:"ti-certificate",    name:"Certificate Engine",
    items:[
      { n:"Certificate storage — lab, number, date, PDF (Cloudinary)", s:1 },
      { n:"Diamond cert — primary_cert_no, primary_cert_lab, cert_url", s:1 },
      { n:"Gemstone cert — GRS, SSEF, GIA, Gübelin, Lotus supported", s:1 },
      { n:"Public verification — GET /api/verify/:cert_number", s:1 },
      { n:"Searches both product_certifications and diamond_details", s:1 },
      { n:"QR code generation per certificate", s:0 },
    ]},

  { id:"custom",    phase:"Commerce",   icon:"ti-pencil",         name:"Custom Orders — Lead only",
    items:[
      { n:"Public POST /api/custom-orders — customer submits request", s:1 },
      { n:"Lead statuses — INQUIRY · CONTACTED · QUOTED · APPROVED · COMPLETED · CANCELLED", s:1 },
      { n:"Admin list + detail + status update", s:1 },
      { n:"ERP webhook — POST /api/custom-orders/erp-sync", s:1 },
      { n:"WhatsApp quick link per lead", s:1 },
      { n:"NOTE: CAD, manufacturing, workshop — all in Vantix ERP", s:1, note:true },
    ]},

  { id:"orders",    phase:"Commerce",   icon:"ti-shopping-cart",  name:"Orders",
    items:[
      { n:"Orders CRUD — create, list, get, status update", s:1 },
      { n:"Order statuses — pending · confirmed · processing · shipped · delivered · cancelled", s:1 },
      { n:"ERP webhook — POST /api/orders/erp-sync (status push from Vantix ERP)", s:1 },
      { n:"Order stats — by status + today revenue", s:1 },
      { n:"Payment gateway integration (Stripe/Telr/Tabby/Tamara)", s:0 },
      { n:"Shipping integration (Aramex/DHL)", s:0 },
    ]},

  { id:"pricing",   phase:"Commerce",   icon:"ti-currency-dollar",name:"Pricing Engine",
    items:[
      { n:"Base price + making charges + discount", s:1 },
      { n:"Live gold rate — manual entry admin", s:1 },
      { n:"Gold rate auto-fetch cron (goldapi.io — GOLD_API_KEY env)", s:1 },
      { n:"Rapaport pricing structure in DB (rap_rate, discount %)", s:1 },
      { n:"Metal options with price delta per variant", s:1 },
      { n:"Rapaport live feed integration (planned)", s:0 },
      { n:"Dynamic markup rules engine", s:0 },
      { n:"Multi-currency conversion (AED/USD/SAR/INR)", s:0 },
    ]},

  { id:"crm",       phase:"Commerce",   icon:"ti-messages",       name:"CRM — Enquiries & Appointments",
    items:[
      { n:"Enquiry CRM — list, detail, status, WhatsApp reply", s:1 },
      { n:"WhatsApp link generator — pre-filled with product details", s:1 },
      { n:"Appointments — book, slot availability check, max 2 per slot", s:1 },
      { n:"Appointments admin — list, today summary, confirm/cancel", s:1 },
      { n:"Customer database — CRUD + import from enquiries", s:1 },
      { n:"Email notifications — enquiry + appointment confirmation", s:1 },
      { n:"Saved diamond searches (customer portal — planned)", s:0 },
    ]},

  { id:"search",    phase:"Commerce",   icon:"ti-search",         name:"Search Engine",
    items:[
      { n:"Unified search — /api/search?q= (all inventory types)", s:1 },
      { n:"Autocomplete — /api/search/autocomplete (Redis cached)", s:1 },
      { n:"Faceted diamond search — shape, carat, color, clarity, cut, lab, price", s:1 },
      { n:"Gemstone search — by type, origin, treatment", s:1 },
      { n:"Full-text search index on products table (PostgreSQL GIN)", s:1 },
      { n:"Meilisearch/Elasticsearch integration (planned)", s:0 },
    ]},

  { id:"seo_be",    phase:"Commerce",   icon:"ti-world",          name:"SEO Backend",
    items:[
      { n:"GET /sitemap.xml — auto from active products + blog + categories", s:1 },
      { n:"GET /robots.txt — disallow admin + api", s:1 },
      { n:"GET /api/seo/schema/:type/:id — JSON-LD Product schema", s:1 },
      { n:"SEO fields on products — seo_title, seo_desc, slug", s:1 },
      { n:"SEO fields on blog posts — seo_title, seo_description", s:1 },
    ]},

  { id:"blog_be",   phase:"Commerce",   icon:"ti-book",           name:"Blog & Content",
    items:[
      { n:"Blog CRUD — title, content, excerpt, cover, category, tags, SEO", s:1 },
      { n:"Public API — GET /api/storefront/blog + /blog/:slug", s:1 },
      { n:"Draft / published / archived workflow", s:1 },
      { n:"Author tracking — name + user ID", s:1 },
    ]},

  { id:"api",       phase:"Commerce",   icon:"ti-api",            name:"Storefront API (public)",
    items:[
      { n:"GET /api/storefront/store — store settings for frontend", s:1 },
      { n:"GET /api/storefront/products — catalogue with filters", s:1 },
      { n:"GET /api/storefront/products/:slug — product detail", s:1 },
      { n:"GET /api/storefront/diamonds/:id — diamond detail + related", s:1 },
      { n:"GET /api/storefront/gemstones/:id — gemstone detail", s:1 },
      { n:"GET /api/storefront/pearls/:id — pearl detail", s:1 },
      { n:"GET /api/storefront/mountings/:id — mounting + compatible diamonds", s:1 },
      { n:"POST /api/storefront/ring-builder — diamond + mounting combined price", s:1 },
      { n:"GET /api/storefront/blog + /blog/:slug — public blog", s:1 },
      { n:"POST /api/storefront/enquiry — store enquiry from website", s:1 },
      { n:"GET /api/storefront/metal-rates — live gold rates", s:1 },
      { n:"GET /api/storefront/banners — hero banners", s:1 },
      { n:"GET /api/storefront/collections + /collections/:slug", s:1 },
      { n:"GET /api/storefront/categories — nav categories", s:1 },
      { n:"Wishlist — add, get, remove (session-based)", s:1 },
    ]},


  { id:"rapnet",    phase:"Commerce",   icon:"ti-diamond",        name:"RapNet Instant Inventory",
    items:[
      { n:"POST /api/rapnet/diamonds — live diamond search from RapNet global suppliers", s:1 },
      { n:"GET /api/rapnet/diamonds/:id — single diamond detail (live)", s:1 },
      { n:"GET /api/rapnet/diamonds/:id/certificate — cert download URL", s:1 },
      { n:"GET /api/rapnet/price-list — Rapaport price list API", s:1 },
      { n:"GET /api/rapnet/status — check if RapNet is connected", s:1 },
      { n:"RAPNET_TOKEN env var — Bearer token from RapNet account", s:1 },
      { n:"RAPNET_MARKUP_PCT env var — markup % applied to RapNet prices", s:1 },
      { n:"NOTE: Diamonds are NEVER stored in local DB (per RapNet terms)", s:1, note:true },
      { n:"RapNet subscription required (Instant Inventory add-on)", s:1, note:true },
      { n:"Fancy color diamonds search", s:1 },
      { n:"Jewellery feed (widget only — no API per RapNet)", s:0 },
      { n:"Admin page — RapNet settings (token, markup, supplier selection)", s:1 },
      { n:"Storefront — /diamonds?source=rapnet combined view with own inventory", s:0 },
    ]},
  { id:"erp",       phase:"Commerce",   icon:"ti-refresh",        name:"Vantix ERP Integration",
    items:[
      { n:"POST /api/orders/erp-sync — order status from ERP → CMS", s:1 },
      { n:"POST /api/custom-orders/erp-sync — custom order progress from ERP", s:1 },
      { n:"erp_sync_log table — tracks all webhook calls", s:1 },
      { n:"ERP_WEBHOOK_SECRET env var — secured", s:1 },
      { n:"ERP → CMS: order delivered status push", s:1 },
      { n:"CMS → ERP: push new custom order lead (planned)", s:0 },
      { n:"Customer account portal — ERP order history (planned)", s:0 },
    ]},
];

// ─── ADMIN PANEL (Frontend — Done) ────────────────────────────
const ADMIN_PANEL = [
  { n:"Login page — 60/40 split, jewellery showcase, remember me", s:1 },
  { n:"Dashboard — KPIs, inventory summary, activity feed, low stock", s:1 },
  { n:"Products list — paginated, filtered, specs button", s:1 },
  { n:"Product form — inventory type aware, jewellery fields", s:1 },
  { n:"Jewellery specs — 5 tabs (metal, certs, images, pricing, details)", s:1 },
  { n:"Diamond form — 6 tabs (identity, 4Cs, measurements, pricing/Rap, cert, availability)", s:1 },
  { n:"Diamonds list — faceted filters, availability badge, cert display", s:1 },
  { n:"Gemstone form — 4 tabs (identity, quality/colour, cert, pricing)", s:1 },
  { n:"Gemstones list — type filter chips", s:1 },
  { n:"Pearl form + list — nacre, luster, strand toggle", s:1 },
  { n:"Mounting form — 6 tabs (structure, compatibility, metals, sizes, manufacturing, pricing)", s:1 },
  { n:"Mountings list — card grid with CAD indicator", s:1 },
  { n:"Categories + Collections manager", s:1 },
  { n:"Media library — upload, gallery, Cloudinary", s:1 },
  { n:"Enquiries CRM — WhatsApp reply, status", s:1 },
  { n:"Appointments admin — list, today, confirm/cancel", s:1 },
  { n:"Customers page — CRUD + import from enquiries", s:1 },
  { n:"Custom orders — lead list, WhatsApp, status update", s:1 },
  { n:"Orders page — list, detail, status", s:1 },
  { n:"Inventory page — stock + ledger", s:1 },
  { n:"Marketing — banners + promo codes", s:1 },
  { n:"Import engine — CSV upload, column mapping, job history, template download", s:1 },
  { n:"Blog & content — list, modal editor, status, categories", s:1 },
  { n:"Store locations + trust badges", s:1 },
  { n:"Plugin marketplace — install, configure", s:1 },
  { n:"Users + roles + permissions matrix", s:1 },
  { n:"Settings — store, contact, branding, SMTP, password", s:1 },
  { n:"Appearance — theme, accent colour, density, toggles", s:1 },
  { n:"Feature flags — module on/off per client", s:1 },
  { n:"Audit log viewer — paginated with filters", s:1 },
  { n:"Dev status page — live build tracker", s:1 },
  { n:"Bulk import modal — reusable across all modules", s:1 },
];

// ─── STOREFRONT FRONTEND (Next.js — In Progress) ──────────────
const STOREFRONT = [
  // DONE
  { n:"Homepage — hero (4 slides), category grid, diamond search teaser, featured products", s:1 },
  { n:"Diamond search page — full filter sidebar (shape, carat, color, clarity, cut, lab, price)", s:1 },
  { n:"Gemstones page — type filter chips (Ruby, Sapphire, Emerald…)", s:1 },
  { n:"Jewellery page — category + metal filters", s:1 },
  { n:"Pearls page — type filter", s:1 },
  { n:"Mountings page — card grid with compatibility info", s:1 },
  { n:"Custom jewellery — 4-step form (idea → stone/metal → budget → contact)", s:1 },
  { n:"Appointment booking — date/time/purpose form with slot check", s:1 },
  { n:"Certificate verify — /verify + /verify/:certNo", s:1 },
  { n:"Header — sticky, dropdown nav, mobile menu, WhatsApp CTA", s:1 },
  { n:"Footer — 4-column, social links", s:1 },
  { n:"WhatsApp floating button — every page", s:1 },
  { n:"Trust badges strip", s:1 },
  { n:"Metal rates bar — live from API", s:1 },
  { n:"Appointment CTA section", s:1 },
  // PENDING
  { n:"Diamond detail page — /diamonds/:id (gallery, 4Cs, cert, WhatsApp, related)", s:1 },
  { n:"Gemstone detail page — /gemstones/:id", s:1 },
  { n:"Pearl detail page — /pearls/:id", s:1 },
  { n:"Mounting detail page — /mountings/:id + compatible diamonds", s:1 },
  { n:"Jewellery detail page — /jewellery/:slug (gallery, specs, variants, WhatsApp)", s:1 },
  { n:"Ring builder UI — pick diamond + mounting = combined price", s:1 },
  { n:"Blog listing page — /blog", s:1 },
  { n:"Blog single post — /blog/:slug", s:1 },
  { n:"About page — brand story, locations, certifications", s:0 },
  { n:"SEO — metadata per page, Open Graph, schema.org injection", s:1 },
  { n:"Arabic RTL support — dir=rtl on html tag", s:0 },
  { n:"Multi-currency display — AED / USD / SAR switcher", s:0 },
  { n:"Wishlist page — saved items (session + localStorage)", s:0 },
  { n:"RapNet diamonds integration — /diamonds?source=rapnet shows live RapNet feed alongside own inventory", s:0 },
  { n:"Search results page — /search?q=", s:0 },
  { n:"Homepage templates — luxury, modern, minimal (3 variants)", s:0 },
  { n:"Product page templates — 2 layout options", s:0 },
];

const PHASE_COLORS = {
  Core:"#6366f1", Inventory:"#c9a84c", Trust:"#22c55e",
  Commerce:"#3b82f6", Frontend:"#8b5cf6"
};

function pct(items) {
  const d = items.filter(i => i.s === 1).length;
  return items.length ? Math.round((d / items.length) * 100) : 0;
}

function ProgressBar({ value, color="#c9a84c", height=3 }) {
  return (
    <div style={{ height, background:"var(--color-border-tertiary)", borderRadius:height, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${value}%`, background:value===100?"#22c55e":color, borderRadius:height, transition:"width .4s" }}/>
    </div>
  );
}

export default function DevStatusPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [tab,      setTab]      = useState("backend");
  const [openMod,  setOpenMod]  = useState({});
  const [apiOk,    setApiOk]    = useState(null);
  const [dbOk,     setDbOk]     = useState(null);
  const [now,      setNow]      = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const check = async () => {
    setRefreshing(true);
    try { await api.get("/dashboard/stats"); setApiOk(true); setDbOk(true); }
    catch { setApiOk(false); setDbOk(false); }
    setNow(new Date());
    setTimeout(()=>setRefreshing(false), 600);
  };

  useEffect(()=>{ check(); }, []);

  const toggle = id => setOpenMod(o=>({...o,[id]: o[id]===false ? true : false }));
  const isOpen = id => openMod[id] !== false;

  // Overall stats
  const backendDone  = BACKEND.reduce((a,m)=>a+m.items.filter(i=>i.s===1).length,0);
  const backendTotal = BACKEND.reduce((a,m)=>a+m.items.length,0);
  const adminDone    = ADMIN_PANEL.filter(i=>i.s===1).length;
  const adminTotal   = ADMIN_PANEL.length;
  const sfDone       = STOREFRONT.filter(i=>i.s===1).length;
  const sfTotal      = STOREFRONT.length;
  const overallDone  = backendDone + adminDone + sfDone;
  const overallTotal = backendTotal + adminTotal + sfTotal;
  const overall      = Math.round((overallDone/overallTotal)*100);

  const t  = "var(--color-text-primary)";
  const m  = "var(--color-text-secondary)";
  const b  = "var(--color-border-tertiary)";
  const bg = "var(--color-background-secondary)";

  const TABS = [
    { id:"backend",   label:"Backend API",    done:backendDone,  total:backendTotal },
    { id:"admin",     label:"Admin Panel",    done:adminDone,    total:adminTotal   },
    { id:"storefront",label:"Storefront",     done:sfDone,       total:sfTotal      },
  ];

  return (
    <>
      <Topbar title="System status" subtitle={`${PLATFORM} ${VERSION} · ${LAST_UPDATED}`}
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={
          <button onClick={check} className="btn-outline flex items-center gap-1.5 text-xs">
            <i className={`ti ti-refresh ${refreshing?"animate-spin":""}`} aria-hidden="true"/>
            Refresh
          </button>
        }/>

      <div className="flex-1 overflow-y-auto">
        <div style={{ maxWidth:920, margin:"0 auto", padding:"20px 20px 48px" }}>

          {/* ── HERO CARD ── */}
          <div style={{ background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e3a5f 100%)", borderRadius:14, padding:"24px 28px", marginBottom:16, color:"#fff", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }}/>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:12, position:"relative", zIndex:1 }}>
              <div>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:4, letterSpacing:"0.06em", textTransform:"uppercase" }}>Overall progress</p>
                <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:6 }}>
                  <span style={{ fontSize:48, fontWeight:600, color:"#c9a84c", lineHeight:1 }}>{overall}%</span>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>{overallDone}/{overallTotal} tasks</span>
                </div>
                <div style={{ height:5, background:"rgba(255,255,255,0.1)", borderRadius:4, width:280, marginBottom:10 }}>
                  <div style={{ height:"100%", width:`${overall}%`, background:"#c9a84c", borderRadius:4 }}/>
                </div>
                <div style={{ display:"flex", gap:16 }}>
                  {[
                    { l:"Backend API", v:Math.round((backendDone/backendTotal)*100), c:"#22c55e" },
                    { l:"Admin Panel", v:Math.round((adminDone/adminTotal)*100),     c:"#3b82f6" },
                    { l:"Storefront",  v:Math.round((sfDone/sfTotal)*100),           c:"#8b5cf6" },
                  ].map(s=>(
                    <div key={s.l}>
                      <div style={{ fontSize:16, fontWeight:600, color:s.c }}>{s.v}%</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:1 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Health */}
              <div style={{ display:"flex", flexDirection:"column", gap:8, minWidth:200 }}>
                {[
                  { l:"Backend API",   ok:apiOk },
                  { l:"PostgreSQL 16", ok:dbOk  },
                  { l:"Server time",   ok:true, v:now.toTimeString().slice(0,8)+" UTC" },
                ].map(h=>(
                  <div key={h.l} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:h.ok===null?"#6b7280":h.ok?"#22c55e":"#ef4444", flexShrink:0 }}/>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>{h.l}</span>
                    <span style={{ fontSize:11, color:h.ok===null?"#6b7280":h.ok?"#22c55e":"#ef4444", marginLeft:"auto" }}>
                      {h.v || (h.ok===null?"checking":h.ok?"● Online":"● Offline")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── TABS ── */}
          <div style={{ display:"flex", gap:4, marginBottom:16, background:bg, padding:4, borderRadius:10, width:"fit-content" }}>
            {TABS.map(tb=>{
              const p = Math.round((tb.done/tb.total)*100);
              return (
                <button key={tb.id} onClick={()=>setTab(tb.id)}
                  style={{ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer",
                    background:tab===tb.id?"var(--color-background-primary)":"transparent",
                    color:tab===tb.id?t:m,
                    border:"none", boxShadow:tab===tb.id?"0 1px 3px rgba(0,0,0,0.08)":"none",
                    display:"flex", alignItems:"center", gap:6 }}>
                  {tb.label}
                  <span style={{ fontSize:10, padding:"1px 6px", borderRadius:20, background:p===100?"#dcfce7":"var(--color-background-secondary)", color:p===100?"#15803d":m, fontWeight:600 }}>
                    {p}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── BACKEND TAB ── */}
          {tab==="backend" && (
            <div className="space-y-2">
              {BACKEND.map(mod=>{
                const done  = mod.items.filter(i=>i.s===1).length;
                const p     = pct(mod.items);
                const col   = PHASE_COLORS[mod.phase]||"#888";
                const open  = isOpen(mod.id);
                return (
                  <div key={mod.id} style={{ background:"var(--color-background-primary)", border:`0.5px solid ${b}`, borderRadius:10, overflow:"hidden" }}>
                    <div onClick={()=>toggle(mod.id)}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", cursor:"pointer" }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:`${col}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <i className={`ti ${mod.icon}`} style={{ fontSize:14, color:col }} aria-hidden="true"/>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <span style={{ fontSize:12, fontWeight:500, color:t }}>{mod.name}</span>
                          <span style={{ fontSize:9, padding:"1px 6px", borderRadius:20, background:`${col}15`, color:col, fontWeight:600 }}>{mod.phase}</span>
                        </div>
                        <ProgressBar value={p} color={col}/>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                        <span style={{ fontSize:11, color:m }}>{done}/{mod.items.length}</span>
                        <span style={{ fontSize:13, fontWeight:600, color:p===100?"#22c55e":col }}>{p}%</span>
                        <i className={`ti ti-chevron-${open?"up":"down"}`} style={{ fontSize:12, color:m }} aria-hidden="true"/>
                      </div>
                    </div>
                    {open && (
                      <div style={{ borderTop:`0.5px solid ${b}`, padding:"6px 0 10px" }}>
                        {mod.items.map((item,idx)=>(
                          <div key={idx} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"5px 14px", background:idx%2===0?"transparent":bg }}>
                            <i className={`ti ${item.s===1?"ti-circle-check":"ti-circle-dashed"}`}
                              style={{ fontSize:13, color:item.s===1?"#22c55e":item.note?"#f59e0b":"var(--color-border-secondary)", flexShrink:0, marginTop:2 }} aria-hidden="true"/>
                            <span style={{ fontSize:11, color:item.s===1?m:t, textDecoration:item.s===1?"line-through":"none", fontStyle:item.note?"italic":"normal" }}>
                              {item.n}
                            </span>
                            <span style={{ fontSize:9, padding:"1px 6px", borderRadius:20, flexShrink:0, marginLeft:"auto",
                              background:item.s===1?"#dcfce7":item.note?"#fef9c3":"var(--color-background-secondary)",
                              color:item.s===1?"#15803d":item.note?"#a16207":"var(--color-text-secondary)", fontWeight:600 }}>
                              {item.s===1?"Done":item.note?"Info":"Pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── ADMIN PANEL TAB ── */}
          {tab==="admin" && (
            <div style={{ background:"var(--color-background-primary)", border:`0.5px solid ${b}`, borderRadius:10, overflow:"hidden" }}>
              <div style={{ padding:"12px 14px", borderBottom:`0.5px solid ${b}`, background:bg, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:t }}>Admin Panel — {adminDone}/{adminTotal} complete</p>
                  <p style={{ fontSize:11, color:m, marginTop:2 }}>React + Vite · http://localhost:3000</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:20, fontWeight:700, color:"#22c55e" }}>100%</span>
                  <i className="ti ti-circle-check" style={{ fontSize:20, color:"#22c55e" }} aria-hidden="true"/>
                </div>
              </div>
              <div>
                {ADMIN_PANEL.map((item,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px",
                    background:i%2===0?"transparent":bg,
                    borderBottom:i<ADMIN_PANEL.length-1?`0.5px solid ${b}`:"none" }}>
                    <i className="ti ti-circle-check" style={{ fontSize:13, color:"#22c55e", flexShrink:0 }} aria-hidden="true"/>
                    <span style={{ fontSize:11, color:m, textDecoration:"line-through", flex:1 }}>{item.n}</span>
                    <span style={{ fontSize:9, padding:"1px 6px", borderRadius:20, background:"#dcfce7", color:"#15803d", fontWeight:600, flexShrink:0 }}>Done</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STOREFRONT TAB ── */}
          {tab==="storefront" && (
            <div>
              {/* Stats bar */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
                {[
                  { l:"Done",     v:sfDone,           c:"#22c55e" },
                  { l:"Pending",  v:sfTotal-sfDone,   c:m         },
                  { l:"Progress", v:`${Math.round((sfDone/sfTotal)*100)}%`, c:"#8b5cf6" },
                ].map(s=>(
                  <div key={s.l} style={{ background:"var(--color-background-primary)", border:`0.5px solid ${b}`, borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:20, fontWeight:600, color:s.c }}>{s.v}</div>
                    <div style={{ fontSize:10, color:m, marginTop:1 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* What's done */}
              <div style={{ background:"var(--color-background-primary)", border:`0.5px solid ${b}`, borderRadius:10, overflow:"hidden", marginBottom:10 }}>
                <div style={{ padding:"10px 14px", borderBottom:`0.5px solid ${b}`, background:"#dcfce822" }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"#15803d" }}>✅ Built — {STOREFRONT.filter(i=>i.s===1).length} pages/components</p>
                  <p style={{ fontSize:10, color:m, marginTop:1 }}>Next.js 14 App Router · Tailwind CSS · http://localhost:3001</p>
                </div>
                {STOREFRONT.filter(i=>i.s===1).map((item,i,arr)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 14px",
                    background:i%2===0?"transparent":bg,
                    borderBottom:i<arr.length-1?`0.5px solid ${b}`:"none" }}>
                    <i className="ti ti-circle-check" style={{ fontSize:13, color:"#22c55e", flexShrink:0 }} aria-hidden="true"/>
                    <span style={{ fontSize:11, color:m, textDecoration:"line-through", flex:1 }}>{item.n}</span>
                  </div>
                ))}
              </div>

              {/* What's pending */}
              <div style={{ background:"var(--color-background-primary)", border:`0.5px solid ${b}`, borderRadius:10, overflow:"hidden" }}>
                <div style={{ padding:"10px 14px", borderBottom:`0.5px solid ${b}`, background:"#ede9fe22" }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"#6d28d9" }}>🔨 Building next — {STOREFRONT.filter(i=>i.s===0).length} remaining</p>
                  <p style={{ fontSize:10, color:m, marginTop:1 }}>Product detail pages · Ring builder · Blog · SEO · Templates</p>
                </div>
                {STOREFRONT.filter(i=>i.s===0).map((item,i,arr)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 14px",
                    background:i%2===0?"transparent":bg,
                    borderBottom:i<arr.length-1?`0.5px solid ${b}`:"none" }}>
                    <i className="ti ti-circle-dashed" style={{ fontSize:13, color:"var(--color-border-secondary)", flexShrink:0 }} aria-hidden="true"/>
                    <span style={{ fontSize:11, color:t, flex:1 }}>{item.n}</span>
                    <span style={{ fontSize:9, padding:"1px 6px", borderRadius:20, background:"#ede9fe", color:"#6d28d9", fontWeight:600, flexShrink:0 }}>Pending</span>
                  </div>
                ))}
              </div>

              {/* Build order */}
              <div style={{ marginTop:12, background:"var(--color-background-primary)", border:`0.5px solid #c9a84c44`, borderRadius:10, padding:"14px 16px" }}>
                <p style={{ fontSize:12, fontWeight:600, color:"#c9a84c", marginBottom:8 }}>📋 Frontend build order</p>
                {[
                  "1. Product detail pages (diamond, gemstone, pearl, mounting, jewellery)",
                  "2. Ring builder UI — pick diamond + mounting → combined price",
                  "3. Blog listing + single post pages",
                  "4. SEO — metadata, Open Graph, schema.org per page",
                  "5. Homepage templates — luxury, modern, minimal (3 variants)",
                  "6. Arabic RTL support",
                  "7. Multi-currency switcher (AED/USD/SAR)",
                  "8. Search results page",
                  "9. Wishlist page",
                  "10. Production deploy — Nginx + SSL + PM2",
                ].map((s,i)=>(
                  <div key={i} style={{ fontSize:11, color:m, padding:"3px 0", borderBottom:i<9?`0.5px solid ${b}`:"none" }}>{s}</div>
                ))}
              </div>
            </div>
          )}

          <p style={{ fontSize:10, color:m, textAlign:"center", marginTop:16 }}>
            {PLATFORM} {VERSION} · KenTech Global · {LAST_UPDATED}
          </p>
        </div>
      </div>
    </>
  );
}
