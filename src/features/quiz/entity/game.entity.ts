import {Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {GamePairStatus} from '../../../infrastructure/utils/constants';
import {Question} from './question.entity';
import {Users} from '../../users/entity/user.entity';
import {Player} from './player.entity';
import {Answer} from './answer.entity';
import {GameQuestion} from './game.question.entity';

@Entity()
export class Game {
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

  @OneToOne(() => Player, pl => pl.game)
  @JoinColumn()
  firstPlayer: Player;
  @Column()
  firstPlayerId: string;

  @OneToOne(() => Player, pl => pl.game, { nullable: true })
  @JoinColumn()
  secondPlayer: Player | null;
  @Column({ nullable: true })
  secondPlayerId: string;

  @OneToMany(() => GameQuestion, gq => gq.game)
  @JoinTable()
  GameQuestions: GameQuestion[];
}