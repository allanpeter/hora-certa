# ⚡ Quick Reference Card

## 🚀 Start Development (1 minute)

```bash
cd /Users/allan/work/personal/hora-certa
pnpm dev
```

**Services will start at**:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api
- Database: http://localhost:5050 (pgAdmin)

---

## 📍 Current Status

- **Overall Progress**: 7% (1/15 tasks)
- **Phase**: MVP (6 weeks)
- **Current Task**: Task #2 - Database Schema (next)
- **Last Completed**: Task #1 - Project Structure ✅

---

## 📚 Key Files to Know

| File | Purpose | When to Use |
|------|---------|-----------|
| [PRD.md](./PRD.md) | Feature specifications | Understanding requirements |
| [TASK_PROGRESS.md](./TASK_PROGRESS.md) | Progress tracking | Resuming work / context |
| [SETUP.md](./SETUP.md) | Installation guide | First-time setup |
| [README.md](./README.md) | Project overview | Learning tech stack |
| [QUICK_START.md](./QUICK_START.md) | 5-min quickstart | Fast setup |

---

## 🛠️ Essential Commands

```bash
# Development
pnpm dev                                # Start all services
pnpm dev:frontend                       # Frontend only
pnpm dev:backend                        # Backend only

# Database
pnpm --filter backend run migration:run # Run migrations
docker-compose down -v                  # Reset everything

# Code Quality
pnpm format                             # Auto-format all code
pnpm lint                               # Check for errors

# Docker
docker-compose up -d                    # Start services
docker-compose down                     # Stop services
docker-compose logs -f                  # View logs
```

---

## 🎯 Next 3 Tasks

### #2: Database Schema (START HERE)
- **Duration**: 3-4 hours
- **Dependencies**: Task #1 ✅
- **Blocks**: Most other tasks
- **What**: Create all database entities and migrations
- **Key Files**: `backend/src/database/entities/*.ts`

### #3: OAuth Authentication
- **Duration**: 2-3 hours
- **Dependencies**: Task #2
- **What**: Google & Apple login
- **Key Files**: `backend/src/modules/auth/*`

### #4: User Profiles
- **Duration**: 2 hours
- **Dependencies**: Task #3
- **What**: Profile management endpoints
- **Key Files**: `backend/src/modules/users/*`

---

## 🔗 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | - |
| Backend | http://localhost:3001 | - |
| API Docs | http://localhost:3001/api | - |
| pgAdmin | http://localhost:5050 | admin@example.com / admin |
| Database | localhost:5432 | postgres / password |

---

## 💾 Environment

### Required for MVP
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=hora_certa_dev
JWT_SECRET=dev-secret-key
```

### Optional (Phase 2)
```
GOOGLE_CLIENT_ID=...
APPLE_CLIENT_ID=...
ABAKATE_PAY_API_KEY=...
SENDGRID_API_KEY=...
```

---

## 📊 Task Overview

```
✅ #1  Set up project structure
⏳ #2  Database schema (NEXT)
⏳ #3  OAuth authentication
⏳ #4  User profiles
⏳ #5  Barber services
⏳ #6  Calendar availability
⏳ #7  Appointment booking
⏳ #8  Payment integration
⏳ #9  Appointment reminders
⏳ #10 Auto-rescheduling
⏳ #11 Client dashboard
⏳ #12 Barber dashboard
⏳ #13 Responsive UI
⏳ #14 Testing infrastructure
⏳ #15 Deploy & launch
```

---

## 🎓 Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite + Tailwind CSS
- React Query + Zustand
- Axios API client

**Backend**
- NestJS + TypeScript
- PostgreSQL + TypeORM
- JWT + Passport.js
- Swagger API docs

**Infrastructure**
- Docker Compose (local)
- PostgreSQL + Redis
- Coolify (deployment)

---

## 🆘 Common Issues

### "Port already in use"
```bash
lsof -i :3001        # Find process
kill -9 <PID>        # Kill it
```

### "Database connection error"
```bash
docker-compose restart postgres
docker-compose logs -f postgres
```

### "Dependencies not installing"
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

### "TypeScript errors in editor"
- Press `Cmd+Shift+P` → "TypeScript: Restart TS Server"
- Or reload VS Code window

---

## 📌 Remember

1. **Always start services first**
   ```bash
   docker-compose up -d
   pnpm dev
   ```

2. **Check TASK_PROGRESS.md** when resuming work
   - Understand current task
   - Check dependencies
   - Review what needs doing

3. **Reference PRD.md** for requirements
   - Feature specs
   - User flows
   - Database schema

4. **Format code before committing**
   ```bash
   pnpm format
   ```

5. **Run tests**
   ```bash
   pnpm test
   ```

---

## 🚀 Quick Session Checklist

- [ ] Run `pnpm dev` to start development
- [ ] Read current task in TASK_PROGRESS.md
- [ ] Check PRD.md for feature details
- [ ] Implement feature
- [ ] Format code: `pnpm format`
- [ ] Test changes
- [ ] Commit with clear message
- [ ] Update TASK_PROGRESS.md with progress

---

## 📞 Quick Help

- **Setup help**: See [SETUP.md](./SETUP.md)
- **Feature details**: See [PRD.md](./PRD.md)
- **Code style**: Run `pnpm format`
- **API testing**: Visit http://localhost:3001/api
- **Database**: pgAdmin at http://localhost:5050

---

**Keep this card open while developing!**
