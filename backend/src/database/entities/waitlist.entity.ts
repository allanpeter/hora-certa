import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../base/tenant-base.entity';
import { Tenant } from './tenant.entity';
import { Customer } from './customer.entity';
import { Service } from './service.entity';
import { Barber } from './barber.entity';

export enum WaitlistStatus {
  WAITING = 'WAITING',           // Customer is on waitlist
  OFFERED = 'OFFERED',           // Slot offered but not yet accepted
  CONFIRMED = 'CONFIRMED',       // Customer accepted offered slot
  CANCELLED = 'CANCELLED',       // Customer cancelled from waitlist
  NO_RESPONSE = 'NO_RESPONSE',   // Offer expired with no response
  FULFILLED = 'FULFILLED',       // Customer successfully booked from waitlist
}

@Entity('waitlists')
export class Waitlist extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  customer_id: string;

  @Column({ type: 'uuid' })
  @Index()
  barber_id: string;

  @Column({ type: 'uuid' })
  service_id: string;

  @Column({ type: 'enum', enum: WaitlistStatus, default: WaitlistStatus.WAITING })
  @Index()
  status: WaitlistStatus;

  @Column({ type: 'timestamp' })
  requested_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  slot_offered_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  slot_available_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  slot_confirmed_at: Date;

  @Column({ type: 'int' })
  position_in_queue: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  offered_slots: {
    start: string;
    end: string;
    expiresAt: string;
  }[];

  @Column({ type: 'uuid', nullable: true })
  resulting_appointment_id: string;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Barber)
  @JoinColumn({ name: 'barber_id' })
  barber: Barber;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
