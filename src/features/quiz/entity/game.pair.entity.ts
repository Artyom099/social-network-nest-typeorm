import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {GamePairStatus} from '../../../infrastructure/utils/constants';

@Entity()
export class GamePairEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()

  @Column()
  status: GamePairStatus;
  @Column()
  pairCreatedDate: Date;
  @Column()
  startGameDate: Date;
  @Column()
  finishGameDate: Date;
}