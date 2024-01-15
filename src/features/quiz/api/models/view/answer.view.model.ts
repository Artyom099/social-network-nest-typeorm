import {AnswerStatus} from '../../../../../infrastructure/utils/enums';

export type AnswerViewModel = {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: Date;
}