export enum LikeStatus {
  None = "None",
  Like = "Like",
  Dislike = "Dislike",
}
export enum SortDirection {
  asc = "asc",
  desc = "desc",
}
export enum SortBy {
  default = "createdAt",
  createdAt = "createdAt",
  login = "login",
  email = "email",
}
export enum BanStatus {
  banned = "banned",
  notBanned = "notBanned",
}
export enum AnswerStatus {
  correct = "Correct",
  incorrect = "Incorrect",
}
export enum GameStatus {
  pending = "PendingSecondPlayer",
  active = "Active",
  finished = "Finished",
}

export enum InternalCode {
  Success = 1,
  NotFound = 0,
  Forbidden = -1,
  Unauthorized = -2,
  Internal_Server = -3,
  Expired = -4,
}
export enum ApproachType {
  http = "selectHttpException",
  tcp = "selectTcpExceptions",
  qraphql = "selectGraphQLExceptions",
}
