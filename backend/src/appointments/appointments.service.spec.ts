import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Appointment } from '../database/entities/appointment.entity';
import { Customer } from '../database/entities/customer.entity';
import { Barber } from '../database/entities/barber.entity';
import { Service as BarberService } from '../database/entities/service.entity';
import { mockDataGenerators } from '../../test/utils';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let mockAppointmentRepository: any;
  let mockCustomerRepository: any;
  let mockBarberRepository: any;
  let mockServiceRepository: any;

  const mockAppointment = mockDataGenerators.appointment();
  const mockCustomer = mockDataGenerators.customer();
  const mockBarber = { ...mockDataGenerators.customer(), id: mockDataGenerators.barberId() };
  const mockService = mockDataGenerators.service();

  beforeEach(async () => {
    // Create mock repositories
    mockAppointmentRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockCustomerRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    mockBarberRepository = {
      findOne: jest.fn(),
    };

    mockServiceRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockAppointmentRepository,
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
        {
          provide: getRepositoryToken(Barber),
          useValue: mockBarberRepository,
        },
        {
          provide: getRepositoryToken(BarberService),
          useValue: mockServiceRepository,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  describe('createAppointment', () => {
    it('should create an appointment successfully', async () => {
      const dto = {
        customer_id: mockCustomer.id,
        barber_id: mockBarber.id,
        service_id: mockService.id,
        scheduled_start: new Date(Date.now() + 86400000),
      };

      mockBarberRepository.findOne.mockResolvedValue(mockBarber);
      mockServiceRepository.findOne.mockResolvedValue(mockService);
      mockAppointmentRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // No conflicts
      });
      mockAppointmentRepository.create.mockReturnValue(mockAppointment);
      mockAppointmentRepository.save.mockResolvedValue(mockAppointment);

      const result = await service.createAppointment('tenant-1', dto);

      expect(result).toEqual(mockAppointment);
      expect(mockAppointmentRepository.save).toHaveBeenCalled();
    });

    it('should throw error if barber not found', async () => {
      const dto = {
        customer_id: mockCustomer.id,
        barber_id: mockBarber.id,
        service_id: mockService.id,
        scheduled_start: new Date(Date.now() + 86400000),
      };

      mockBarberRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createAppointment('tenant-1', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if scheduling in the past', async () => {
      const dto = {
        customer_id: mockCustomer.id,
        barber_id: mockBarber.id,
        service_id: mockService.id,
        scheduled_start: new Date(Date.now() - 3600000), // 1 hour ago
      };

      mockBarberRepository.findOne.mockResolvedValue(mockBarber);
      mockServiceRepository.findOne.mockResolvedValue(mockService);

      await expect(
        service.createAppointment('tenant-1', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error on conflicting appointments', async () => {
      const dto = {
        customer_id: mockCustomer.id,
        barber_id: mockBarber.id,
        service_id: mockService.id,
        scheduled_start: new Date(Date.now() + 86400000),
      };

      mockBarberRepository.findOne.mockResolvedValue(mockBarber);
      mockServiceRepository.findOne.mockResolvedValue(mockService);
      mockAppointmentRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockAppointment), // Conflict found
      });

      await expect(
        service.createAppointment('tenant-1', dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAppointments', () => {
    it('should return list of appointments', async () => {
      mockAppointmentRepository.find.mockResolvedValue([mockAppointment]);

      const result = await service.getAppointments('tenant-1', {});

      expect(result).toEqual([mockAppointment]);
      expect(mockAppointmentRepository.find).toHaveBeenCalled();
    });

    it('should filter appointments by status', async () => {
      mockAppointmentRepository.find.mockResolvedValue([mockAppointment]);

      const result = await service.getAppointments('tenant-1', {
        status: 'CONFIRMED',
      });

      expect(result).toEqual([mockAppointment]);
      expect(mockAppointmentRepository.find).toHaveBeenCalled();
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel an appointment', async () => {
      const cancelledAppointment = { ...mockAppointment, status: 'CANCELLED' };

      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
      mockAppointmentRepository.save.mockResolvedValue(cancelledAppointment);

      const result = await service.cancelAppointment(mockAppointment.id, 'tenant-1');

      expect(result.status).toBe('CANCELLED');
      expect(mockAppointmentRepository.save).toHaveBeenCalled();
    });

    it('should throw error if appointment not found', async () => {
      mockAppointmentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.cancelAppointment('invalid-id', 'tenant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
