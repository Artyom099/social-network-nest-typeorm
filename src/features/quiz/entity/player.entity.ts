import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Users} from '../../users/entity/user.entity';
import {Answer} from './answer.entity';
import {GamePair} from './game.pair.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  score: number;

  @ManyToOne(() => Users, u => u.players)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;

  @ManyToOne(() => Answer, a => a.player)
  @JoinColumn()
  answers: Answer[];

  @OneToOne(() => GamePair)
  game_pair: GamePair;
  @Column()
  game_pair_id: string;
}