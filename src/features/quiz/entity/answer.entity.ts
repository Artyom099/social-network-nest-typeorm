import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnswerStatus } from '../../../infrastructure/utils/enums';
import { Player } from './player.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  answer: string;
  @Column()
  answerStatus: AnswerStatus;
  @Column({ default: new Date() })
  addedAt: Date;

  // @ManyToOne(() => Question, q => q.answers)
  // @JoinColumn()
  // question: Question;
  @Column()
  questionId: string;

  @OneToMany(() => Player, (pl) => pl.answers)
  @JoinColumn()
  player: Player;
  @Column({ type: 'uuid' })
  playerId: string;
}
