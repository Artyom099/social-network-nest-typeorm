import {LikeStatus} from '../../../../../infrastructure/utils/constants';

export type UpdatePostLikesModel = {
  postId: string;
  userId: string;
  likeStatus: LikeStatus;
  addedAt: Date,
  login: string;
}