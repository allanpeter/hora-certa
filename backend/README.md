# Hora Certa Backend

NestJS backend for the Hora Certa barber shop management system.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Create .env file from template
cp ../.env.example .env

# Run database migrations
pnpm run migration:run

# Start development server
pnpm run start:dev
```

The API will be available at `http://localhost:3001`

### API Documentation

Once running, visit `http://localhost:3001/api` for Swagger documentation.

## Project Structure

```
src/
├── config/          # Configuration files
├── database/        # Database entities and migrations
├── modules/         # Feature modules
│   ├── auth/       # Authentication & OAuth
│   ├── customers/  # Customer management
│   ├── appointments/
│   ├── services/
│   ├── pos/        # Point of sale
│   ├── loyalty/    # Loyalty program
│   ├── payments/   # Payment integration
│   ├── reports/    # Analytics & reports
│   └── notifications/
├── common/         # Shared code
│   ├── middleware/
│   ├── guards/
│   ├── filters/
│   └── decorators/
└── main.ts         # Application entry point
```

## Scripts

- `pnpm run start:dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm run start:prod` - Run production build
- `pnpm run test` - Run unit tests
- `pnpm run test:cov` - Run tests with coverage
- `pnpm run lint` - Lint code
- `pnpm run format` - Format code with Prettier

## Database

### Migrations

Generate a new migration:
```bash
pnpm run migration:generate -- src/database/migrations/CreateUsersTable
```

Run migrations:
```bash
pnpm run migration:run
```

Revert last migration:
```bash
pnpm run migration:revert
```

## Development Tips

- API Documentation: http://localhost:3001/api
- Health check: http://localhost:3001/health
- Enable debug logging: `LOG_LEVEL=debug` in .env

## Authentication

- JWT-based authentication
- OAuth2 support (Google, Apple)
- Role-based access control (RBAC)
- Multi-tenant isolation

## Environment Variables

See `../.env.example` for complete list. Key variables:

```
DATABASE_URL=postgresql://user:pass@localhost/hora_certa_dev
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=development
```

## API Endpoints

See Swagger docs at `/api` for complete endpoint documentation.

Key modules:
- `/api/auth` - Authentication
- `/api/customers` - Customers
- `/api/appointments` - Appointments
- `/api/services` - Services
- `/api/pos` - Point of Sale
- `/api/loyalty` - Loyalty program
- `/api/payments` - Payments
- `/api/reports` - Reports

## Contributing

1. Follow NestJS best practices
2. Create modules for features
3. Write tests for new code
4. Keep controllers thin, business logic in services
5. Use DTOs for validation

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify credentials

### Port Already in Use
- Change PORT in .env
- Or kill process: `lsof -ti :3001 | xargs kill -9`

### Migration Issues
- Ensure database exists
- Run: `pnpm run migration:run`
- Check migration files in `src/database/migrations`
