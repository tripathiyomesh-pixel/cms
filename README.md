# JewelleryCMS — Backend API

Secure, scalable, modular REST API for the Jewellery Industry CMS.  
Built with **Node.js + Express + MySQL (Sequelize) + Redis + Cloudinary**.

---

## Stack

| Layer        | Technology                        |
|-------------|-----------------------------------|
| Runtime      | Node.js 20 LTS                   |
| Framework    | Express.js                        |
| Database     | MySQL 8 + Sequelize ORM           |
| Cache        | Redis                             |
| Media        | Cloudinary                        |
| Auth         | JWT + RBAC                        |
| Validation   | express-validator                 |
| Logging      | Winston                           |
| Testing      | Jest + Supertest                  |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/tripathiyomesh-pixel/cms.git
cd cms
npm install
```

### 2. Environment

```bash
cp .env.example .env
# Edit .env with your DB, Redis, Cloudinary, JWT values
```

### 3. Create Database

```sql
CREATE DATABASE jewellery_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Migration

```bash
node src/database/migrations/001_schema.js
```

### 5. Start Server

```bash
npm run dev       # development (nodemon)
npm start         # production
```

---

## API Reference

### Auth
| Method | Endpoint              | Description          | Auth |
|--------|-----------------------|----------------------|------|
| POST   | /api/auth/register    | Register user        | —    |
| POST   | /api/auth/login       | Login                | —    |
| GET    | /api/auth/me          | Current user         | JWT  |
| POST   | /api/auth/change-password | Change password  | JWT  |

### Products
| Method | Endpoint                   | Description           | Role          |
|--------|----------------------------|-----------------------|---------------|
| GET    | /api/products              | List (paginated+filter)| All           |
| GET    | /api/products/:id          | Single product        | All           |
| POST   | /api/products              | Create product        | editor+       |
| PUT    | /api/products/:id          | Update product        | editor+       |
| DELETE | /api/products/:id          | Delete (soft)         | admin+        |
| PUT    | /api/products/:id/price    | Update pricing        | manager+      |
| PUT    | /api/products/:id/stock    | Update stock          | manager+      |
| POST   | /api/products/:id/media    | Upload media files    | editor+       |

### Collections
| Method | Endpoint                        | Description      |
|--------|---------------------------------|------------------|
| GET    | /api/collections                | All collections  |
| GET    | /api/collections/:id            | With products    |
| POST   | /api/collections                | Create           |
| PUT    | /api/collections/:id            | Update           |
| DELETE | /api/collections/:id            | Delete           |
| POST   | /api/collections/:id/banner     | Upload banner    |

### Categories
| Method | Endpoint                  | Description        |
|--------|---------------------------|--------------------|
| GET    | /api/categories/tree      | Nested tree        |
| GET    | /api/categories           | Flat list          |
| POST   | /api/categories           | Create             |
| PUT    | /api/categories/:id       | Update             |
| DELETE | /api/categories/:id       | Delete             |

### Inventory
| Method | Endpoint                       | Description          |
|--------|--------------------------------|----------------------|
| GET    | /api/inventory/low-stock       | Low stock alerts     |
| GET    | /api/inventory/:id/ledger      | Movement history     |
| PUT    | /api/inventory/bulk-update     | Bulk stock update    |

### Marketing
| Method | Endpoint                             | Description          |
|--------|--------------------------------------|----------------------|
| GET    | /api/marketing/banners               | List banners         |
| POST   | /api/marketing/banners               | Create banner        |
| PUT    | /api/marketing/banners/:id           | Update banner        |
| DELETE | /api/marketing/banners/:id           | Delete banner        |
| GET    | /api/marketing/promocodes            | List promo codes     |
| POST   | /api/marketing/promocodes            | Create promo code    |
| POST   | /api/marketing/promocodes/validate   | Validate at checkout |
| DELETE | /api/marketing/promocodes/:id        | Delete promo code    |

### Users
| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| GET    | /api/users                  | All users           |
| GET    | /api/users/:id              | Single user         |
| PUT    | /api/users/:id              | Update user         |
| PUT    | /api/users/:id/permissions  | Set permissions     |
| DELETE | /api/users/:id              | Delete user         |

---

## Roles & Permissions

| Role        | Access Level                                 |
|-------------|----------------------------------------------|
| super_admin | Full access to everything                    |
| admin       | Full access except license management        |
| manager     | Products, collections, inventory, marketing  |
| editor      | Products (no delete), media upload           |
| viewer      | Read-only access                             |

---

## Jewellery Business Logic

- **SKU Auto-generation**: `JM-{METAL}{PURITY}-{RAND}` e.g. `JM-GD18-X4K2`
- **Pricing formula**: `final_price = base_price + making_charges − discount`
  - making_charges can be fixed amount OR % of base_price
  - discount can be fixed amount OR % of subtotal
- **Purity validation**: Only `24K, 22K, 18K, 14K, 950, 925, other` accepted
- **Gemstone validation**: Each stone must have `type`, valid `clarity` (FL→I3), valid `cut`
- **Certification validation**: Only `GIA, IGI, SGL, HRD, AGS, other` accepted
- **Stock ledger**: Every stock change creates an immutable ledger entry (in/out/adjustment/return/transfer)
- **VAT**: `exempt` class skips tax; `reduced` halves the rate; `standard` applies full rate

---

## Tests

```bash
npm test              # all tests
npm run test:unit     # unit tests only (pricing logic)
```

---

## Environment Variables

See `.env.example` for the full list.  
Minimum required: `DB_*`, `JWT_SECRET`, `CLOUDINARY_*`
