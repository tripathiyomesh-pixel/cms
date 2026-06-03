# VANTIX CMS — Work In Progress

**Last updated:** 2026-06-03 (Session 2)
**Phase:** Phase 2 — CRM, Email Wiring, Orders
**Stack:** Node.js + Express + PostgreSQL 16 + Redis · Admin: React/Vite · Storefront: Next.js

---

## ✅ Completed — Bug Fix Session

11 critical bugs fixed. See git log `2f701b9` for full list.

Key fixes: JWT split-brain, missing reset-password endpoint, db.pool.js crash on missing .env,
pages table SERIAL→UUID, missing PATCH /publish endpoint.

---

## ✅ Completed — Phase 1 Core CMS (Session 2)

### Email Service (`src/services/email.service.js`)
- nodemailer wrapper with HTML templates: password-reset, welcome, order-confirmation, appointment-confirmation
- Brand tokens from env (STORE_NAME, BRAND_COLOR, STORE_LOGO_URL)
- Graceful dev mode (logs to console when SMTP not configured)
- Wired: forgot-password sends reset emails, appointment confirms send emails, order confirms send emails

### SEO Module (`src/modules/storefront/seo.routes.js`)
- Redirect Manager: GET/POST/PATCH/DELETE /api/seo/redirects (301/302, toggle, hit count)
- SEO Audit: GET /api/seo/audit/:type/:slug (score 0-100, grade A-D, issue categorisation)
- Robots.txt: admin-configurable via settings DB
- SMTP test + status endpoints
- seo_redirects table auto-created

### Admin UI — Phase 1
- `SeoPage.jsx` — Redirects | robots.txt | SEO Audit | Email Settings (4 tabs)
- `PagesAdminPage.jsx` — Pages list with publish/unpublish/archive
- `PageBuilderPage.jsx` — Publish now correctly calls PATCH /publish endpoint
- Sidebar: Pages, SEO & Email added

---

## ✅ Completed — Phase 2 CRM (This Session)

### CRM Backend (`src/modules/customers/crm.routes.js`)
Tables auto-created: `customer_notes`, `customer_activities`, `leads`

| Endpoint | Description |
|----------|-------------|
| GET /api/crm/customers/:id/timeline | Activity timeline |
| POST /api/crm/customers/:id/activities | Log manual activity |
| GET/POST /api/crm/customers/:id/notes | Customer notes |
| PATCH/DELETE /api/crm/customers/:customerId/notes/:noteId | Edit/delete note |
| GET /api/crm/leads | Lead list with filters |
| GET /api/crm/leads/board | Kanban board data grouped by stage |
| GET/POST /api/crm/leads/:id | Individual lead |
| PATCH /api/crm/leads/:id | Update stage, fields |
| DELETE /api/crm/leads/:id | Soft delete |
| GET /api/crm/stats | Pipeline summary + recent activities |

### CRM Admin UI
- `CrmPage.jsx` — 3 tabs: Kanban Board | Lead List | Stats
  - Kanban: 6-stage pipeline (new→contacted→qualified→proposal→won/lost)
  - Per-column: count, pipeline value, add button, move shortcuts
  - Lead cards: priority icon, contact links, WhatsApp, quick stage move
  - List view: sortable, filterable by stage + search
  - Stats: KPI row, stage breakdown with bars, recent activity feed
- `CustomerDetailPage.jsx` — /customers/:id
  - Profile card with avatar, contact actions, WhatsApp
  - Activity timeline with type icons (enquiry/appointment/order/note/call/whatsapp/visit)
  - Notes tab: add/pin/delete notes
  - Linked enquiries tab
  - Linked orders tab
  - Log Activity modal (call/email/whatsapp/visit/note)
- `CustomersPage.jsx` — added "View Full Profile & Timeline" button
- Sidebar: CRM & Leads added to Commerce section

### Orders
- Order confirmation email fires when status → confirmed
- PATCH /:id/status now wired to emailService

---

## 📦 Module Status

| Module | Backend | Admin UI | Storefront |
|--------|---------|----------|------------|
| Auth & Users | ✅ | ✅ | — |
| Products | ✅ | ✅ | ✅ |
| Jewellery Specs | ✅ | ✅ | ✅ |
| Diamonds | ✅ | ✅ | ✅ |
| Gemstones | ✅ | ✅ | — |
| Pearls | ✅ | ✅ | — |
| Mountings | ✅ | ✅ | — |
| Categories | ✅ | ✅ | ✅ |
| Collections | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | — |
| Marketing | ✅ | ✅ | ✅ |
| **CRM & Leads** | ✅ | ✅ | — |
| **Customer Timeline** | ✅ | ✅ | — |
| **Customer Notes** | ✅ | ✅ | — |
| Enquiries | ✅ | ✅ | — |
| Appointments | ✅ | ✅ | ✅ |
| Orders | ✅ | ✅ | — |
| Custom Orders | ✅ | ✅ | — |
| Blog | ✅ | ✅ | ✅ |
| **Pages Admin** | ✅ | ✅ | ✅ |
| **SEO & Redirects** | ✅ | ✅ | — |
| **Email Service** | ✅ | — | — |
| Media Library | ✅ | ✅ | — |
| Menus | ✅ | ✅ | ✅ |
| Themes | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | — |
| Feature Flags | ✅ | ✅ | — |
| Gold Rates | ✅ | ✅ | ✅ |
| RapNet | ✅ | ✅ | — |
| ERP Integration | ✅ | ✅ | — |
| Exhibitions | ✅ | ✅ | ✅ |
| Import Engine | ✅ | ✅ | — |
| Audit Log | ✅ | ✅ | — |
| Workforce | ✅ | ✅ | — |
| Payments | ✅ | ✅ | — |
| Plugins | ✅ | ✅ | — |
| Webhooks | ✅ | ✅ | — |

---

## 🔜 Phase 3 — Next Session

Priority order:

1. **Storefront: Orders** — customer-facing order tracking page (/account/orders)
2. **Storefront: Wishlist** — fully functional wishlist page with localStorage sync + API
3. **Media Library Admin** — folder management, bulk delete, drag-to-upload improvements
4. **Dashboard** — wire CRM stats widget into main dashboard
5. **Booking flow** — storefront appointment form auto-creates CRM activity
6. **Reports** — basic revenue report + CSV export

---

## VM Deploy Commands

```bash
cd /var/www/cms
git pull origin main
node scripts/migrate.js     # idempotent — safe to re-run
pm2 restart jewellery-cms
cd admin && npm run build
```

## Docker Commands

```bash
docker compose up -d
docker compose exec backend node scripts/migrate.js
docker compose logs -f backend
```

## ⚠️ Required Before Production

1. Set JWT_SECRET (min 64 random chars) in .env
2. Configure SMTP_* for emails to actually send
3. Change DB_PASS from default
4. Set NODE_ENV=production
5. Configure CLOUDINARY_* for media
