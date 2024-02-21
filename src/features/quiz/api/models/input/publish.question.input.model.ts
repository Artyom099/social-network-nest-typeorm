import { IsBoolean, IsNotEmpty } from 'class-validator';

export class PublishQuestionInputModel {
  @IsBoolean()
  @IsNotEmpty()
  published: boolean;
}
