import {Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
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
  @Column({ nullable: true })
  startGameDate: Date;
  @Column({ nullable: true })
  finishGameDate: Date;

  // @ManyToMany(() => Answer, a => a.game_pairs)
  // @JoinColumn()
  // answers: Answer[];

  @ManyToMany(() => Question, q => q.game_pairs)
  @JoinTable()
  questions: Question[];

  @OneToOne(() => Player, pl => pl.game_pair)
  @JoinColumn()
  first_player: Player[];
  @Column()
  firstPlayerId: string;

  @OneToOne(() => Player, pl => pl.game_pair)
  @JoinColumn()
  second_player: Player[];
  @Column({ nullable: true })
  secondPlayerId: string;
}