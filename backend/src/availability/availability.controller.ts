import {
  Controller,
  Get,
  Patch,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { AvailabilityService } from './availability.service';
import { UpdateWorkingHoursDto, AvailableSlotDto, AvailableSlotsRequestDto } from './dto/working-hours.dto';

@ApiTags('availability')
@Controller('availability')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Patch('barbers/:barberId/working-hours')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update barber working hours' })
  @ApiOkResponse({
    description: 'Working hours updated successfully',
  })
  async updateWorkingHours(
    @CurrentUser() user: User,
    @Param('barberId') barberId: string,
    @Body() updateWorkingHoursDto: UpdateWorkingHoursDto,
  ) {
    return this.availabilityService.updateWorkingHours(
      user.id,
      barberId,
      updateWorkingHoursDto,
    );
  }

  @Get('slots')
  @ApiOperation({ summary: 'Get available appointment slots' })
  @ApiOkResponse({
    description: 'Available slots retrieved successfully',
    type: [AvailableSlotDto],
  })
  async getAvailableSlots(
    @CurrentUser() user: User,
    @Query('date') date: string,
    @Query('barberId') barberId: string,
    @Query('serviceDuration') serviceDuration: string,
  ): Promise<AvailableSlotDto[]> {
    const request: AvailableSlotsRequestDto = {
      date,
      barber_id: barberId,
      service_duration_minutes: parseInt(serviceDuration, 10),
    };

    const slots = await this.availabilityService.getAvailableSlots(user.id, request);

    // Fill in barber_id for response
    return slots.map((slot) => ({
      ...slot,
      barber_id: barberId,
    }));
  }
}
