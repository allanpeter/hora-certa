import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Barber } from '../database/entities/barber.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { UpdateWorkingHoursDto, AvailableSlotDto, AvailableSlotsRequestDto } from './dto/working-hours.dto';
import { AppointmentStatus } from '../common/enums';

const BUFFER_MINUTES = 15; // Time between appointments

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Barber)
    private barbersRepository: Repository<Barber>,
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  async updateWorkingHours(
    tenantId: string,
    barberId: string,
    workingHoursDto: UpdateWorkingHoursDto,
  ): Promise<Barber> {
    const barber = await this.barbersRepository.findOne({
      where: { id: barberId, tenant_id: tenantId },
    });

    if (!barber) {
      throw new NotFoundException('Barber not found');
    }

    barber.working_hours = workingHoursDto;
    return this.barbersRepository.save(barber);
  }

  async getAvailableSlots(
    tenantId: string,
    request: AvailableSlotsRequestDto,
  ): Promise<AvailableSlotDto[]> {
    const barber = await this.barbersRepository.findOne({
      where: { id: request.barber_id, tenant_id: tenantId },
    });

    if (!barber) {
      throw new NotFoundException('Barber not found');
    }

    if (!barber.working_hours) {
      return [];
    }

    // Parse the date
    const date = new Date(request.date);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    // Get day of week (0=Sunday, 1=Monday, etc.)
    const dayOfWeek = date.getDay();
    const dayName = this.getDayName(dayOfWeek);

    // Get working hours for this day
    const dayHours = barber.working_hours[dayName.toLowerCase()];
    if (!dayHours) {
      return []; // Barber doesn't work this day
    }

    // Get existing appointments for this day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.appointmentsRepository.find({
      where: [
        {
          barber_id: request.barber_id,
          tenant_id: tenantId,
          status: AppointmentStatus.SCHEDULED,
          scheduled_start: date,
        },
        {
          barber_id: request.barber_id,
          tenant_id: tenantId,
          status: AppointmentStatus.CONFIRMED,
          scheduled_start: date,
        },
      ],
    });

    // Generate available slots
    const slots = this.generateSlots(
      date,
      dayHours,
      request.service_duration_minutes,
      appointments,
    );

    return slots;
  }

  private generateSlots(
    date: Date,
    dayHours: any,
    serviceDuration: number,
    appointments: Appointment[],
  ): AvailableSlotDto[] {
    const slots: AvailableSlotDto[] = [];

    // Convert working hours to minutes from start of day
    const startMinutes = dayHours.start_hour * 60 + dayHours.start_minute;
    const endMinutes = dayHours.end_hour * 60 + dayHours.end_minute;

    let currentMinutes = startMinutes;

    while (currentMinutes + serviceDuration <= endMinutes) {
      // Check if there's a lunch break
      if (dayHours.lunch_start_hour !== undefined) {
        const lunchStartMinutes = dayHours.lunch_start_hour * 60 + dayHours.lunch_start_minute;
        const lunchEndMinutes = dayHours.lunch_end_hour * 60 + dayHours.lunch_end_minute;

        // Skip if in lunch break
        if (currentMinutes >= lunchStartMinutes && currentMinutes < lunchEndMinutes) {
          currentMinutes = lunchEndMinutes;
          continue;
        }

        // Skip if appointment overlaps with lunch
        if (currentMinutes + serviceDuration > lunchStartMinutes && currentMinutes < lunchEndMinutes) {
          currentMinutes = lunchEndMinutes;
          continue;
        }
      }

      // Check if slot overlaps with existing appointments
      const slotStart = this.minutesToDateTime(date, currentMinutes);
      const slotEnd = this.minutesToDateTime(date, currentMinutes + serviceDuration);

      const hasConflict = appointments.some((apt) => {
        const aptStart = apt.scheduled_start.getTime();
        const aptEnd = apt.scheduled_end.getTime();
        const bufferStart = new Date(aptStart - BUFFER_MINUTES * 60 * 1000).getTime();
        const bufferEnd = new Date(aptEnd + BUFFER_MINUTES * 60 * 1000).getTime();

        return slotStart.getTime() < bufferEnd && slotEnd.getTime() > bufferStart;
      });

      if (!hasConflict) {
        slots.push({
          slot_start: slotStart.toISOString(),
          slot_end: slotEnd.toISOString(),
          barber_id: '', // Will be filled by controller
        });
      }

      currentMinutes += 30; // 30-minute intervals
    }

    return slots;
  }

  private minutesToDateTime(date: Date, minutes: number): Date {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const result = new Date(date);
    result.setHours(hours, mins, 0, 0);
    return result;
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayOfWeek];
  }
}
