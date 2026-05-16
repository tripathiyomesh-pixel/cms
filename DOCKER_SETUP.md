# Docker Development Setup

## Prerequisites — install these once on your PC

| Tool | Download |
|------|----------|
| Docker Desktop | https://www.docker.com/products/docker-desktop |
| Git | https://git-scm.com |
| VS Code (optional) | https://code.visualstudio.com |

---

## First time setup — 4 commands only

```bash
# 1. Clone the repo
git clone https://github.com/tripathiyomesh-pixel/cms.git
cd cms

# 2. Copy the docker env file
cp .env.docker .env

# 3. Start all containers
docker compose up -d

# 4. Run migrations (first time only)
bash docker-migrate.sh
```

That's it. Everything runs inside Docker.

---

## What starts automatically

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:4000 | Node.js + Express |
| Admin Panel | http://localhost:3000 | React + Vite |
| pgAdmin | http://localhost:5050 | Database GUI |
| PostgreSQL | localhost:5432 | Database (internal) |
| Redis | localhost:6379 | Cache (internal) |

**pgAdmin login:** admin@cms.dev / admin123
**pgAdmin DB connection:** host = postgres, user = cmsuser, pass = CmsPass@2026

---

## Daily commands

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# View live logs
docker compose logs -f backend
docker compose logs -f admin

# Restart just the backend
docker compose restart backend

# Open a shell inside backend container
docker compose exec backend sh

# Run a migration manually
docker compose exec backend node src/database/migrations/001_schema.js
```

---

## When you change code

- **Backend** — nodemon auto-restarts on save. No action needed.
- **Admin panel** — Vite hot-reloads on save. No action needed.
- **Add npm package to backend** — run:
  ```bash
  docker compose exec backend npm install package-name
  ```
- **Add npm package to admin** — run:
  ```bash
  docker compose exec admin npm install package-name
  ```

---

## Full reset (wipe database and start fresh)

```bash
bash docker-reset.sh
```

---

## Resource usage (approximate)

| Container | RAM |
|-----------|-----|
| PostgreSQL | ~80MB |
| Redis | ~10MB |
| Backend | ~120MB |
| Admin (Vite dev) | ~200MB |
| pgAdmin | ~150MB |
| **Total** | **~560MB** |

Much less than running natively on Windows/Mac.

---

## Push to production (when ready)

When going live on a real Ubuntu VPS:
```bash
# On the VPS — no Docker needed in production
git clone <repo>
cd cms
cp .env.example .env
# fill in .env
bash setup.sh
pm2 start src/server.js --name jewellery-cms
```
