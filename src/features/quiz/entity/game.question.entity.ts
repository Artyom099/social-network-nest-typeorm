import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Game} from './game.entity';
import {Question} from './question.entity';

@Entity()
export class GameQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  questionNumber: number;

  @ManyToOne(() => Game)
  game: Game;

  @ManyToOne(() => Question)
  question: Question;
}