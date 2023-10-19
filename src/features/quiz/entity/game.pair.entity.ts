import {Column, Entity, ManyToMany, PrimaryGeneratedColumn} from 'typeorm';
import {GamePairStatus} from '../../../infrastructure/utils/constants';
import {Question} from './question.entity';

@Entity()
export class GamePair {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  firstPlayerId: string;
  @Column()
  secondPlayerId: string;
  @Column()
  status: GamePairStatus;
  @Column()
  pairCreatedDate: Date;
  @Column()
  startGameDate: Date;
  @Column()
  finishGameDate: Date;

  @ManyToMany(() => Question, q => q.gamePairs)
  questions: Question[];
}