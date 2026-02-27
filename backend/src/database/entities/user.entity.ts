import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { UserType } from '../../common/enums';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  password_hash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ type: 'enum', enum: UserType })
  user_type: UserType;

  @Column({ nullable: true, unique: true })
  google_id: string;

  @Column({ default: false })
  email_verified: boolean;
}
