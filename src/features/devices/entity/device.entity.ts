import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Users} from '../../users/entity/user.entity';

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

  @ManyToOne(() => Users, u => u.devices)
  user: Users;
}