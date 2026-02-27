import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../base/tenant-base.entity';
import { AppointmentStatus, PaymentStatus } from '../../common/enums';
import { Tenant } from './tenant.entity';
import { Barber } from './barber.entity';
import { Customer } from './customer.entity';
import { Service } from './service.entity';

@Entity('appointments')
export class Appointment extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  barber_id: string;

  @Column({ type: 'uuid' })
  @Index()
  customer_id: string;

  @Column({ type: 'uuid' })
  service_id: string;

  @Column({ type: 'timestamp' })
  @Index()
  scheduled_start: Date;

  @Column({ type: 'timestamp' })
  scheduled_end: Date;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  @Index()
  status: AppointmentStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status: PaymentStatus;

  @Column({ type: 'uuid', nullable: true })
  payment_id: string;

  @Column({ type: 'timestamp', nullable: true })
  reminder_sent_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Barber)
  @JoinColumn({ name: 'barber_id' })
  barber: Barber;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
