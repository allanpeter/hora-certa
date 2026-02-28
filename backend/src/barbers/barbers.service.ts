import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Barber } from '../database/entities/barber.entity';
import { User } from '../database/entities/user.entity';
import { Tenant } from '../database/entities/tenant.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { TenantUser } from '../database/entities/tenant-user.entity';
import { CreateBarberDto, UpdateBarberDto, BarberResponseDto, BarberStatsDto } from './dto';

@Injectable()
export class BarbersService {
  constructor(
    @InjectRepository(Barber) private barberRepository: Repository<Barber>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
    @InjectRepository(Appointment) private appointmentRepository: Repository<Appointment>,
    @InjectRepository(TenantUser) private tenantUserRepository: Repository<TenantUser>,
  ) {}

  /**
   * Get all barbers in a shop
   */
  async getBarbersInShop(shopId: string, includeStats: boolean = false): Promise<BarberResponseDto[]> {
    const barbers = await this.barberRepository.find({
      where: { tenant_id: shopId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    if (includeStats) {
      return Promise.all(
        barbers.map(async (barber) => this.mapBarberToResponse(barber, true)),
      );
    }

    return Promise.all(barbers.map((barber) => this.mapBarberToResponse(barber, false)));
  }

  /**
   * Get a specific barber
   */
  async getBarberById(barberId: string, shopId?: string): Promise<BarberResponseDto> {
    const query = this.barberRepository.createQueryBuilder('barber').where('barber.id = :id', { id: barberId });

    if (shopId) {
      query.andWhere('barber.tenant_id = :shopId', { shopId });
    }

    const barber = await query.leftJoinAndSelect('barber.user', 'user').getOne();

    if (!barber) {
      throw new NotFoundException('Barber not found');
    }

    return this.mapBarberToResponse(barber, false);
  }

  /**
   * Create a new barber profile (owner/manager only)
   */
  async createBarber(shopId: string, createBarberDto: CreateBarberDto, currentUserId: string): Promise<BarberResponseDto> {
    // Verify shop exists
    const shop = await this.tenantRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Verify requester is owner or manager
    const userRole = await this.tenantUserRepository.findOne({
      where: { tenant_id: shopId, user_id: currentUserId },
    });

    if (!userRole || (userRole.role !== 'OWNER' && userRole.role !== 'MANAGER')) {
      throw new ForbiddenException('Only owner or manager can add barbers');
    }

    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: createBarberDto.user_id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if barber already exists in this shop
    const existingBarber = await this.barberRepository.findOne({
      where: { tenant_id: shopId, user_id: createBarberDto.user_id },
    });

    if (existingBarber) {
      throw new BadRequestException('This user is already a barber in this shop');
    }

    // Create barber profile
    const barber = this.barberRepository.create({
      tenant_id: shopId,
      user_id: createBarberDto.user_id,
      bio: createBarberDto.bio,
      commission_percentage: createBarberDto.commission_percentage,
      working_hours: createBarberDto.working_hours,
    });

    const savedBarber = await this.barberRepository.save(barber);

    // Load user relation
    return this.getBarberById(savedBarber.id, shopId);
  }

  /**
   * Update barber profile
   */
  async updateBarber(barberId: string, shopId: string, updateBarberDto: UpdateBarberDto, currentUserId: string): Promise<BarberResponseDto> {
    // Verify requester is owner or manager
    const userRole = await this.tenantUserRepository.findOne({
      where: { tenant_id: shopId, user_id: currentUserId },
    });

    if (!userRole || (userRole.role !== 'OWNER' && userRole.role !== 'MANAGER')) {
      throw new ForbiddenException('Only owner or manager can update barber profiles');
    }

    // Get barber
    const barber = await this.barberRepository.findOne({
      where: { id: barberId, tenant_id: shopId },
    });

    if (!barber) {
      throw new NotFoundException('Barber not found');
    }

    // Update fields
    if (updateBarberDto.bio !== undefined) {
      barber.bio = updateBarberDto.bio;
    }
    if (updateBarberDto.commission_percentage !== undefined) {
      barber.commission_percentage = updateBarberDto.commission_percentage;
    }
    if (updateBarberDto.working_hours !== undefined) {
      barber.working_hours = updateBarberDto.working_hours;
    }

    await this.barberRepository.save(barber);
    return this.getBarberById(barberId, shopId);
  }

  /**
   * Delete a barber
   */
  async deleteBarber(barberId: string, shopId: string, currentUserId: string): Promise<{ success: boolean }> {
    // Verify requester is owner only
    const userRole = await this.tenantUserRepository.findOne({
      where: { tenant_id: shopId, user_id: currentUserId },
    });

    if (!userRole || userRole.role !== 'OWNER') {
      throw new ForbiddenException('Only owner can delete barbers');
    }

    const barber = await this.barberRepository.findOne({
      where: { id: barberId, tenant_id: shopId },
    });

    if (!barber) {
      throw new NotFoundException('Barber not found');
    }

    await this.barberRepository.remove(barber);
    return { success: true };
  }

  /**
   * Get barber statistics and performance metrics
   */
  async getBarberStats(barberId: string, shopId: string): Promise<BarberStatsDto> {
    const barber = await this.barberRepository.findOne({
      where: { id: barberId, tenant_id: shopId },
    });

    if (!barber) {
      throw new NotFoundException('Barber not found');
    }

    // Get all appointments for this barber with service details
    const appointments = await this.appointmentRepository.find({
      where: { barber_id: barberId, tenant_id: shopId },
      relations: ['service'],
    });

    const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');
    const totalAppointments = appointments.length;
    const noShowAppointments = appointments.filter((a) => a.status === 'NO_SHOW');

    // Calculate total revenue (sum of all completed appointment service prices)
    const totalRevenue = completedAppointments.reduce((sum, appointment) => {
      return sum + (appointment.service ? parseFloat(appointment.service.price.toString()) : 0);
    }, 0);

    // Get unique customers
    const uniqueCustomers = new Set(appointments.map((a) => a.customer_id));
    const totalCustomers = uniqueCustomers.size;

    // Calculate repeat customer rate
    const customerCounts = new Map<string, number>();
    appointments.forEach((a) => {
      const count = customerCounts.get(a.customer_id) || 0;
      customerCounts.set(a.customer_id, count + 1);
    });

    const repeatCustomers = Array.from(customerCounts.values()).filter((count) => count > 1).length;
    const repeatCustomerRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    // Calculate no-show rate
    const noShowRate = totalAppointments > 0 ? (noShowAppointments.length / totalAppointments) * 100 : 0;

    return {
      total_revenue: Math.round(totalRevenue * 100) / 100,
      appointments_completed: completedAppointments.length,
      appointments_total: totalAppointments,
      average_rating: barber.rating,
      repeat_customer_rate: Math.round(repeatCustomerRate * 100) / 100,
      no_show_rate: Math.round(noShowRate * 100) / 100,
      total_customers: totalCustomers,
    };
  }

  /**
   * Helper: Map Barber entity to response DTO
   */
  private async mapBarberToResponse(barber: Barber, includeStats: boolean = false): Promise<BarberResponseDto> {
    const response: BarberResponseDto = {
      id: barber.id,
      tenant_id: barber.tenant_id,
      user_id: barber.user_id,
      bio: barber.bio,
      rating: parseFloat(barber.rating.toString()),
      commission_percentage: barber.commission_percentage ? parseFloat(barber.commission_percentage.toString()) : null,
      working_hours: barber.working_hours,
      created_at: barber.created_at.toISOString(),
      updated_at: barber.updated_at.toISOString(),
    };

    // Add user data if relation is loaded
    if (barber.user) {
      response.user = {
        id: barber.user.id,
        name: barber.user.name,
        email: barber.user.email,
        avatar_url: barber.user.avatar_url,
      };
    }

    // Add stats if requested
    if (includeStats) {
      response.stats = await this.getBarberStats(barber.id, barber.tenant_id);
    }

    return response;
  }
}
