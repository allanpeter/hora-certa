import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../base/base.entity';

@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column({ unique: true })
  @Index()
  slug: string;

  @Column()
  name: string;

  @Column({ type: 'uuid' })
  owner_id: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  pix_key: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ type: 'jsonb', nullable: true })
  theme: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ default: 'FREE' })
  subscription_tier: string;

  @Column({ default: true })
  subscription_active: boolean;
}
