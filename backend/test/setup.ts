import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Setup global test timeout
jest.setTimeout(30000);

// Mock environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/hora_certa_test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// Suppress console logs in tests (optional)
global.console = {
  ...console,
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(),
};

afterAll(async () => {
  // Cleanup after all tests
  jest.clearAllMocks();
});
