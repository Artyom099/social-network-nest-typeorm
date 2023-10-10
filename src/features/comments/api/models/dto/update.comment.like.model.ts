import {LikeStatus} from '../../../../../infrastructure/utils/constants';

export type UpdateCommentLikeModel = {
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
}