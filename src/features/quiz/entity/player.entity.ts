import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Users} from '../../users/entity/user.entity';
import {Answer} from './answer.entity';
import {Game} from './game.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  score: number;

  @ManyToOne(() => Users, u => u.players)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;
  @Column()
  login: string;

  @ManyToOne(() => Answer, a => a.player)
  @JoinColumn()
  answers: Answer[];

  @OneToOne(() => Game, { nullable: true })
  game: Game;
  @Column({ nullable: true })
  gameId: string;
}