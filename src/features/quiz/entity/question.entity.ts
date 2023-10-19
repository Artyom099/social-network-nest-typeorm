import {Column, Entity, ManyToMany, PrimaryGeneratedColumn} from 'typeorm';
import {GamePair} from './game.pair.entity';

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
  gamePairs: GamePair[];
}