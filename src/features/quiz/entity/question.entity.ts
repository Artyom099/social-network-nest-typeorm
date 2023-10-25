import {Column, Entity, JoinColumn, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Game} from './game.entity';
import {Answer} from './answer.entity';
import {GameQuestion} from './game.question.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  body: string;
  @Column({ type: 'character varying', array: true })
  correctAnswers: string[];
  @Column()
  published: boolean;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;

  @OneToMany(() => GameQuestion, gq => gq.question)
  gameQuestions: GameQuestion[];

  @OneToMany(() => Answer, a => a.question)
  answers: Answer[];
}