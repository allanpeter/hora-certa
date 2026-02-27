import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { ReschedulingService } from './rescheduling.service';

@ApiTags('rescheduling')
@Controller('rescheduling')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReschedulingController {
  constructor(private reschedulingService: ReschedulingService) {}

  @Post('waitlist')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add customer to waitlist',
    description:
      'Add to waitlist when preferred time slot is not available',
  })
  @ApiCreatedResponse({
    description: 'Customer added to waitlist',
  })
  @ApiBadRequestResponse({
    description: 'Customer already on waitlist',
  })
  async addToWaitlist(
    @CurrentUser() user: User,
    @Body()
    body: {
      barber_id: string;
      service_id: string;
      notes?: string;
    },
  ) {
    return this.reschedulingService.addToWaitlist(
      user.id,
      user.id, // Using user.id as customer_id for simplicity
      body.barber_id,
      body.service_id,
      body.notes,
    );
  }

  @Get('waitlist/:barber_id/:service_id')
  @ApiOperation({
    summary: 'Get waitlist position',
    description: 'Check if customer is on waitlist and their position',
  })
  @ApiOkResponse({
    description: 'Waitlist position details',
  })
  async getWaitlistPosition(
    @CurrentUser() user: User,
    @Param('barber_id') barberId: string,
    @Param('service_id') serviceId: string,
  ) {
    return this.reschedulingService.getWaitlistPosition(
      user.id,
      user.id,
      barberId,
      serviceId,
    );
  }

  @Delete('waitlist/:barber_id/:service_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove from waitlist',
    description: 'Remove customer from waitlist',
  })
  @ApiOkResponse({
    description: 'Removed from waitlist',
  })
  @ApiNotFoundResponse({
    description: 'Not on waitlist',
  })
  async removeFromWaitlist(
    @CurrentUser() user: User,
    @Param('barber_id') barberId: string,
    @Param('service_id') serviceId: string,
  ) {
    await this.reschedulingService.removeFromWaitlist(
      user.id,
      user.id,
      barberId,
      serviceId,
    );
    return { success: true, message: 'Removed from waitlist' };
  }

  @Post('waitlist/accept-offer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept offered slot from waitlist',
    description: 'Accept a slot offered to waitlist customer',
  })
  @ApiOkResponse({
    description: 'Slot accepted, appointment created',
  })
  @ApiBadRequestResponse({
    description: 'Offer expired or invalid',
  })
  async acceptOfferedSlot(
    @CurrentUser() user: User,
    @Body() body: { token?: string },
  ) {
    return this.reschedulingService.acceptOfferedSlot(
      user.id,
      user.id,
      body.token || '',
    );
  }

  @Post('waitlist/decline-offer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Decline offered slot',
    description: 'Decline offered slot and stay on waitlist',
  })
  @ApiOkResponse({
    description: 'Offer declined',
  })
  async declineOfferedSlot(@CurrentUser() user: User) {
    await this.reschedulingService.declineOfferedSlot(user.id, user.id);
    return { success: true, message: 'Offer declined' };
  }

  @Get('pending-confirmations')
  @ApiOperation({
    summary: 'Get appointments pending confirmation',
    description:
      'List appointments that need confirmation or will be auto-released',
  })
  @ApiOkResponse({
    description: 'List of appointments',
  })
  async getPendingConfirmations(@CurrentUser() user: User) {
    return this.reschedulingService.getAppointmentsNeedingConfirmation(user.id);
  }
}
