import {Column, Entity, JoinColumn, ManyToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {GamePairStatus} from '../../../infrastructure/utils/constants';
import {Question} from './question.entity';
import {Users} from '../../users/entity/user.entity';
import {Player} from './player.entity';
import {Answer} from './answer.entity';

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

  // @ManyToMany(() => Answer, a => a.game_pairs)
  // @JoinColumn()
  // answers: Answer[];

  @ManyToMany(() => Question, q => q.game_pairs)
  @JoinColumn()
  questions: Question[];
  @Column()
  questionId: string;

  @OneToOne(() => Player, pl => pl.game_pair)
  @JoinColumn()
  first_player: Player[];
  @Column()
  firstPlayerId: string;

  @OneToOne(() => Player, pl => pl.game_pair)
  @JoinColumn()
  second_player: Player[];
  @Column()
  secondPlayerId: string;
}