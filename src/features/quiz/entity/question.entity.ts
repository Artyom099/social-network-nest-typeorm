import {Column, Entity, JoinColumn, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {GamePair} from './game.pair.entity';
import {Answer} from './answer.entity';

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

  @ManyToMany(() => GamePair, g => g.questions)
  @JoinColumn()
  game_pairs: GamePair[];
  @Column()
  game_pair_id: string;

  @OneToMany(() => Answer, a => a.question)
  answers: Answer[];
}