import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../base/tenant-base.entity';
import { PaymentStatus, PaymentMethod } from '../../common/enums';
import { Tenant } from './tenant.entity';
import { Customer } from './customer.entity';

@Entity('payments')
export class Payment extends TenantBaseEntity {
  @Column({ type: 'uuid', nullable: true })
  appointment_id: string;

  @Column({ type: 'uuid' })
  @Index()
  customer_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'char', length: 3, default: 'BRL' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  @Index()
  status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ nullable: true })
  @Index()
  provider_transaction_id: string;

  @Column({ type: 'jsonb', nullable: true })
  items: Record<string, any>[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tip_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax_amount: number;

  @Column({ nullable: true })
  receipt_url: string;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
