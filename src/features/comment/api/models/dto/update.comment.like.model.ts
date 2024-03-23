import { LikeStatus } from '../../../../../infrastructure/utils/enums';

export type UpdateCommentLikeModel = {
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
};
