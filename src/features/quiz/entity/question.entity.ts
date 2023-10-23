import {Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {GamePair} from './game.pair.entity';
import {Answer} from './answer.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  body: string;
  @Column()
  correctAnswers: string[];
  @Column()
  published: boolean;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;

  @ManyToMany(() => GamePair, g => g.questions)
  game_pairs: GamePair[];

  @OneToMany(() => Answer, a => a.question)
  answers: Answer[];
}