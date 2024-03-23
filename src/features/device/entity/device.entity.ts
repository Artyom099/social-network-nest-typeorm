import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../user/entity/user.entity';

@Entity()
export class Devices {
  @PrimaryGeneratedColumn('uuid')
  deviceId: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  lastActiveDate: Date;

  @ManyToOne(() => Users, (u) => u.devices)
  @JoinColumn({ name: 'userId' })
  userId: string;
}
