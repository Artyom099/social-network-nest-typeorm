import {AnswerStatus} from '../../../../../infrastructure/utils/constants';

export type AnswerViewModel = {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: Date;
}