import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { mockDataGenerators, generateTestToken } from './utils';

describe('Appointments API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let tenantId: string;
  let customerId: string;
  let barberId: string;
  let serviceId: string;
  let appointmentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Setup test data
    tenantId = mockDataGenerators.tenantId();
    customerId = mockDataGenerators.customerId();
    barberId = mockDataGenerators.barberId();
    serviceId = mockDataGenerators.serviceId();
    authToken = generateTestToken(customerId);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /appointments', () => {
    it('should create an appointment', async () => {
      const appointmentData = {
        barber_id: barberId,
        customer_id: customerId,
        service_id: serviceId,
        scheduled_start: new Date(Date.now() + 86400000).toISOString(),
        scheduled_end: new Date(Date.now() + 87000000).toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(appointmentData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('SCHEDULED');
      expect(response.body.barber_id).toBe(barberId);

      appointmentId = response.body.id;
    });

    it('should reject appointment in the past', async () => {
      const appointmentData = {
        barber_id: barberId,
        customer_id: customerId,
        service_id: serviceId,
        scheduled_start: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        scheduled_end: new Date(Date.now()).toISOString(),
      };

      await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(appointmentData)
        .expect(400);
    });

    it('should reject if unauthorized', async () => {
      const appointmentData = {
        barber_id: barberId,
        customer_id: customerId,
        service_id: serviceId,
        scheduled_start: new Date(Date.now() + 86400000).toISOString(),
        scheduled_end: new Date(Date.now() + 87000000).toISOString(),
      };

      await request(app.getHttpServer())
        .post('/appointments')
        .send(appointmentData)
        .expect(401);
    });
  });

  describe('GET /appointments', () => {
    it('should list appointments', async () => {
      const response = await request(app.getHttpServer())
        .get('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('total');
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/appointments?status=SCHEDULED')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by date range', async () => {
      const startDate = new Date(Date.now() + 86400000).toISOString();
      const endDate = new Date(Date.now() + 172800000).toISOString();

      const response = await request(app.getHttpServer())
        .get(`/appointments?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /appointments/:id', () => {
    it('should return appointment details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(appointmentId);
      expect(response.body.status).toBe('SCHEDULED');
    });

    it('should return 404 for non-existent appointment', async () => {
      await request(app.getHttpServer())
        .get('/appointments/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /appointments/:id/status', () => {
    it('should update appointment status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'CONFIRMED' })
        .expect(200);

      expect(response.body.status).toBe('CONFIRMED');
    });

    it('should reject invalid status transition', async () => {
      await request(app.getHttpServer())
        .patch(`/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'SCHEDULED' }) // Can't go back to SCHEDULED
        .expect(400);
    });
  });

  describe('DELETE /appointments/:id', () => {
    it('should cancel appointment', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('CANCELLED');
    });

    it('should return 404 for non-existent appointment', async () => {
      await request(app.getHttpServer())
        .delete('/appointments/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Conflict Detection', () => {
    it('should prevent double-booking same barber', async () => {
      // First appointment
      const apt1 = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          barber_id: barberId,
          customer_id: customerId,
          service_id: serviceId,
          scheduled_start: new Date(Date.now() + 86400000).toISOString(),
          scheduled_end: new Date(Date.now() + 87000000).toISOString(),
        })
        .expect(201);

      // Second overlapping appointment - should fail
      await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          barber_id: barberId,
          customer_id: customerId,
          service_id: serviceId,
          scheduled_start: new Date(Date.now() + 86400000 + 300000).toISOString(), // 5 min later (overlap)
          scheduled_end: new Date(Date.now() + 87000000 + 300000).toISOString(),
        })
        .expect(400);
    });
  });
});
