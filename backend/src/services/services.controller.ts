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
  @ApiOperation({ summary: 'Create a new service' })
  @ApiCreatedResponse({
    description: 'Service created successfully',
    type: ServiceResponseDto,
  })
  async createService(
    @CurrentUser() user: User,
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.createService(
      user.id,
      createServiceDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all services' })
  @ApiOkResponse({
    description: 'Services retrieved successfully',
    type: [ServiceResponseDto],
  })
  async getServices(@CurrentUser() user: User): Promise<ServiceResponseDto[]> {
    return this.servicesService.getServices(user.id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active services only' })
  @ApiOkResponse({
    description: 'Active services retrieved successfully',
    type: [ServiceResponseDto],
  })
  async getActiveServices(
    @CurrentUser() user: User,
  ): Promise<ServiceResponseDto[]> {
    return this.servicesService.getActiveServices(user.id);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get services by category' })
  @ApiOkResponse({
    description: 'Services by category retrieved successfully',
    type: [ServiceResponseDto],
  })
  async getServicesByCategory(
    @CurrentUser() user: User,
    @Param('category') category: ServiceCategory,
  ): Promise<ServiceResponseDto[]> {
    return this.servicesService.getServicesByCategory(user.id, category);
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
    return this.servicesService.getServiceById(user.id, serviceId);
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
    return this.servicesService.updateService(
      user.id,
      serviceId,
      updateServiceDto,
    );
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
    return this.servicesService.toggleServiceStatus(user.id, serviceId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a service' })
  async deleteService(
    @CurrentUser() user: User,
    @Param('id') serviceId: string,
  ): Promise<void> {
    await this.servicesService.deleteService(user.id, serviceId);
  }
}
