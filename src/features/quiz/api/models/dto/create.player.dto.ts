export type CreatePlayerDTO = {
  id: string;
  score: number;
  userId: string;
  login: string;
  answers: string[],
  gamePairId: string;
}