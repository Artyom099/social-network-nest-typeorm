import {LikeStatus} from '../../../../../infrastructure/utils/enums';

export type UpdatePostLikesModel = {
  postId: string;
  userId: string;
  likeStatus: LikeStatus;
  addedAt: Date,
  login: string;
}