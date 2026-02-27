import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';

/**
 * Create a test database module configuration
 */
export const createTestDatabaseModule = () => {
  return TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'test',
    password: process.env.DATABASE_PASSWORD || 'test',
    database: process.env.DATABASE_NAME || 'hora_certa_test',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: true,
    dropSchema: true,
    logging: false,
  });
};

/**
 * Create a configured test app
 */
export async function createTestApp(
  appModule: any,
): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [appModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

/**
 * Generate a test JWT token
 */
export function generateTestToken(userId: string, expiresIn = '7d'): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      email: `test-${userId}@example.com`,
      iat: Math.floor(Date.now() / 1000),
    }),
  ).toString('base64');

  // Note: This is a simplified mock. In tests, use JwtService from @nestjs/jwt
  return `${header}.${payload}.fake-signature`;
}

/**
 * Create request helper with auth
 */
export function createAuthenticatedRequest(app: INestApplication, token: string) {
  return request(app.getHttpServer())
    .set('Authorization', `Bearer ${token}`);
}

/**
 * Mock data generators
 */
export const mockDataGenerators = {
  userId: () => '550e8400-e29b-41d4-a716-446655440001',
  tenantId: () => '550e8400-e29b-41d4-a716-446655440010',
  customerId: () => '550e8400-e29b-41d4-a716-446655440002',
  barberId: () => '550e8400-e29b-41d4-a716-446655440003',
  serviceId: () => '550e8400-e29b-41d4-a716-446655440004',
  appointmentId: () => '550e8400-e29b-41d4-a716-446655440005',
  paymentId: () => '550e8400-e29b-41d4-a716-446655440006',

  user: () => ({
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'test@example.com',
    name: 'Test User',
    password_hash: 'hashed-password',
    user_type: 'CLIENT',
    email_verified: true,
    created_at: new Date(),
    updated_at: new Date(),
  }),

  customer: () => ({
    id: '550e8400-e29b-41d4-a716-446655440002',
    tenant_id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Test Customer',
    email: 'customer@example.com',
    phone: '11999999999',
    created_at: new Date(),
    updated_at: new Date(),
  }),

  appointment: () => ({
    id: '550e8400-e29b-41d4-a716-446655440005',
    tenant_id: '550e8400-e29b-41d4-a716-446655440010',
    barber_id: '550e8400-e29b-41d4-a716-446655440003',
    customer_id: '550e8400-e29b-41d4-a716-446655440002',
    service_id: '550e8400-e29b-41d4-a716-446655440004',
    scheduled_start: new Date(Date.now() + 86400000),
    scheduled_end: new Date(Date.now() + 87000000),
    status: 'SCHEDULED',
    payment_status: 'PENDING',
    created_at: new Date(),
    updated_at: new Date(),
  }),

  payment: () => ({
    id: '550e8400-e29b-41d4-a716-446655440006',
    tenant_id: '550e8400-e29b-41d4-a716-446655440010',
    appointment_id: '550e8400-e29b-41d4-a716-446655440005',
    amount: 150.00,
    status: 'PENDING',
    method: 'PIX',
    created_at: new Date(),
    updated_at: new Date(),
  }),

  service: () => ({
    id: '550e8400-e29b-41d4-a716-446655440004',
    tenant_id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Corte Masculino',
    description: 'Corte de cabelo masculino',
    price: 50.00,
    duration_minutes: 30,
    category: 'HAIR',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  }),
};

/**
 * Wait for async operations
 */
export async function waitFor(condition: () => boolean, timeout = 5000): Promise<void> {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('waitFor timeout');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
