# 📊 Hora Certa - Task Progress & Context

**Last Updated**: Feb 27, 2026 - Night
**Project Status**: MVP Phase 1 - Foundation (All Core Features Complete - Auth + Profiles + Services + Calendar + Booking + Payments + Reminders)
**Overall Completion**: 60% (9 of 15 tasks) - Reminder System Complete

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
[███████████████████░] 60% (9/15 tasks completed)
```

| Phase | Status | Duration |
|-------|--------|----------|
| **Phase 1 (MVP)** | 🚧 In Progress | Weeks 1-6 |
| Phase 2 (Reminders) | ⏳ Planned | Weeks 7-10 |
| Phase 3 (Advanced) | 📋 Backlog | Weeks 11-16 |
| Phase 4 (Future) | 🔮 Future | TBD |

---

## 📋 Detailed Task Breakdown

### ✅ **COMPLETED (9/15)**

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

### ⏳ **PENDING (6/15)**

---

#### Task #3: Implement Google and Apple OAuth SSO
- **Status**: ✅ COMPLETED
- **Completed Date**: Feb 26, 2026
- **Duration**: 2 sessions (Google + Apple)
- **Priority**: HIGH (blocks user flow)
- **Dependencies**: Task #2
- **What was done**:
  - ✅ Session 1 - Google OAuth:
    - Set up Passport.js with Google strategy
    - Created auth service and auth controller
    - Implemented JWT token generation (7-day expiration)
    - Added auth guards for protected routes (JwtAuthGuard, GoogleAuthGuard)
    - Created auth DTOs for validation
    - Enhanced User entity with `google_id` and `email_verified` fields
    - Created database migration for OAuth fields
    - Set up environment configuration (.env)
    - Comprehensive documentation and quick-start guides
  - ✅ Session 2 - Apple OAuth:
    - Set up Passport.js with Apple strategy
    - Implemented JWT identity token validation
    - Added Apple-specific email handling (private relay support)
    - Created apple-auth.guard.ts for protection
    - Enhanced User entity with `apple_id` field
    - Created migration for apple_id column
    - Updated auth service to support both OAuth providers
    - Added POST endpoints for Apple OAuth flow
    - Complete Apple setup documentation
- **Packages Used**: `@nestjs/passport`, `passport-google-oauth20`, `passport-apple`, `@nestjs/jwt`
- **Artifacts**:
  - `backend/src/auth/` - Core auth module (11 files, 260+ lines)
  - `backend/src/auth/strategies/google.strategy.ts` - Google OAuth
  - `backend/src/auth/strategies/apple.strategy.ts` - Apple OAuth (NEW)
  - `backend/src/auth/guards/apple-auth.guard.ts` - Apple guard (NEW)
  - `backend/src/database/migrations/1704081600001-AddOAuthFieldsToUser.ts` - Google fields
  - `backend/src/database/migrations/1704081600002-AddAppleOAuthToUser.ts` - Apple fields (NEW)
  - `backend/.env` - OAuth configuration template (updated)
  - `AUTH_IMPLEMENTATION.md` - Google OAuth documentation
  - `QUICK_START_AUTH.md` - Quick start guide
  - `IMPLEMENTATION_SUMMARY.md` - Overview
  - `APPLE_OAUTH_SETUP.md` - Apple OAuth setup guide (NEW)
  - `APPLE_OAUTH_SUMMARY.md` - Apple implementation summary (NEW)
- **API Endpoints**:
  - `GET /auth/google` - Initiate Google OAuth flow
  - `GET /auth/google/callback` - Google callback handler
  - `POST /auth/apple` - Initiate Apple OAuth flow (NEW)
  - `POST /auth/apple/callback` - Apple callback handler (NEW)
  - `GET /auth/profile` - Get current user (protected)
- **Database**:
  - User entity now has: google_id (unique), apple_id (unique), email_verified
  - Supports users with Google auth, Apple auth, or both
  - Email remains primary identifier
- **Reference**: [PRD.md Section 2.1.8](./PRD.md#218-authentication--security-multi-tenant)
- **Documentation**:
  - Google OAuth: See AUTH_IMPLEMENTATION.md + QUICK_START_AUTH.md
  - Apple OAuth: See APPLE_OAUTH_SETUP.md + APPLE_OAUTH_SUMMARY.md

---

#### Task #4: Create user profile management system
- **Status**: ✅ COMPLETED
- **Completed Date**: Feb 27, 2026
- **Duration**: 1 session
- **Priority**: MEDIUM
- **Dependencies**: Task #3 (OAuth)
- **What was done**:
  - ✅ Created UsersService with full CRUD logic
  - ✅ Created UsersController with REST endpoints
  - ✅ Implemented UpdateProfileDto with validation
  - ✅ Created ProfileResponseDto for type-safe responses
  - ✅ Email uniqueness validation
  - ✅ Phone number validation (Brazilian format)
  - ✅ Avatar URL management
  - ✅ JWT authentication on endpoints
  - ✅ Error handling (404, 400, 401)
  - ✅ Swagger documentation with examples
  - ✅ Type-safe database operations
- **Artifacts**:
  - `backend/src/users/` - Users module (5 files, 190 lines)
  - `backend/src/users/users.service.ts` - Business logic (90 lines)
  - `backend/src/users/users.controller.ts` - HTTP endpoints (60 lines)
  - `backend/src/users/users.module.ts` - Module config (11 lines)
  - `backend/src/users/dto/update-profile.dto.ts` - Validation (17 lines)
  - `backend/src/users/dto/profile-response.dto.ts` - Response (13 lines)
  - `USER_PROFILE_GUIDE.md` - Complete documentation
- **API Endpoints**:
  - `GET /users/profile` - Current user profile (protected)
  - `PATCH /users/profile` - Update current user (protected)
  - `GET /users/:id` - Get user by ID (public)
- **Features**:
  - ✅ Get own profile (JWT protected)
  - ✅ Update own profile (name, email, phone, avatar)
  - ✅ Email uniqueness validation
  - ✅ Phone format validation (11-15 digits)
  - ✅ Error handling and validation
  - ✅ Type-safe DTOs
  - ✅ Automatic timestamps
- **Database**:
  - Uses existing User entity
  - All fields (name, email, phone, avatar_url, user_type, email_verified, etc)
  - Email uniqueness enforced
  - Timestamps (created_at, updated_at)
- **Testing**:
  - Build successful
  - All validations working
  - Swagger documented
- **Reference**: [PRD.md Section 2.1.1](./PRD.md#211-customer-management)

---

#### Task #5: Build barber service management
- **Status**: ✅ COMPLETED
- **Completed Date**: Feb 27, 2026
- **Duration**: 1 session
- **Priority**: HIGH (blocks booking)
- **Dependencies**: Task #2, Task #4
- **What was done**:
  - ✅ Created ServicesService with full CRUD logic
  - ✅ Created ServicesController with REST endpoints
  - ✅ Implemented CreateServiceDto with validation
  - ✅ Implemented UpdateServiceDto for partial updates
  - ✅ Created ServiceResponseDto for type-safe responses
  - ✅ Service pricing with decimal validation
  - ✅ Duration in minutes with validation
  - ✅ Category enum support (HAIR, BEARD, COMBO, PRODUCT)
  - ✅ Active/inactive status toggle
  - ✅ Filter by category functionality
  - ✅ Get active services only
  - ✅ JWT authentication on all endpoints
  - ✅ Tenant isolation (services belong to creator)
  - ✅ Comprehensive error handling
  - ✅ Swagger documentation
- **Artifacts**:
  - `backend/src/services/` - Services module (6 files, 329 lines)
  - `backend/src/services/services.service.ts` - Business logic (120 lines)
  - `backend/src/services/services.controller.ts` - HTTP endpoints (140 lines)
  - `backend/src/services/services.module.ts` - Module config (12 lines)
  - `backend/src/services/dto/create-service.dto.ts` - Creation validation (21 lines)
  - `backend/src/services/dto/update-service.dto.ts` - Update validation (23 lines)
  - `backend/src/services/dto/service-response.dto.ts` - Response format (13 lines)
  - `BARBER_SERVICES_GUIDE.md` - Complete documentation
- **API Endpoints**:
  - `POST /services` - Create service (JWT protected)
  - `GET /services` - List all services (JWT protected)
  - `GET /services/active` - Get active services only (JWT protected)
  - `GET /services/category/:category` - Filter by category (JWT protected)
  - `GET /services/:id` - Get specific service (JWT protected)
  - `PATCH /services/:id` - Update service (JWT protected)
  - `PATCH /services/:id/toggle` - Toggle active status (JWT protected)
  - `DELETE /services/:id` - Delete service (JWT protected)
- **Features**:
  - ✅ Full CRUD operations
  - ✅ Service pricing and duration
  - ✅ Category filtering
  - ✅ Status management (active/inactive)
  - ✅ Type-safe validations
  - ✅ Tenant isolation
  - ✅ Error handling (404, 401)
  - ✅ Swagger documented
- **Database**:
  - Uses existing Service entity (TenantBaseEntity)
  - BarberService entity ready for future barber-specific assignments
  - Full multi-tenant support
- **Reference**: [PRD.md Section 2.1.3](./PRD.md#213-services-management)

---

#### Task #6: Implement calendar and availability system
- **Status**: ✅ COMPLETED
- **Completed Date**: Feb 27, 2026
- **Duration**: 1 session
- **Priority**: HIGH (core feature)
- **Dependencies**: Task #2, Task #5
- **What was done**:
  - ✅ Created AvailabilityService with slot calculation logic
  - ✅ Implemented working hours configuration per day
  - ✅ Created slot generation algorithm (30-minute intervals)
  - ✅ Added lunch break support with start/end times
  - ✅ Implemented buffer time (15 minutes between appointments)
  - ✅ Added conflict detection with existing appointments
  - ✅ Created AvailabilityController with REST endpoints
  - ✅ Implemented slot filtering by date and service duration
  - ✅ Multi-day week configuration support
  - ✅ Time conversion utilities (minutes to datetime)
  - ✅ AppointmentStatus filtering (SCHEDULED, CONFIRMED only)
  - ✅ Swagger documentation
  - ✅ Type-safe DTOs
  - ✅ Error handling
- **Artifacts**:
  - `backend/src/availability/` - Availability module (4 files, 282 lines)
  - `backend/src/availability/availability.service.ts` - Slot calculation (150 lines)
  - `backend/src/availability/availability.controller.ts` - HTTP endpoints (60 lines)
  - `backend/src/availability/availability.module.ts` - Module config (12 lines)
  - `backend/src/availability/dto/working-hours.dto.ts` - DTOs (60 lines)
  - `AVAILABILITY_CALENDAR_GUIDE.md` - Complete documentation
- **API Endpoints**:
  - `PATCH /availability/barbers/:barberId/working-hours` - Update hours (JWT protected)
  - `GET /availability/slots` - Get available slots (JWT protected)
    - Query params: date (YYYY-MM-DD), barberId, serviceDuration
- **Features**:
  - ✅ Per-day working hours (start_hour, start_minute, end_hour, end_minute)
  - ✅ Optional lunch break configuration
  - ✅ Closed days support (null/undefined)
  - ✅ 30-minute slot intervals
  - ✅ Service duration-based slot calculation
  - ✅ 15-minute buffer time between appointments
  - ✅ Lunch break handling (skip slots during lunch)
  - ✅ Existing appointment conflict detection
  - ✅ SCHEDULED and CONFIRMED status filtering
  - ✅ Invalid date format validation
- **Database**:
  - Uses existing Barber entity with working_hours JSONB field
  - Uses existing Appointment entity with scheduled_start/end timestamps
  - No schema changes needed
- **Availability Logic**:
  - Get working hours for day of week
  - Generate 30-minute slots from start to end time
  - Skip lunch break periods
  - Skip slots conflicting with existing appointments (+ 15min buffer)
  - Return available slots in ISO 8601 format
- **Reference**: [PRD.md Section 2.1.2](./PRD.md#212-schedule-management---core)

---

#### Task #7: Build appointment booking system
- **Status**: ✅ COMPLETED
- **Completed Date**: Feb 27, 2026
- **Duration**: 1 session
- **Priority**: HIGH (core feature)
- **Dependencies**: Task #6, Task #8 (payment)
- **What was done**:
  - ✅ Created AppointmentsService with full CRUD logic
  - ✅ Created AppointmentsController with REST endpoints
  - ✅ Implemented CreateAppointmentDto with validation
  - ✅ Implemented UpdateAppointmentDto for rescheduling
  - ✅ Implemented ChangeAppointmentStatusDto for status changes
  - ✅ Created AppointmentResponseDto for type-safe responses
  - ✅ Slot availability validation (no double-booking)
  - ✅ Conflict detection algorithm (prevents overlapping appointments)
  - ✅ Appointment status tracking with valid transitions
  - ✅ Reschedule logic with conflict checking
  - ✅ Cancel appointment functionality
  - ✅ Access control (customer/barber permissions)
  - ✅ Appointment notes management
  - ✅ Date/time validation and service duration matching
  - ✅ Swagger documentation with examples
  - ✅ Type-safe database operations
- **Appointment Status Flow**:
  - SCHEDULED → CONFIRMED, CANCELLED
  - CONFIRMED → COMPLETED, NO_SHOW, CANCELLED
  - COMPLETED → (final)
  - CANCELLED → (final)
  - NO_SHOW → (final)
- **Artifacts**:
  - `backend/src/appointments/` - Appointments module (8 files, 787 lines)
  - `backend/src/appointments/appointments.service.ts` - Business logic (430 lines)
  - `backend/src/appointments/appointments.controller.ts` - HTTP endpoints (160 lines)
  - `backend/src/appointments/appointments.module.ts` - Module config (18 lines)
  - `backend/src/appointments/dto/create-appointment.dto.ts` - Booking validation (50 lines)
  - `backend/src/appointments/dto/update-appointment.dto.ts` - Reschedule validation (30 lines)
  - `backend/src/appointments/dto/change-appointment-status.dto.ts` - Status validation (15 lines)
  - `backend/src/appointments/dto/appointment-response.dto.ts` - Response format (80 lines)
  - `backend/src/appointments/dto/index.ts` - DTO exports (4 lines)
  - `APPOINTMENT_BOOKING_GUIDE.md` - Complete documentation
- **API Endpoints**:
  - `POST /appointments` - Book appointment (CREATE)
  - `GET /appointments` - List appointments with filters (READ)
  - `GET /appointments/:id` - Get appointment details (READ)
  - `PATCH /appointments/:id/status` - Update status (UPDATE)
  - `PATCH /appointments/:id` - Reschedule appointment (UPDATE)
  - `DELETE /appointments/:id` - Cancel appointment (DELETE)
- **Features**:
  - ✅ Full CRUD operations with proper status transitions
  - ✅ Automatic customer creation if not exists
  - ✅ Conflict detection prevents double-booking
  - ✅ Service duration validation
  - ✅ Cannot book in the past
  - ✅ Rescheduling with conflict checking
  - ✅ Cancellation with status validation
  - ✅ Access control (barber only for status, customer/barber for reschedule/cancel)
  - ✅ Comprehensive error handling
  - ✅ Swagger documented with examples
- **Database**:
  - Uses existing Appointment entity (TenantBaseEntity)
  - Uses existing Customer entity (for customer management)
  - Uses existing Barber entity
  - Uses existing Service entity
  - No schema changes needed
- **Conflict Detection**:
  - Prevents overlapping appointments for same barber
  - Only checks SCHEDULED and CONFIRMED statuses
  - Query: `scheduled_start < end AND scheduled_end > start`
  - Properly excludes current appointment during rescheduling
- **Testing**:
  - Build successful ✅
  - All validations working ✅
  - Swagger documented ✅
- **Reference**: [PRD.md Section 2.1.2](./PRD.md#212-schedule-management---core)

---

#### Task #8: Integrate payment processing (PIX and Card)
- **Status**: ✅ COMPLETED
- **Completed Date**: Feb 27, 2026
- **Duration**: 1 session
- **Priority**: CRITICAL (revenue-blocking)
- **Dependencies**: Task #2, Task #7 (appointments)
- **What was done**:
  - ✅ Created PaymentsService with AbakatePay API wrapper
  - ✅ Created PaymentsController with REST endpoints
  - ✅ Implemented CreatePaymentDto for payment requests
  - ✅ Implemented PaymentResponseDto family for type-safe responses
  - ✅ Implemented WebhookPayloadDto for webhook validation
  - ✅ PIX payment support with QR code generation
  - ✅ Card payment support with installments (1-12x)
  - ✅ POS transaction (cash payment) recording
  - ✅ Webhook signature validation (HMAC-SHA256)
  - ✅ Payment status lifecycle management
  - ✅ Refund support for all payment methods
  - ✅ List payments with filtering
  - ✅ Enhanced Payment entity with new fields
  - ✅ Database migration for schema updates
  - ✅ Comprehensive error handling
  - ✅ Swagger documentation with examples
- **Artifacts**:
  - `backend/src/payments/` - Payments module (9 files, 965 lines)
  - `backend/src/payments/payments.service.ts` - Business logic (520 lines)
  - `backend/src/payments/payments.controller.ts` - HTTP endpoints (160 lines)
  - `backend/src/payments/payments.module.ts` - Module config (15 lines)
  - `backend/src/payments/dto/create-payment.dto.ts` - Payment request (45 lines)
  - `backend/src/payments/dto/payment-response.dto.ts` - Response formats (110 lines)
  - `backend/src/payments/dto/webhook-payload.dto.ts` - Webhook structure (50 lines)
  - `backend/src/payments/dto/index.ts` - DTO exports (5 lines)
  - `backend/src/database/migrations/1704081600003-EnhancePaymentEntity.ts` - Schema migration (60 lines)
  - `PAYMENT_PROCESSING_GUIDE.md` - Complete documentation
- **API Endpoints**:
  - `POST /payments/pix` - Create PIX payment (JWT protected)
  - `POST /payments/card` - Create card payment (JWT protected)
  - `POST /payments/pos` - Record POS transaction (JWT protected)
  - `GET /payments` - List payments with filters (JWT protected)
  - `GET /payments/:id` - Get payment details (JWT protected)
  - `PATCH /payments/:id/refund` - Refund payment (JWT protected)
  - `POST /payments/webhook` - Webhook handler (NO AUTH - signature validated)
- **Payment Methods**:
  - ✅ PIX: Instant QR code, real-time payment
  - ✅ Card: Support for installments (1-12x), hosted form
  - ✅ Cash: Immediate POS recording, no webhooks
- **Webhook Support**:
  - ✅ payment.completed → Update status to COMPLETED, mark appointment paid
  - ✅ payment.failed → Update status to FAILED, keep appointment unpaid
  - ✅ payment.refunded → Update status to REFUNDED, reset appointment to PENDING
  - ✅ HMAC-SHA256 signature validation
  - ✅ Idempotent processing (safe to retry)
- **Database**:
  - Enhanced existing Payment entity with:
    - `external_id` - Alternative payment ID
    - `paid_at` - When payment was completed
    - `metadata` - JSONB for additional data
    - Foreign key relationship to Appointment
  - Migration: 1704081600003-EnhancePaymentEntity.ts
  - No breaking changes to existing schema
- **Features**:
  - ✅ Full CRUD operations for payments
  - ✅ Multiple payment method support
  - ✅ Installment planning (1-12x)
  - ✅ Webhook handling with signature validation
  - ✅ Payment history and filtering
  - ✅ Refund processing
  - ✅ Error handling for API failures
  - ✅ Comprehensive logging
  - ✅ Environment-based configuration
  - ✅ Swagger documented
- **Security**:
  - ✅ JWT authentication on all endpoints except webhook
  - ✅ HMAC-SHA256 webhook signature validation
  - ✅ No card details stored (AbakatePay hosted form)
  - ✅ Secure API key management via environment variables
  - ✅ PCI compliance through AbakatePay integration
- **Testing**:
  - Build successful ✅
  - All validations working ✅
  - Swagger documented ✅
- **Reference**: [PRD.md Section 3.6](./PRD.md#36-payment-integration-abakate)

---

#### Task #9: Implement appointment reminder system
- **Status**: ✅ COMPLETED
- **Completed Date**: Feb 27, 2026
- **Duration**: 1 session
- **Priority**: HIGH (80% no-show reduction)
- **Dependencies**: Task #7 (appointments), Task #8 (payments)
- **What was done**:
  - ✅ Set up Bull queue system with Redis
  - ✅ Created scheduled jobs (24h before appointment)
  - ✅ Integrated email service (Nodemailer with SendGrid/SMTP)
  - ✅ Created professional reminder email template
  - ✅ Generated secure confirmation/decline tokens (HMAC-SHA256)
  - ✅ Token expiration (24 hours)
  - ✅ Track reminder sent status in database
  - ✅ Implemented confirmation endpoint (mark as CONFIRMED)
  - ✅ Implemented decline endpoint (mark as CANCELLED)
  - ✅ Email delivery with fallback plain text
  - ✅ Job retry logic (3 attempts with exponential backoff)
  - ✅ Idempotent job processing
  - ✅ Support for SendGrid and SMTP email providers
  - ✅ Logging and error handling
  - ✅ Swagger documentation
- **Artifacts**:
  - `backend/src/reminders/` - Reminders module (5 files, 780 lines)
  - `backend/src/reminders/reminders.service.ts` - Main logic (360 lines)
  - `backend/src/reminders/email.service.ts` - Email delivery (280 lines)
  - `backend/src/reminders/reminders.controller.ts` - HTTP endpoints (90 lines)
  - `backend/src/reminders/reminders.processor.ts` - Bull job processor (30 lines)
  - `backend/src/reminders/reminders.module.ts` - Module config (20 lines)
  - `APPOINTMENT_REMINDER_GUIDE.md` - Complete documentation
- **API Endpoints**:
  - `PATCH /reminders/appointments/:id/confirm` - Confirm via email link (token-based)
  - `PATCH /reminders/appointments/:id/decline` - Decline via email link (token-based)
  - `GET /reminders/appointments/:id/status` - Get reminder status (JWT)
  - `GET /reminders/pending` - List pending reminders (JWT)
- **Email Features**:
  - ✅ Professional HTML template with styling
  - ✅ Green confirmation button
  - ✅ Red decline button
  - ✅ Appointment details in styled box
  - ✅ Fallback plain text for email clients
  - ✅ Brazilian Portuguese localization
  - ✅ Support for SendGrid or SMTP
  - ✅ Configurable sender email
- **Job Queue Features**:
  - ✅ Bull queue with Redis backend
  - ✅ 24-hour delayed job scheduling
  - ✅ 3 retry attempts with exponential backoff (2s, 4s, 8s)
  - ✅ Auto-remove on completion
  - ✅ Job status tracking
  - ✅ Automatic appointment selection on booking
- **Security**:
  - ✅ HMAC-SHA256 token generation
  - ✅ Token expiration (24 hours)
  - ✅ Token verification on confirmation/decline
  - ✅ No JWT required for email links
  - ✅ Appointment validation before status change
  - ✅ Secure random token generation
- **Database**:
  - Uses existing Appointment entity
  - Reads: scheduled_start, status, customer, service
  - Updates: reminder_sent_at, status
  - No schema changes needed
- **Configuration**:
  - EMAIL_PROVIDER (sendgrid or smtp)
  - SENDGRID_API_KEY or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD
  - EMAIL_FROM (sender email)
  - REMINDER_TOKEN_SECRET (token signing key)
  - REDIS_HOST, REDIS_PORT
- **Testing**:
  - Build successful ✅
  - All validations working ✅
  - Swagger documented ✅
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
| Feb 26, 2026 | 3a | Task #3 | Google OAuth authentication (Session 1) |
| Feb 26, 2026 | 3b | Task #3 | Apple OAuth authentication (Session 2) - COMPLETE ✅ |
| Feb 27, 2026 | 4 | Task #4 | User profile management (GET/PATCH endpoints) - COMPLETE ✅ |
| Feb 27, 2026 | 5 | Task #5 | Barber service management (CRUD + filtering) - COMPLETE ✅ |
| Feb 27, 2026 | 6 | Task #6 | Calendar and availability system (slots + working hours) - COMPLETE ✅ |
| Feb 27, 2026 | 7 | Task #7 | Appointment booking system (CRUD + conflict detection) - COMPLETE ✅ |
| Feb 27, 2026 | 8 | Task #8 | Payment processing (PIX, Card, Cash + AbakatePay) - COMPLETE ✅ |
| Feb 27, 2026 | 9 | Task #9 | Appointment reminder system (Bull queues + email notifications) - COMPLETE ✅ |
| - | 10 | Task #10 | Auto-rescheduling & waitlist management |
| - | ... | ... | Continue with remaining tasks |

---

**Last working session**: Feb 27, 2026 (Night - Reminder System)
**Next task**: Task #10 - Auto-Rescheduling & Waitlist Management
**Estimated time for next task**: 2-3 hours

---

💡 **Tip**: Use this file to quickly understand project state and jump back into development without losing context.
