import { Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class TenantBaseEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;
}
