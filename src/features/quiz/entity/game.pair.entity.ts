import {Column, Entity, JoinColumn, ManyToMany, PrimaryGeneratedColumn} from 'typeorm';
import {GamePairStatus} from '../../../infrastructure/utils/constants';
import {Question} from './question.entity';
import {Users} from '../../users/entity/user.entity';

@Entity()
export class GamePair {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: GamePairStatus;
  @Column()
  pairCreatedDate: Date;
  @Column()
  startGameDate: Date;
  @Column()
  finishGameDate: Date;

  @ManyToMany(() => Question, q => q.game_pairs)
  @JoinColumn()
  questions: Question[];
  @Column()
  questionId: string;

  // @ManyToMany(() => Users, u => u.game_pairs)
  // @JoinColumn()
  // users: Users[];
  @Column()
  firstPlayerId: string;

  // @ManyToMany(() => Users, u => u.game_pair)
  // @JoinColumn()
  // users: Users[];
  @Column()
  secondPlayerId: string;
}