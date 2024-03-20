import { IsNotEmpty, IsUUID } from 'class-validator';

export class QuestionIdInputModel {
  @IsUUID()
  @IsNotEmpty()
  questionId: string;
}
