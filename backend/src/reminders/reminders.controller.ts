import {
  Controller,
  Get,
  Patch,
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
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RemindersService } from './reminders.service';

@ApiTags('reminders')
@Controller('reminders')
export class RemindersController {
  constructor(private remindersService: RemindersService) {}

  @Get('appointments/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get appointment reminder status' })
  @ApiOkResponse({
    description: 'Reminder status retrieved',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found',
  })
  async getReminderStatus(@Param('id') appointmentId: string) {
    return this.remindersService.getReminderStatus(appointmentId);
  }

  @Patch('appointments/:id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm appointment (via email link)',
    description:
      'Confirms appointment using token from reminder email. No authentication required.',
  })
  @ApiOkResponse({
    description: 'Appointment confirmed',
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired token',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found',
  })
  async confirmAppointment(
    @Param('id') appointmentId: string,
    @Query('token') token: string,
  ) {
    return this.remindersService.confirmAppointment(appointmentId, token);
  }

  @Patch('appointments/:id/decline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Decline/cancel appointment (via email link)',
    description:
      'Cancels appointment using token from reminder email. No authentication required.',
  })
  @ApiOkResponse({
    description: 'Appointment declined',
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired token',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found',
  })
  async declineAppointment(
    @Param('id') appointmentId: string,
    @Query('token') token: string,
  ) {
    return this.remindersService.declineAppointment(appointmentId, token);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get pending reminders',
    description:
      'List appointments that need reminders sent in the next 24 hours. Admin only.',
  })
  @ApiOkResponse({
    description: 'List of pending appointments',
  })
  async getPendingReminders() {
    // TODO: Add admin check
    return this.remindersService.getPendingReminders();
  }
}
