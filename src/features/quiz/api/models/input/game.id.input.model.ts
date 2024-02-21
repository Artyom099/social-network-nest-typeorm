import { IsNotEmpty, IsUUID } from 'class-validator';

export class GameIdInputModel {
  @IsUUID()
  @IsNotEmpty()
  gameId: string;
}
