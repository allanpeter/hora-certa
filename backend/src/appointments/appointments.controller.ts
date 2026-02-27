import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentResponseDto,
  ChangeAppointmentStatusDto,
} from './dto';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book a new appointment' })
  @ApiCreatedResponse({
    description: 'Appointment created successfully',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid appointment data (invalid times, service duration mismatch)',
  })
  @ApiNotFoundResponse({
    description: 'Barber or service not found',
  })
  @ApiConflictResponse({
    description: 'Time slot is not available',
  })
  async createAppointment(
    @CurrentUser() user: User,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.createAppointment(
      user.id,
      user.id, // tenant_id is user.id for now (single tenant per user)
      createAppointmentDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get appointments',
    description:
      'Get list of appointments. Barbers see all their appointments, customers see only their own.',
  })
  @ApiOkResponse({
    description: 'List of appointments',
    type: [AppointmentResponseDto],
  })
  async getAppointments(
    @CurrentUser() user: User,
    @Query('status') status?: string,
    @Query('barber_id') barberId?: string,
    @Query('customer_id') customerId?: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
  ): Promise<AppointmentResponseDto[]> {
    const filters = {
      status: status as any,
      barber_id: barberId,
      customer_id: customerId,
      from_date: fromDate ? new Date(fromDate) : undefined,
      to_date: toDate ? new Date(toDate) : undefined,
    };

    return this.appointmentsService.getAppointments(user.id, user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment details' })
  @ApiOkResponse({
    description: 'Appointment details',
    type: AppointmentResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found',
  })
  async getAppointmentById(
    @CurrentUser() user: User,
    @Param('id') appointmentId: string,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.getAppointmentById(
      appointmentId,
      user.id,
      user.id,
    );
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update appointment status',
    description: 'Only barber can update status. Valid transitions: SCHEDULED → CONFIRMED/CANCELLED, CONFIRMED → COMPLETED/NO_SHOW/CANCELLED',
  })
  @ApiOkResponse({
    description: 'Appointment status updated',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid status transition',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found',
  })
  async updateAppointmentStatus(
    @CurrentUser() user: User,
    @Param('id') appointmentId: string,
    @Body() dto: ChangeAppointmentStatusDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.updateAppointmentStatus(
      appointmentId,
      user.id,
      user.id,
      dto.status,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reschedule appointment',
    description: 'Customer or barber can reschedule to a different time slot',
  })
  @ApiOkResponse({
    description: 'Appointment rescheduled',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid new time or cannot reschedule this appointment',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found',
  })
  @ApiConflictResponse({
    description: 'New time slot is not available',
  })
  async rescheduleAppointment(
    @CurrentUser() user: User,
    @Param('id') appointmentId: string,
    @Body() dto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.rescheduleAppointment(
      appointmentId,
      user.id,
      user.id,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel appointment',
    description: 'Customer or barber can cancel SCHEDULED or CONFIRMED appointments',
  })
  @ApiOkResponse({
    description: 'Appointment cancelled',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Cannot cancel this appointment (already completed/cancelled)',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found',
  })
  async cancelAppointment(
    @CurrentUser() user: User,
    @Param('id') appointmentId: string,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.cancelAppointment(
      appointmentId,
      user.id,
      user.id,
    );
  }
}
