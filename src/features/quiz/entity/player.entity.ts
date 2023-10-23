import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Users} from '../../users/entity/user.entity';
import {Answer} from './answer.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  score: number;

  // @OneToOne(() => Users, u => u.player)
  // @JoinColumn()
  // user: Users;
  // @Column()
  // userId: string;

  @ManyToOne(() => Answer, a => a.player)
  @JoinColumn()
  answers: Answer[];
}