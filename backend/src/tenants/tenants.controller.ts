import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { TenantUserRole } from '../common/enums';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new barber shop',
    description: 'Create a new barber shop (tenant). Current user becomes the owner.',
  })
  async createTenant(@CurrentUser() user: User, @Body() dto: CreateTenantDto) {
    return this.tenantsService.createTenant(user, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all my barber shops',
    description: 'Get all barber shops where the current user is a member',
  })
  async getMyTenants(@CurrentUser() user: User) {
    return this.tenantsService.getMyTenants(user.id);
  }

  @Get(':tenantId')
  @ApiOperation({
    summary: 'Get barber shop details',
    description: 'Get details of a specific barber shop',
  })
  async getTenantById(@Param('tenantId') tenantId: string) {
    return this.tenantsService.getTenantById(tenantId);
  }

  @Patch(':tenantId')
  @ApiOperation({
    summary: 'Update barber shop',
    description: 'Update barber shop details (owner only)',
  })
  async updateTenant(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.updateTenant(tenantId, user, dto);
  }

  /**
   * Staff Management Endpoints
   */

  @Post(':tenantId/staff')
  @ApiOperation({
    summary: 'Add staff member to barber shop',
    description: 'Add a barber, receptionist, or manager to your shop (owner or manager only)',
  })
  async addStaffMember(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: User,
    @Body() body: { email: string; role: TenantUserRole },
  ) {
    return this.tenantsService.addStaffMember(tenantId, user, body.email, body.role);
  }

  @Get(':tenantId/staff')
  @ApiOperation({
    summary: 'Get shop staff members',
    description: 'Get list of all staff members in the shop',
  })
  async getTenantStaff(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: User,
  ) {
    return this.tenantsService.getTenantStaff(tenantId, user);
  }

  @Patch(':tenantId/staff/:tenantUserId/role')
  @ApiOperation({
    summary: 'Update staff member role',
    description: 'Update a staff member role (owner only)',
  })
  async updateStaffRole(
    @Param('tenantId') tenantId: string,
    @Param('tenantUserId') tenantUserId: string,
    @CurrentUser() user: User,
    @Body() body: { role: TenantUserRole },
  ) {
    return this.tenantsService.updateStaffRole(tenantId, user, tenantUserId, body.role);
  }

  @Delete(':tenantId/staff/:tenantUserId')
  @ApiOperation({
    summary: 'Remove staff member',
    description: 'Remove a staff member from the shop (owner or manager only)',
  })
  async removeStaffMember(
    @Param('tenantId') tenantId: string,
    @Param('tenantUserId') tenantUserId: string,
    @CurrentUser() user: User,
  ) {
    return this.tenantsService.removeStaffMember(tenantId, user, tenantUserId);
  }
}
