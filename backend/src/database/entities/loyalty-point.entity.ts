import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../base/tenant-base.entity';
import { Tenant } from './tenant.entity';
import { Customer } from './customer.entity';

@Entity('loyalty_points')
@Index(['tenant_id', 'customer_id'], { unique: true })
export class LoyaltyPoint extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  customer_id: string;

  @Column({ type: 'int', default: 0 })
  balance: number;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
