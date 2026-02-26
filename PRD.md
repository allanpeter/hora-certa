# Hora Certa - Complete Barber Shop Management SaaS Platform

**Version**: 2.0 | **Last Updated**: Feb 26, 2026 | **Status**: Planning MVP | **Type**: Multi-tenant SaaS

---

## Executive Summary

Hora Certa is a comprehensive barber shop management platform designed to help barbers and shop owners manage customers, appointments, payments, and loyalty programs from a single system. Unlike generic appointment systems, Hora Certa includes POS, loyalty programs, staff management, and inventory tracking—everything a barber shop needs to operate efficiently.

**Core Value Proposition**: Complete barber shop management + intelligent scheduling + mobile-first experience

**Target Markets**: Brazil (PIX integration) → Latin America → Global

---

## 1. Product Vision & Target Users

### 1.1 Vision Statement
Enable barber shops (from solo practitioners to multi-shop chains) to run their entire business on one platform—managing customers, appointments, revenue, staff, and growth—while providing customers with a seamless booking and loyalty experience.

### 1.2 Target Users (Priority Order)

**Primary (MVP)**:
- Solo barbers (freelancers)
- Small barber shops (1-5 barbers)
- Traditional barbers with manual systems

**Secondary (Phase 2+)**:
- Barber shop chains (multi-location)
- Salon owners who want to manage barbers
- Franchise barber shops

### 1.3 Core Problems We Solve

| Problem | Impact | Solution |
|---------|--------|----------|
| Manual appointment scheduling | Lost bookings, double-bookings | Digital calendar with smart availability |
| Cash-based, no tracking | No financial visibility, theft risk | Integrated POS with payment methods |
| No customer data | Can't market, poor service | Customer profiles + visit history |
| No-shows reduce revenue | 10-30% revenue loss | Automatic reminders (WhatsApp/Email/SMS) |
| Poor customer retention | Constant churn | Loyalty program with rewards |
| Staff productivity unknown | No data-driven decisions | Staff performance dashboards |
| Time on admin tasks | Less time with customers | Automation + reports |

---

## 2. Complete Feature Set & Roadmap

### Phase 1 (MVP) - Foundation - Weeks 1-6

Core features to launch and get paying customers.

#### 2.1.1 Customer Management
- **Registration & Profiles**
  - Name, email, phone, gender
  - Notes (preferences, allergies, style preferences)
  - Avatar/profile picture
  - Visit history with dates
  - Favorite barber
  - Contact preferences (notification channels)

- **Advanced Customer Data**
  - Birthday tracking (optional, Phase 1 advanced)
  - Photo gallery (before/after cuts)
  - Total spent tracking
  - Loyalty points balance
  - Service history with dates
  - Last visit date

- **UI/Search**
  - Quick customer search (by name/phone)
  - Customer list with filters
  - Customer detail page with full history

#### 2.1.2 Appointment System - Core
- **Booking Flow**
  - Select barber
  - Select service(s)
  - View available time slots
  - Confirm appointment
  - Payment (PIX/Card required before confirmation)

- **Calendar Views**
  - Day view (hourly slots)
  - Week view (grid with barbers)
  - Barber availability management
  - Holiday/vacation management
  - Working hours configuration

- **Appointment Status Tracking**
  - SCHEDULED → CONFIRMED → COMPLETED
  - CANCELLED
  - NO_SHOW
  - Status history

- **Appointment Management (Barber)**
  - View today's appointments
  - Mark as completed
  - Mark as no-show
  - Cancel appointment
  - Reschedule appointment
  - Add notes

#### 2.1.3 Services Management
- **Service Catalog**
  - Name (Haircut, Beard, Hair + Beard, etc.)
  - Price (fixed per service)
  - Duration (15, 30, 45, 60 min)
  - Category (Hair, Beard, Combo, Product)
  - Description
  - Photo/icon

- **Barber Services**
  - Assign services to barbers
  - Barber can override prices (optional)
  - Disable/enable services per barber

- **Service Groups**
  - Bundle services (Hair + Beard combo)
  - Pricing for bundles

#### 2.1.4 POS (Payment System)
- **Transaction Entry**
  - Select customer (or new transaction)
  - Add services (automatically from appointment or manual add)
  - Add products (hair gel, etc.)
  - Calculate subtotal automatically
  - Apply discount (amount or %)
  - Add tip
  - Calculate tax (if applicable)

- **Payment Methods**
  - Cash
  - Debit Card (via AbakatePay)
  - Credit Card (via AbakatePay)
  - PIX (via AbakatePay)
  - Multiple payments (e.g., R$50 PIX + R$30 Cash)

- **Receipts**
  - Digital receipt (QR code + details)
  - Email receipt
  - Print receipt (if printer available)
  - Receipt number tracking

- **Payment Confirmation**
  - Real-time payment validation via AbakatePay
  - Webhook handling for payment status
  - Failed payment handling
  - Payment refund tracking (Phase 2)

#### 2.1.5 Loyalty Program - Points System
- **Points Calculation**
  - 1 point per R$1 spent (configurable)
  - Automatic calculation after payment
  - Points balance visible to customer

- **Rewards System**
  - Define rewards:
    - Free service (e.g., 100 points = Free haircut)
    - Discount (e.g., 50 points = R$10 off)
    - Free product (e.g., 30 points = Free hair gel)
  - Customer can view available rewards
  - Barber marks reward as redeemed
  - Points deducted automatically

- **Loyalty Dashboard**
  - Customer sees their points balance
  - Customer sees available rewards
  - Customer sees reward history
  - Encourage redemption

#### 2.1.6 Staff Management
- **Barber Profiles**
  - Name, email, phone
  - Avatar
  - Services offered
  - Working hours
  - Commission % (optional)

- **Staff Roles** (Auth)
  - Owner (full access)
  - Barber (appointments, POS, own stats)
  - Receptionist (appointments, POS, customer management)
  - Manager (all except financial settings)

#### 2.1.7 Basic Reports
- **Financial**
  - Daily revenue
  - Payment methods breakdown (Cash, Card, PIX)
  - Discount tracking

- **Appointments**
  - Completed appointments
  - No-shows
  - Cancellations

- **Customers**
  - New customers (this period)
  - Total customers
  - Returning customers

#### 2.1.8 Authentication & Security (Multi-tenant)
- **User Registration**
  - Email + password
  - Google OAuth (optional MVP)
  - Apple OAuth (optional MVP)

- **Tenant Setup**
  - Shop owner creates account
  - Creates their shop workspace (tenant)
  - Invites staff members
  - Shop slug (barber1.horacerta.local or horacerta.local/barber1)

- **Data Security**
  - Tenant isolation (can't access other shops' data)
  - Role-based access control
  - Password hashing
  - HTTPS only
  - Secure payment handling

#### 2.1.9 Responsive Design (Mobile-First)
- **Barber Tablet/Phone**
  - Quick appointment view
  - Fast POS (no lag)
  - Easy payment buttons
  - Offline mode (optional MVP 2)

- **Responsive Web**
  - Desktop: Full features
  - Tablet: Optimized for 7-10" screens
  - Phone: Core features (book, pay, see loyalty)

---

### Phase 2 - Advanced Features & Growth - Weeks 7-14

High-impact features to reduce no-shows and improve revenue.

#### 2.2.1 Appointment Reminders & Auto-Rescheduling

**Reminder System**
- Send reminder 24 hours before appointment
- Channels: WhatsApp (primary), Email, SMS
- Customer clicks confirmation link or reply
- Status tracking: REMINDER_SENT → CONFIRMED/DECLINED/TIMEOUT

**Automatic Rescheduling Logic** ⭐ High value feature
```
When appointment is 24h away:
  IF client CONFIRMS → Keep appointment
  IF client DECLINES → Release slot, try to fill
  IF client NO_RESPONSE after reminder:
    → Mark as "Pending Confirmation"
    → Keep slot reserved for 2 more hours
    → If still no response:
      → Release slot → Try to fill from waitlist
      → Notify other clients on waitlist
      → Keep first client in waitlist for future
      → Update barber: "Slot available"
```

**Waitlist Management**
- Customers can join waitlist for full slots
- Automatic notification when slot opens
- Quick-book from waitlist

**Benefits**
- Reduces no-shows from ~20% to <5%
- Increases revenue per barber by 15-25%
- Better customer communication

#### 2.2.2 Online Customer Portal

**Customer Web Portal**
- Sign up / Login
- Browse barbers and services
- View availability (real-time)
- Book appointment
- View booking history
- Manage loyalty points
- See receipt
- Cancel/reschedule own appointments
- Update preferences

**Guest Booking** (optional)
- Book without account
- QR code or link in reminder

#### 2.2.3 Notifications & Marketing

**Notification Channels**
- **WhatsApp** (highest engagement in Brazil)
  - Integration with Twilio/MessageBird
  - Appointment reminders
  - Confirmation requests
  - Loyalty rewards notifications
  - Marketing messages

- **Email**
  - Appointment details
  - Receipts
  - Loyalty updates
  - Marketing newsletters

- **SMS** (optional)
  - Backup reminders
  - Cost-effective alternative

**Automation**
- Send reminder 24h before
- Send "last 3 hours" reminder
- Send loyalty points earned message
- Send "birthday promotion" message
- Customizable templates per tenant

#### 2.2.4 Advanced Scheduling Features

**Availability Management**
- Working hours per barber (flexible, can vary by day)
- Vacation/time-off scheduling
- Break times
- Lunch hours
- Appointment templates (quick setup)

**Smart Availability Logic**
- Calculate available slots based on:
  - Barber working hours
  - Existing appointments
  - Service duration
  - Buffer time between appointments (if needed)
- Real-time availability visible to customers

#### 2.2.5 Inventory Management

**Product Tracking**
- Product name
- Stock quantity
- Reorder level (alert when stock < threshold)
- Purchase cost
- Selling price
- Profit margin calculation

**Sales Tracking**
- Track products sold per transaction
- Inventory deduction on sale
- Low stock alerts
- Inventory reports

**Example**
```
Hair Gel Premium:
  Stock: 10 units
  Alert when < 3
  Cost: R$25/unit
  Price: R$50/unit
  Margin: 100%
```

#### 2.2.6 Financial Management

**Cash Register Control**
- Opening balance
- Track cash in/out throughout day
- Closing balance
- Discrepancies flagged

**Expense Tracking**
- Record expenses (supplies, rent, utilities)
- Categorize expenses
- Track profit = Revenue - Expenses

**Financial Reports**
- Daily P&L
- Monthly P&L
- Revenue trends
- Expense trends

#### 2.2.7 Advanced Reports

**Financial Reports**
- Revenue by period (daily/weekly/monthly)
- Payment methods breakdown
- Best-selling services
- Service revenue comparison
- Average ticket size

**Staff Performance**
- Revenue per barber
- Appointments per barber
- Services per barber
- Commission calculations
- No-show rate per barber

**Customer Analytics**
- Most frequent customers
- New vs returning ratio
- Customer lifetime value
- Churn rate
- Revenue per customer

---

### Phase 3 - Differentiation & Scale - Weeks 15-24

Enterprise features and competitive advantages.

#### 2.3.1 Multi-Shop Support

**Multiple Locations**
- Owner can manage multiple shops
- Separate data per shop
- Shared reporting (across shops)
- Centralized staff management
- Bulk operations

#### 2.3.2 Team Management & Permissions

**Detailed Roles**
- **Owner**: Full access, settings, team management
- **Manager**: Staff management, reports, no financial settings
- **Barber**: Only their schedule, appointments, POS
- **Receptionist**: Appointments, customers, POS
- **Custom Roles**: Define permissions granularly

**Team Invitations**
- Invite by email
- QR code share
- Role assignment
- Deactivate staff access

#### 2.3.3 Reviews & Ratings System

**Customer Reviews**
- Rate barber (1-5 stars)
- Rate shop (1-5 stars)
- Written feedback
- Photos of work
- Verified purchases only

**Public Profiles**
- Barber profile shows average rating
- Top-rated barbers highlighted
- Reviews visible on booking page
- Helps customers choose

#### 2.3.4 Promotions & Coupons

**Discount Codes**
- Create coupon codes (FIRST10, SUMMER20, etc.)
- Discount type: % or fixed amount
- Expiration date
- Usage limits
- Applicable services/barbers
- Track usage

**Seasonal Promotions**
- Auto-apply to specific customer groups
- Birthday promotions
- "Come back" offers for inactive customers
- Limited-time offers

#### 2.3.5 Advanced Analytics Dashboard

**Real-time Dashboard**
- Revenue today/week/month
- Appointments today
- Top barber (by revenue/appointments)
- Top service
- Customer acquisition rate
- Churn rate

**Predictive Analytics**
- Forecast next month revenue
- Predict customer no-show likelihood
- Recommend optimal pricing
- Identify high-churn customers

#### 2.3.6 Customer App / PWA

**Mobile App Features**
- Native mobile app (React Native) OR Progressive Web App
- Book appointments
- View loyalty points
- Cancel/reschedule bookings
- View history
- Chat with shop (optional)
- Payment integration in app

#### 2.3.7 Accounting & Tax Integration

**Tax Support**
- Invoice generation (for business customers)
- Tax calculations (if applicable)
- Accounting export (CSV/PDF)
- Integration with accounting software (optional)

#### 2.3.8 AI Features (Differentiation)

**Smart Recommendations**
- Recommend next service based on history
- Suggest best time to book (less crowded)
- Bundle recommendations (if you got haircut, suggest beard trim)

**Automated Marketing**
- Identify inactive customers
- Send automated "Come back" offer
- Birthday promotions auto-send
- Best time to send message (when customer is likely online)

**Smart Scheduling**
- Suggest optimal barber assignments
- Predict demand patterns
- Optimize staff scheduling

---

### Phase 4 - Enterprise & Integrations - Future

#### 2.4.1 External Integrations

**Payment Processors**
- Card machine integration (Square, Ingenico)
- Multiple payment gateways

**Messaging**
- WhatsApp Business API
- SMS gateways
- Push notifications

**Accounting**
- Integration with accounting software
- Tax compliance tools

**Marketing**
- Email marketing platform
- SMS marketing
- Social media posting

#### 2.4.2 Advanced Features

**Video Consultations**
- Pre-appointment consultations
- Customer asks questions
- See portfolio

**Group Bookings**
- Book for multiple friends
- Group discounts

**Gift Cards**
- Digital gift cards
- E-gift card delivery
- Redemption tracking

#### 2.4.3 White Label / API

**White Label Solution**
- Custom branding
- API access for integrations
- Premium pricing tier

---

## 3. Technical Architecture

### 3.1 Multi-Tenant Architecture

**Isolation Strategy**
```
horacerta.com (main domain)
├── barber1.horacerta.local (Tenant 1)
├── barber2.horacerta.local (Tenant 2)
└── barber3.horacerta.local (Tenant 3)

OR

horacerta.com/barber1 (URL-based routing)
horacerta.com/barber2
```

**Data Isolation**
- Every table has `tenant_id`
- Middleware enforces tenant context
- Row-level security (user can only see own tenant's data)
- Clients can book with multiple tenants

**Tenant Context in JWT**
```json
{
  "sub": "user_123",
  "tenant_id": "barber1_tenant",
  "email": "barber@horacerta.com",
  "roles": ["BARBER"],
  "iat": 1234567890
}
```

### 3.2 Frontend Architecture

**Framework**: React 18+ with TypeScript
**State Management**: React Query (server state) + Zustand/Context (UI state)
**Styling**: Tailwind CSS
**UI Components**: Shadcn/ui or similar
**Mobile**: Responsive design (mobile-first)

**Key Pages/Screens**
```
/auth
  ├── /login
  ├── /register
  ├── /reset-password

/dashboard
  ├── /appointments (calendar view)
  ├── /customers
  ├── /pos (point of sale)
  ├── /loyalty
  ├── /reports
  ├── /settings

/customer-portal
  ├── /book (public booking)
  ├── /profile (if logged in)
  ├── /my-bookings
  ├── /rewards
```

**Performance Priorities**
- Fast POS (should be <200ms to add item)
- Fast calendar loading (preload 2 weeks)
- Optimistic UI updates
- Minimal API calls
- Local caching with React Query

### 3.3 Backend Architecture

**Framework**: NestJS + TypeScript
**Database**: PostgreSQL (self-hosted)
**ORM**: TypeORM
**Authentication**: JWT + OAuth2 (Google/Apple)
**API**: RESTful + WebSocket (for real-time updates)

**Key Modules**
```
├── auth (login, register, SSO)
├── tenants (multi-tenancy management)
├── users (user management, roles)
├── customers (customer profiles, history)
├── appointments (booking, scheduling)
├── services (service catalog)
├── pos (payment, transactions)
├── loyalty (points, rewards)
├── staff (barber profiles, schedules)
├── inventory (products, stock)
├── reports (analytics, reporting)
├── notifications (email, WhatsApp, SMS)
├── payments (AbakatePay integration)
└── utils (middleware, helpers)
```

**Key Middleware**
- Tenant isolation (verify tenant_id in every request)
- Role-based access control (RBAC)
- Error handling
- Logging/monitoring
- Rate limiting

### 3.4 Database Schema (PostgreSQL)

```sql
-- Tenants (Multi-tenancy)
Tenants
├── id (UUID, PK)
├── slug (TEXT, UNIQUE) -- barber1
├── name (TEXT)
├── owner_id (FK → Users)
├── address (TEXT)
├── phone (TEXT)
├── pix_key (TEXT) -- for AbakatePay
├── logo_url (TEXT)
├── theme (JSONB) -- colors, branding
├── settings (JSONB) -- business hours, tax, etc.
├── subscription_tier (ENUM) -- FREE, BASIC, PRO, PREMIUM
├── subscription_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Users (Global, shared across tenants)
Users
├── id (UUID, PK)
├── email (TEXT, UNIQUE)
├── password_hash (TEXT)
├── name (TEXT)
├── phone (TEXT)
├── avatar_url (TEXT)
├── user_type (ENUM) -- BARBER, CLIENT, OWNER
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- TenantUsers (Junction: User belongs to Tenant with role)
TenantUsers
├── id (UUID, PK)
├── tenant_id (FK → Tenants)
├── user_id (FK → Users)
├── role (ENUM) -- OWNER, MANAGER, BARBER, RECEPTIONIST
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Customers
Customers
├── id (UUID, PK)
├── tenant_id (FK → Tenants)
├── user_id (FK → Users, nullable)
├── name (TEXT)
├── email (TEXT)
├── phone (TEXT)
├── gender (ENUM) -- M, F, OTHER
├── birthday (DATE)
├── notes (TEXT)
├── avatar_url (TEXT)
├── preferred_barber_id (FK → Barbers, nullable)
├── total_spent (DECIMAL)
├── visit_count (INTEGER)
├── last_visit (TIMESTAMP)
├── contact_preferences (JSONB) -- {whatsapp: true, email: true, sms: false}
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Barbers
Barbers
├── id (UUID, PK)
├── tenant_id (FK → Tenants)
├── user_id (FK → Users)
├── bio (TEXT)
├── rating (DECIMAL) -- 0-5 stars
├── commission_percentage (DECIMAL) -- optional
├── working_hours (JSONB) -- {mon: {start: "09:00", end: "18:00"}, ...}
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Services
Services
├── id (UUID, PK)
├── tenant_id (FK → Tenants)
├── name (TEXT)
├── description (TEXT)
├── price (DECIMAL)
├── duration_minutes (INTEGER)
├── category (ENUM) -- HAIR, BEARD, COMBO, PRODUCT
├── icon_url (TEXT)
├── active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- BarberServices (Junction: Barber offers Service)
BarberServices
├── id (UUID, PK)
├── barber_id (FK → Barbers)
├── service_id (FK → Services)
├── custom_price (DECIMAL, nullable) -- override price
├── custom_duration (INTEGER, nullable)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Appointments
Appointments
├── id (UUID, PK)
├── tenant_id (FK → Tenants)
├── barber_id (FK → Barbers)
├── customer_id (FK → Customers)
├── service_id (FK → Services)
├── scheduled_start (TIMESTAMP)
├── scheduled_end (TIMESTAMP)
├── status (ENUM) -- SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
├── payment_status (ENUM) -- PENDING, COMPLETED, FAILED
├── payment_id (FK → Payments, nullable)
├── reminder_sent_at (TIMESTAMP, nullable)
├── notes (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Payments (Transactions)
Payments
├── id (UUID, PK)
├── tenant_id (FK → Tenants)
├── appointment_id (FK → Appointments, nullable)
├── customer_id (FK → Customers)
├── amount (DECIMAL)
├── currency (CHAR(3)) -- BRL, USD, etc.
├── status (ENUM) -- PENDING, COMPLETED, FAILED, REFUNDED
├── method (ENUM) -- CASH, CARD, PIX, TRANSFER
├── provider_transaction_id (TEXT) -- AbakatePay reference
├── items (JSONB) -- [{type: 'service', id: '...', amount: 100}, {type: 'product', id: '...', amount: 50}]
├── discount_amount (DECIMAL)
├── tip_amount (DECIMAL)
├── tax_amount (DECIMAL)
├── receipt_url (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- LoyaltyPoints
LoyaltyPoints
├── id (UUID, PK)
├── tenant_id (FK → Tenants)
├── customer_id (FK → Customers)
├── balance (INTEGER) -- current points
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- LoyaltyTransactions
LoyaltyTransactions
├── id (UUID, PK)
├── tenant_id (FK → Tenants)
├── customer_id (FK → Customers)
├── points (INTEGER) -- positive (earned) or negative (redeemed)
├── type (ENUM) -- EARNED, REDEEMED, ADJUSTED
├── reference_id (UUID) -- appointment_id or reward_id
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- LoyaltyRewards
LoyaltyRewards
├── id (UUID, PK)
├── tenant_id (FK → Tenants)
├── name (TEXT) -- "Free Haircut"
├── description (TEXT)
├── points_required (INTEGER)
├── reward_type (ENUM) -- SERVICE_DISCOUNT, CASH_DISCOUNT, FREE_SERVICE, PRODUCT
├── reward_value (DECIMAL) -- discount amount or service id
├── active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Products (Inventory)
Products
├── id (UUID, PK)
├── tenant_id (FK → Tenants)
├── name (TEXT)
├── description (TEXT)
├── sku (TEXT, UNIQUE per tenant)
├── quantity (INTEGER)
├── reorder_level (INTEGER)
├── purchase_cost (DECIMAL)
├── selling_price (DECIMAL)
├── category (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Reports (Pre-computed for performance)
DailyReports
├── id (UUID, PK)
├── tenant_id (FK → Tenants)
├── report_date (DATE)
├── revenue (DECIMAL)
├── appointments_completed (INTEGER)
├── appointments_noshow (INTEGER)
├── customers_served (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 3.5 Payment Integration (AbakatePay)

**Flow**
```
Client initiates payment
  ↓
Backend creates payment request to AbakatePay
  ↓
AbakatePay returns payment details (QR code for PIX, form for Card)
  ↓
Frontend displays QR code or card form
  ↓
Customer completes payment
  ↓
AbakatePay webhook notifies backend
  ↓
Backend marks appointment as CONFIRMED
  ↓
Send confirmation to customer
```

**Webhook Handling**
- Validate webhook signature
- Update payment status
- Update appointment status
- Send confirmation email/WhatsApp
- Update loyalty points

### 3.6 Notification Service

**Architecture**
```
NestJS Notification Module
  ├── WhatsApp (Twilio/MessageBird)
  ├── Email (SendGrid/AWS SES)
  └── SMS (Twilio/MessageBird)

Queue System (Bull/RabbitMQ)
  ├── Appointment reminders (scheduled jobs)
  ├── Marketing messages
  └── Notifications (async processing)
```

**Scheduled Jobs**
- 24 hours before appointment: Send reminder
- 2 hours before: Send final reminder
- Birthday: Send birthday offer
- Inactive customer: Send come-back offer

### 3.7 Infrastructure (Coolify)

**Services**
```
Coolify (Docker Orchestration)
├── React Frontend (Node.js container)
├── NestJS Backend (Node.js container)
├── PostgreSQL (Container + persistent volume)
├── Redis (for caching, sessions, queue)
├── MinIO (S3-compatible storage for images)
└── Reverse Proxy (Nginx)
```

**Deployment**
- Single server or cluster
- Docker Compose for development
- CI/CD with GitHub Actions
- Environment variables for config
- Health checks on all services

---

## 4. Detailed Feature Specifications

### 4.1 Smart Reminder & Auto-Rescheduling System

**State Machine for Appointments**
```
SCHEDULED (24h before)
  ├─ Send reminder (WhatsApp primary, email backup)
  │
WAITING_CONFIRMATION (24h - 2h before)
  ├─ Customer confirms → CONFIRMED
  ├─ Customer declines → RELEASED_SLOT
  └─ No response (2h before) → AUTO_RELEASED
      ├─ Try to fill from waitlist
      └─ Notify backup customers
```

**Confirmation Link**
- Unique, short-lived link in reminder message
- "Confirm" button (valid 24 hours)
- "Decline" button
- Click tracking for analytics

**Auto-Release Logic**
```javascript
// Every hour, find appointments 2h away with no confirmation
const appointmentsNeedingConfirmation = await Appointments.find({
  status: 'WAITING_CONFIRMATION',
  scheduled_start: Between(now + 1.5h, now + 2.5h),
  reminder_sent_at: LessThan(now - 1.5h)
});

for (const appt of appointmentsNeedingConfirmation) {
  // Release slot
  await appt.updateStatus('RELEASED');

  // Notify waitlist
  const waitlist = await Waitlist.findByService(appt.service_id);
  for (const waitlistEntry of waitlist) {
    // Send "slot available" message
    await notifications.send({
      customer: waitlistEntry.customer,
      message: `A spot just opened up for ${appt.service.name}! Book now: [link]`
    });
  }
}
```

**Benefits**
- Reduces no-shows by 80%
- Fills cancellations automatically
- Improves customer communication
- Barber always has a full schedule

---

### 4.2 Loyalty Program Mechanics

**Points Earning**
```
Transaction: R$100
  ├─ Points earned: 100 points (1 point per R$1)
  ├─ Updated balance: Customer had 50, now has 150
  └─ Notification sent: "You earned 100 points! 50 more to get a free haircut 💇"
```

**Reward Redemption**
```
Customer has 150 points
Barber shows "You can get a free haircut!" (costs 100 points)
Customer accepts
  ├─ 100 points deducted
  ├─ New balance: 50
  ├─ Service price set to R$0
  └─ Transaction completed, receipt shows "Redeemed reward"
```

**Retention Impact**
- Customers who earn rewards have 3x higher retention
- Average customer lifetime value increases 40%
- Encourages repeat visits

---

### 4.3 POS System Speed Optimization

**Critical**: POS must be fast for barbers
- Add item to transaction: <100ms
- Calculate total: instant
- Process payment: <2s
- Print receipt: <3s

**Optimization Strategies**
- Offline support (queue transactions when offline, sync when online)
- Cached customer/service list
- Preload common transactions
- Minimal re-renders (React.memo)
- Native payment buttons (no extra clicks)

---

### 4.4 Multi-Shop Management

**Shop Owner Can**
- Create multiple shops
- Invite barbers to specific shops
- View consolidated reports across shops
- Manage settings per shop
- See cross-shop trends

**Separate Data Per Shop**
- Customers, appointments, payments isolated
- Staff belongs to specific shop
- Services per shop
- Reports per shop (and consolidated)

**Implementation**
- JWT contains shop_id context
- Middleware validates shop access
- Queries filtered by shop_id
- Settings per shop

---

## 5. Success Metrics & KPIs

### 5.1 User Acquisition Metrics
- Monthly sign-ups (barbers)
- Monthly sign-ups (customers)
- Free trial conversion rate (target: 20%)
- Time to first booking (target: <24 hours)

### 5.2 Retention Metrics
- Monthly churn rate (target: <5%)
- Customer retention rate 30/60/90 days
- Repeat booking rate (target: 60%)
- Barber active usage rate

### 5.3 Operational Metrics
- Average bookings per barber per day
- No-show rate (target: <5% with reminders)
- Payment success rate (target: >98%)
- System uptime (target: 99.9%)

### 5.4 Financial Metrics
- MRR (Monthly Recurring Revenue)
- ARPU (Average Revenue Per User)
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- Gross margin (target: >70%)

### 5.5 Platform Engagement
- Daily active users
- Bookings per day
- Revenue per day
- Email open rate (reminders)
- WhatsApp engagement rate

---

## 6. Monetization Strategy

### 6.1 Pricing Tiers

**Tier 1: Starter (MVP Launch)**
- Free forever
- Limited to 30 appointments/month
- Basic reports
- No loyalty program
- 1 barber only
- Target: User acquisition

**Tier 2: Professional** ($49/month)
- Unlimited appointments
- Full features (loyalty, reminders, auto-rescheduling)
- Advanced reports
- 1-5 barbers
- Email + WhatsApp support
- Target: Early adopters

**Tier 3: Enterprise** ($149/month)
- All Pro features
- Unlimited barbers + multi-shop
- API access
- Custom integrations
- Dedicated support
- Target: Chains and enterprises

### 6.2 Revenue Model
- Subscription only (simplest)
- Optional: 2% commission on payments (Phase 2)
- Optional: Premium features add-on

### 6.3 Go-to-Market Strategy
1. Launch free tier for user acquisition
2. Feature showcases (testimonials from early barbers)
3. Content marketing (Instagram, TikTok with barber tips + Hora Certa)
4. Referral program (barber refers another = $5 credit)
5. Target Facebook/Instagram ads to barber shop owners

---

## 7. Development Roadmap

### Phase 1 (MVP) - 6 weeks
- Week 1-2: Infrastructure setup, database design, auth
- Week 2-3: Appointment booking + calendar
- Week 3-4: POS + payments
- Week 4-5: Loyalty program + staff management
- Week 5-6: Testing, UI polish, deployment

### Phase 2 - 4 weeks
- Week 1: Reminders + auto-rescheduling
- Week 2: Customer portal
- Week 3: Inventory + financial mgmt
- Week 4: Advanced reports

### Phase 3 - 6 weeks
- Multi-shop support
- Reviews system
- Promotions & coupons
- Analytics dashboard
- Customer mobile app

---

## 8. Risk Analysis & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Payment integration delays | High | Medium | Use sandbox early, pre-plan API calls |
| Barber adoption slow | High | Medium | Free tier, great UX, easy onboarding |
| Data loss/security breach | Critical | Low | PostgreSQL backups, HTTPS, encryption |
| Competition from existing solutions | Medium | High | Focus on simple UX + loyalty feature |
| High churn (missing features) | Medium | Medium | Clear roadmap communicated to users |
| Scalability issues | Medium | Low | Use PostgreSQL scalability features early |

---

## 9. Smart MVP Recommendation

**For fastest market entry with maximum value:**

**Phase 1 Core (Weeks 1-4)**
1. ✅ Customer Management (names, notes, history)
2. ✅ Appointments (booking, calendar, reschedule)
3. ✅ Services Management (prices, duration)
4. ✅ POS (add items, pay via PIX/Card)
5. ✅ Loyalty Points (simple: 1 point per R$1)
6. ✅ Basic Reports (daily revenue, no-shows)
7. ✅ Staff Profiles (who did the service)

**Not in MVP (do in Phase 2)**
- ❌ Automatic reminders (too complex, save for Phase 2)
- ❌ Customer portal (not critical day 1)
- ❌ Inventory (add in Phase 2)
- ❌ Advanced reports (Phase 2)
- ❌ Multi-shop (Phase 3)

**Why this works**
- Covers 80% of actual barber needs
- Can launch in 4 weeks
- Revenue-generating immediately
- Get user feedback before building reminder system
- Technical complexity is manageable

---

## 10. Success Criteria (MVP Launch)

- ✅ Barber can setup shop in <5 minutes
- ✅ Customer can book appointment in <2 minutes
- ✅ Payment processes successfully >98% of time
- ✅ Barber dashboard shows today's appointments
- ✅ POS calculates totals and accepts PIX/Card
- ✅ Loyalty points earned and redeemable
- ✅ Mobile responsiveness works on phones/tablets
- ✅ No critical bugs on main user flows
- ✅ First 10 paying customers acquired
- ✅ NPS score >40

---

## 11. Appendix: Detailed Feature Backlog

### High Priority (Phase 2)
- [ ] Appointment reminders (WhatsApp)
- [ ] Auto-rescheduling logic
- [ ] Waitlist management
- [ ] Customer portal
- [ ] Inventory tracking
- [ ] Financial reports
- [ ] WhatsApp integration

### Medium Priority (Phase 3)
- [ ] Multi-shop support
- [ ] Reviews & ratings
- [ ] Promotions system
- [ ] Advanced analytics
- [ ] Customer mobile app
- [ ] Team management improvements

### Nice-to-Have (Future)
- [ ] AI recommendations
- [ ] Accounting integration
- [ ] Video consultations
- [ ] Gift cards
- [ ] White label solution

---

## Notes for Implementation

**Technology Stack Confirmed**
- Frontend: React + TypeScript + Tailwind
- Backend: NestJS + TypeScript + PostgreSQL
- Payments: AbakatePay (PIX + Card)
- Hosting: Coolify (self-hosted)
- Messaging: WhatsApp (Phase 2) + Email
- Multi-tenancy: Database-per-row isolation

**Key Success Factors**
1. **Speed**: POS must be fast, calendar must load instantly
2. **Mobile**: Barbers use tablets/phones
3. **Simplicity**: Easy to use for non-tech barbers
4. **Reliability**: Payment processing must never fail
5. **Communication**: Reminders must actually reduce no-shows

