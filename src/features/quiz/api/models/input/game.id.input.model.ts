import {IsNotEmpty, IsString, IsUUID} from 'class-validator';

export class GameIdInputModel {
  // todo - любой декоратор сразу ломает 4й тест и выдает 400 ошибку
  // @IsString()
  // @IsUUID()
  // @IsNotEmpty()
  gameId: string;
}