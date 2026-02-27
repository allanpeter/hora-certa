import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../base/tenant-base.entity';
import { Tenant } from './tenant.entity';

@Entity('loyalty_rewards')
export class LoyaltyReward extends TenantBaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  points_required: number;

  @Column()
  reward_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  reward_value: number;

  @Column({ default: true })
  active: boolean;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
