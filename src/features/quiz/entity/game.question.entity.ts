import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';
import { Question } from './question.entity';

@Entity()
export class GameQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  questionNumber: number;

  @ManyToOne(() => Game)
  game: Game;
  @Column()
  gameId: string;

  @ManyToOne(() => Question)
  question: Question;
  @Column({ nullable: true })
  questionId: string;
}
