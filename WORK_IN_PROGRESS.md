# VANTIX CMS — Work In Progress

**Last updated:** 2026-06-03
**Phase:** Bug Fix Session → Phase 1 Core CMS Completion
**Stack:** Node.js + Express + PostgreSQL 16 + Redis · Admin: React/Vite · Storefront: Next.js

---

## ✅ Bug Fixes Applied (2026-06-03)

All bugs identified in the Analysis Report have been resolved.

### Critical Fixes

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `src/config/db.pool.js` | No env var fallbacks — crashed if `.env` missing | Added safe fallbacks matching `database.js` |
| 2 | `src/modules/auth/auth.routes.js` | Hardcoded `JWT_SECRET` fallback was different string to `auth.guard.js` — tokens could silently fail verification | Single resolved constant; warns loudly if unset |
| 3 | `src/common/guards/auth.guard.js` | Used raw `process.env.JWT_SECRET` (no fallback) — split-brain with auth.routes.js | Now imports same constant from auth.routes.js |
| 4 | `src/modules/auth/auth.routes.js` | Missing `POST /api/auth/reset-password` endpoint — forgot-password stored tokens with no way to consume them | Full endpoint added: validates token, checks expiry, updates password, deletes token (one-time use) |
| 5 | `src/modules/auth/auth.routes.js` | Missing `POST /api/auth/refresh-token` — no way to renew tokens without re-login | Added endpoint using existing `authenticate` guard |
| 6 | `src/modules/auth/auth.routes.js` | `register()` accepted any `role` value — could create `super_admin` via public API | Now restricts to `['editor', 'viewer']` |
| 7 | `src/modules/customer_portal/customer_portal.routes.js` | Hardcoded different JWT secret string — customer tokens could not be verified consistently | Now imports shared constant |
| 8 | `src/modules/pages/pages.routes.js` | `id` column was `SERIAL` (integer) — inconsistent with every other table (UUID) | Migrated to `UUID DEFAULT gen_random_uuid()` |
| 9 | `src/modules/pages/pages.routes.js` | No `PATCH /publish` endpoint — builder had no way to change page status without resaving full HTML | Added `PATCH /:slug/publish` |
| 10 | `src/modules/pages/pages.routes.js` | DELETE had no role guard — any editor could delete pages | Added `authorize(['admin', 'super_admin'])` |
| 11 | `scripts/migrate.js` | `password_resets` table only created in migration 020 — skipping it caused crashes | Now guaranteed right after `users` table |

### Code Quality Fixes

| File | Change |
|------|--------|
| `src/common/slug.util.js` | **NEW** — centralised `makeSlug()` + `makeUniqueSlug()`. Eliminates duplication across products, categories, collections, menus. |
| `.env.example` | Comprehensive documentation, security warnings, all vars listed |

---

## 📦 Module Status

| Module | Backend | Admin UI | Storefront | Notes |
|--------|---------|----------|------------|-------|
| Auth & Users | ✅ Complete | ✅ | — | reset-password now works |
| Products CRUD | ✅ | ✅ | ✅ | |
| Jewellery Specs | ✅ | ✅ | — | 5-tab form |
| Diamonds | ✅ | ✅ | ✅ | |
| Gemstones | ✅ | ✅ | — | |
| Pearls | ✅ | ✅ | — | |
| Mountings | ✅ | ✅ | — | |
| Categories | ✅ | ✅ | ✅ | |
| Collections | ✅ | ✅ | ✅ | |
| Inventory | ✅ | ✅ | — | |
| Marketing/Banners | ✅ | ✅ | ✅ | |
| Enquiries CRM | ✅ | ✅ | — | WhatsApp link |
| Appointments | ✅ | ✅ | ✅ | Cartier-style modal |
| Store Locations | ✅ | ✅ | ✅ | |
| Trust Badges | ✅ | ✅ | ✅ | |
| Orders | ✅ | ✅ | — | |
| Customers | ✅ | ✅ | — | |
| Custom Orders | ✅ | ✅ | — | |
| Blog | ✅ | ✅ | — | |
| Page Builder | ✅ | ✅ | ✅ | GrapesJS, UUID fix applied |
| Media Library | ✅ | ✅ | — | Cloudinary |
| Menus | ✅ | ✅ | ✅ | |
| Themes | ✅ | ✅ | ✅ | |
| Settings | ✅ | ✅ | — | |
| Feature Flags | ✅ | ✅ | — | |
| Gold Rates | ✅ | ✅ | ✅ | |
| RapNet | ✅ | ✅ | — | live proxy only |
| ERP Integration | ✅ | ✅ | — | |
| Exhibitions | ✅ | ✅ | ✅ | |
| Import Engine | ✅ | ✅ | — | |
| Audit Log | ✅ | ✅ | — | |
| Workforce | ✅ | ✅ | — | |
| Payments | ✅ | ✅ | — | |
| Notifications | ✅ | — | — | schema only |
| Plugins | ✅ | ✅ | — | |
| Webhooks | ✅ | ✅ | — | |
| Certificate Verify | ✅ | — | ✅ | |

---

## 🔜 Phase 1 — Core CMS Completion (Next Session)

### Priority Tasks

1. **SEO Module — missing endpoints**
   - `GET /api/seo/audit/:slug` — page-level SEO score
   - `POST /api/seo/redirect` — redirect manager (301/302)
   - Auto-generate `robots.txt` from settings
   - Sitemap already exists — add to migration guarantee

2. **Media Library Admin UI**
   - Grid/list view with search + filter by type
   - Folder management
   - Bulk delete
   - Copy URL button

3. **Blog Module Storefront**
   - Blog listing page with category filter
   - Blog detail page
   - Related posts widget

4. **Email Service (SMTP)**
   - Wire nodemailer to `forgot-password` flow (token is stored, email not sent yet)
   - Template: password-reset.html
   - Template: welcome.html

5. **Admin: Publish / Status Controls**
   - Wire the new `PATCH /:slug/publish` endpoint in `PageBuilderPage.jsx`
   - Add status badge to pages list

---

## 🔜 Phase 2 — E-Commerce & CRM (After Phase 1)

- Storefront: Product detail page with full jewellery specs
- Storefront: Cart → Checkout → Order confirmation
- CRM: Lead pipeline (Kanban board)
- CRM: Activity timeline per customer
- Customer portal: Order history + tracking
- Payment gateway: Stripe or Telr (UAE)

---

## VM Commands

```bash
cd /var/www/cms
git pull origin main
node scripts/migrate.js         # safe to re-run — all idempotent
pm2 restart jewellery-cms
cd admin && npm run build
```

## Docker Commands

```bash
docker compose up -d
docker compose exec backend node scripts/migrate.js
docker compose logs -f backend
```

---

## ⚠️ Required Before Production

1. Set a real `JWT_SECRET` in `.env` (minimum 64 random chars)
2. Configure `SMTP_*` vars for password reset emails to actually send
3. Change `DB_PASS` from default `CmsPass@2026`
4. Set `NODE_ENV=production`
5. Configure `CLOUDINARY_*` for media uploads
