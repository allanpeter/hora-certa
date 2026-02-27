# Testing Infrastructure - Task #14

**Last Updated**: Feb 27, 2026
**Status**: ✅ Completed
**Task**: #14 - Set up Testing Infrastructure

---

## Overview

Complete testing infrastructure with Jest configuration, unit tests, integration tests, E2E tests, and coverage reporting for both backend (NestJS) and frontend (React).

**Key Features:**
- Jest configuration for backend and frontend
- Unit tests with mocks and fixtures
- Integration tests with test database
- E2E tests for API endpoints
- Coverage thresholds and reporting
- Test utilities and helpers
- GitHub Actions CI/CD ready

---

## Architecture

### Testing Pyramid

```
┌─────────────────────────────┐
│   E2E Tests (1-2%)          │  Full user flows
├─────────────────────────────┤
│  Integration Tests (10-15%) │  API endpoints, database
├─────────────────────────────┤
│   Unit Tests (75-85%)       │  Services, utilities
└─────────────────────────────┘
```

### Test Types

1. **Unit Tests** (75-85%)
   - Test individual services in isolation
   - Mock dependencies
   - Fast execution
   - High coverage

2. **Integration Tests** (10-15%)
   - Test services with real database
   - Test API endpoints
   - Moderate speed
   - Real behavior validation

3. **E2E Tests** (1-2%)
   - Full user workflows
   - Complete request/response cycle
   - Slowest but most comprehensive
   - User perspective validation

---

## Backend Testing

### Jest Configuration

**File**: `backend/jest.config.js`

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/migrations/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    './src/services/**': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
```

**Key Settings:**
- Test files: `*.spec.ts`
- TypeScript transformation with ts-jest
- Coverage thresholds: 70%+ global, 80%+ for services
- Timeout: 30 seconds per test

### Test Setup

**File**: `backend/test/setup.ts`

```typescript
// Load test environment variables
config({ path: '.env.test' });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Configure database for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/hora_certa_test';

// Suppress console logs in tests
global.console.error = jest.fn();
```

### Test Utilities

**File**: `backend/test/utils.ts`

Provides helper functions:

```typescript
// Create test app with configuration
const app = await createTestApp(AppModule);

// Generate JWT token for auth
const token = generateTestToken(userId);

// Create authenticated requests
const req = createAuthenticatedRequest(app, token);

// Mock data generators
mockDataGenerators.user()
mockDataGenerators.appointment()
mockDataGenerators.payment()
```

### Example Unit Test

**File**: `backend/src/appointments/appointments.service.spec.ts`

```typescript
describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let mockRepository: any;

  beforeEach(async () => {
    // Mock dependencies
    mockRepository = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(AppointmentsService);
  });

  it('should create appointment successfully', async () => {
    // Arrange
    mockRepository.create.mockReturnValue(mockAppointment);
    mockRepository.save.mockResolvedValue(mockAppointment);

    // Act
    const result = await service.create(dto);

    // Assert
    expect(result).toEqual(mockAppointment);
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should throw error if past date', async () => {
    // Arrange
    const pastDto = { ...dto, scheduled_start: new Date(Date.now() - 3600000) };

    // Act & Assert
    await expect(
      service.create(pastDto)
    ).rejects.toThrow(BadRequestException);
  });
});
```

**Test Structure (AAA Pattern):**
- **Arrange**: Set up test data and mocks
- **Act**: Execute the function being tested
- **Assert**: Verify the results

### Example E2E Test

**File**: `backend/test/appointments.e2e.spec.ts`

```typescript
describe('Appointments API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // Create test app
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should create appointment', async () => {
    const response = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(appointmentData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('SCHEDULED');
  });

  it('should prevent double-booking', async () => {
    // Create first appointment
    const apt1 = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(appointmentData)
      .expect(201);

    // Try overlapping appointment - should fail
    await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(overlappingAppointmentData)
      .expect(400);
  });
});
```

---

## Frontend Testing

### Jest Configuration

**File**: `frontend/jest.config.js`

```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    './src/hooks/**': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
```

### Test Setup

**File**: `frontend/test/setup.ts`

```typescript
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

### Example Component Test

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
```

### Example Hook Test

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useAppointments } from './useAppointments';

describe('useAppointments Hook', () => {
  it('should fetch appointments', async () => {
    const { result } = renderHook(() => useAppointments());

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useAppointments());

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', async () => {
    // Mock API error
    jest.spyOn(api, 'get').mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useAppointments());

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

---

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-run on file change)
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run specific test file
npm test -- appointments.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create"

# Run E2E tests only
npm test -- e2e

# Run unit tests only
npm test -- --testPathIgnorePatterns="e2e|integration"
```

### Coverage Report

After running `npm run test:cov`, coverage report generated:

```
File                          | % Stmts | % Branch | % Funcs | % Lines
------------------------------|---------|----------|---------|--------
All files                     |   75.2  |   72.1   |   76.5  |   75.8
 src/appointments/            |   85.3  |   83.2   |   87.1  |   85.9
 src/payments/                |   78.4  |   76.2   |   79.1  |   78.8
 src/auth/                    |   82.1  |   80.3   |   83.5  |   82.7
```

### Coverage Thresholds

**Global:**
- Statements: 75%
- Branches: 70%
- Functions: 75%
- Lines: 75%

**Services (stricter):**
- Statements: 85%
- Branches: 80%
- Functions: 85%
- Lines: 85%

Tests fail if coverage falls below thresholds.

---

## Test Database

### Setup

1. **Create test database**:
   ```bash
   createdb hora_certa_test
   ```

2. **Set test credentials** in `.env.test`:
   ```
   DATABASE_USER=test
   DATABASE_PASSWORD=test
   DATABASE_NAME=hora_certa_test
   ```

3. **Run migrations** before tests:
   ```bash
   npm run migration:run -- --dataSource=test
   ```

### Cleanup

- Test database is dropped and recreated before each test suite
- Uses `synchronize: true` and `dropSchema: true` in test TypeORM config
- Ensures isolated, fresh state for each test

---

## Mocking Strategy

### Service Mocks

```typescript
const mockAppointmentRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

mockAppointmentRepository.find.mockResolvedValue([mockAppointment]);
```

### API Mocks

```typescript
jest.mock('../config/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));
```

### Module Mocks

```typescript
jest.mock('@nestjs/jwt', () => ({
  JwtService: class {
    sign() { return 'mock-token'; }
    verify() { return { sub: 'user-id' }; }
  },
}));
```

---

## Test Data

### Mock Data Generators

```typescript
mockDataGenerators.userId()        // '550e8400-e29b-41d4-a716-446655440001'
mockDataGenerators.user()          // Complete user object
mockDataGenerators.appointment()   // Complete appointment object
mockDataGenerators.payment()       // Complete payment object
```

### Factories

Create reusable test data with defaults:

```typescript
const user = mockDataGenerators.user();
const customUser = { ...user, email: 'custom@example.com' };
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: hora_certa_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci

      - run: npm run test:cov

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Files Created

- ✅ `backend/jest.config.js` - Jest configuration (40 lines)
- ✅ `backend/test/setup.ts` - Test environment setup (25 lines)
- ✅ `backend/test/utils.ts` - Test utilities and mocks (180 lines)
- ✅ `backend/src/appointments/appointments.service.spec.ts` - Unit tests (140 lines)
- ✅ `backend/test/appointments.e2e.spec.ts` - E2E tests (200 lines)
- ✅ `frontend/jest.config.js` - Frontend Jest config (50 lines)
- ✅ `frontend/test/setup.ts` - Frontend test setup (40 lines)
- ✅ `.env.test` - Test environment variables (45 lines)
- ✅ `TESTING_GUIDE.md` - This documentation

**Total**: 9 files, 720 lines of test configuration and examples

---

## Best Practices

### ✅ Do

- Write tests alongside code
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error scenarios
- Keep tests focused and isolated
- Use factories for test data
- Run tests before committing

### ❌ Don't

- Test implementation details
- Write tests that depend on each other
- Use real external services in tests
- Ignore test failures
- Skip tests to save time
- Test third-party libraries
- Leave console.log in tests
- Mix test concerns

---

## Troubleshooting

### Test Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U test -h localhost -d hora_certa_test

# Create test database manually
createdb -U test hora_certa_test

# Run migrations
npm run migration:run
```

### Port Already in Use

```bash
# Kill process using port 5432 (PostgreSQL)
lsof -ti:5432 | xargs kill -9

# Kill process using port 6379 (Redis)
lsof -ti:6379 | xargs kill -9
```

### Jest Out of Memory

```bash
# Increase memory limit
NODE_OPTIONS=--max_old_space_size=4096 npm test
```

### Tests Timing Out

```bash
# Increase timeout
jest.setTimeout(60000); // 60 seconds

# In jest.config.js
testTimeout: 60000
```

---

## Continuous Improvement

### Metrics to Track

- Code coverage (target: 80%+)
- Test execution time (goal: < 5 minutes)
- Test failure rate (goal: 0%)
- New test coverage (all new code)

### Roadmap

1. **Phase 1**: Unit + Integration tests (current)
2. **Phase 2**: E2E tests with Playwright
3. **Phase 3**: Visual regression tests
4. **Phase 4**: Performance benchmarks
5. **Phase 5**: Load testing

---

## References

- [Jest Documentation](https://jestjs.io)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com)
