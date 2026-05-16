import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import { useTheme } from "../context/ThemeContext";

const STATUS = {
  DONE:    { label: "Done",        color: "#22c55e", icon: "ti-circle-check" },
  PARTIAL: { label: "In progress", color: "#f59e0b", icon: "ti-clock" },
  TODO:    { label: "Pending",     color: "#6b7280", icon: "ti-circle-dashed" },
  BLOCKED: { label: "Blocked",     color: "#ef4444", icon: "ti-circle-x" },
};

const LAST_UPDATED = "2026-05-16 — dev status, users RBAC, plugins operational";

const MODULES = [
  {
    id: "infra",
    name: "Infrastructure & DevOps",
    icon: "ti-server-2",
    items: [
      { name: "Docker Compose (PostgreSQL + Redis + Backend + Admin + pgAdmin)", status: "DONE", note: "Running on Windows 11 Docker Desktop" },
      { name: "PostgreSQL 16 database", status: "DONE", note: "Migrated from MySQL — unified with Vantix ERP" },
      { name: "Redis cache", status: "DONE" },
      { name: "Nodemon hot-reload (backend)", status: "DONE" },
      { name: "Vite hot-reload (admin panel)", status: "DONE" },
      { name: "GitHub repo (private)", status: "DONE", note: "tripathiyomesh-pixel/cms" },
      { name: "Windows batch files (start.bat, stop.bat, docker-migrate.bat)", status: "DONE" },
      { name: "Nginx + SSL (production)", status: "TODO", note: "Needed before going live with first client" },
      { name: "PM2 auto-restart (production)", status: "TODO" },
      { name: "Automated daily DB backups", status: "TODO" },
      { name: "Production VPS setup (Hetzner/Hostinger)", status: "TODO" },
    ]
  },
  {
    id: "auth",
    name: "Authentication & Users",
    icon: "ti-shield-lock",
    items: [
      { name: "JWT login + logout", status: "DONE" },
      { name: "Register + bcrypt password hash", status: "DONE" },
      { name: "Role-based access + permissions matrix page (role guide + resource matrix)", status: "DONE" },
      { name: "Auth guard middleware", status: "DONE" },
      { name: "Change password", status: "DONE" },
      { name: "Audit log middleware", status: "DONE" },
      { name: "Login page (admin UI)", status: "DONE" },
      { name: "Users list + invite (admin UI)", status: "DONE" },
      { name: "Role assignment (admin UI)", status: "DONE" },
      { name: "Forgot password / email reset", status: "TODO" },
      { name: "Two-factor authentication (2FA)", status: "TODO" },
      { name: "Session management (revoke tokens)", status: "TODO" },
    ]
  },
  {
    id: "products",
    name: "Product Catalogue (Core — works for all industries)",
    icon: "ti-package",
    items: [
      { name: "Products CRUD API + soft delete", status: "DONE" },
      { name: "Auto SKU generation (JM-GD18-XXXX)", status: "DONE" },
      { name: "Auto slug generation", status: "DONE" },
      { name: "Pricing engine (base + making charges + discount)", status: "DONE" },
      { name: "Country pricing (multi-currency JSON)", status: "DONE" },
      { name: "Stock management + ledger", status: "DONE" },
      { name: "Redis caching (2 min TTL)", status: "DONE" },
      { name: "Cloudinary media upload", status: "DONE" },
      { name: "Tags + SEO fields (title, description, slug)", status: "DONE" },
      { name: "Products list page (paginated + filtered)", status: "DONE" },
      { name: "Add / edit product form", status: "DONE" },
      { name: "Multi-image upload on product", status: "DONE" },
      { name: "Stock update from admin", status: "DONE" },
      { name: "Categories (tree, parent/child)", status: "DONE" },
      { name: "Collections CRUD + product assignment", status: "DONE" },
      { name: "Bulk CSV import", status: "PARTIAL", note: "Backend ready, admin UI pending" },
      { name: "Product variants (size, color)", status: "PARTIAL", note: "DB table exists, UI pending" },
      { name: "Product duplication (clone)", status: "TODO" },
      { name: "Quick inline edit on list", status: "TODO" },
      { name: "Drag-and-drop sort order", status: "TODO" },
    ]
  },
  {
    id: "jewellery",
    name: "Jewellery Plugin (Industry-specific layer)",
    icon: "ti-diamond",
    items: [
      { name: "Metal type + purity fields", status: "DONE" },
      { name: "Gross + net weight", status: "DONE" },
      { name: "Diamond 4Cs (cut, color, clarity, carat, shape)", status: "DONE" },
      { name: "Gemstone type + carat + color", status: "DONE" },
      { name: "Certifications (IGI, GIA, SGL) + PDF upload", status: "DONE" },
      { name: "Making charges (flat AED + % of metal value)", status: "DONE" },
      { name: "Ring size range configuration", status: "DONE" },
      { name: "Occasion tags (bridal, daily, gifting etc.)", status: "DONE" },
      { name: "Live gold rate table (manual + API)", status: "DONE" },
      { name: "Live price preview (weight × rate + making)", status: "DONE" },
      { name: "5-tab jewellery specs form (admin UI)", status: "DONE" },
      { name: "Multi-image gallery with primary image", status: "DONE" },
      { name: "Wire 'Jewellery Specs' button on product list", status: "DONE", note: "💎 button now on each product row" },
      { name: "Hallmark fields (BIS India)", status: "TODO" },
      { name: "Old gold exchange calculator", status: "TODO" },
      { name: "Making charges per category (not per product)", status: "TODO" },
      { name: "Ring size guide page (storefront)", status: "TODO" },
    ]
  },
  {
    id: "enquiries",
    name: "Enquiries & WhatsApp",
    icon: "ti-brand-whatsapp",
    items: [
      { name: "Enquiry submission API (form + WhatsApp)", status: "DONE" },
      { name: "Enquiry CRM admin page", status: "DONE" },
      { name: "WhatsApp quick reply from admin panel", status: "DONE" },
      { name: "WhatsApp link generator API (pre-fills product info)", status: "DONE" },
      { name: "Status tracking (new → contacted → converted → closed)", status: "DONE" },
      { name: "Channel tracking (WhatsApp / form / email / phone)", status: "DONE" },
      { name: "Filter by status + pagination", status: "DONE" },
      { name: "WhatsApp button on product detail page (storefront)", status: "TODO", note: "Needs storefront first" },
      { name: "Floating WhatsApp button sitewide", status: "TODO" },
      { name: "Auto-reply emails (enquiry + appointment confirmation)", status: "DONE" },
      { name: "Bulk WhatsApp message (notify customer list)", status: "TODO" },
    ]
  },
  {
    id: "appointments",
    name: "Appointments (Cartier-style boutique booking)",
    icon: "ti-calendar-event",
    items: [
      { name: "Appointments DB tables (upgraded schema)", status: "DONE" },
      { name: "Real-time slot availability API", status: "DONE" },
      { name: "Max bookings per slot (configurable)", status: "DONE" },
      { name: "Unique booking reference (APT-XXXXX)", status: "DONE" },
      { name: "Product pre-fill from product page", status: "DONE" },
      { name: "Multi-location support", status: "DONE" },
      { name: "Today's summary API", status: "DONE" },
      { name: "5-step booking modal (Cartier-style)", status: "DONE" },
      { name: "Purpose selector (6 types: engagement, bridal, gifting etc.)", status: "DONE" },
      { name: "Date picker + live time slots", status: "DONE" },
      { name: "Customer details + party size", status: "DONE" },
      { name: "Booking confirmation screen + WhatsApp confirm", status: "DONE" },
      { name: "Appointments admin CRM page", status: "DONE" },
      { name: "Status management (pending/confirmed/completed/cancelled)", status: "DONE" },
      { name: "Calendar view (month/week) in admin", status: "TODO" },
      { name: "Auto WhatsApp / SMS confirmation on booking", status: "TODO" },
      { name: "Google Calendar sync", status: "TODO" },
      { name: "24h reminder notifications", status: "TODO" },
      { name: "Staff assignment per appointment", status: "TODO" },
    ]
  },
  {
    id: "store",
    name: "Store Management",
    icon: "ti-building-store",
    items: [
      { name: "Multi-showroom locations (DB + API)", status: "DONE" },
      { name: "Working hours + Google Maps URL", status: "DONE" },
      { name: "Primary location flag", status: "DONE" },
      { name: "Trust badges (admin-configurable, DB + API)", status: "DONE" },
      { name: "Store countries + currency + VAT", status: "DONE" },
      { name: "Key-value settings store (brand colors, logo, WhatsApp)", status: "DONE" },
      { name: "Settings admin page (partial)", status: "PARTIAL", note: "Logo upload and branding UI incomplete" },
      { name: "Store locations admin page (UI)", status: "DONE" },
      { name: "Trust badges admin page (UI)", status: "DONE" },
      { name: "Logo + favicon upload in settings", status: "TODO" },
      { name: "Google Maps embed on storefront", status: "TODO" },
    ]
  },
  {
    id: "marketing",
    name: "Marketing & Orders",
    icon: "ti-speakerphone",
    items: [
      { name: "Banners (hero, promo strip, sidebar, popup)", status: "DONE" },
      { name: "Promo codes (% + fixed, min order, expiry)", status: "DONE" },
      { name: "Marketing admin page", status: "DONE" },
      { name: "Inventory ledger + low stock alerts", status: "DONE" },
      { name: "Orders table (DB)", status: "DONE" },
      { name: "Orders page (list, detail, status workflow, WhatsApp contact)", status: "DONE" },
      { name: "Order status workflow (pending → confirmed → shipped)", status: "DONE" },
      { name: "Invoice / receipt PDF generation", status: "TODO", note: "Next — use pdfkit" },
      { name: "Customers page (list, detail, WhatsApp, import from enquiries)", status: "DONE" },
      { name: "Email marketing (Mailchimp sync)", status: "TODO" },
      { name: "Newsletter signup API", status: "TODO" },
      { name: "Payment gateway (Stripe / Razorpay)", status: "TODO" },
    ]
  },
  {
    id: "content",
    name: "Content & Admin Tools",
    icon: "ti-layout",
    items: [
      { name: "Page builder (backend — sections, content JSON)", status: "DONE" },
      { name: "Menu builder (backend)", status: "DONE" },
      { name: "Themes system (backend)", status: "DONE" },
      { name: "Content pages DB (buying guide, FAQ, about)", status: "DONE" },
      { name: "Webhooks CRUD + event delivery", status: "DONE" },
      { name: "Plugin marketplace (install/uninstall/activate/configure — fully operational)", status: "DONE" },
      { name: "Audit log (DB)", status: "DONE" },
      { name: "Page builder admin UI", status: "PARTIAL", note: "Page exists, drag-and-drop incomplete" },
      { name: "Media library admin UI (upload, gallery, preview, delete)", status: "DONE" },
      { name: "Menu builder admin UI", status: "PARTIAL", note: "Priority 4" },
      { name: "Theme switcher admin UI", status: "TODO" },
      { name: "Audit log viewer (backend + admin UI + diff view)", status: "DONE" },
      { name: "Plugin config UI per plugin", status: "DONE", note: "Settings modal per plugin" },
    ]
  },
  {
    id: "storefront",
    name: "Public Storefront (Next.js — Phase 2)",
    icon: "ti-world",
    items: [
      { name: "Next.js project setup + Tailwind", status: "TODO", note: "Phase 2 start" },
      { name: "Homepage (pulls from page builder sections)", status: "TODO" },
      { name: "Product listing page + filter sidebar", status: "TODO" },
      { name: "Product detail page (images, specs, cert download)", status: "TODO" },
      { name: "WhatsApp enquiry button on product", status: "TODO" },
      { name: "Book appointment button on product", status: "TODO" },
      { name: "Collection pages", status: "TODO" },
      { name: "Wishlist (localStorage, no login needed)", status: "TODO" },
      { name: "Education hub (4Cs guide, ring size chart)", status: "TODO" },
      { name: "About / store story page", status: "TODO" },
      { name: "Contact page + store locations map", status: "TODO" },
      { name: "Header + footer from menu builder", status: "TODO" },
      { name: "SEO meta tags + sitemap.xml + robots.txt", status: "TODO" },
      { name: "Arabic RTL support", status: "TODO" },
      { name: "Multi-currency price display", status: "TODO" },
      { name: "Mobile responsive (GCC customers)", status: "TODO" },
    ]
  },
  {
    id: "plugins",
    name: "Industry Plugins (future — no code rewrite needed)",
    icon: "ti-plug",
    items: [
      { name: "Jewellery plugin", status: "DONE", note: "First industry — fully built" },
      { name: "Fashion / Apparel plugin (size, color, fabric, season)", status: "TODO" },
      { name: "Real estate plugin (BHK, area, floor plan, amenities)", status: "TODO" },
      { name: "Automotive plugin (make, model, year, mileage, VIN)", status: "TODO" },
      { name: "Furniture plugin (dimensions, material, finish)", status: "TODO" },
      { name: "Beauty / cosmetics plugin (ingredients, skin type, shade)", status: "TODO" },
      { name: "Electronics plugin (specs, warranty, storage)", status: "TODO" },
      { name: "F&B / menu plugin (allergens, calories, portions)", status: "TODO" },
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
    <div style={{ height: 4, background: "var(--color-border-tertiary)", borderRadius: 4, marginTop: 6 }}>
      <div style={{ height: 4, width: `${pct}%`, background: color, borderRadius: 4, transition: "width .4s" }} />
    </div>
  );
}

export default function DevStatusPage() {
  const { dark } = useTheme();
  const { collapsed, toggleSidebar } = useOutletContext();
  const [expanded, setExpanded] = useState({});
  const [filterStatus, setFilterStatus] = useState("ALL");

  const bg = dark ? "#1a1a1a" : "#ffffff";
  const cardBg = dark ? "#242424" : "#f8f8f8";
  const border = dark ? "#333" : "#e5e5e5";
  const text = dark ? "#e0e0e0" : "#1a1a1a";
  const muted = dark ? "#888" : "#666";
  const gold = "#c9a84c";

  const allItems = MODULES.flatMap(m => m.items);
  const totalDone = allItems.filter(i => i.status === "DONE").length;
  const totalPartial = allItems.filter(i => i.status === "PARTIAL").length;
  const totalTodo = allItems.filter(i => i.status === "TODO").length;
  const totalAll = allItems.length;
  const overallPct = Math.round(((totalDone + totalPartial * 0.5) / totalAll) * 100);

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const getColor = (pct) => pct >= 80 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#6b7280";

  // AppLayout provides the scroll container — just use its pattern
  return (
    <>
      <Topbar title="Dev status" subtitle={`Last updated: ${LAST_UPDATED}`} collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="flex-1 overflow-y-auto" style={{ background: bg, color: text, fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Development status</h1>
              <p style={{ fontSize: 13, color: muted, margin: "4px 0 0" }}>
                Jewellery CMS · Last updated: {LAST_UPDATED}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: gold }}>{overallPct}%</div>
              <div style={{ fontSize: 12, color: muted }}>overall complete</div>
            </div>
          </div>
          <ProgressBar pct={overallPct} color={gold} />
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Total tasks", value: totalAll, color: text },
            { label: "Done", value: totalDone, color: "#22c55e" },
            { label: "In progress", value: totalPartial, color: "#f59e0b" },
            { label: "Pending", value: totalTodo, color: muted },
          ].map(s => (
            <div key={s.label} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {["ALL", "DONE", "PARTIAL", "TODO"].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: filterStatus === f ? 600 : 400,
                background: filterStatus === f ? gold : "transparent",
                color: filterStatus === f ? "#000" : muted,
                border: `1px solid ${filterStatus === f ? gold : border}` }}>
              {f === "ALL" ? "All" : STATUS[f].label}
            </button>
          ))}
        </div>

        {/* Modules */}
        {MODULES.map(mod => {
          const stats = countStatus(mod.items);
          const isOpen = expanded[mod.id] !== false;
          const filteredItems = filterStatus === "ALL" ? mod.items : mod.items.filter(i => i.status === filterStatus);
          if (filterStatus !== "ALL" && filteredItems.length === 0) return null;
          const moduleColor = getColor(stats.pct);

          return (
            <div key={mod.id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
              {/* Module header */}
              <div onClick={() => toggle(mod.id)}
                style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                <i className={`ti ${mod.icon}`} style={{ fontSize: 18, color: gold, flexShrink: 0 }} aria-hidden="true" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{mod.name}</span>
                    <span style={{ fontSize: 11, color: muted }}>{stats.done}/{stats.total} done</span>
                  </div>
                  <ProgressBar pct={stats.pct} color={moduleColor} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: moduleColor }}>{stats.pct}%</span>
                  <i className={`ti ti-chevron-${isOpen ? "up" : "down"}`} style={{ fontSize: 14, color: muted }} aria-hidden="true" />
                </div>
              </div>

              {/* Module items */}
              {isOpen && (
                <div style={{ borderTop: `1px solid ${border}`, padding: "10px 18px 14px" }}>
                  {filteredItems.map((item, idx) => {
                    const s = STATUS[item.status];
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0", borderBottom: idx < filteredItems.length - 1 ? `1px solid ${dark ? "#2a2a2a" : "#f0f0f0"}` : "none" }}>
                        <i className={`ti ${s.icon}`} style={{ fontSize: 15, color: s.color, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: item.status === "DONE" ? muted : text, textDecoration: item.status === "DONE" ? "line-through" : "none" }}>
                            {item.name}
                          </div>
                          {item.note && (
                            <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{item.note}</div>
                          )}
                        </div>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: s.color + "22", color: s.color, fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ textAlign: "center", padding: "20px 0 4px", fontSize: 12, color: muted }}>
          Jewellery CMS · Built by KenTech Global · {LAST_UPDATED}
        </div>
      </div>
      </div>
    </>
  );
}
