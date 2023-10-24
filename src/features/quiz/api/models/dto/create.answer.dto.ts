import {AnswerStatus} from '../../../../../infrastructure/utils/constants';

export type CreateAnswerDTO = {
  id: string;
  answer: string;
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: Date;
}