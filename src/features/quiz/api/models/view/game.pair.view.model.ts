import {AnswerStatus, GameStatus} from '../../../../../infrastructure/utils/constants';

export type GamePairViewModel = {
  id: string;
  firstPlayerProgress: firstPlayerProgressType,
  secondPlayerProgress: secondPlayerProgressType,
  gameQuestions: questionsType[] | null,
  status: GameStatus;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
}

type questionsType = {
  id: string;
  body: string;
}

type firstPlayerProgressType = {
  answers: AnswersType[],
  player: firstPlayerType,
  score: number;
}
type firstPlayerType = {
  id: string;
  login: string;
}

type secondPlayerProgressType = {
  answers: AnswersType[],
  player: secondPlayerType,
  score: number;
}
type secondPlayerType = {
  id: string | null;
  login: string | null;
}

type AnswersType = {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: Date | string;
}
// todo - addedAt: Date;