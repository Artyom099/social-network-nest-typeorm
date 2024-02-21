import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class AnswerInputModel {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  answer: string;
}
