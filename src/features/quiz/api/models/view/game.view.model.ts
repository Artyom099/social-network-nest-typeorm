import {AnswerStatus, GameStatus} from '../../../../../infrastructure/utils/enums';

export type GameViewModel = {
  id: string;
  firstPlayerProgress: firstPlayerProgressType,
  secondPlayerProgress: secondPlayerProgressType | null,
  questions: questionsType[] | null,
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