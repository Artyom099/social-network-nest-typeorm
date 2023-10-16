export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}
export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}
export enum SortBy {
  default = 'createdAt',
  createdAt = 'createdAt',
  login = 'login',
  email = 'email',
}
export enum BanStatus {
  banned = 'banned',
  notBanned = 'notBanned',
}
export enum AnswerStatus {
  correct = 'Correct',
  incorrect = 'Incorrect',
}
export enum GamePairStatus {
  pending = 'PendingSecondPlayer',
  active = 'Active',
  finished = 'Finished',
}
