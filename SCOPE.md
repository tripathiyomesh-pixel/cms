# Jewellery Commerce Operating System (JCOS)
## Senior Developer Technical Brief — May 2026

---

## 1. What This Is

A production-grade **Jewellery Commerce Operating System** for GCC and Indian luxury jewellery businesses.

**Not:** generic ecommerce, WordPress clone, marketplace, basic CMS.

**Is:** Luxury CMS + Website Builder + Jewellery PIM + Boutique CRM + Workforce Platform + Inventory System + ERP Integration.

**Positioning:** "Shopify + Builder.io + Jewellery ERP + CRM for GCC Jewellery Businesses"

**Business model:** Single tenant per jewellery business. Each installation = one jewellery company. Boutique-first, enquiry-first, WhatsApp-first.

---

## 2. Current Tech Stack

```
Admin panel:    React 18 + Vite + Tailwind CSS (JavaScript)
Storefront:     Next.js 14 + React + Tailwind CSS (JavaScript)
API:            Node.js 20 + Express + PostgreSQL 16 + Sequelize ORM
Cache:          Redis
Media:          Cloudinary
Infrastructure: Docker + Nginx
Deployment:     Ubuntu VPS / PM2
Repository:     github.com/tripathiyomesh-pixel/cms (private)
```

**Target architecture (not yet implemented):**
```
/apps
   /admin        React + Vite
   /storefront   Next.js
   /api          Node.js Express
   /worker       Background jobs

/packages
   /ui           Shared component library
   /builder      Page builder engine
   /auth         Auth + permissions
   /database     Shared DB utilities
   /permissions  RBAC + ABAC engine
   /theme-engine Design token system
   /jewellery-engine Jewellery business logic
   /shared       Utilities
   /types        TypeScript types
   /config       Shared config
```

---

## 3. Six Engine Architecture (Target)

### Engine 1 — Core CMS
Pages, menus, themes, media, SEO, settings, localization, domains, analytics, audit logs, webhooks, plugins, feature flags. Must remain industry-independent.

### Engine 2 — Jewellery Commerce
Jewellery products, diamonds, gemstones, pearls, mountings, collections, certifications, pricing engine, gold rates, making charges, inventory, suppliers, ERP sync, custom orders, appointments, WhatsApp CRM, exhibitions, bespoke services.

### Engine 3 — Website Builder
JSON page builder, section renderer, component registry, theme engine, responsive controls, reusable sections, design tokens, live preview, storefront rendering.

### Engine 4 — Workforce & Access Management *(mostly missing)*
Staff accounts, branch assignment, department assignment, reporting hierarchy, permission engine, policy engine, session management, device tracking, activity logs.

### Engine 5 — Customer Experience *(mostly missing)*
Customer accounts, wishlist, appointment history, order history, certificate verification, loyalty (future), bridal consultation, private collection previews.

### Engine 6 — Partner & API *(partially done)*
ERP integrations, supplier access, API keys, webhook management, partner portals, developer access.

---

## 4. What Is Built (Current State)

### Backend API — Node.js + Express + PostgreSQL

**Completed modules (35 total):**
```
auth              JWT + bcryptjs, login/logout/refresh/reset
users             CRUD + basic RBAC (5 roles)
products          Jewellery with full specs
diamonds          4C + GIA/IGI/HRD certification + lab-grown flag
gemstones         Type, color, cut, carat, origin, treatment
pearls            Type, size, luster, nacre, shape
mountings         Metal, style, compatibility
categories        Hierarchical, slug routing
collections       Named collections (Aurora, Frost, Vivid, etc)
certifications    Certificate management
inventory         Ledger, stock tracking, import jobs
appointments      Slot management, booking
enquiries         WhatsApp CRM, lead capture
custom_orders     Bespoke request flow
customers         CRM, import, history
exhibitions       Events, registrations, VIP, countdown
blog              Posts, categories, SEO fields
orders            Order management + ERP sync
payments          6 gateways (Tap, Geidea, Tabby, Tamara, Razorpay, Stripe)
erp_integration   Vantix ERP webhook + scheduled sync
rapnet            Live diamond inventory (API only, no local storage per ToS)
marketing         Banners, promo codes
menus             Header, footer, mega menu
themes            DB-backed theme system
settings          JSONB key-value store
media             Cloudinary integration
notifications     Event-driven notification foundation
audit             Activity logging
plugins           Extensible plugin system
webhooks          Outbound webhook management
suppliers         Supplier management
import_engine     Bulk product import
content           Page content storage
storefront        Public-facing API endpoints
dashboard         Stats, charts, activity feed
```

**Database: 15 migrations, PostgreSQL 16, JSONB, UUID PKs**

Key tables:
```
users, products, diamonds, gemstones, pearls, mountings
categories, collections, media, certifications
appointments, enquiries, custom_orders, customers
exhibitions, exhibition_registrations
blog_posts, menus, settings, themes, plugins
orders, payment_gateways, audit_logs
inventory_ledger, suppliers, import_jobs
erp_sync_logs, webhooks, feature_flags, page_sections
```

### Admin Panel — React + Vite

**46 pages built:**
- Dashboard (stats, charts, activity)
- Products / Jewellery specs form
- Diamonds / Gemstones / Pearls / Mountings
- Categories / Collections / Media
- Inventory / Bulk import / Suppliers
- Orders / Enquiries / Appointments / Custom orders
- Customers / Exhibitions / Blog / Marketing
- Payments / ERP integration / RapNet settings
- Theme editor (10 themes, colors, fonts, buttons)
- Home builder (section toggle/reorder/edit)
- Menu builder (nav type + tree editor)
- Page builder (JSON-based, 21 section types)
- Frontend settings (preloader, cookie, popup, maintenance, analytics)
- Users / Settings / Audit log
- Feature flags / Plugins / Dev status

### Storefront — Next.js 14

**25 pages built:**
```
/                     Homepage — JSON sections OR static fallback
/jewellery            Listing — sort, filter by category/collection
/jewellery/[slug]     Product detail — Cartier-style, Request Price → WhatsApp
/lab-grown            Separate landing page (NEVER mixed with natural)
/diamonds             Listing + RapNet
/diamonds/[id]        Detail
/gemstones            Listing + detail
/pearls               Listing + detail
/mountings            Listing + detail
/exhibitions          Event list + countdown
/exhibitions/[slug]   Event detail + registration
/blog                 Posts grid
/blog/[slug]          Full post
/about                Dynamic via page builder
/boutiques            Store finder
/appointment          Booking form
/custom               Bespoke request
/search               Full text search
/wishlist             Saved items
/verify               Certificate lookup
/ring-builder         (stub)
```

### Website Builder — Current State

**Architecture (correct per spec):**
```
Admin saves JSON array
→ PostgreSQL JSONB
→ GET /api/settings/page/:page
→ Storefront fetches
→ SectionFromJSON dispatcher
→ Component Registry (SectionRenderer.js)
→ Pre-built React components
→ Next.js renders
```

**21 section types:**
```
Hero (5 variants):   fullscreen, slider, split, video, minimal
Products:            grid 2/3/4 col, carousel
Categories:          circles, cards
Content:             brand_story, about_heritage, testimonials (carousel/grid),
                     why_choose, learning_center
Banners:             editorial_full_width, collection_banners_2col, promo_strip
Engagement:          newsletter, whatsapp_cta
Trust:               cert_logos
Layout:              spacer, divider
```

**Navigation — Mega menu (Palmiero-style):**
- Hover item → full-width panel
- Left: Type + Collections columns
- Right: preview image updates live on each link hover
- Mobile: slide-in drawer
- 4 nav styles: Mega, Standard, Centered logo, Minimal

**10 pre-built themes:**
Cartier Noir, Graff Gold, Blue Nile, Mejuri Rose, Tejori Cream, Dubai Gold Souk, Diamond Navy, Platinum Slate, Tiffany Blue, Midnight Emerald

**Design system:**
- Fonts: Cormorant Garamond (headings) + Inter (body)
- Colors: --tejori-gold #b8860b, --tejori-cream #fdf8f3
- CSS variables injected at runtime (no rebuild needed on theme change)
- RTL-ready CSS (not implemented yet)

---

## 5. Critical Gaps vs Updated Scope

### Gap 1 — Workforce Architecture *(HIGH PRIORITY)*

**Current:** Simple `users` table with `role` column (5 roles). Basic RBAC with `if(role === 'admin')` checks.

**Required:** Full workforce management system.

Missing:
```
branches table          (Dubai, Abu Dhabi, etc)
departments table       (Sales, Inventory, Marketing, etc)
staff_profiles table    (linked to users, with branch + department)
reporting hierarchy     (manager_id)
permission_policies     (ABAC rules)
device_sessions         (per-device login tracking)
```

Missing flows:
```
Admin → Create Staff → Assign Branch → Assign Department
     → Assign Policies → Send Activation Link
```

Missing permission engine:
```
Current:  if(role === 'admin') { ... }
Required: if(can('products.edit') && isInBranch('dubai')) { ... }
```

Identity architecture needs separation:
```
Current: one users table for everything
Required:
  workforce_accounts   (internal staff)
  customer_accounts    (buyers)
  partner_accounts     (suppliers, agencies)
  api_accounts         (developer keys)
```

### Gap 2 — Customer Experience Engine *(MEDIUM PRIORITY)*

Missing entirely:
- Customer login portal
- Order history
- Appointment history
- Wishlist sync across devices
- Certificate verification linked to customer account
- Bridal consultation flow
- Private collection previews

### Gap 3 — Gold Rate + Pricing Engine *(HIGH PRIORITY for GCC)*

Missing:
- Gold rate per gram (live or manual entry)
- Making charge % per product/category
- Stone value entry
- Auto price calculation: `(gold_weight × gold_rate) + (making_charge%) + stone_value`
- Bulk price update when gold rate changes
- Price history log

### Gap 4 — Monorepo + TypeScript *(ARCHITECTURE)*

Current: flat repo structure, JavaScript only.
Required: monorepo with `/apps` + `/packages`, TypeScript everywhere.

This is the biggest refactor required.

### Gap 5 — State Management *(ADMIN FRONTEND)*

Current: local React state per page, no global state.
Required: Zustand for auth, permissions, builder, themes, products.

### Gap 6 — Dynamic Form Engine *(MEDIUM)*

Current: each form is hand-coded per page.
Required: schema-driven form engine with conditional fields, validation, dependencies.

### Gap 7 — Arabic RTL *(GCC MARKET)*

Current: LTR only.
Required: `dir="rtl"` toggle, Arabic fonts (Noto Naskh Arabic), flex direction flip.

### Gap 8 — Workspaces *(ADMIN UX)*

Current: flat sidebar with all items.
Required: role-based dynamic workspaces.

```
Sales Workspace:     leads, enquiries, appointments, follow-ups
Inventory Workspace: stock, SKUs, imports, certifications
Marketing Workspace: banners, blog, newsletters, SEO
Builder Workspace:   page builder, themes, menus, preview
```

### Gap 9 — Advanced Search *(MEDIUM)*

Current: PostgreSQL LIKE queries.
Required: Meilisearch for faceted jewellery search (filter by carat, metal, price, certification simultaneously).

### Gap 10 — Media Pipeline *(MEDIUM)*

Current: single image upload to Cloudinary.
Required: original + thumbnail + WebP + zoom + 360 frames + video + certificate PDF pipeline.

---

## 6. Important Business Rules (Non-Negotiable)

```
1. Natural and lab-grown diamonds NEVER appear together
   - separate pages, separate filters, separate suggestions
   - separate mega menu section
   - product page suggestions filter by inventory_type

2. No buy/cart button anywhere
   - all CTAs → Request Price → WhatsApp
   - message pre-fills with product name + SKU + page URL

3. WhatsApp is primary conversion channel
   - every product page, enquiry form, appointment → WhatsApp

4. Single vendor per installation
   - not marketplace architecture
   - each jeweller gets isolated environment

5. Workforce staff ≠ customer accounts
   - completely separate identity systems
   - staff never use invite-based onboarding
```

---

## 7. Key Technical Decisions That Need Senior Review

| Decision | Current | Concern |
|---|---|---|
| Page builder | JSON array → React components | Is section registry pattern scalable to 50+ section types? |
| Permission system | Role string check | ABAC needed — how to implement without over-engineering? |
| Monorepo migration | Flat repo | When to migrate — now or post-launch? Impact on Docker setup? |
| TypeScript | JavaScript only | Full migration or gradual per module? |
| Gold rate engine | Missing | Best pattern — polling vs webhook vs manual admin entry? |
| RTL support | Missing | Next.js i18n routing vs manual dir toggle? |
| Search | PostgreSQL LIKE | When to introduce Meilisearch — after launch or now? |
| State management | Local React state | Zustand vs React Query vs Context — what fits this scope? |
| Caching | Redis key-value | ISR for storefront? Edge caching strategy? |
| Media | Single Cloudinary | 360° viewer — which library? How to structure frames? |
| Customer portal | Missing | Separate Next.js app or routes within storefront? |
| Workforce | Basic RBAC | Full ABAC implementation complexity vs time to market? |

---

## 8. Immediate Priorities (Next Sprint)

Based on updated scope — in order:

```
1. Gold rate + pricing engine     (GCC clients need this day 1)
2. Arabic RTL toggle              (GCC market requirement)
3. Customer account portal        (wishlist, appointments, history)
4. Workforce branch/dept tables   (foundation for ABAC)
5. Permission engine (ABAC)       (capability-driven frontend)
6. TypeScript migration plan      (architecture discipline)
7. Monorepo structure decision    (before it gets harder)
8. Zustand state management       (admin frontend stability)
```

---

## 9. Setup Instructions

```bash
# Fresh install
git clone https://github.com/tripathiyomesh-pixel/cms.git
cd cms
cp .env.docker .env
docker compose up -d
./setup.bat   # Windows: runs all 15 migrations + seeds admin

# Login
URL:      http://localhost:3010
Email:    admin@vantix.io
Password: Admin@2026

# Ports
Admin:      :3010
Storefront: :3011
API:        :4000
pgAdmin:    :5050
```

---

## 10. What We Need from Senior Developer

1. **Architecture review** — is the 6-engine separation correct for this scale?
2. **Monorepo plan** — timeline and approach for `/apps /packages` migration
3. **TypeScript migration** — strategy: all at once vs module by module
4. **ABAC permission engine** — recommended library or custom implementation?
5. **Gold rate engine design** — data model + update propagation pattern
6. **Workforce architecture** — review branch/department/policy DB schema before building
7. **Storefront rendering** — ISR vs SSR vs CSR for jewellery product pages
8. **Search strategy** — Meilisearch integration timing and index design
9. **Customer portal** — separate app vs sub-routes
10. **Code quality review** — what needs refactoring before scaling

---

*JCOS v0.9 — Development Build*
*KenTech Global — May 2026*
*Repository: github.com/tripathiyomesh-pixel/cms (private)*
