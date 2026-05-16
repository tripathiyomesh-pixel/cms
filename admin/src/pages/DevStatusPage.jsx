import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Topbar from "../components/layout/Topbar";

const LAST_UPDATED = "2026-05-16 — Inventory Engine added";

const STATUS = {
  DONE:    { label: "Done",        color: "#22c55e", icon: "ti-circle-check" },
  PARTIAL: { label: "In progress", color: "#f59e0b", icon: "ti-clock" },
  TODO:    { label: "Pending",     color: "#6b7280", icon: "ti-circle-dashed" },
  BLOCKED: { label: "Blocked",     color: "#ef4444", icon: "ti-circle-x" },
};

const MODULES = [
  {
    id: "infra", name: "Infrastructure & DevOps", icon: "ti-server-2",
    items: [
      { name: "Docker Compose — PostgreSQL + Redis + Backend + Admin + pgAdmin", status: "DONE" },
      { name: "PostgreSQL 16 (same as Vantix ERP)", status: "DONE" },
      { name: "Redis cache + sessions", status: "DONE" },
      { name: "GitHub private repo + git workflow", status: "DONE" },
      { name: "Nodemon hot-reload (backend)", status: "DONE" },
      { name: "Vite hot-reload (admin panel)", status: "DONE" },
      { name: "Windows batch files (start.bat, stop.bat)", status: "DONE" },
      { name: "Nginx + SSL (production)", status: "TODO", note: "Needed before first client goes live" },
      { name: "PM2 auto-restart production", status: "TODO" },
      { name: "Automated daily DB backups", status: "TODO" },
      { name: "CI/CD pipeline + staging environment", status: "TODO" },
      { name: "Error tracking (Sentry)", status: "TODO" },
      { name: "Admin 2FA (TOTP)", status: "TODO" },
    ]
  },
  {
    id: "auth", name: "Authentication & Users", icon: "ti-shield-lock",
    items: [
      { name: "JWT login + logout + refresh token", status: "DONE" },
      { name: "RBAC — super_admin, admin, manager, editor, viewer", status: "DONE" },
      { name: "Permissions matrix (11 resources × 4 actions)", status: "DONE" },
      { name: "Audit log (all actions tracked)", status: "DONE" },
      { name: "Users admin page (invite, edit, deactivate)", status: "DONE" },
      { name: "Role guide + permissions matrix page", status: "DONE" },
      { name: "Workshop Manager role (for manufacturing module)", status: "TODO" },
      { name: "Forgot password / email reset flow", status: "TODO" },
      { name: "Admin 2FA", status: "TODO" },
      { name: "Supplier login (B2B future)", status: "TODO" },
    ]
  },
  {
    id: "inventory", name: "Inventory Engine — Core", icon: "ti-database",
    items: [
      { name: "inventory_type column on products (JEWELLERY, NATURAL_DIAMOND, LAB_GROWN, GEMSTONE, PEARL, MOUNTING, CUSTOM_DESIGN, PARCEL)", status: "DONE", note: "Migration 008" },
      { name: "inventory_mode column (IN_HOUSE, MEMO, SUPPLIER, MADE_TO_ORDER, VIRTUAL)", status: "DONE", note: "Migration 008" },
      { name: "Feature flags table — module on/off per client", status: "DONE", note: "19 flags seeded" },
      { name: "Inventory admin page — type-routed product form", status: "TODO", note: "Form shows correct fields based on inventory_type" },
      { name: "Dynamic attribute engine — admin creates new gemstone types without code", status: "TODO" },
      { name: "Bulk CSV/XLS import engine (RapNet format + supplier sheets)", status: "TODO" },
      { name: "Import job tracking (status, errors, matched/skipped)", status: "TODO" },
    ]
  },
  {
    id: "jewellery", name: "Jewellery Module (Finished pieces)", icon: "ti-diamond",
    items: [
      { name: "Jewellery specs — metal, purity, gross/net weight", status: "DONE" },
      { name: "Making charges (flat + %)", status: "DONE" },
      { name: "Ring sizes + occasion tags + gender", status: "DONE" },
      { name: "Jewellery BOM / components table (1 ring = diamond + side stones + gold)", status: "DONE", note: "Migration 008" },
      { name: "Multi-image gallery with primary image", status: "DONE" },
      { name: "Product form — jewellery fields section", status: "DONE" },
      { name: "Jewellery variants (size matrix, metal options)", status: "TODO" },
      { name: "Custom jewellery flow (inquiry → CAD → approval → production)", status: "TODO" },
    ]
  },
  {
    id: "diamonds", name: "Diamond Module (Natural + Lab-grown)", icon: "ti-hexagon",
    items: [
      { name: "diamond_details table (4Cs, measurements, polish, symmetry, fluorescence, laser inscription)", status: "DONE", note: "Migration 008" },
      { name: "Natural vs lab-grown flag + CVD/HPHT type", status: "DONE", note: "Migration 008" },
      { name: "Country of origin field", status: "DONE", note: "Migration 008" },
      { name: "Rapaport pricing structure (rap_rate, discount %, final_rate)", status: "DONE", note: "Migration 008" },
      { name: "Diamond hold system (hold_until, hold_by_customer)", status: "DONE", note: "Migration 008" },
      { name: "Diamond admin form (full grading UI)", status: "TODO", note: "Admin UI for diamond_details" },
      { name: "Diamond search API (faceted — shape, carat, color, clarity, cut, lab, price)", status: "TODO" },
      { name: "Diamond comparison (up to 4 side by side)", status: "TODO" },
      { name: "360 diamond viewer", status: "TODO" },
      { name: "Rapaport auto-pricing (fetch + apply markup rules)", status: "TODO" },
      { name: "Supplier inventory sync", status: "TODO" },
    ]
  },
  {
    id: "gemstones", name: "Gemstone Module (Coloured stones)", icon: "ti-oval",
    items: [
      { name: "gemstone_details table (type, species, variety, origin, treatment, saturation, tone)", status: "DONE", note: "Migration 008" },
      { name: "Cert labs — GRS, SSEF, GIA, Gübelin, Lotus", status: "DONE", note: "Migration 008" },
      { name: "Gemstone admin form", status: "TODO" },
      { name: "Gemstone search + filter page", status: "TODO" },
    ]
  },
  {
    id: "pearls", name: "Pearl Module", icon: "ti-circle",
    items: [
      { name: "pearl_details table (type, nacre, lustre, overtone, shape, size, matching grade)", status: "DONE", note: "Migration 008" },
      { name: "Pearl types — Akoya, South Sea, Tahitian, Freshwater", status: "DONE" },
      { name: "Pearl admin form", status: "TODO" },
    ]
  },
  {
    id: "mountings", name: "Mounting Module", icon: "ti-ring",
    items: [
      { name: "mounting_details table (type, style, shank, head, prong, compatible shapes/carats, metal options)", status: "DONE", note: "Migration 008" },
      { name: "CAD file upload per mounting", status: "DONE", note: "Migration 008" },
      { name: "Mounting admin form", status: "TODO" },
      { name: "Stone + Mounting builder (customer picks both, price calculated)", status: "TODO" },
      { name: "Mounting catalogue storefront page", status: "TODO" },
    ]
  },
  {
    id: "certificates", name: "Certificate Engine", icon: "ti-certificate",
    items: [
      { name: "Certificate storage — lab, number, date, PDF upload (Cloudinary)", status: "DONE" },
      { name: "Certifications admin UI on product", status: "DONE" },
      { name: "Diamond cert fields (cert_url, primary_cert_no)", status: "DONE", note: "Migration 008" },
      { name: "Public verification page — /verify/:cert_number", status: "TODO", note: "Critical for trust" },
      { name: "QR code generation per certificate", status: "TODO" },
      { name: "GRS, SSEF, Gübelin, Lotus labs for gemstones", status: "DONE", note: "Migration 008" },
    ]
  },
  {
    id: "suppliers", name: "Supplier & Memo System", icon: "ti-building-store",
    items: [
      { name: "Suppliers table (name, contact, terms, currency, discount)", status: "DONE", note: "Migration 008" },
      { name: "Memo tracking table (memo items, status, due date)", status: "DONE", note: "Migration 008" },
      { name: "Suppliers admin page (CRUD)", status: "TODO" },
      { name: "Memo admin page (issue memo, mark returned/sold)", status: "TODO" },
      { name: "Supplier inventory sync (CSV import)", status: "TODO" },
    ]
  },
  {
    id: "manufacturing", name: "Manufacturing & Custom Orders", icon: "ti-tools",
    items: [
      { name: "custom_orders table (full workflow status)", status: "DONE", note: "Migration 008" },
      { name: "custom_order_cad table (versions, approval, feedback)", status: "DONE", note: "Migration 008" },
      { name: "Custom order statuses — INQUIRY → DESIGNING → APPROVAL_PENDING → APPROVED → MANUFACTURING → STONE_SETTING → POLISHING → QC → READY → SHIPPED", status: "DONE", note: "Migration 008" },
      { name: "Custom orders admin page", status: "TODO" },
      { name: "CAD file management UI (upload, versions, approve/reject)", status: "TODO" },
      { name: "Workshop status board", status: "TODO" },
      { name: "Craftsman assignment", status: "TODO" },
      { name: "Customer custom order request flow (storefront)", status: "TODO" },
    ]
  },
  {
    id: "pricing", name: "Pricing Engine", icon: "ti-currency-dollar",
    items: [
      { name: "Base price + making charges + discount calculation", status: "DONE" },
      { name: "Live gold rate table (manual entry)", status: "DONE" },
      { name: "Price preview (weight × rate + making charges)", status: "DONE" },
      { name: "Rapaport pricing structure in DB", status: "DONE", note: "Migration 008" },
      { name: "Auto gold rate fetch cron job", status: "TODO" },
      { name: "Rapaport live feed integration", status: "TODO" },
      { name: "Markup rules engine (% above/below rap)", status: "TODO" },
      { name: "Dynamic pricing per country/currency", status: "TODO" },
      { name: "B2B pricing tiers", status: "TODO" },
    ]
  },
  {
    id: "crm", name: "CRM — Enquiries, Appointments, WhatsApp", icon: "ti-messages",
    items: [
      { name: "Enquiry CRM (list, detail, status tracking)", status: "DONE" },
      { name: "WhatsApp quick reply + link generator", status: "DONE" },
      { name: "Boutique appointment booking (5-step, Cartier-style)", status: "DONE" },
      { name: "Appointments admin page + today summary", status: "DONE" },
      { name: "Customer database (CRUD + import from enquiries)", status: "DONE" },
      { name: "Auto-reply emails (enquiry + appointment confirmation)", status: "DONE" },
      { name: "Saved diamond searches (customer portal)", status: "TODO" },
      { name: "Diamond comparison save", status: "TODO" },
      { name: "Customer login portal", status: "TODO" },
    ]
  },
  {
    id: "commerce", name: "Commerce Engine", icon: "ti-shopping-cart",
    items: [
      { name: "Orders admin (list, detail, status update)", status: "DONE" },
      { name: "Promo codes (% + fixed, min order, expiry)", status: "DONE" },
      { name: "Cart (guest + logged in + saved + reserved inventory)", status: "TODO" },
      { name: "Checkout (address, shipping, payment, VAT)", status: "TODO" },
      { name: "Payment gateways — Stripe, Checkout.com, Telr, Tabby, Tamara", status: "TODO" },
      { name: "Shipping — Aramex, DHL, FedEx", status: "TODO" },
      { name: "Customer account portal (orders, wishlist, certs, custom orders)", status: "TODO" },
      { name: "B2B wholesale pricing + RFQ", status: "TODO" },
      { name: "Invoice PDF generation", status: "TODO" },
    ]
  },
  {
    id: "admin_ui", name: "Admin Panel UI", icon: "ti-layout-dashboard",
    items: [
      { name: "Login page (65/35 split, jewellery showcase, remember me)", status: "DONE" },
      { name: "Dashboard (real KPIs, activity feed, low stock alerts)", status: "DONE" },
      { name: "Products list (paginated, filtered, 💎 specs button)", status: "DONE" },
      { name: "Product form (plugin-aware, universal + jewellery fields)", status: "DONE" },
      { name: "Jewellery specs form (5-tab — metal, certs, images, pricing, details)", status: "DONE" },
      { name: "Categories + Collections manager", status: "DONE" },
      { name: "Media library (upload, gallery, preview)", status: "DONE" },
      { name: "Enquiries CRM page", status: "DONE" },
      { name: "Appointments admin page", status: "DONE" },
      { name: "Customers page", status: "DONE" },
      { name: "Orders page", status: "DONE" },
      { name: "Inventory page (stock + ledger)", status: "DONE" },
      { name: "Marketing page (banners + promos)", status: "DONE" },
      { name: "Store locations page", status: "DONE" },
      { name: "Trust badges page", status: "DONE" },
      { name: "Plugin marketplace (install/configure)", status: "DONE" },
      { name: "Users + Roles + Permissions matrix", status: "DONE" },
      { name: "Settings page", status: "DONE" },
      { name: "Audit log viewer", status: "DONE" },
      { name: "Dev status tracker (this page)", status: "DONE" },
      { name: "Diamond inventory form (4Cs, measurements, Rap pricing)", status: "TODO" },
      { name: "Gemstone inventory form", status: "TODO" },
      { name: "Pearl inventory form", status: "TODO" },
      { name: "Mounting catalogue form", status: "TODO" },
      { name: "Suppliers admin page", status: "TODO" },
      { name: "Memo tracking page", status: "TODO" },
      { name: "Custom orders admin + CAD workflow", status: "TODO" },
      { name: "Import engine page (CSV upload + field mapping)", status: "TODO" },
      { name: "Feature flags admin (enable/disable modules per client)", status: "TODO" },
      { name: "Certificate management + QR generator", status: "TODO" },
      { name: "Blog + education content manager", status: "TODO" },
      { name: "Visual page builder (drag-and-drop)", status: "TODO" },
    ]
  },
  {
    id: "storefront", name: "Next.js Storefront (Public Website)", icon: "ti-world",
    items: [
      { name: "Homepage — hero, collections, diamonds, gemstones, appointment CTA", status: "TODO" },
      { name: "Jewellery catalogue (filters — metal, purity, occasion, gender, price)", status: "TODO" },
      { name: "Diamond search (live filters — shape, carat, color, clarity, cut, lab, price)", status: "TODO" },
      { name: "Gemstone search page", status: "TODO" },
      { name: "Product detail page (gallery, zoom, 360, cert viewer, WhatsApp button)", status: "TODO" },
      { name: "Mounting catalogue page", status: "TODO" },
      { name: "Stone + Mounting builder (pick your stone + setting)", status: "TODO" },
      { name: "Custom jewellery request flow", status: "TODO" },
      { name: "Certificate verification — /verify/:cert_number", status: "TODO" },
      { name: "Cart + Checkout + Payment", status: "TODO" },
      { name: "Customer account portal", status: "TODO" },
      { name: "Blog / education hub", status: "TODO" },
      { name: "About, FAQ, policy pages (from CMS)", status: "TODO" },
      { name: "Appointment booking (from product page)", status: "TODO" },
      { name: "WhatsApp floating button + product enquiry", status: "TODO" },
      { name: "Wishlist (localStorage + account sync)", status: "TODO" },
      { name: "Diamond comparison page", status: "TODO" },
      { name: "SEO — SSR, schema.org, sitemap, Open Graph, canonical", status: "TODO" },
      { name: "Arabic RTL support", status: "TODO" },
      { name: "Multi-currency display (AED, USD, SAR, INR)", status: "TODO" },
    ]
  },
];

function countStatus(items) {
  const done = items.filter(i => i.status === "DONE").length;
  const partial = items.filter(i => i.status === "PARTIAL").length;
  const total = items.length;
  const pct = Math.round(((done + partial * 0.5) / total) * 100);
  return { done, partial, total, pct };
}

function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 3, background: "var(--color-border-tertiary)", borderRadius: 4, marginTop: 5 }}>
      <div style={{ height: 3, width: `${pct}%`, background: color, borderRadius: 4, transition: "width .4s" }} />
    </div>
  );
}

const getColor = (pct) => pct >= 70 ? "#22c55e" : pct >= 30 ? "#f59e0b" : "#6b7280";

export default function DevStatusPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [expanded, setExpanded] = useState({});
  const [filterStatus, setFilterStatus] = useState("ALL");

  const allItems = MODULES.flatMap(m => m.items);
  const totalDone    = allItems.filter(i => i.status === "DONE").length;
  const totalPartial = allItems.filter(i => i.status === "PARTIAL").length;
  const totalTodo    = allItems.filter(i => i.status === "TODO").length;
  const totalAll     = allItems.length;
  const overallPct   = Math.round(((totalDone + totalPartial * 0.5) / totalAll) * 100);
  const gold = "#c9a84c";

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: e[id] === false ? true : false }));
  const isOpen = (id) => expanded[id] !== false;

  const text    = "var(--color-text-primary)";
  const muted   = "var(--color-text-secondary)";
  const cardBg  = "var(--color-background-primary)";
  const cardBg2 = "var(--color-background-secondary)";
  const border  = "var(--color-border-tertiary)";

  return (
    <>
      <Topbar title="Development status" subtitle={`Jewellery Commerce OS · Last updated: ${LAST_UPDATED}`}
        collapsed={collapsed} onToggle={toggleSidebar} />

      <div className="flex-1 overflow-y-auto" style={{ fontFamily: "Inter, sans-serif", color: text }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px 40px" }}>

          {/* Overall progress */}
          <div style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Overall progress</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: gold }}>{overallPct}%</span>
            </div>
            <ProgressBar pct={overallPct} color={gold} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 14 }}>
              {[
                { label: "Total tasks", value: totalAll, color: text },
                { label: "Done", value: totalDone, color: "#22c55e" },
                { label: "In progress", value: totalPartial, color: "#f59e0b" },
                { label: "Pending", value: totalTodo, color: muted },
              ].map(s => (
                <div key={s.label} style={{ background: cardBg2, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["ALL", "DONE", "PARTIAL", "TODO"].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                  fontWeight: filterStatus === f ? 600 : 400, border: `0.5px solid ${filterStatus === f ? gold : border}`,
                  background: filterStatus === f ? gold : "transparent",
                  color: filterStatus === f ? "#000" : muted }}>
                {f === "ALL" ? "All" : STATUS[f].label}
              </button>
            ))}
          </div>

          {/* Modules */}
          {MODULES.map(mod => {
            const stats = countStatus(mod.items);
            const filteredItems = filterStatus === "ALL" ? mod.items : mod.items.filter(i => i.status === filterStatus);
            if (filterStatus !== "ALL" && filteredItems.length === 0) return null;
            const moduleColor = getColor(stats.pct);
            const open = isOpen(mod.id);

            return (
              <div key={mod.id} style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
                <div onClick={() => toggle(mod.id)}
                  style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                  <i className={`ti ${mod.icon}`} style={{ fontSize: 16, color: gold, flexShrink: 0 }} aria-hidden="true" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{mod.name}</span>
                      <span style={{ fontSize: 11, color: muted }}>{stats.done}/{stats.total}</span>
                    </div>
                    <ProgressBar pct={stats.pct} color={moduleColor} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: moduleColor }}>{stats.pct}%</span>
                    <i className={`ti ti-chevron-${open ? "up" : "down"}`} style={{ fontSize: 13, color: muted }} aria-hidden="true" />
                  </div>
                </div>

                {open && (
                  <div style={{ borderTop: `0.5px solid ${border}`, padding: "8px 16px 12px" }}>
                    {filteredItems.map((item, idx) => {
                      const s = STATUS[item.status];
                      return (
                        <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0",
                          borderBottom: idx < filteredItems.length - 1 ? `0.5px solid var(--color-background-secondary)` : "none" }}>
                          <i className={`ti ${s.icon}`} style={{ fontSize: 14, color: s.color, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: item.status === "DONE" ? muted : text,
                              textDecoration: item.status === "DONE" ? "line-through" : "none" }}>{item.name}</div>
                            {item.note && <div style={{ fontSize: 10, color: muted, marginTop: 1 }}>{item.note}</div>}
                          </div>
                          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20,
                            background: s.color + "22", color: s.color, fontWeight: 600,
                            flexShrink: 0, whiteSpace: "nowrap" }}>{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ textAlign: "center", padding: "16px 0 4px", fontSize: 11, color: muted }}>
            Jewellery Commerce OS · Built by KenTech Global · {LAST_UPDATED}
          </div>
        </div>
      </div>
    </>
  );
}
