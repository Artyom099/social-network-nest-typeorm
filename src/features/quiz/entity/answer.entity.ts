import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {AnswerStatus} from '../../../infrastructure/utils/constants';
import {Question} from './question.entity';
import {Player} from './player.entity';

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
}