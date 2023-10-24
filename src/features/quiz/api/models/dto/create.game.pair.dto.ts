import {GamePairStatus} from '../../../../../infrastructure/utils/constants';

export type CreateGamePairDTO = {
  id: string;
  status: GamePairStatus;
  pairCreatedDate: Date;
  // startGameDate: Date;
  // finishGameDate: Date;
  // questionsId: string[];
  firstPlayerId: string;
  // secondPlayerId: string;
}