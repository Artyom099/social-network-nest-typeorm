import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {AnswerStatus} from '../../../infrastructure/utils/constants';
import {Question} from './question.entity';
import {Player} from './player.entity';
import {GamePair} from './game.pair.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  answer: string;
  @Column()
  answerStatus: AnswerStatus;
  @Column()
  addedAt: Date;

  @ManyToOne(() => Question, q => q.answers)
  @JoinColumn()
  question: Question;
  @Column()
  questionId: string;

  @OneToMany(() => Player, pl => pl.answers)
  @JoinColumn()
  player: Player;
  @Column()
  playerId: string;

  // @ManyToMany(() => GamePair, g => g.answers)
  // @JoinColumn()
  // game_pairs: GamePair[];
}