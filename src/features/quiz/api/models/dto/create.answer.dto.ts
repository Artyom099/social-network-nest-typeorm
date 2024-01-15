import {AnswerStatus} from '../../../../../infrastructure/utils/enums';

export type CreateAnswerDTO = {
  id: string;
  answer: string;
  answerStatus: AnswerStatus;
  addedAt: Date;
  questionId: string;
  playerId: string;
}