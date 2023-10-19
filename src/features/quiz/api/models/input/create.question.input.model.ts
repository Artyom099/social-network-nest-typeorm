import {IsArray, IsNotEmpty, IsString, Length} from 'class-validator';
import {Transform} from 'class-transformer';

export class CreateQuestionInputModel {
  @IsString()
  @IsNotEmpty()
  @Length(10, 500)
  @Transform(({ value }) => value?.trim())
  body: string;
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  correctAnswers: string[];
}