import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../base/tenant-base.entity';
import { Gender } from '../../common/enums';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';

@Entity('customers')
export class Customer extends TenantBaseEntity {
  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ type: 'uuid', nullable: true })
  preferred_barber_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_spent: number;

  @Column({ type: 'int', default: 0 })
  visit_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_visit: Date;

  @Column({ type: 'jsonb', nullable: true })
  contact_preferences: Record<string, any>;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
