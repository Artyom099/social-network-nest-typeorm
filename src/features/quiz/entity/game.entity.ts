import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameStatus } from '../../../infrastructure/utils/enums';
import { Player } from './player.entity';
import { GameQuestion } from './game.question.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  status: GameStatus;
  @Column()
  pairCreatedDate: Date;
  @Column({ nullable: true })
  startGameDate: Date;
  @Column({ nullable: true })
  finishGameDate: Date;

  @OneToOne(() => Player, (pl) => pl.game, { onDelete: 'CASCADE' })
  @JoinColumn()
  firstPlayer: Player;
  @Column()
  firstPlayerId: string;

  @OneToOne(() => Player, (pl) => pl.game, { nullable: true })
  @JoinColumn()
  secondPlayer: Player | null;
  @Column({ nullable: true })
  secondPlayerId: string;

  @OneToMany(() => GameQuestion, (gq) => gq.game)
  @JoinTable()
  gameQuestions: string[];
}
