# Hora Certa Database Schema Implementation

## Overview

Complete multi-tenant database schema implemented for the Hora Certa barber shop management SaaS platform. The schema supports:

- **Multi-tenant isolation** via `tenant_id` columns on all tenant-scoped tables
- **User management** with multiple roles per tenant
- **Appointment scheduling** with payment tracking
- **Service catalog** with barber-specific customization
- **Customer management** with loyalty program support
- **Payment processing** with multiple methods
- **Loyalty program** for customer retention

## Architecture

### Database Design Principles

1. **Multi-Tenancy**: All tenant-scoped tables inherit from `TenantBaseEntity`, ensuring automatic `tenant_id` column and indexing
2. **Relationships**: Proper foreign keys with CASCADE deletes to maintain data integrity
3. **Performance**: Strategic indexes on commonly queried columns (tenant_id, foreign keys, status fields)
4. **Extensibility**: JSONB columns for theme/settings to allow dynamic configuration

### Entity Inheritance

```
BaseEntity (id, created_at, updated_at)
├── Tenant
├── User
├── TenantUser
├── BarberService
└── TenantBaseEntity (adds tenant_id)
    ├── Customer
    ├── Barber
    ├── Service
    ├── Appointment
    ├── Payment
    ├── LoyaltyPoint
    ├── LoyaltyTransaction
    └── LoyaltyReward
```

## Tables

### Core Tables

#### `tenants` (SaaS Workspace)
- **Purpose**: Represents a barber shop/business
- **Key Fields**:
  - `slug`: Unique identifier for URL routing
  - `owner_id`: Reference to the tenant owner user
  - `subscription_tier`: Tracks SaaS plan (FREE, BASIC, PRO, etc.)
  - `theme`, `settings`: JSONB for branding customization

#### `users` (System Users)
- **Purpose**: Global user accounts
- **Key Fields**:
  - `email`: Unique identifier
  - `user_type`: BARBER, CLIENT, OWNER (allows multiple roles)
  - `password_hash`: Stored for authentication

#### `tenant_users` (Junction Table)
- **Purpose**: Maps users to tenants with roles
- **Key Fields**:
  - `role`: OWNER, MANAGER, BARBER, RECEPTIONIST
  - **Unique Constraint**: (tenant_id, user_id) - one role per user per tenant

### Business Domain Tables

#### `customers`
- **Purpose**: Client database for each tenant
- **Key Fields**:
  - `user_id`: Optional link to global user account
  - `preferred_barber_id`: Stores barber preference
  - `total_spent`, `visit_count`: Customer lifetime metrics
  - `contact_preferences`: JSONB for notification settings

#### `barbers`
- **Purpose**: Barber staff profiles
- **Key Fields**:
  - `user_id`: Links to user account
  - `rating`: Average service rating
  - `commission_percentage`: Revenue sharing
  - `working_hours`: JSONB schedule configuration

#### `services`
- **Purpose**: Service catalog (haircuts, beard trim, etc.)
- **Key Fields**:
  - `category`: HAIR, BEARD, COMBO, PRODUCT
  - `price`, `duration_minutes`: Service specs
  - `active`: Soft delete capability

#### `barber_services` (Junction)
- **Purpose**: Maps barbers to services with customization
- **Key Fields**:
  - `custom_price`: Override service price for specific barber
  - `custom_duration`: Override service duration
  - **Unique Constraint**: (barber_id, service_id)

### Appointment Tables

#### `appointments`
- **Purpose**: Booking system
- **Key Fields**:
  - `scheduled_start`, `scheduled_end`: Time slots
  - `status`: SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
  - `payment_status`: PENDING, COMPLETED, FAILED, REFUNDED
  - `payment_id`: Optional link to payment record
  - **Indexes**: tenant_id, barber_id, customer_id, status, scheduled_start

### Payment Tables

#### `payments`
- **Purpose**: Financial transactions
- **Key Fields**:
  - `method`: CASH, CARD, PIX, TRANSFER
  - `status`: PENDING, COMPLETED, FAILED, REFUNDED
  - `provider_transaction_id`: External payment gateway reference
  - `items`: JSONB array of itemized charges
  - `discount_amount`, `tip_amount`, `tax_amount`: Breakdown
  - **Indexes**: tenant_id, customer_id, status, provider_transaction_id

### Loyalty Program Tables

#### `loyalty_points`
- **Purpose**: Customer point balance tracking
- **Key Fields**:
  - `balance`: Current points available
  - **Unique Constraint**: (tenant_id, customer_id)

#### `loyalty_transactions`
- **Purpose**: Audit log of point movements
- **Key Fields**:
  - `type`: EARNED, REDEEMED, ADJUSTED
  - `points`: Amount (positive/negative)
  - `reference_id`: Links to appointment/payment

#### `loyalty_rewards`
- **Purpose**: Reward catalog per tenant
- **Key Fields**:
  - `points_required`: Cost to redeem
  - `reward_type`: Flexible type (discount, free-service, product, etc.)
  - `reward_value`: Monetary value or percentage

## Indexes

### Performance Optimization

```sql
-- Tenant scoping (all tenant tables)
CREATE INDEX idx_<table>_tenant_id ON <table>(tenant_id);

-- Foreign key lookups
CREATE INDEX idx_barber_services_barber_id ON barber_services(barber_id);
CREATE INDEX idx_barber_services_service_id ON barber_services(service_id);

-- Query filtering
CREATE INDEX idx_appointments_barber_id ON appointments(barber_id);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_scheduled_start ON appointments(scheduled_start);

CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider_transaction_id ON payments(provider_transaction_id);

-- Unique constraints (prevent duplicates)
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_tenants_slug ON tenants(slug);
CREATE UNIQUE INDEX idx_tenant_users_composite ON tenant_users(tenant_id, user_id);
CREATE UNIQUE INDEX idx_barber_services_composite ON barber_services(barber_id, service_id);
CREATE UNIQUE INDEX idx_loyalty_points_composite ON loyalty_points(tenant_id, customer_id);
```

## Enums

### System Enums

#### `UserType`
- `BARBER`: Professional barber
- `CLIENT`: Customer
- `OWNER`: Business owner/admin

#### `TenantUserRole`
- `OWNER`: Full administrative access
- `MANAGER`: Business management access
- `BARBER`: Staff with limited access
- `RECEPTIONIST`: Scheduling and customer facing

### Business Enums

#### `AppointmentStatus`
- `SCHEDULED`: Booking confirmed
- `CONFIRMED`: Customer confirmed attendance
- `COMPLETED`: Service delivered
- `CANCELLED`: Cancelled by barber or customer
- `NO_SHOW`: Customer didn't show up

#### `PaymentStatus` / `PaymentMethod`
- **Status**: PENDING, COMPLETED, FAILED, REFUNDED
- **Method**: CASH, CARD, PIX, TRANSFER

#### `ServiceCategory`
- `HAIR`: Hair cutting services
- `BEARD`: Beard grooming
- `COMBO`: Combined services
- `PRODUCT`: Retail products (shampoo, etc.)

#### `Gender`
- `MALE`, `FEMALE`, `OTHER`

#### `LoyaltyTransactionType`
- `EARNED`: Points awarded
- `REDEEMED`: Points spent
- `ADJUSTED`: Manual adjustment

## File Structure

```
backend/src/
├── database/
│   ├── base/
│   │   ├── base.entity.ts           # Abstract base with id, timestamps
│   │   └── tenant-base.entity.ts    # Abstract base with tenant_id
│   ├── entities/
│   │   ├── tenant.entity.ts
│   │   ├── user.entity.ts
│   │   ├── tenant-user.entity.ts
│   │   ├── customer.entity.ts
│   │   ├── barber.entity.ts
│   │   ├── service.entity.ts
│   │   ├── barber-service.entity.ts
│   │   ├── appointment.entity.ts
│   │   ├── payment.entity.ts
│   │   ├── loyalty-point.entity.ts
│   │   ├── loyalty-transaction.entity.ts
│   │   ├── loyalty-reward.entity.ts
│   │   └── index.ts                 # Barrel export
│   ├── migrations/
│   │   └── 1704081600000-InitialSchema.ts
│   └── data-source.ts               # TypeORM CLI configuration
├── common/
│   └── enums/
│       ├── user-type.enum.ts
│       ├── tenant-user-role.enum.ts
│       ├── appointment-status.enum.ts
│       ├── payment-status.enum.ts
│       ├── payment-method.enum.ts
│       ├── service-category.enum.ts
│       ├── gender.enum.ts
│       ├── loyalty-transaction-type.enum.ts
│       └── index.ts                 # Barrel export
└── app.module.ts                    # Updated with TypeORM config
```

## Migration

### Generated Migration: `1704081600000-InitialSchema`

- **Up**: Creates all 12 tables with proper constraints and indexes
- **Down**: Drops all tables and enum types (respects foreign key dependencies)
- **Enums**: PostgreSQL enum types for status fields

### Running Migrations

```bash
# Generate migrations from entity changes
npm run migration:generate -- src/database/migrations/NameOfMigration

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Multi-Tenancy Pattern

### Design

1. **Tenant Isolation**: Every tenant-scoped entity has a `tenant_id` field
2. **Indexing**: `tenant_id` is indexed in all tenant-scoped tables
3. **Foreign Keys**: Careful relationships prevent cross-tenant data access
4. **Query Pattern**: All queries must include `WHERE tenant_id = $tenantId`

### Example Query
```typescript
// Find appointments for specific tenant
const appointments = await appointmentRepository.find({
  where: { tenant_id: tenantId, status: AppointmentStatus.SCHEDULED },
  relations: ['barber', 'customer', 'service'],
  order: { scheduled_start: 'ASC' },
});
```

### Middleware (To Implement)
```typescript
// Extract tenant_id from JWT or request context
// Automatically filter all queries by tenant_id
// Prevent cross-tenant data leakage
```

## Type Safety

### TypeScript Support

- All entities are TypeScript classes
- Full IDE autocomplete for entity properties
- Type-safe query builders
- Enum type checking

### Compiled Output

- JavaScript compiled to `dist/database/`
- Declaration files (`.d.ts`) for type information
- Migrations compiled for execution

## Verification Checklist

- ✅ 12 entity classes created with correct relationships
- ✅ 8 enum types defined for business logic
- ✅ Base entity classes for inheritance
- ✅ Multi-tenant isolation with `tenant_id` indexing
- ✅ Migration file generated with all tables and constraints
- ✅ TypeScript compilation successful (no errors)
- ✅ Database schema matches PRD specification
- ✅ Foreign keys configured with CASCADE deletes
- ✅ Unique constraints preventing duplicates
- ✅ Strategic indexes for query performance

## Next Steps

1. **Database Setup**:
   - Start PostgreSQL container
   - Run migrations: `npm run migration:run`
   - Verify tables in pgAdmin

2. **Authentication Module**:
   - Implement OAuth (Google) for authentication
   - Create tenant isolation middleware
   - Add row-level security checks

3. **Feature Modules**:
   - Customers module (CRUD, search)
   - Barbers module (profiles, schedules)
   - Services module (catalog management)
   - Appointments module (booking system)
   - Payments module (transaction processing)

4. **Testing**:
   - Unit tests for entities
   - Integration tests for migrations
   - E2E tests for API endpoints

## Performance Considerations

1. **Indexing Strategy**: Indexed all foreign keys and commonly filtered fields
2. **JSONB Usage**: Used for extensibility without schema migrations
3. **Relationships**: Lazy-loaded by default, eager-loaded when needed
4. **Query Optimization**: Strategic composite indexes for multi-column filters

## Data Integrity

- Cascade deletes ensure orphaned records are cleaned up
- Unique constraints prevent duplicate data
- Foreign keys maintain referential integrity
- Timestamps track all record changes

## Security

- `tenant_id` field ensures multi-tenant isolation
- Never trust user input for tenant_id (extract from JWT)
- Password hashes stored (plaintext never in database)
- Row-level security to be enforced in middleware
