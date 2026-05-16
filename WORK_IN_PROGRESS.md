# CMS Build — Work In Progress

**Last updated:** 2026-05-16
**Phase:** Phase 1 — Jewellery plugin (single-vendor)
**Last completed step:** Jewellery specs, certifications, multi-image, enquiries, appointments, locations, trust badges, WhatsApp link generator

## What was built this session

### Backend (Node.js + Express + MySQL)
- `src/database/migrations/004_jewellery_specs.js` — 10 new tables
- `src/modules/jewellery/jewellery.routes.js` — 25 API endpoints
- Registered on `/api/jewellery/*` in server.js

### New MySQL tables
| Table | Purpose |
|-------|---------|
| product_jewellery_specs | Metal, purity, weight, diamond 4Cs, gemstone |
| product_certifications | IGI/GIA/SGL certs with PDF upload |
| product_images | Multi-image gallery replacing single image_url |
| metal_rates | Live/manual gold rate cache |
| enquiries | WhatsApp + form leads per product |
| wishlists | Anonymous wishlist (localStorage-compatible) |
| trust_badges | Admin-configurable badges per store |
| content_pages | Education hub pages (buying guide, 4Cs) |
| appointments | Showroom booking system |
| store_locations | Multi-showroom with maps |

### Admin UI (React)
- `admin/src/pages/JewellerySpecsForm.jsx` — 5-tab specs editor (Metal, Certs, Images, Pricing, Details)
- `admin/src/pages/EnquiriesPage.jsx` — Enquiry CRM with status tracking + WhatsApp quick reply
- `admin/src/services/api.js` — jewelleryAPI with 20 methods added

### Key features
- Live gold rate pricing preview (weight × rate + making charges)
- One-click WhatsApp reply link from enquiry panel
- Certificate PDF upload + download
- Multi-image gallery with primary image selection
- Diamond 4Cs fields (cut, color, clarity, carat, shape)
- Ring size range configuration
- Occasion multi-select (bridal, daily, gifting, etc.)

## Blockers
- Cloudinary must be configured for image/cert uploads (.env keys needed)
- Live gold rate API integration pending (goldapi.io or metals-api.com)

## Next 3 Tasks
1. Run migration: `node src/database/migrations/004_jewellery_specs.js`
2. Wire "Jewellery Specs" button on product list → `/jewellery-specs/:id`
3. Build storefront product detail page (Next.js) with WhatsApp enquiry

## VM Commands
```bash
cd /var/www/cms
git pull origin main
node src/database/migrations/004_jewellery_specs.js
pm2 restart jewellery-cms
cd admin && npm run dev -- --host 0.0.0.0
```

## Modules Status
- [x] Auth & Users
- [x] Products CRUD
- [x] Categories + Collections
- [x] Inventory
- [x] Marketing / Banners
- [x] Plugin system
- [x] Webhook system
- [x] Menus + Themes
- [x] **Jewellery specs + certifications** ← NEW
- [x] **Multi-image gallery** ← NEW
- [x] **Enquiries CRM** ← NEW
- [x] **Appointments booking** ← NEW
- [x] **Store locations** ← NEW
- [x] **Trust badges** ← NEW
- [ ] Media library (admin UI)
- [ ] Page builder (admin UI)
- [ ] Storefront (Next.js Phase 2)
