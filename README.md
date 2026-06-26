# JCOS — Jewellery Commerce Operating System
### By KenTech Global

> The complete platform for luxury jewellery businesses.  
> WhatsApp-first. GCC-built. Production-ready.

---

## Live Demo
| Surface | URL |
|---------|-----|
| Storefront | [Tejori Gems Demo](https://tejori.vantix.io) |
| Admin | [admin.vantix.io](https://admin.vantix.io) · `admin@vantix.io` / `Admin@2026` |

---

## Quick Start (5 minutes)

```bash
git clone https://github.com/tripathiyomesh-pixel/cms.git
cd cms
cp .env.production.example .env
# Edit .env with your values
docker compose up -d
node src/database/migrate.js
node tejori_v2.js
```

| Service | URL |
|---------|-----|
| Admin Dashboard | http://localhost:3010 |
| Storefront | http://localhost:3011 |
| API | http://localhost:4000/api |

---

## Production Deploy

```bash
./scripts/deploy.sh
```

Pulls latest code, rebuilds Docker images, runs migrations, reports live URLs.

---

## Architecture

```
Browser
  └── Nginx (80 / 443)
        ├── /admin  → Admin:3010   (React 18 + Vite)
        ├── /api    → Backend:4000 (Node.js + Express)
        └── /       → Storefront:3011 (Next.js 14)
                         └── PostgreSQL:5432
                         └── Redis:6379
```

---

## What's Built

| Layer | Count | Notes |
|-------|-------|-------|
| Admin pages | 33 | Fully audited and fixed |
| Storefront pages | 19 | Complete storefront |
| API endpoints | 60+ | RESTful, JWT-guarded |
| Luxury themes | 10 | CSS variable system |
| Seeded data | Full | Products, diamonds, settings |

### Features
- **WhatsApp Commerce** — no cart, no checkout, all CTAs → WhatsApp
- **Gold Rate Engine** — Dubai 18K/22K/24K, updated 3× daily
- **CRM + Appointments** — full sales pipeline, private viewings
- **Certificate Verification** — GIA, IGI, HRD, GRS lookup
- **Import Engine** — Excel/CSV with image import
- **Diamond Separation** — natural and lab-grown strictly isolated
- **Multi-Collection Management** — collections, campaigns, exhibitions
- **Customer Portal** — login, wishlist, appointments, enquiries
- **Exhibition Management** — countdown, registration, venue details
- **Theme Editor** — live colour change, no rebuild needed

---

## Business Rules (Never Violate)

1. **No cart, no checkout** — all CTAs go to WhatsApp only
2. **Natural + lab-grown diamonds NEVER on the same page**
3. **WhatsApp number from DB settings** — never hardcoded
4. **Price 0 or null → "Price on Request"** — never show `AED 0`
5. **Single vendor per installation** — one store, one brand

---

## New Client Setup

```bash
# 1. Clone to fresh VPS
git clone https://github.com/tripathiyomesh-pixel/cms.git /var/www/jcos-CLIENT_NAME
cd /var/www/jcos-CLIENT_NAME

# 2. Update env
cp .env.production.example .env
nano .env  # Set DB_NAME, FRONTEND_URL, WHATSAPP_NUMBER, etc.

# 3. Deploy
./scripts/deploy.sh

# 4. Import catalogue
# Admin → Inventory → Bulk Import → Upload CSV/Excel

# 5. Set theme
# Admin → Settings → Theme Editor → Choose theme + colours

# 6. Go live
# Update DNS → wait for propagation → done
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js 20 + Express 4 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Admin | React 18 + Vite + Tailwind CSS |
| Storefront | Next.js 14 (App Router) + Tailwind CSS |
| Media | Cloudinary |
| Infrastructure | Docker + Nginx + Let's Encrypt |

---

## Environment Variables

Copy `.env.production.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `DB_PASS` | Strong PostgreSQL password |
| `JWT_SECRET` | 64-char random string |
| `FRONTEND_URL` | Your storefront domain |
| `CLOUDINARY_*` | Image upload credentials |
| `WHATSAPP_NUMBER` | Store WhatsApp (digits only) |
| `SMTP_*` | Email delivery settings |

---

## JCOS Landing Page

Open `landing/index.html` in any browser for the product marketing page.  
No build step required — single self-contained HTML file.

---

## Support

| Channel | Contact |
|---------|---------|
| WhatsApp | [+971 50 850 9747](https://wa.me/971508509747) |
| Email | contact@kentech.ae |
| Website | [kentech.ae](https://kentech.ae) |

---

*JCOS is proprietary software by KenTech Global. Licenced per installation.*