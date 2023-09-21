import {Injectable} from '@nestjs/common';
import {PostsRepository} from '../infrastucture/posts.repository';
import {PostInputModel} from '../api/models/input/post.input.model';
import {LikeStatus} from '../../../infrastructure/utils/constants';
import {UsersQueryRepository} from '../../users/infrastructure/users.query.repository';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  //todo - переписать на use cases
  async updatePost(postId: string, InputModel: PostInputModel) {
    return this.postsRepository.updatePost(postId, InputModel);
  }
  async deletePost(postId: string) {
    return this.postsRepository.deletePost(postId);
  }

  async updatePostLikes(postId: string, userId: string, likeStatus: LikeStatus,) {
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) return null;

    const updatePostLikesModel = {
      postId,
      userId,
      likeStatus,
      addedAt: new Date(),
      login: user.login,
    }
    await this.postsRepository.setPostNone(updatePostLikesModel)
    if (likeStatus !== LikeStatus.None) {
      return this.postsRepository.setPostReaction(updatePostLikesModel)
    }
  }
}
