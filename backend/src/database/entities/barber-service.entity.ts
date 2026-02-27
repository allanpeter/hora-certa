import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Barber } from './barber.entity';
import { Service } from './service.entity';

@Entity('barber_services')
@Index(['barber_id', 'service_id'], { unique: true })
export class BarberService extends BaseEntity {
  @Column({ type: 'uuid' })
  barber_id: string;

  @Column({ type: 'uuid' })
  service_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  custom_price: number;

  @Column({ type: 'int', nullable: true })
  custom_duration: number;

  // Relations
  @ManyToOne(() => Barber)
  @JoinColumn({ name: 'barber_id' })
  barber: Barber;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
