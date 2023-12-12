import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
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
  @Column({ nullable: true })
  updatedAt: Date;

  @OneToMany(() => GameQuestion, gq => gq.question)
  gameQuestions: GameQuestion[];

  // @OneToMany(() => Answer, a => a.question)
  // answers: Answer[];
}