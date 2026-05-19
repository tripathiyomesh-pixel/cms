import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import api from '../services/api';

const VERSION     = 'v0.9.2';
const UPDATED     = '2026-05-19';
const PLATFORM    = 'Jewellery Commerce OS (JCOS)';

// ── STATUS DATA ───────────────────────────────────────────────
const PHASES = [
  {
    phase: 'Phase 1 — Foundation & Workforce',
    status: 'complete',
    pct: 100,
    sections: [
      {
        name: 'Infrastructure',
        items: [
          { n:'Docker Compose — PostgreSQL · Redis · Backend · Admin · Storefront', s:1 },
          { n:'PostgreSQL 16 — 17 migrations (001–017)', s:1 },
          { n:'Redis cache + session management', s:1 },
          { n:'Nginx reverse proxy — /api routing from any PC', s:1 },
          { n:'GitHub private repo — tripathiyomesh-pixel/cms', s:1 },
          { n:'setup.bat — one-command full install', s:1 },
          { n:'node-cron — gold rate auto-fetch 3x daily', s:1 },
          { n:'Nginx + SSL — production VPS', s:0 },
          { n:'CI/CD pipeline + staging environment', s:0 },
          { n:'Automated daily DB backups', s:0 },
        ],
      },
      {
        name: 'Auth & Identity Layer',
        items: [
          { n:'JWT login / logout / refresh token', s:1 },
          { n:'bcryptjs password hashing', s:1 },
          { n:'4 identity types: Workforce · Customer · Partner · API', s:1 },
          { n:'Workforce accounts — NOT invite-based', s:1 },
          { n:'Customer accounts — separate JWT secret', s:1 },
          { n:'Partner accounts — API key management', s:1 },
          { n:'Password reset flow', s:1 },
          { n:'2FA (two-factor authentication)', s:0 },
          { n:'SSO (Google/Apple login)', s:0 },
        ],
      },
      {
        name: 'RBAC + ABAC Permission Engine',
        items: [
          { n:'9 roles: super_admin → viewer', s:1 },
          { n:'Role capabilities stored in DB — fully dynamic', s:1 },
          { n:'ABAC policies — grant/revoke per staff member', s:1 },
          { n:'Per-user capability overrides', s:1 },
          { n:'buildPermissions() — layered engine', s:1 },
          { n:'req.permissions.can() — all routes use this', s:1 },
          { n:'Role capability editor in admin UI', s:1 },
          { n:'Policy editor — create custom capability sets', s:1 },
          { n:'Cache with 5-min TTL + invalidation on update', s:1 },
          { n:'Branch-scoped access (ABAC condition)', s:0.5 },
          { n:'Amount-limit approvals (ABAC condition)', s:0.5 },
        ],
      },
      {
        name: 'Workforce Management',
        items: [
          { n:'Staff creation with activation link flow', s:1 },
          { n:'Branches — locations with city/country/contact', s:1 },
          { n:'Departments — Sales, Inventory, Marketing, CRM, Accounting, Management', s:1 },
          { n:'Staff table — filter by branch, role, search', s:1 },
          { n:'Assign policies to individual staff members', s:1 },
          { n:'Org chart view', s:1 },
          { n:'Staff edit — change role, branch, department, policies', s:1 },
          { n:'Device session tracking table', s:1 },
          { n:'Workforce sessions UI', s:0 },
          { n:'Shift / attendance management', s:0 },
          { n:'Performance tracking', s:0 },
        ],
      },
      {
        name: 'Gold Rate System',
        items: [
          { n:'gold_rates table — 24K/22K/21K/18K per gram AED', s:1 },
          { n:'gold_rate_history — 90-day log', s:1 },
          { n:'Scraper: dubaicityofgold.com (primary)', s:1 },
          { n:'Scraper: goldratetodaydubai.com (backup)', s:1 },
          { n:'Scraper: gulfnews.com (backup)', s:1 },
          { n:'Auto-cron: 3x daily at DJG schedule (9AM/1:30PM/6PM UAE)', s:1 },
          { n:'Manual entry — enter 24K → others auto-calculate', s:1 },
          { n:'Admin gold rate page — rate cards + history table', s:1 },
          { n:'Storefront header ticker — live 24K/22K display', s:1 },
          { n:'Gold-linked product pricing (weight × rate + making%)', s:0.5 },
        ],
      },
    ],
  },
  {
    phase: 'Phase 2 — Frontend & Customer Experience',
    status: 'complete',
    pct: 100,
    sections: [
      {
        name: 'Storefront — 25 Pages',
        items: [
          { n:'/ — Homepage (JSON sections + static fallback)', s:1 },
          { n:'/jewellery — listing + Tejori-style filters', s:1 },
          { n:'/jewellery/[slug] — Cartier-style product detail', s:1 },
          { n:'/lab-grown — separate landing (NEVER mixed with natural)', s:1 },
          { n:'/diamonds — listing + RapNet', s:1 },
          { n:'/gemstones · /pearls · /mountings', s:1 },
          { n:'/exhibitions · /exhibitions/[slug]', s:1 },
          { n:'/blog · /blog/[slug]', s:1 },
          { n:'/about · /boutiques · /appointment · /custom', s:1 },
          { n:'/search · /wishlist · /verify', s:1 },
          { n:'/account/login — sign in + create account', s:1 },
          { n:'/account — profile editor', s:1 },
          { n:'/account/wishlist — saved items + WhatsApp enquire', s:1 },
          { n:'/account/appointments — history + status', s:1 },
          { n:'/account/enquiries — history + reply status', s:1 },
          { n:'/account/settings — change password', s:1 },
        ],
      },
      {
        name: 'Navigation — Mega Menu',
        items: [
          { n:'Mega menu (Palmiero-style) — full-width panel', s:1 },
          { n:'Hover image updates live as you hover each link', s:1 },
          { n:'4 nav styles: Mega / Standard / Centered / Minimal', s:1 },
          { n:'Mobile slide-in drawer', s:1 },
          { n:'Dynamic from DB — editable in menu builder', s:1 },
          { n:'6 top-level items per Tejori client spec', s:1 },
          { n:'Lab Diamond — separate section, never mixed', s:1 },
        ],
      },
      {
        name: 'Website Builder Engine',
        items: [
          { n:'JSON page schema — Page JSON → Component Registry → Next.js', s:1 },
          { n:'21 section types across 8 categories', s:1 },
          { n:'3-panel builder: sections list / preview / editor', s:1 },
          { n:'Section picker — searchable, grouped by category', s:1 },
          { n:'Live preview canvas with device switcher', s:1 },
          { n:'Field types: text, textarea, number, select, color, image, range', s:1 },
          { n:'Duplicate, move up/down, delete sections', s:1 },
          { n:'4 pages: Homepage, About, Lab Diamond, Bespoke', s:1 },
          { n:'Home builder — section toggle/reorder/edit', s:1 },
          { n:'Menu builder — nav type + tree editor', s:1 },
          { n:'Drag-and-drop reordering', s:0 },
          { n:'Undo/redo history', s:0 },
        ],
      },
      {
        name: 'Theme System',
        items: [
          { n:'10 pre-built themes with 1-click apply', s:1 },
          { n:'Colors tab — primary, background, text color pickers', s:1 },
          { n:'Fonts tab — heading + body font selector', s:1 },
          { n:'Buttons tab — radius, style, hover color', s:1 },
          { n:'Design tokens — CSS variables injected at runtime', s:1 },
          { n:'No rebuild needed — storefront reads from DB', s:1 },
          { n:'10 themes: Cartier Noir, Graff Gold, Blue Nile, Mejuri Rose, Tejori Cream, Dubai Gold Souk, Diamond Navy, Platinum Slate, Tiffany Blue, Midnight Emerald', s:1 },
        ],
      },
      {
        name: 'Arabic RTL + Multilingual',
        items: [
          { n:'Arabic RTL CSS — full right-to-left layout', s:1 },
          { n:'Arabic fonts: Noto Naskh Arabic (headings) + Noto Kufi (body)', s:1 },
          { n:'LanguageSwitcher — EN/AR toggle in header', s:1 },
          { n:'Saves preference in localStorage', s:1 },
          { n:'dir=rtl applied to html element', s:1 },
          { n:'Flex direction + margin/padding flip in CSS', s:1 },
          { n:'Arabic content translation (product names/descriptions)', s:0 },
          { n:'i18n routing (/ar/* routes)', s:0 },
        ],
      },
      {
        name: 'Currency + Gold Ticker',
        items: [
          { n:'CurrencyProvider — React context wraps storefront', s:1 },
          { n:'CurrencySwitcher — AED/USD/EUR/GBP/INR/SAR', s:1 },
          { n:'useCurrency() hook — format() + convert()', s:1 },
          { n:'Gold rate ticker in header — 24K + 22K live', s:1 },
          { n:'Real-time forex rates via API', s:0 },
        ],
      },
      {
        name: 'SEO',
        items: [
          { n:'buildMeta() helper — title, description, OG, Twitter', s:1 },
          { n:'Metadata on all key pages (jewellery, diamonds, about, etc.)', s:1 },
          { n:'Product pages — dynamic metadata from product data', s:1 },
          { n:'Blog posts — custom metadata per post', s:1 },
          { n:'Canonical URLs', s:1 },
          { n:'robots: index/follow per page', s:1 },
          { n:'Sitemap auto-generation', s:0 },
          { n:'Structured data (JSON-LD)', s:0 },
        ],
      },
    ],
  },
  {
    phase: 'Phase 3 — CRM & Advanced Features',
    status: 'in-progress',
    pct: 20,
    sections: [
      {
        name: 'CRM Workflows',
        items: [
          { n:'Enquiry pipeline — New → Contacted → Qualified → Won/Lost', s:0.5 },
          { n:'Follow-up date tracking + reminders', s:0 },
          { n:'Assign enquiries to sales staff', s:0.5 },
          { n:'WhatsApp conversation log per customer', s:0 },
          { n:'Customer timeline — all interactions in one view', s:0 },
          { n:'Lead scoring', s:0 },
        ],
      },
      {
        name: 'Notification Engine',
        items: [
          { n:'In-app notifications — bell icon in admin', s:0 },
          { n:'Email notifications — new enquiry, appointment booked', s:0 },
          { n:'WhatsApp notifications — appointment confirmation', s:0 },
          { n:'Push notifications', s:0 },
        ],
      },
      {
        name: 'Advanced Search',
        items: [
          { n:'Product faceted search — filter by carat, metal, price, cert', s:0 },
          { n:'Meilisearch integration', s:0 },
          { n:'Search autocomplete on storefront', s:0 },
        ],
      },
      {
        name: 'Media Pipeline',
        items: [
          { n:'360° product viewer — image spin', s:0 },
          { n:'WebP auto-conversion', s:0 },
          { n:'Image zoom on product page', s:0 },
          { n:'Certificate PDF embed on product page', s:0 },
          { n:'Video support', s:0 },
        ],
      },
    ],
  },
  {
    phase: 'Phase 4 — ERP & Analytics',
    status: 'pending',
    pct: 10,
    sections: [
      {
        name: 'ERP Deep Sync',
        items: [
          { n:'Vantix ERP — inventory sync (stock levels)', s:0.5 },
          { n:'Order sync — confirmed orders go to ERP', s:0.5 },
          { n:'Customer sync', s:0 },
          { n:'Product pricing sync', s:0 },
          { n:'Manufacturing orders from bespoke requests', s:0 },
          { n:'Accounting sync (invoices, payments)', s:0 },
        ],
      },
      {
        name: 'Analytics & Reporting',
        items: [
          { n:'Dashboard — basic stats (orders, enquiries, revenue)', s:1 },
          { n:'Sales reports — by period, by product, by staff', s:0 },
          { n:'Enquiry funnel report', s:0 },
          { n:'Google Analytics 4 integration', s:1 },
          { n:'Custom report builder', s:0 },
        ],
      },
      {
        name: 'AI Features',
        items: [
          { n:'AI product description generation', s:0 },
          { n:'AI SEO meta generation', s:0 },
          { n:'AI enquiry response suggestions', s:0 },
        ],
      },
      {
        name: 'Mobile App',
        items: [
          { n:'React Native + Expo foundation', s:0 },
          { n:'Staff mobile app — view enquiries + appointments', s:0 },
          { n:'Customer app — wishlist + appointments', s:0 },
          { n:'Push notifications', s:0 },
        ],
      },
    ],
  },
];

// ── BACKEND HEALTH CHECK ───────────────────────────────────────
function HealthCheck() {
  const [health, setHealth] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checks = [
      { key:'api',      label:'Backend API',     fn: () => api.get('/health').then(()=>true).catch(()=>false) },
      { key:'gold',     label:'Gold rates',       fn: () => api.get('/gold-rates/current').then(r=>!!r.data.data).catch(()=>false) },
      { key:'settings', label:'Settings DB',      fn: () => api.get('/settings').then(r=>r.data.success).catch(()=>false) },
      { key:'products', label:'Products API',     fn: () => api.get('/products?limit=1').then(r=>r.data.success).catch(()=>false) },
      { key:'workforce',label:'Workforce tables', fn: () => api.get('/workforce/branches').then(r=>r.data.success).catch(()=>false) },
      { key:'customer', label:'Customer portal',  fn: () => api.get('/customer/profile').then(()=>true).catch(e=>e.response?.status===401) },
    ];
    Promise.all(checks.map(async c => ({ key:c.key, label:c.label, ok: await c.fn() })))
      .then(results => {
        const map = {};
        results.forEach(r => { map[r.key] = r; });
        setHealth(map);
        setLoading(false);
      });
  }, []);

  const all = Object.values(health);
  const passing = all.filter(h=>h.ok).length;

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-ink-700 dark:text-ink-200">System Health</h3>
        {!loading && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${passing===all.length?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>
            {passing}/{all.length} passing
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {loading ? Array(6).fill(0).map((_,i)=>(
          <div key={i} className="h-12 rounded-lg bg-ink-100 dark:bg-ink-800 animate-pulse"/>
        )) : Object.values(health).map(h=>(
          <div key={h.key} className={`flex items-center gap-2.5 p-3 rounded-lg ${h.ok?'bg-green-50 dark:bg-green-900/20':'bg-red-50 dark:bg-red-900/20'}`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${h.ok?'bg-green-500':'bg-red-500'}`}/>
            <span className={`text-xs font-medium ${h.ok?'text-green-700 dark:text-green-400':'text-red-600 dark:text-red-400'}`}>{h.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────
function ProgressBar({ pct, status }) {
  const colors = { complete:'#22c55e', 'in-progress':'#f59e0b', pending:'#94a3b8' };
  return (
    <div style={{ height:4, background:'var(--color-background-tertiary)', borderRadius:4, overflow:'hidden', flex:1 }}>
      <div style={{ height:'100%', width:`${pct}%`, background:colors[status]||'#94a3b8', borderRadius:4, transition:'width .5s ease' }}/>
    </div>
  );
}

// ── STATUS BADGE ──────────────────────────────────────────────
function StatusBadge({ s }) {
  if (s === 1)   return <span className="text-[10px] font-bold text-green-600 dark:text-green-400">✓</span>;
  if (s === 0.5) return <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">◑</span>;
  return <span className="text-[10px] text-ink-300 dark:text-ink-600">○</span>;
}

// ── MAIN PAGE ──────────────────────────────────────────────────
export default function DevStatusPage() {
  const { collapsed } = useOutletContext()||{};
  const [expandedPhase,   setExpandedPhase]   = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);

  // Overall stats
  const allItems = PHASES.flatMap(p => p.sections.flatMap(s => s.items));
  const done     = allItems.filter(i => i.s === 1).length;
  const partial  = allItems.filter(i => i.s === 0.5).length;
  const total    = allItems.length;
  const pct      = Math.round(((done + partial * 0.5) / total) * 100);

  return (
    <>
      <Topbar title="Platform status" subtitle={`${PLATFORM} ${VERSION} — last updated ${UPDATED}`}/>

      <div className="flex-1 overflow-y-auto p-6">

        {/* Health check */}
        <HealthCheck/>

        {/* Overall progress */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-ink-700 dark:text-ink-200">Overall progress</h3>
              <p className="text-xs text-ink-400 mt-0.5">{done} complete · {partial} partial · {total-done-partial} pending</p>
            </div>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:300, color:'#b8860b' }}>{pct}%</span>
          </div>
          <ProgressBar pct={pct} status="complete"/>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {PHASES.map((p,i)=>(
              <div key={i} className="text-center">
                <p className="text-xs text-ink-400 mb-1 leading-tight">{p.phase.split('—')[0].trim()}</p>
                <div className="flex items-center gap-2">
                  <ProgressBar pct={p.pct} status={p.status}/>
                  <span className="text-xs font-bold text-ink-500 flex-shrink-0">{p.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase details */}
        <div className="space-y-4">
          {PHASES.map((phase, pi) => {
            const phaseItems = phase.sections.flatMap(s=>s.items);
            const phaseDone  = phaseItems.filter(i=>i.s===1).length;
            const phaseTotal = phaseItems.length;
            const isExpanded = expandedPhase === pi;

            const badgeStyle = {
              complete:    { bg:'#dcfce7', text:'#15803d', label:'Complete' },
              'in-progress':{ bg:'#fef3c7', text:'#92400e', label:'In Progress' },
              pending:     { bg:'#f1f5f9', text:'#475569', label:'Planned' },
            }[phase.status] || {};

            return (
              <div key={pi} className="card overflow-hidden">
                {/* Phase header */}
                <button className="w-full flex items-center gap-4 p-5 text-left hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors"
                  onClick={()=>setExpandedPhase(isExpanded?-1:pi)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-bold text-ink-700 dark:text-ink-200">{phase.phase}</h3>
                      <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:20, background:badgeStyle.bg, color:badgeStyle.text, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                        {badgeStyle.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ProgressBar pct={phase.pct} status={phase.status}/>
                      <span className="text-xs font-bold text-ink-400 flex-shrink-0">{phaseDone}/{phaseTotal} items</span>
                    </div>
                  </div>
                  <span className="text-ink-400 flex-shrink-0">{isExpanded?'▲':'▼'}</span>
                </button>

                {/* Sections */}
                {isExpanded && (
                  <div className="border-t border-ink-100 dark:border-ink-800">
                    {phase.sections.map((section, si) => {
                      const secKey     = `${pi}-${si}`;
                      const secDone    = section.items.filter(i=>i.s===1).length;
                      const secPartial = section.items.filter(i=>i.s===0.5).length;
                      const secTotal   = section.items.length;
                      const isSecExp   = expandedSection === secKey;

                      return (
                        <div key={si} className="border-b border-ink-50 dark:border-ink-800/50 last:border-0">
                          <button className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors"
                            onClick={()=>setExpandedSection(isSecExp?null:secKey)}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-ink-600 dark:text-ink-300">{section.name}</span>
                                <span className="text-[10px] text-ink-400">{secDone}/{secTotal}</span>
                                {secPartial > 0 && <span className="text-[9px] bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 rounded-full">{secPartial} partial</span>}
                              </div>
                            </div>
                            <span className="text-ink-300 text-xs">{isSecExp?'▲':'▼'}</span>
                          </button>

                          {isSecExp && (
                            <div className="px-5 pb-4 space-y-1.5">
                              {section.items.map((item, ii) => (
                                <div key={ii} className="flex items-start gap-2.5">
                                  <StatusBadge s={item.s}/>
                                  <span className={`text-xs leading-relaxed ${item.s===1?'text-ink-600 dark:text-ink-300':item.s===0.5?'text-amber-700 dark:text-amber-400':'text-ink-300 dark:text-ink-600'}`}>
                                    {item.n}
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
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 p-4 rounded-xl bg-ink-50 dark:bg-ink-800/50">
          <span className="text-xs text-ink-400 font-semibold uppercase tracking-wide">Legend:</span>
          <span className="flex items-center gap-2 text-xs text-ink-500"><span className="text-green-600 font-bold">✓</span> Complete</span>
          <span className="flex items-center gap-2 text-xs text-ink-500"><span className="text-amber-600 font-bold">◑</span> Partial / In Progress</span>
          <span className="flex items-center gap-2 text-xs text-ink-500"><span className="text-ink-300 font-bold">○</span> Planned</span>
        </div>
      </div>
    </>
  );
}
