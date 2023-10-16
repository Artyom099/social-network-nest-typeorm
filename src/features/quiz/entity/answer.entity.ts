import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {AnswerStatus} from '../../../infrastructure/utils/constants';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  answer: string;
  @Column()
  questionId: string;
  @Column()
  answerStatus: AnswerStatus;
  @Column()
  addedAt: Date;
}