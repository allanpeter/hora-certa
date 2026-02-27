import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../base/tenant-base.entity';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';

@Entity('barbers')
export class Barber extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  commission_percentage: number;

  @Column({ type: 'jsonb', nullable: true })
  working_hours: Record<string, any>;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
