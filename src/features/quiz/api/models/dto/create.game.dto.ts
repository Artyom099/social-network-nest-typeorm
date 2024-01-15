import {GameStatus} from '../../../../../infrastructure/utils/enums';

export type CreateGameDto = {
  id: string;
  status: GameStatus;
  pairCreatedDate: Date;
  // startGameDate: Date;
  // finishGameDate: Date;
  // questionsId: string[];
  firstPlayerId: string;
  // secondPlayerId: string;
}