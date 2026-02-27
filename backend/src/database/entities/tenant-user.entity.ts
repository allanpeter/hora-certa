import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { TenantUserRole } from '../../common/enums';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';

@Entity('tenant_users')
@Index(['tenant_id', 'user_id'], { unique: true })
export class TenantUser extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;

  @Column({ type: 'uuid' })
  @Index()
  user_id: string;

  @Column({ type: 'enum', enum: TenantUserRole })
  role: TenantUserRole;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
