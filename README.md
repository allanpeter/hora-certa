# Hora Certa - Barber Shop Management SaaS

A comprehensive, intelligent barber shop management platform with appointment scheduling, payment processing, loyalty programs, and staff management.

**Status**: 🚧 In Development (MVP Phase)
**Live Demo**: Coming soon
**Documentation**: See [PRD.md](./PRD.md) for complete product specifications

---

## 📋 Quick Links

- [PRD (Product Requirements Document)](./PRD.md) - Complete feature specifications
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)

---

## 🎯 MVP Features (Phase 1)

- ✅ Customer management with visit history
- ✅ Appointment booking & calendar (day/week views)
- ✅ Point-of-sale with PIX & card payments
- ✅ Loyalty points program
- ✅ Staff profiles & roles
- ✅ Basic financial reports
- ✅ Mobile-responsive design
- ✅ Multi-tenant architecture

**Planned Features**:
- 🔄 Appointment reminders (WhatsApp/Email)
- 🔄 Automatic rescheduling
- 🔄 Customer portal
- 🔄 Inventory management

See [PRD.md](./PRD.md) for complete feature roadmap.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query + Zustand
- **UI Components**: Shadcn/ui
- **Build Tool**: Vite
- **Package Manager**: pnpm

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT + OAuth2
- **Payment**: AbakatePay API
- **Notifications**: Email (SendGrid), WhatsApp (Twilio)
- **Hosting**: Coolify (self-hosted)

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Coolify
- **Database**: PostgreSQL (self-hosted)
- **Caching**: Redis (optional)
- **Email**: SendGrid or AWS SES
- **File Storage**: MinIO or local

---

## 📁 Project Structure

```
hora-certa/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API calls
│   │   ├── store/             # State management
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # NestJS application
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/
│   │   │   ├── tenants/
│   │   │   ├── customers/
│   │   │   ├── appointments/
│   │   │   ├── services/
│   │   │   ├── pos/
│   │   │   ├── loyalty/
│   │   │   ├── payments/
│   │   │   ├── notifications/
│   │   │   └── reports/
│   │   ├── common/            # Shared modules
│   │   │   ├── middleware/
│   │   │   ├── guards/
│   │   │   ├── filters/
│   │   │   ├── pipes/
│   │   │   └── decorators/
│   │   ├── database/          # Database config & migrations
│   │   ├── config/            # Configuration
│   │   └── main.ts
│   ├── test/
│   ├── package.json
│   └── nest-cli.json
│
├── docker-compose.yml           # Local development stack
├── docker-compose.prod.yml      # Production stack
├── .env.example                 # Environment variables template
├── .env.production.example      # Production environment template
├── .gitignore
├── package.json                 # Monorepo root
├── PRD.md                       # Product specifications
└── README.md                    # This file
```

---

## 🚀 Development Setup

### Prerequisites

- **Node.js**: v18+
- **pnpm**: v8+ (recommended) or npm/yarn
- **Docker** & **Docker Compose** (for local database)
- **PostgreSQL**: v14+ (or use Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hora-certa.git
   cd hora-certa
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp .env.example .env

   # Update .env with your configuration
   # - Database credentials
   # - OAuth keys (Google, Apple)
   # - AbakatePay API keys
   # - Email service API key
   ```

4. **Start local services (PostgreSQL, Redis)**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   pnpm --filter backend run migration:run
   ```

6. **Start development servers**
   ```bash
   # Both frontend and backend
   pnpm dev

   # Or separately
   pnpm dev:frontend  # runs on http://localhost:5173
   pnpm dev:backend   # runs on http://localhost:3001
   ```

7. **Verify setup**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - API Docs: http://localhost:3001/api

### Docker Compose Services

```yaml
# Local development stack
- PostgreSQL (port 5432)
- Redis (port 6379)
- pgAdmin (port 5050) - database management UI
```

Access pgAdmin at http://localhost:5050

---

## 📖 Usage

### For Barbers (Shop Owners)

1. **Sign up** with email or OAuth
2. **Create shop workspace** (tenant)
3. **Add services** (haircut, beard, etc. with prices)
4. **Configure working hours**
5. **Add staff members** (barbers, receptionists)
6. **Start accepting bookings**
7. **Process payments** via POS
8. **View reports** to track revenue

### For Customers

1. **Browse barbers** and available times
2. **Book appointment** with preferred barber
3. **Pay via PIX or Card**
4. **Receive confirmation** email/WhatsApp
5. **View loyalty points** and redeem rewards
6. **Rate barber** after service (Phase 2)

---

## 🧪 Testing

### Run all tests
```bash
pnpm test
```

### Backend tests
```bash
pnpm test:backend
```

### Frontend tests
```bash
pnpm test:frontend
```

---

## 📦 Building for Production

### Build all services
```bash
pnpm build
```

### Build only frontend
```bash
pnpm build:frontend
```

### Build only backend
```bash
pnpm build:backend
```

### Deploy with Coolify

1. **Prepare environment**
   ```bash
   cp .env.production.example .env.production
   # Update with production values
   ```

2. **Build Docker images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

3. **Deploy via Coolify** (follow Coolify documentation)

---

## 🔐 Security Considerations

- JWT tokens for API authentication
- OAuth2 for user registration (Google, Apple)
- AbakatePay webhook signature verification
- Row-level security for multi-tenant isolation
- HTTPS enforced in production
- Environment variables for secrets
- Regular backups of PostgreSQL
- Rate limiting on sensitive endpoints

---

## 📊 API Documentation

API documentation available at:
- **Swagger UI**: http://localhost:3001/api
- **OpenAPI Spec**: http://localhost:3001/api-json

Key endpoints:
```
Authentication
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/google
  POST   /api/auth/apple
  POST   /api/auth/refresh

Appointments
  GET    /api/appointments
  POST   /api/appointments
  GET    /api/appointments/:id
  PATCH  /api/appointments/:id
  DELETE /api/appointments/:id

Customers
  GET    /api/customers
  POST   /api/customers
  GET    /api/customers/:id
  PATCH  /api/customers/:id

Services
  GET    /api/services
  POST   /api/services
  PATCH  /api/services/:id

POS
  POST   /api/transactions
  GET    /api/transactions
  GET    /api/transactions/:id

Loyalty
  GET    /api/loyalty/points
  POST   /api/loyalty/redeem

See Swagger UI for complete API documentation.
```

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

## 📝 License

This project is private and proprietary.

---

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: [PRD.md](./PRD.md)
- **Email**: support@horacerta.com (coming soon)

---

## 🗓️ Roadmap

**Phase 1 (MVP)** - Due: April 2026
- Core appointment booking
- POS with payments
- Loyalty program
- Basic reports

**Phase 2** - Due: May 2026
- Appointment reminders
- Auto-rescheduling
- Customer portal
- Inventory management

**Phase 3** - Due: June 2026
- Multi-shop support
- Advanced analytics
- Customer mobile app
- Reviews system

See [PRD.md](./PRD.md) for detailed roadmap.

---

## 📞 Contact

- **Portfolio**: https://yourportfolio.com
- **GitHub**: https://github.com/yourusername
- **LinkedIn**: https://linkedin.com/in/yourprofile

---

**Made with ❤️ for barbers**
