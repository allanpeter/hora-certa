import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../database/entities/service.entity';
import { ServiceCategory } from '../common/enums';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async createService(
    tenantId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    const service = this.servicesRepository.create({
      ...createServiceDto,
      tenant_id: tenantId,
    });

    await this.servicesRepository.save(service);
    return this.mapToResponseDto(service);
  }

  async getServices(tenantId: string): Promise<ServiceResponseDto[]> {
    const services = await this.servicesRepository.find({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
    });

    return services.map((service) => this.mapToResponseDto(service));
  }

  async getServiceById(
    tenantId: string,
    serviceId: string,
  ): Promise<ServiceResponseDto> {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId, tenant_id: tenantId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.mapToResponseDto(service);
  }

  async updateService(
    tenantId: string,
    serviceId: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId, tenant_id: tenantId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Update only provided fields
    Object.assign(service, updateServiceDto);

    await this.servicesRepository.save(service);
    return this.mapToResponseDto(service);
  }

  async deleteService(
    tenantId: string,
    serviceId: string,
  ): Promise<{ message: string }> {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId, tenant_id: tenantId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    await this.servicesRepository.remove(service);
    return { message: 'Service deleted successfully' };
  }

  async getServicesByCategory(
    tenantId: string,
    category: ServiceCategory,
  ): Promise<ServiceResponseDto[]> {
    const services = await this.servicesRepository.find({
      where: { tenant_id: tenantId, category },
    });

    return services.map((service) => this.mapToResponseDto(service));
  }

  async getActiveServices(tenantId: string): Promise<ServiceResponseDto[]> {
    const services = await this.servicesRepository.find({
      where: { tenant_id: tenantId, active: true },
    });

    return services.map((service) => this.mapToResponseDto(service));
  }

  async toggleServiceStatus(
    tenantId: string,
    serviceId: string,
  ): Promise<ServiceResponseDto> {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId, tenant_id: tenantId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.active = !service.active;
    await this.servicesRepository.save(service);

    return this.mapToResponseDto(service);
  }

  private mapToResponseDto(service: Service): ServiceResponseDto {
    return {
      id: service.id,
      tenant_id: service.tenant_id,
      name: service.name,
      description: service.description,
      price: parseFloat(service.price.toString()),
      duration_minutes: service.duration_minutes,
      category: service.category,
      icon_url: service.icon_url,
      active: service.active,
      created_at: service.created_at,
      updated_at: service.updated_at,
    };
  }
}
