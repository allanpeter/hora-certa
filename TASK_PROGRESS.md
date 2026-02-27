# 📊 Hora Certa - Task Progress & Context

**Last Updated**: Feb 26, 2026 - Evening
**Project Status**: MVP Phase 1 - Foundation (User Auth Complete)
**Overall Completion**: 20% (3 of 15 tasks)

---

## 🎯 Current Focus

**Phase 1 (MVP) - 6 Weeks**

Core features to launch and get paying customers:
- Customer management
- Appointment booking & calendar
- POS (Payments via PIX/Card)
- Loyalty Points
- Basic Reports
- Staff Profiles

See [PRD.md](./PRD.md) for complete specifications.

---

## 📈 Completion Overview

```
[███████░░░░░░░░░░░░░] 20% (3/15 tasks completed)
```

| Phase | Status | Duration |
|-------|--------|----------|
| **Phase 1 (MVP)** | 🚧 In Progress | Weeks 1-6 |
| Phase 2 (Reminders) | ⏳ Planned | Weeks 7-10 |
| Phase 3 (Advanced) | 📋 Backlog | Weeks 11-16 |
| Phase 4 (Future) | 🔮 Future | TBD |

---

## 📋 Detailed Task Breakdown

### ✅ **COMPLETED (3/15)**

#### Task #1: Set up project structure and dependencies
- **Status**: ✅ COMPLETED
- **Completed Date**: Feb 26, 2026
- **Duration**: 1 session
- **What was done**:
  - Created monorepo with frontend (React) and backend (NestJS)
  - Set up Docker Compose with PostgreSQL, Redis, pgAdmin
  - Created all config files (.env, tsconfig, eslint, prettier)
  - Created documentation (README, SETUP, QUICK_START, CONTRIBUTING)
  - Created initial React and NestJS application structure
  - Set up VS Code settings for auto-formatting
- **Artifacts**:
  - `/frontend` - React Vite application
  - `/backend` - NestJS application
  - `docker-compose.yml` - Local development stack
  - `docker-compose.prod.yml` - Production deployment
  - Documentation files

#### Task #2: Design and create database schema
- **Status**: ✅ COMPLETED
- **Completed Date**: Feb 26, 2026
- **Duration**: 1 session
- **What was done**:
  - Created 12 TypeORM entity classes with proper relationships
  - Implemented multi-tenant isolation (tenant_id on all tenant-scoped tables)
  - Created 8 enum types for type-safe status fields
  - Built 2 base entity classes for inheritance (BaseEntity, TenantBaseEntity)
  - Generated complete database migration with 9 enum types and 12 tables
  - Configured 15+ strategic indexes for performance
  - Set up TypeORM DataSource for CLI integration
  - Updated app.module.ts with proper configuration
  - All TypeScript compiles without errors
- **Artifacts**:
  - `backend/src/database/entities/` - 12 entity classes
  - `backend/src/database/base/` - 2 base entity classes
  - `backend/src/database/migrations/1704081600000-InitialSchema.ts` - Complete migration
  - `backend/src/database/data-source.ts` - TypeORM CLI config
  - `backend/src/common/enums/` - 8 enum types
- **Entities Created**:
  - Core: Tenant, User, TenantUser
  - Business: Customer, Barber, Service, BarberService
  - Operational: Appointment, Payment
  - Loyalty: LoyaltyPoint, LoyaltyTransaction, LoyaltyReward
- **Commands**:
  ```bash
  # Run migrations
  npm run migration:run

  # Generate migration from entities
  npm run migration:generate -- src/database/migrations/MigrationName
  ```

---

### ⏳ **PENDING (12/15)**

---

#### Task #3: Implement Google and Apple OAuth SSO
- **Status**: ✅ COMPLETED (Google) / ⏳ PENDING (Apple)
- **Completed Date**: Feb 26, 2026
- **Duration**: 1 session
- **Priority**: HIGH (blocks user flow)
- **Dependencies**: Task #2
- **What was done**:
  - ✅ Set up Passport.js with Google strategy
  - ✅ Created auth service and auth controller
  - ✅ Implemented JWT token generation (7-day expiration)
  - ✅ Added auth guards for protected routes (JwtAuthGuard, GoogleAuthGuard)
  - ✅ Created auth DTOs for validation
  - ✅ Enhanced User entity with `google_id` and `email_verified` fields
  - ✅ Created database migration for OAuth fields
  - ✅ Set up environment configuration (.env)
  - ✅ Comprehensive documentation and quick-start guides
  - ⏳ Set up Passport.js with Apple strategy (TODO - future)
- **Packages Used**: `@nestjs/passport`, `passport-google-oauth20`, `@nestjs/jwt`
- **Artifacts**:
  - `backend/src/auth/` - Core auth module (9 files, 221 lines)
  - `backend/src/database/migrations/1704081600001-AddOAuthFieldsToUser.ts`
  - `backend/.env` - OAuth configuration template
  - `AUTH_IMPLEMENTATION.md` - Technical documentation
  - `QUICK_START_AUTH.md` - Quick start guide
  - `IMPLEMENTATION_SUMMARY.md` - Overview
- **API Endpoints**:
  - `GET /auth/google` - Initiate OAuth flow
  - `GET /auth/google/callback` - OAuth callback handler
  - `GET /auth/profile` - Get current user (protected)
- **Reference**: [PRD.md Section 2.1.8](./PRD.md#218-authentication--security-multi-tenant)
- **Next**: Apple OAuth strategy (similar pattern)

---

#### Task #4: Create user profile management system
- **Status**: ⏳ PENDING
- **Priority**: MEDIUM
- **Dependencies**: Task #3
- **Estimated Duration**: 2 hours
- **What needs to be done**:
  - Create user profile service
  - Create profile update endpoints (GET, PATCH)
  - Implement profile completion tracking
  - Add avatar upload functionality
  - Create role-based profile views (Barber vs Client)
  - Add validation for profile fields
- **Endpoints**:
  - `GET /api/users/profile`
  - `PATCH /api/users/profile`
  - `GET /api/users/:id/profile`
- **Reference**: [PRD.md Section 2.1.1](./PRD.md#211-customer-management)

---

#### Task #5: Build barber service management
- **Status**: ⏳ PENDING
- **Priority**: HIGH (blocks booking)
- **Dependencies**: Task #2, Task #4
- **Estimated Duration**: 2-3 hours
- **What needs to be done**:
  - Create services CRUD endpoints
  - Implement service pricing and duration
  - Add service categories (Hair, Beard, Combo, Product)
  - Create barber-service assignments
  - Allow custom prices per barber (optional)
  - Validate service data
- **Endpoints**:
  - `POST /api/services` - Create service
  - `GET /api/services` - List services
  - `PATCH /api/services/:id` - Update service
  - `DELETE /api/services/:id` - Delete service
- **Reference**: [PRD.md Section 2.1.3](./PRD.md#213-services-management)

---

#### Task #6: Implement calendar and availability system
- **Status**: ⏳ PENDING
- **Priority**: HIGH (core feature)
- **Dependencies**: Task #2, Task #5
- **Estimated Duration**: 3-4 hours
- **What needs to be done**:
  - Create barber working hours configuration
  - Implement availability calculation logic
  - Add day/week/month view support
  - Create slot generation algorithm
  - Handle breaks and lunch hours
  - Implement vacation/time-off management
  - Add available slots endpoint
- **Logic**: Calculate available slots based on:
  - Barber working hours
  - Service duration
  - Existing appointments
  - Buffer time between appointments
- **Endpoints**:
  - `GET /api/barbers/:id/availability?date=YYYY-MM-DD`
  - `GET /api/barbers/:id/working-hours`
  - `PATCH /api/barbers/:id/working-hours`
  - `GET /api/slots?barber_id=&service_id=&date=`
- **Reference**: [PRD.md Section 2.1.2](./PRD.md#212-schedule-management---core)

---

#### Task #7: Build appointment booking system
- **Status**: ⏳ PENDING
- **Priority**: HIGH (core feature)
- **Dependencies**: Task #6, Task #8 (payment)
- **Estimated Duration**: 3-4 hours
- **What needs to be done**:
  - Create appointment creation endpoint
  - Validate slot availability (no double-booking)
  - Lock slots during booking process
  - Create appointment status tracking
  - Implement reschedule/cancel logic
  - Add appointment notes
  - Create confirmation flow
- **Appointment Status**:
  - SCHEDULED → CONFIRMED → COMPLETED
  - CANCELLED, NO_SHOW
- **Endpoints**:
  - `POST /api/appointments` - Book appointment
  - `GET /api/appointments` - List appointments
  - `PATCH /api/appointments/:id` - Update status/reschedule
  - `DELETE /api/appointments/:id` - Cancel
- **Frontend**: Calendar view with booking form
- **Reference**: [PRD.md Section 2.1.2](./PRD.md#212-schedule-management---core)

---

#### Task #8: Integrate payment processing (PIX and Card)
- **Status**: ⏳ PENDING
- **Priority**: CRITICAL (revenue-blocking)
- **Dependencies**: Task #2
- **Estimated Duration**: 4-5 hours
- **What needs to be done**:
  - Set up AbakatePay API integration
  - Create payment service with API wrapper
  - Implement PIX QR code generation
  - Implement card payment handling
  - Create webhook handler for payment confirmations
  - Validate webhook signatures
  - Update appointment payment status on webhook
  - Create POS transaction endpoint
  - Handle multiple payment methods (cash, card, pix)
  - Create receipt generation
- **Payment Flow**:
  1. Customer selects payment method
  2. Backend creates payment request with AbakatePay
  3. Frontend displays QR code or card form
  4. Customer completes payment
  5. AbakatePay sends webhook confirmation
  6. Backend updates appointment status
  7. Send confirmation to customer
- **Endpoints**:
  - `POST /api/payments/create` - Create payment request
  - `GET /api/payments/:id` - Get payment status
  - `POST /api/payments/webhook` - AbakatePay webhook (no auth)
  - `POST /api/transactions` - Create POS transaction
- **Sandbox Testing**: Use AbakatePay sandbox environment first
- **Reference**: [PRD.md Section 3.6](./PRD.md#36-payment-integration-abakate)

---

#### Task #9: Implement appointment reminder system
- **Status**: ⏳ PENDING
- **Priority**: HIGH (80% no-show reduction)
- **Dependencies**: Task #7, Task #2
- **Estimated Duration**: 3-4 hours
- **What needs to be done**:
  - Set up Bull/RabbitMQ queue system
  - Create scheduled job (24h before appointment)
  - Integrate email service (SendGrid/AWS SES)
  - Create reminder email template
  - Generate confirmation link with expiry
  - Track reminder sent status
  - Implement confirmation/decline link handler
  - Update appointment status based on confirmation
- **Scheduled Jobs**:
  - 24h before: Send reminder
  - 2h before: Send final reminder (Phase 2)
  - Check for unconfirmed appointments
- **Templates**: Appointment detail, confirmation link, barber info
- **Reference**: [PRD.md Section 4.1](./PRD.md#41-smart-reminder--auto-rescheduling-system)

---

#### Task #10: Build automatic rescheduling logic
- **Status**: ⏳ PENDING
- **Priority**: HIGH (revenue impact)
- **Dependencies**: Task #9, Task #6
- **Estimated Duration**: 2-3 hours
- **What needs to be done**:
  - Implement auto-release logic (if no confirmation at 2h mark)
  - Create waitlist/queue management
  - Auto-fill released slots from waitlist
  - Send slot availability notifications
  - Update all affected parties
  - Track appointment status changes
  - Create audit trail for rescheduling
- **State Machine**:
  ```
  SCHEDULED (24h before)
    → Send reminder
  WAITING_CONFIRMATION (24h - 2h before)
    → Customer confirms → CONFIRMED
    → Customer declines → RELEASED_SLOT
    → No response (2h before) → AUTO_RELEASED
      → Try to fill from waitlist
  ```
- **Benefits**: 80% reduction in no-shows, 15-25% revenue increase
- **Reference**: [PRD.md Section 4.1](./PRD.md#41-smart-reminder--auto-rescheduling-system)

---

#### Task #11: Create client dashboard
- **Status**: ⏳ PENDING
- **Priority**: MEDIUM
- **Dependencies**: Task #7
- **Estimated Duration**: 2-3 hours
- **What needs to be done**:
  - Create client dashboard page
  - Display upcoming appointments
  - Show appointment status
  - Display loyalty points balance
  - Show rewards available
  - Allow appointment cancellation
  - Display past appointments
  - Show payment history
- **Sections**:
  - Upcoming appointments (with time until appointment)
  - Loyalty points and rewards
  - Past appointments
  - Payment history
  - Profile settings link
- **Frontend**: React components with React Query
- **Reference**: [PRD.md Section 2.1.6](./PRD.md#216-dashboard--analytics-barber)

---

#### Task #12: Create barber dashboard
- **Status**: ⏳ PENDING
- **Priority**: MEDIUM
- **Dependencies**: Task #7, Task #8
- **Estimated Duration**: 2-3 hours
- **What needs to be done**:
  - Create barber dashboard page
  - Display today's appointments
  - Show week/month calendar view
  - Display quick stats (revenue, bookings)
  - Allow appointment management (mark complete, no-show)
  - Show customer details on hover
  - Display payment status
  - Add notes to appointments
- **Stats**:
  - Revenue (today/week/month)
  - Appointments (today/upcoming)
  - No-show rate
  - Booking rate
- **Frontend**: React calendar component
- **Reference**: [PRD.md Section 2.1.6](./PRD.md#216-dashboard--analytics-barber)

---

#### Task #13: Build responsive frontend UI (mobile-first)
- **Status**: ⏳ PENDING
- **Priority**: MEDIUM
- **Dependencies**: Task #7, Task #11, Task #12
- **Estimated Duration**: 3-4 hours
- **What needs to be done**:
  - Create reusable React components
  - Build all pages (auth, dashboard, calendar, booking, payment)
  - Implement responsive design (mobile-first)
  - Create form components with validation
  - Implement calendar UI component
  - Create payment UI
  - Add loading and error states
  - Implement navigation and routing
  - Test on mobile devices/browsers
- **Pages**:
  - `/login` - Authentication
  - `/register` - Registration
  - `/dashboard` - User dashboard (role-based)
  - `/book` - Booking page (public)
  - `/appointments` - My appointments
  - `/settings` - User settings
  - `/loyalty` - Loyalty rewards
- **Mobile Breakpoints**:
  - `sm:` 640px, `md:` 768px, `lg:` 1024px, `xl:` 1280px
- **Reference**: [PRD.md Section 3.1](./PRD.md#31-frontend-architecture)

---

#### Task #14: Set up testing infrastructure
- **Status**: ⏳ PENDING
- **Priority**: MEDIUM
- **Dependencies**: Task #3-12
- **Estimated Duration**: 2-3 hours
- **What needs to be done**:
  - Configure Jest for unit tests
  - Set up test database (test environment)
  - Write unit tests for services
  - Write integration tests for API endpoints
  - Configure e2e tests
  - Set up test coverage reporting
  - Aim for >80% coverage on critical paths
- **Test Types**:
  - Unit tests (services, helpers)
  - Integration tests (API endpoints)
  - E2E tests (user flows: signup, booking, payment)
- **Commands**:
  ```bash
  pnpm test              # Run all tests
  pnpm test:watch       # Watch mode
  pnpm test:cov         # With coverage
  ```
- **Target Coverage**: >80% on critical paths

---

#### Task #15: Deploy and launch MVP
- **Status**: ⏳ PENDING
- **Priority**: HIGH (after all features)
- **Dependencies**: Task #1-14
- **Estimated Duration**: 3-4 hours
- **What needs to be done**:
  - Build Docker images for frontend and backend
  - Deploy via Coolify (self-hosted)
  - Set up production database
  - Configure environment variables for production
  - Test all critical flows in production
  - Set up monitoring and logging
  - Configure CI/CD pipeline (GitHub Actions)
  - Create health checks
  - Backup strategy for database
  - Set up error tracking/monitoring
- **Deployment Steps**:
  1. Build production images
  2. Push to Coolify
  3. Configure database
  4. Run migrations
  5. Set environment variables
  6. Start services
  7. Run smoke tests
  8. Monitor health
- **Reference**: [SETUP.md](./SETUP.md)

---

## 🗂️ Project Structure

```
hora-certa/
├── PRD.md                    ⭐ Product specifications (READ FIRST)
├── README.md                 Project overview
├── SETUP.md                  Detailed setup guide
├── QUICK_START.md            5-minute quickstart
├── TASK_PROGRESS.md          This file
├── CONTRIBUTING.md           Development guidelines
│
├── backend/                  NestJS backend
│   ├── src/
│   │   ├── modules/         Feature modules (TODO: create)
│   │   │   ├── auth/
│   │   │   ├── customers/
│   │   │   ├── appointments/
│   │   │   ├── services/
│   │   │   ├── pos/
│   │   │   ├── loyalty/
│   │   │   ├── payments/
│   │   │   └── reports/
│   │   └── database/        TypeORM entities (TODO: create)
│   └── package.json
│
└── frontend/                 React frontend
    ├── src/
    │   ├── components/      React components (TODO: create)
    │   ├── pages/          Page components (TODO: create)
    │   ├── hooks/          Custom hooks (TODO: create)
    │   ├── stores/         Zustand stores (done: auth.store)
    │   └── config/         Configuration (done: api.ts)
    └── package.json
```

---

## 💾 Environment Setup

### Development (.env)
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=hora_certa_dev
NODE_ENV=development
PORT=3001
JWT_SECRET=dev-secret
```

### Services Running
- **Frontend**: http://localhost:5173 (React Vite)
- **Backend**: http://localhost:3001 (NestJS)
- **API Docs**: http://localhost:3001/api (Swagger)
- **PostgreSQL**: localhost:5432 (database)
- **Redis**: localhost:6379 (cache)
- **pgAdmin**: http://localhost:5050 (DB management)

### Key Commands
```bash
# Install & run
pnpm install
docker-compose up -d
pnpm --filter backend run migration:run
pnpm dev

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres
```

---

## 🎓 Key Architecture Decisions

✅ **Multi-tenant**: Database-per-row isolation (tenant_id in all tables)
✅ **Payment**: AbakatePay (PIX + Card) - Brazilian focused
✅ **Monorepo**: pnpm workspaces (frontend + backend in one repo)
✅ **Database**: PostgreSQL (self-hosted, not cloud)
✅ **Hosting**: Coolify (self-hosted, Docker Compose based)
✅ **Frontend**: React + Vite + Tailwind (mobile-first)
✅ **Backend**: NestJS + TypeORM + JWT
✅ **State**: React Query (server) + Zustand (client)

---

## 🎯 Success Metrics for MVP

- ✅ Users can sign up with OAuth
- ✅ Barbers can create services and set availability
- ✅ Customers can book appointments
- ✅ Payment processing works (PIX + Card)
- ✅ Reminder system sends emails 24h before
- ✅ Mobile responsive design
- ✅ No critical bugs on main flows
- ✅ First 10 paying customers acquired
- ✅ NPS score >40

---

## 📚 Key Documents to Reference

1. **[PRD.md](./PRD.md)** - Complete specifications (95+ features)
   - Section 2: All features organized by phase
   - Section 3: Technical architecture
   - Section 4: Detailed feature specs
   - Section 5: User flows

2. **[README.md](./README.md)** - Project overview
   - Technology stack
   - Project structure
   - Development setup

3. **[SETUP.md](./SETUP.md)** - Step-by-step setup guide
   - Prerequisites
   - Installation steps
   - Verification
   - Troubleshooting

4. **[QUICK_START.md](./QUICK_START.md)** - 5-minute quickstart
   - Quick commands
   - Service URLs
   - Common issues

---

## 🚨 Critical Blockers / Dependencies

| Task | Blocks | Status |
|------|--------|--------|
| #2 Database Schema | All tasks | ✅ COMPLETE |
| #3 OAuth (Google) | User creation | ✅ COMPLETE |
| #4 User Profiles | Services management | ⏳ NEXT |
| #5 Services | Appointment booking | ⏳ After #4 |
| #6 Calendar | Appointment booking | ⏳ After #5 |
| #7 Booking | Payment, Reminders | ⏳ After #6 |
| #8 Payment | MVP launch | ⏳ High priority |
| #9 Reminders | Revenue impact | ⏳ After #7 |
| #10 Auto-resch. | No-show reduction | ⏳ After #9 |

---

## 📌 Quick Reference

### Frontend Tech
- React 18 + TypeScript
- Vite (dev server)
- React Router (routing)
- React Query (server state)
- Zustand (client state)
- Tailwind CSS (styling)
- Axios (HTTP)

### Backend Tech
- NestJS + TypeScript
- PostgreSQL + TypeORM
- JWT authentication
- Swagger/OpenAPI docs
- Bull/RabbitMQ (queues)
- SendGrid (email)
- AbakatePay (payments)

### Infrastructure
- Docker Compose (local)
- PostgreSQL, Redis, pgAdmin
- Coolify (self-hosted deployment)

---

## 📋 Notes for Future Sessions

**When resuming work:**
1. Check this file for current task status
2. Look at BLOCKED tasks and their dependencies
3. Review PRD.md for feature details
4. Check SETUP.md if environment issues
5. Run `pnpm dev` to start development

**Git commits should reference:**
- Which task number (e.g., "Task #2: Create database schema")
- What was accomplished
- Any blockers encountered

**Database changes:**
- Always run migrations: `pnpm --filter backend run migration:run`
- Check pgAdmin (http://localhost:5050) to verify tables

---

## 🔄 Version History

| Date | Session | Completed | Notes |
|------|---------|-----------|-------|
| Feb 26, 2026 | 1 | Task #1 | Project structure + monorepo setup |
| Feb 26, 2026 | 2 | Task #2 | Database schema: 12 entities, 8 enums, 1 migration |
| Feb 26, 2026 | 3 | Task #3 | Google OAuth authentication (Apple SSO: TODO) |
| - | 4 | Task #4 | User profile management |
| - | ... | ... | Continue with remaining tasks |

---

**Last working session**: Feb 26, 2026 (Evening)
**Next task**: Task #4 - User Profile Management (or Task #3 Part 2 - Apple OAuth)
**Estimated time for next task**: 2-3 hours (Task #4) or 1-2 hours (Apple SSO)

---

💡 **Tip**: Use this file to quickly understand project state and jump back into development without losing context.
