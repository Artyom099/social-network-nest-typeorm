import { AnswerStatus } from '../../../../../infrastructure/utils/enums';

export type CreateAnswerDTO = {
  id: string;
  answer: string;
  answerStatus: AnswerStatus;
  questionId: string;
  playerId: string;
};
