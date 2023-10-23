import {GamePairStatus} from '../../../../../infrastructure/utils/constants';

export type CreateGamePairDTO = {
  status: GamePairStatus;
  pairCreatedDate: Date;
  // startGameDate: Date;
  // finishGameDate: Date;
  // questionsId: string[];
  firstPlayerId: string;
  // secondPlayerId: string;
}