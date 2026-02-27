# Hora Certa - Project Setup Guide

Complete step-by-step guide to set up the Hora Certa development environment.

## Prerequisites

Before you start, ensure you have installed:

- **Node.js** 18+ ([download](https://nodejs.org))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker & Docker Compose** ([download](https://www.docker.com/products/docker-desktop))
- **Git** ([download](https://git-scm.com))

## Setup Steps

### Step 1: Navigate to Project Directory

```bash
cd /Users/allan/work/personal/hora-certa
```

### Step 2: Install Root Dependencies

```bash
pnpm install
```

This installs dependencies for both frontend and backend using pnpm workspaces.

### Step 3: Start Local Services

Start PostgreSQL, Redis, and pgAdmin:

```bash
docker-compose up -d
```

Verify services are running:
```bash
docker-compose ps
```

You should see 3 services running:
- `hora-certa-postgres` on port 5432
- `hora-certa-redis` on port 6379
- `hora-certa-pgadmin` on port 5050

### Step 4: Configure Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit .env with your values
nano .env
```

**Essential variables** (for MVP):
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=hora_certa_dev
NODE_ENV=development
PORT=3001
JWT_SECRET=dev-secret-key-change-in-production
```

**Optional** (for Phase 2):
- Google OAuth credentials
- Apple OAuth credentials
- AbakatePay API keys
- SendGrid API key

### Step 5: Database Setup

Run backend migrations to create database tables:

```bash
pnpm --filter backend run migration:run
```

**Verify database:**
- Open pgAdmin: http://localhost:5050
- Login with `admin@example.com` / `admin`
- Add PostgreSQL server:
  - Host: `postgres`
  - Port: `5432`
  - Username: `postgres`
  - Password: `password`

### Step 6: Start Development Servers

Start both frontend and backend:

```bash
pnpm dev
```

Or start them separately:

```bash
# Terminal 1 - Frontend
pnpm dev:frontend

# Terminal 2 - Backend
pnpm dev:backend
```

### Step 7: Verify Installation

**Frontend** - Open http://localhost:5173

You should see:
- "Hora Certa" heading
- Development status message
- Feature cards (Schedule, Payments, Loyalty)

**Backend** - Visit http://localhost:3001/api

You should see:
- Swagger API documentation interface
- List of available endpoints
- Try-it-out functionality for each endpoint

**Database** - Check pgAdmin http://localhost:5050

Verify tables were created in `hora_certa_dev` database

**Health Check** - GET http://localhost:3001/health

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-02-26T20:30:00.000Z",
  "version": "0.1.0"
}
```

## Project Structure Overview

```
hora-certa/
├── frontend/                    # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── config/
│   │   └── App.tsx
│   └── package.json
│
├── backend/                     # NestJS app
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── customers/
│   │   │   ├── appointments/
│   │   │   ├── services/
│   │   │   ├── pos/
│   │   │   ├── loyalty/
│   │   │   ├── payments/
│   │   │   └── reports/
│   │   ├── database/
│   │   └── main.ts
│   └── package.json
│
├── docker-compose.yml          # Local dev services
├── docker-compose.prod.yml     # Production services
├── .env.example                # Environment template
├── PRD.md                       # Product specifications
├── README.md                    # Project overview
├── SETUP.md                     # This file
└── CONTRIBUTING.md             # Contribution guide
```

## Common Commands

### Development

```bash
# Start all services
pnpm dev

# Start only frontend
pnpm dev:frontend

# Start only backend
pnpm dev:backend

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format
```

### Database

```bash
# Run migrations
pnpm --filter backend run migration:run

# Generate new migration
pnpm --filter backend run migration:generate src/database/migrations/CreateUsers

# Revert last migration
pnpm --filter backend run migration:revert
```

### Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove all data (careful!)
docker-compose down -v
```

### Building

```bash
# Build all
pnpm build

# Build frontend only
pnpm build:frontend

# Build backend only
pnpm build:backend
```

## Troubleshooting

### Database Connection Error

**Error**: `ECONNREFUSED: Connection refused`

**Solution**:
```bash
# Check if postgres is running
docker-compose ps

# Restart postgres
docker-compose restart postgres

# Verify connection
docker-compose exec postgres psql -U postgres -c '\l'
```

### Port Already in Use

**Error**: `Port 3001 is already in use` or `Port 5173 is already in use`

**Solution**:
```bash
# Find process using port
lsof -i :3001      # Backend
lsof -i :5173      # Frontend

# Kill process (get PID from above)
kill -9 <PID>

# Or change port in .env or vite.config.ts
```

### Dependencies Installation Error

**Error**: `ERR! code ERESOLVE unable to resolve dependency tree`

**Solution**:
```bash
# Clear cache
pnpm store prune
rm -rf node_modules

# Reinstall
pnpm install
```

### Migration Errors

**Error**: `No migrations are pending`

**Solution**:
```bash
# Check migration status
docker-compose exec postgres psql -U postgres -d hora_certa_dev -c 'SELECT * FROM migrations;'

# Reset (careful!)
docker-compose down -v
docker-compose up -d
pnpm --filter backend run migration:run
```

## Getting Help

1. **Check documentation**
   - [PRD.md](./PRD.md) - Feature specifications
   - [README.md](./README.md) - Project overview
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines

2. **Check logs**
   ```bash
   # Backend logs
   docker-compose logs -f postgres

   # Frontend console
   # Open browser DevTools (F12)
   ```

3. **API Documentation**
   - Visit http://localhost:3001/api
   - Try endpoints directly

4. **Database**
   - pgAdmin: http://localhost:5050

## Next Steps

Once setup is complete:

1. **Read PRD.md** - Understand feature requirements
2. **Review architecture** - Check database schema and tech stack
3. **Start with Task #1** - Set up project structure (done!)
4. **Move to Task #2** - Create database migrations
5. **Then Task #3** - Implement authentication

## Notes

- **Frontend runs on**: http://localhost:5173
- **Backend API runs on**: http://localhost:3001
- **API Docs**: http://localhost:3001/api
- **pgAdmin**: http://localhost:5050
- **Database**: hora_certa_dev on localhost:5432

## Tips for Development

- Keep terminal windows open to see logs
- Use Swagger UI to test API endpoints
- Use pgAdmin to inspect database
- Browser DevTools for frontend debugging
- Use `pnpm run format` before committing code

---

**Setup complete!** You're ready to start developing Hora Certa. 🚀
