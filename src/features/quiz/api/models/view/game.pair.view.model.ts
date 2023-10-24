import {AnswerStatus, GamePairStatus} from '../../../../../infrastructure/utils/constants';

export type GamePairViewModel = {
  id: string;
  firstPlayerProgress: PlayerProgressType,
  secondPlayerProgress: PlayerProgressType,
  questions: questionsType[],
  status: GamePairStatus;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
}

type questionsType = {
  id: string;
  body: string;
}

type PlayerProgressType = {
  answers: AnswersType[],
  player: PlayerType,
  score: number;
}
type PlayerType = {
  id: string;
  login: string;
}
type AnswersType = {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: Date | string;
}
// todo - addedAt: Date;