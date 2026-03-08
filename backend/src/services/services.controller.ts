import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { ServiceCategory } from '../common/enums';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';

@ApiTags('services')
@Controller('services')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new service for a shop' })
  @ApiCreatedResponse({
    description: 'Service created successfully',
    type: ServiceResponseDto,
  })
  async createService(
    @CurrentUser() user: User,
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.createService(user, createServiceDto);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'List all services for a shop' })
  @ApiOkResponse({
    description: 'Services retrieved successfully',
    type: [ServiceResponseDto],
  })
  async getServices(
    @CurrentUser() user: User,
    @Param('tenantId') tenantId: string,
  ): Promise<ServiceResponseDto[]> {
    return this.servicesService.getServices(user, tenantId);
  }

  @Get('tenant/:tenantId/active')
  @ApiOperation({ summary: 'Get active services only for a shop' })
  @ApiOkResponse({
    description: 'Active services retrieved successfully',
    type: [ServiceResponseDto],
  })
  async getActiveServices(
    @CurrentUser() user: User,
    @Param('tenantId') tenantId: string,
  ): Promise<ServiceResponseDto[]> {
    return this.servicesService.getActiveServices(user, tenantId);
  }

  @Get('tenant/:tenantId/category/:category')
  @ApiOperation({ summary: 'Get services by category for a shop' })
  @ApiOkResponse({
    description: 'Services by category retrieved successfully',
    type: [ServiceResponseDto],
  })
  async getServicesByCategory(
    @CurrentUser() user: User,
    @Param('tenantId') tenantId: string,
    @Param('category') category: ServiceCategory,
  ): Promise<ServiceResponseDto[]> {
    return this.servicesService.getServicesByCategory(user, tenantId, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiOkResponse({
    description: 'Service retrieved successfully',
    type: ServiceResponseDto,
  })
  async getServiceById(
    @CurrentUser() user: User,
    @Param('id') serviceId: string,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.getServiceById(user, serviceId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a service' })
  @ApiOkResponse({
    description: 'Service updated successfully',
    type: ServiceResponseDto,
  })
  async updateService(
    @CurrentUser() user: User,
    @Param('id') serviceId: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.updateService(user, serviceId, updateServiceDto);
  }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle service active status' })
  @ApiOkResponse({
    description: 'Service status toggled successfully',
    type: ServiceResponseDto,
  })
  async toggleServiceStatus(
    @CurrentUser() user: User,
    @Param('id') serviceId: string,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.toggleServiceStatus(user, serviceId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a service' })
  async deleteService(
    @CurrentUser() user: User,
    @Param('id') serviceId: string,
  ): Promise<void> {
    await this.servicesService.deleteService(user, serviceId);
  }
}
