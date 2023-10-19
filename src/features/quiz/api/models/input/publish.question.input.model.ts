import {IsBoolean, IsNotEmpty} from 'class-validator';
import {Transform} from 'class-transformer';

export class PublishQuestionInputModel {
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  published: boolean;
}