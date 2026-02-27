import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../base/tenant-base.entity';
import { LoyaltyTransactionType } from '../../common/enums';
import { Tenant } from './tenant.entity';
import { Customer } from './customer.entity';

@Entity('loyalty_transactions')
export class LoyaltyTransaction extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  customer_id: string;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'enum', enum: LoyaltyTransactionType })
  type: LoyaltyTransactionType;

  @Column({ type: 'uuid', nullable: true })
  reference_id: string;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
