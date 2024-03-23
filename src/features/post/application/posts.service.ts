import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { PostInputModel } from '../api/models/input/post.input.model';
import { LikeStatus } from '../../../infrastructure/utils/enums';
import { UserQueryRepository } from '../../user/infrastructure/user.query.repository';
import { UpdatePostLikesModel } from '../api/models/dto/update.post.likes.model';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersQueryRepository: UserQueryRepository,
  ) {}

  //todo - переписать на use cases
  async updatePost(postId: string, inputModel: PostInputModel) {
    return this.postsRepository.updatePost(postId, inputModel);
  }
  async deletePost(postId: string) {
    return this.postsRepository.deletePost(postId);
  }

  async updatePostLikes(
    postId: string,
    userId: string,
    likeStatus: LikeStatus,
  ) {
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) return null;

    const dto: UpdatePostLikesModel = {
      postId,
      userId,
      likeStatus,
      addedAt: new Date(),
      login: user.login,
    };
    await this.postsRepository.setPostNone(dto);

    if (likeStatus !== LikeStatus.None) {
      return this.postsRepository.setPostReaction(dto);
    }
  }
}
