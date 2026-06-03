# VANTIX CMS — Work In Progress

**Last updated:** 2026-06-03 (Session 3)
**Phase:** Phase 4 — Automation, Reports, Media Library
**Repo:** https://github.com/tripathiyomesh-pixel/cms.git

---

## ✅ Completed — This Session (Phase 4)

### CRM Automation (zero-friction lead capture)

**appointments.routes.js — full rewrite:**
- Bug fix: `notifyAdmins()` was called inside GET / (fires on every admin list load). Now only fires inside POST / on actual new booking.
- New appointment → `syncToCrm()` called automatically:
  - Finds or creates a `leads` record (by phone number)
  - If lead exists at 'new' stage, advances to 'contacted'
  - Finds or creates a `customers` record
  - Logs to `customer_activities` timeline
- Appointment confirmed → logs another CRM timeline event + sends confirmation email
- `syncToCrm()` exported for reuse

**jewellery.routes.js — enquiries POST:**
- Product enquiry submitted → `syncToCrm()` fires automatically
- Creates/updates lead, creates customer, logs activity to timeline
- Source = 'whatsapp' or 'website' based on channel
- Interest populated from product_name + enquiry_type

Net result: every enquiry and appointment now automatically appears in the CRM
without any admin intervention.

### Reports Module

**Backend: `src/modules/reports/reports.routes.js`** (new)
Registered at `/api/reports/*`

| Endpoint | Description | CSV |
|----------|-------------|-----|
| GET /api/reports/revenue | Monthly revenue breakdown, KPIs | ✅ |
| GET /api/reports/enquiries | Daily enquiry volume, funnel stats, top products | ✅ |
| GET /api/reports/appointments | Daily appt volume, by-purpose breakdown | ✅ |
| GET /api/reports/crm | Pipeline stages, by-source, recent wins | ✅ |
| GET /api/reports/customers | Monthly growth, top customers by activity | ✅ |

All endpoints: `?format=csv` returns downloadable CSV, `?days=N` for window filter.

**Admin UI: `ReportsPage.jsx`** — 5-tab reports dashboard
- Revenue: KPI row (total revenue, orders, avg order, VAT), monthly bar chart, full monthly table
- Enquiries: KPI row, top enquired products bar chart, daily table
- Appointments: KPI row, by-purpose breakdown bars
- CRM Pipeline: stage breakdown with value, by-source grid, recent wins list
- Customers: monthly growth chart, top customers table
- Export CSV button on every tab (downloads via direct URL)
- Year selector for revenue, day-range selector (30/60/90/180/365) for others
- Added to sidebar under System section

---

## ✅ Previously Completed

### Bug Fix Session
11 critical bugs — see git log `2f701b9`.

### Phase 1 — Core CMS
Email service, SEO + redirect manager, Pages admin, PageBuilder publish fix.

### Phase 2 — CRM
Full CRM routes (timeline, notes, leads), Kanban board, Customer detail page,
order/appointment confirmation emails.

### Phase 3 — Storefront
Customer orders page (/account/orders), Dashboard CRM pipeline widget.

---

## 📦 Module Status

| Module | Backend | Admin UI | Storefront |
|--------|---------|----------|------------|
| **Reports** | ✅ | ✅ | — |
| **CRM Automation** | ✅ | — | — |
| Auth & Users | ✅ | ✅ | ✅ |
| Products | ✅ | ✅ | ✅ |
| CRM & Leads | ✅ | ✅ | — |
| Customer Timeline | ✅ | ✅ | — |
| Orders | ✅ | ✅ | ✅ |
| Blog | ✅ | ✅ | ✅ |
| Pages | ✅ | ✅ | ✅ |
| SEO & Redirects | ✅ | ✅ | — |
| Email Service | ✅ | — | — |
| Media Library | ✅ | ✅ | — |
| All other modules | ✅ | ✅ | partial |

---

## 🔜 Next Session Priority

1. **Media Library** — bulk delete, folder management, drag-drop upload zone improvements
2. **Slug utility rollout** — replace inline slugify in products/categories/blog with shared `slug.util.js`
3. **Webhook delivery** — ensure enquiry + appointment webhooks fire for ERP integrations
4. **Settings page** — wire SMTP settings editor (so admins can update without SSH/env)
5. **Search** — wire OpenSearch/PostgreSQL FTS for global admin search

---

## VM Deploy

```bash
cd /var/www/cms && git pull origin main
node scripts/migrate.js
pm2 restart jewellery-cms
cd admin && npm run build
```

## ⚠️ Required Before Production
1. JWT_SECRET (64+ random chars)
2. SMTP_* for email sending
3. DB_PASS changed from default
4. NODE_ENV=production
5. CLOUDINARY_* for media
