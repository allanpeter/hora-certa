# 🚀 Quick Start - 5 Minutes

Get Hora Certa running in 5 minutes.

## Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose

## Quick Setup

### 1. Install Dependencies (2 min)
```bash
cd /Users/allan/work/personal/hora-certa
pnpm install
```

### 2. Start Services (1 min)
```bash
docker-compose up -d
```

### 3. Setup Environment
```bash
cp .env.example .env
```

### 4. Run Migrations (1 min)
```bash
pnpm --filter backend run migration:run
```

### 5. Start Development (1 min)
```bash
pnpm dev
```

## Access URLs

| Service | URL | Username | Password |
|---------|-----|----------|----------|
| **Frontend** | http://localhost:5173 | - | - |
| **Backend API** | http://localhost:3001 | - | - |
| **API Docs** | http://localhost:3001/api | - | - |
| **pgAdmin** | http://localhost:5050 | admin@example.com | admin |
| **Database** | localhost:5432 | postgres | password |

## Next Steps

1. **Read PRD**: [PRD.md](./PRD.md)
2. **Follow Setup**: [SETUP.md](./SETUP.md)
3. **Contribute**: [CONTRIBUTING.md](./CONTRIBUTING.md)

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# View API documentation
# Open http://localhost:3001/api in browser

# Format code
pnpm format

# Lint code
pnpm lint

# Run tests
pnpm test
```

## Common Issues

**Port in use?**
```bash
lsof -i :3001
kill -9 <PID>
```

**Database error?**
```bash
docker-compose restart postgres
```

**Dependencies error?**
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

---

For detailed setup: see [SETUP.md](./SETUP.md)

**Happy coding!** 🎉
