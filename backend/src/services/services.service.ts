import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../database/entities/service.entity';
import { User } from '../database/entities/user.entity';
import { TenantUser } from '../database/entities/tenant-user.entity';
import { ServiceCategory } from '../common/enums';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(TenantUser)
    private tenantUserRepository: Repository<TenantUser>,
  ) {}

  private async verifyTenantAccess(user: User, tenantId: string): Promise<void> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: { user_id: user.id, tenant_id: tenantId },
    });

    if (!tenantUser) {
      throw new BadRequestException('You do not have access to this shop');
    }
  }

  async createService(
    user: User,
    createServiceDto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    // Verify user has access to the tenant
    await this.verifyTenantAccess(user, createServiceDto.tenant_id);

    const service = this.servicesRepository.create({
      ...createServiceDto,
    });

    await this.servicesRepository.save(service);
    return this.mapToResponseDto(service);
  }

  async getServices(user: User, tenantId: string): Promise<ServiceResponseDto[]> {
    // Verify user has access to the tenant
    await this.verifyTenantAccess(user, tenantId);

    const services = await this.servicesRepository.find({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
    });

    return services.map((service) => this.mapToResponseDto(service));
  }

  async getServiceById(user: User, serviceId: string): Promise<ServiceResponseDto> {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Verify user has access to the tenant
    await this.verifyTenantAccess(user, service.tenant_id);

    return this.mapToResponseDto(service);
  }

  async updateService(
    user: User,
    serviceId: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Verify user has access to the tenant
    await this.verifyTenantAccess(user, service.tenant_id);

    // Update only provided fields
    Object.assign(service, updateServiceDto);

    await this.servicesRepository.save(service);
    return this.mapToResponseDto(service);
  }

  async deleteService(user: User, serviceId: string): Promise<void> {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Verify user has access to the tenant
    await this.verifyTenantAccess(user, service.tenant_id);

    await this.servicesRepository.remove(service);
  }

  async getServicesByCategory(
    user: User,
    tenantId: string,
    category: ServiceCategory,
  ): Promise<ServiceResponseDto[]> {
    // Verify user has access to the tenant
    await this.verifyTenantAccess(user, tenantId);

    const services = await this.servicesRepository.find({
      where: { tenant_id: tenantId, category },
    });

    return services.map((service) => this.mapToResponseDto(service));
  }

  async getActiveServices(user: User, tenantId: string): Promise<ServiceResponseDto[]> {
    // Verify user has access to the tenant
    await this.verifyTenantAccess(user, tenantId);

    const services = await this.servicesRepository.find({
      where: { tenant_id: tenantId, active: true },
    });

    return services.map((service) => this.mapToResponseDto(service));
  }

  async toggleServiceStatus(
    user: User,
    serviceId: string,
  ): Promise<ServiceResponseDto> {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Verify user has access to the tenant
    await this.verifyTenantAccess(user, service.tenant_id);

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
