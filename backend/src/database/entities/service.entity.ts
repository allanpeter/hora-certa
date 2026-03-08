import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../base/tenant-base.entity';
import { ServiceCategory } from '../../common/enums';
import { Tenant } from './tenant.entity';

@Entity('services')
export class Service extends TenantBaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', nullable: true })
  duration_minutes: number | null;

  @Column({ type: 'enum', enum: ServiceCategory })
  category: ServiceCategory;

  @Column({ nullable: true })
  icon_url: string;

  @Column({ default: true })
  active: boolean;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
