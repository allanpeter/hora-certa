import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../database/entities/tenant.entity';
import { TenantUser } from '../database/entities/tenant-user.entity';
import { User } from '../database/entities/user.entity';
import { TenantUserRole, UserType } from '../common/enums';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantResponseDto } from './dto/tenant-response.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantUser)
    private tenantUserRepository: Repository<TenantUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create a new barber shop (tenant)
   * Current user becomes the OWNER
   */
  async createTenant(
    currentUser: User,
    dto: CreateTenantDto,
  ): Promise<TenantResponseDto> {
    // Check if slug already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { slug: dto.slug },
    });

    if (existingTenant) {
      throw new ConflictException(`Slug "${dto.slug}" is already taken`);
    }

    // Create tenant with current user as owner
    const tenant = this.tenantRepository.create({
      ...dto,
      owner_id: currentUser.id,
    });

    const savedTenant = await this.tenantRepository.save(tenant);

    // Create tenant_user record linking user as OWNER
    await this.tenantUserRepository.save({
      tenant_id: savedTenant.id,
      user_id: currentUser.id,
      role: TenantUserRole.OWNER,
    });

    // Update user type to OWNER if not already
    if (currentUser.user_type !== UserType.OWNER) {
      await this.userRepository.update(currentUser.id, {
        user_type: UserType.OWNER,
      });
    }

    return this.formatTenantResponse(savedTenant);
  }

  /**
   * Get all tenants where user is a member (excluding soft-deleted)
   */
  async getMyTenants(userId: string): Promise<TenantResponseDto[]> {
    const tenantUsers = await this.tenantUserRepository.find({
      where: { user_id: userId },
      relations: ['tenant'],
    });

    // Filter out soft-deleted tenants
    return tenantUsers
      .filter((tu) => !tu.tenant.deleted_at)
      .map((tu) => this.formatTenantResponse(tu.tenant));
  }

  /**
   * Get single tenant by ID (excluding soft-deleted)
   */
  async getTenantById(tenantId: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant || tenant.deleted_at) {
      throw new NotFoundException(`Tenant not found`);
    }

    return this.formatTenantResponse(tenant);
  }

  /**
   * Get single tenant by slug (excluding soft-deleted)
   */
  async getTenantBySlug(slug: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findOne({
      where: { slug },
    });

    if (!tenant || tenant.deleted_at) {
      throw new NotFoundException(`Tenant not found`);
    }

    return this.formatTenantResponse(tenant);
  }

  /**
   * Update tenant (owner only)
   */
  async updateTenant(
    tenantId: string,
    currentUser: User,
    dto: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant not found`);
    }

    // Check if user is owner
    if (tenant.owner_id !== currentUser.id) {
      throw new BadRequestException('Only the shop owner can update shop details');
    }

    // Update fields
    Object.assign(tenant, dto);

    const updated = await this.tenantRepository.save(tenant);
    return this.formatTenantResponse(updated);
  }

  /**
   * Add a staff member (barber, receptionist, manager) to tenant
   * Only OWNER or MANAGER can add staff
   */
  async addStaffMember(
    tenantId: string,
    currentUser: User,
    staffEmail: string,
    role: TenantUserRole,
  ): Promise<{ message: string; tenant_user_id: string }> {
    // Verify tenant exists
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant not found`);
    }

    // Check if current user has permission
    const currentUserRole = await this.tenantUserRepository.findOne({
      where: { tenant_id: tenantId, user_id: currentUser.id },
    });

    if (!currentUserRole || (currentUserRole.role !== TenantUserRole.OWNER && currentUserRole.role !== TenantUserRole.MANAGER)) {
      throw new BadRequestException('Only owner or manager can add staff members');
    }

    // Find user by email
    const staffUser = await this.userRepository.findOne({
      where: { email: staffEmail },
    });

    if (!staffUser) {
      throw new BadRequestException(`User with email "${staffEmail}" not found. They must sign up first.`);
    }

    // Check if user is already a member
    const existingMembership = await this.tenantUserRepository.findOne({
      where: { tenant_id: tenantId, user_id: staffUser.id },
    });

    if (existingMembership) {
      throw new ConflictException(`User is already a member of this shop`);
    }

    // Add user to tenant with specified role
    const tenantUser = await this.tenantUserRepository.save({
      tenant_id: tenantId,
      user_id: staffUser.id,
      role,
    });

    // Update staff user type if necessary
    if (role === TenantUserRole.BARBER && staffUser.user_type === UserType.CLIENT) {
      await this.userRepository.update(staffUser.id, {
        user_type: UserType.BARBER,
      });
    }

    return {
      message: `${staffEmail} added as ${role}`,
      tenant_user_id: tenantUser.id,
    };
  }

  /**
   * Get staff members of a tenant
   */
  async getTenantStaff(
    tenantId: string,
    currentUser: User,
  ): Promise<Array<{ id: string; email: string; name: string; role: TenantUserRole; user_type: UserType }>> {
    // Verify user is member of tenant
    const membership = await this.tenantUserRepository.findOne({
      where: { tenant_id: tenantId, user_id: currentUser.id },
    });

    if (!membership) {
      throw new BadRequestException('You are not a member of this shop');
    }

    const tenantUsers = await this.tenantUserRepository.find({
      where: { tenant_id: tenantId },
      relations: ['user'],
    });

    return tenantUsers.map((tu) => ({
      id: tu.id,
      email: tu.user.email,
      name: tu.user.name,
      role: tu.role,
      user_type: tu.user.user_type,
    }));
  }

  /**
   * Remove a staff member from tenant
   */
  async removeStaffMember(
    tenantId: string,
    currentUser: User,
    tenantUserId: string,
  ): Promise<{ message: string }> {
    // Check current user permission
    const currentUserRole = await this.tenantUserRepository.findOne({
      where: { tenant_id: tenantId, user_id: currentUser.id },
    });

    if (!currentUserRole || (currentUserRole.role !== TenantUserRole.OWNER && currentUserRole.role !== TenantUserRole.MANAGER)) {
      throw new BadRequestException('Only owner or manager can remove staff members');
    }

    // Get tenant user to remove
    const tenantUser = await this.tenantUserRepository.findOne({
      where: { id: tenantUserId, tenant_id: tenantId },
    });

    if (!tenantUser) {
      throw new NotFoundException('Staff member not found');
    }

    // Cannot remove owner
    if (tenantUser.role === TenantUserRole.OWNER) {
      throw new BadRequestException('Cannot remove shop owner');
    }

    await this.tenantUserRepository.remove(tenantUser);

    return { message: 'Staff member removed' };
  }

  /**
   * Update staff member role
   */
  async updateStaffRole(
    tenantId: string,
    currentUser: User,
    tenantUserId: string,
    newRole: TenantUserRole,
  ): Promise<{ message: string; new_role: TenantUserRole }> {
    // Check current user permission (owner only)
    const currentUserRole = await this.tenantUserRepository.findOne({
      where: { tenant_id: tenantId, user_id: currentUser.id },
    });

    if (!currentUserRole || currentUserRole.role !== TenantUserRole.OWNER) {
      throw new BadRequestException('Only owner can update staff roles');
    }

    // Get tenant user
    const tenantUser = await this.tenantUserRepository.findOne({
      where: { id: tenantUserId, tenant_id: tenantId },
    });

    if (!tenantUser) {
      throw new NotFoundException('Staff member not found');
    }

    // Cannot change owner role
    if (tenantUser.role === TenantUserRole.OWNER) {
      throw new BadRequestException('Cannot change shop owner role');
    }

    tenantUser.role = newRole;
    await this.tenantUserRepository.save(tenantUser);

    return {
      message: `Staff role updated to ${newRole}`,
      new_role: newRole,
    };
  }

  /**
   * Soft delete a tenant (only if empty - only owner as member)
   */
  async deleteTenant(tenantId: string, currentUser: User): Promise<void> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if user is owner
    if (tenant.owner_id !== currentUser.id) {
      throw new BadRequestException('Only the shop owner can delete the shop');
    }

    // Check if shop is empty (only owner as member)
    const staffCount = await this.tenantUserRepository.count({
      where: { tenant_id: tenantId },
    });

    if (staffCount > 1) {
      throw new BadRequestException('Cannot delete shop with staff members. Remove all staff first.');
    }

    // Soft delete the tenant
    tenant.deleted_at = new Date();
    await this.tenantRepository.save(tenant);
  }

  /**
   * Check if user has permission for tenant action
   */
  async getUserTenantRole(tenantId: string, userId: string): Promise<TenantUserRole | null> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: { tenant_id: tenantId, user_id: userId },
    });

    return tenantUser?.role || null;
  }

  /**
   * Private method to format response
   */
  private formatTenantResponse(tenant: Tenant): TenantResponseDto {
    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      address: tenant.address,
      phone: tenant.phone,
      pix_key: tenant.pix_key,
      logo_url: tenant.logo_url,
      theme: tenant.theme,
      settings: tenant.settings,
      subscription_tier: tenant.subscription_tier,
      subscription_active: tenant.subscription_active,
      owner_id: tenant.owner_id,
      created_at: tenant.created_at,
      updated_at: tenant.updated_at,
    };
  }
}
