import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {PostsService} from '../application/posts.service';
import {DefaultPaginationInput} from '../../../infrastructure/models/pagination.input.models';
import {PostsQueryRepository} from '../infrastucture/posts.query.repository';
import {CommentsQueryRepository} from '../../comments/infrastructure/comments.query.repository';
import {BearerAuthGuard} from '../../../infrastructure/guards/bearer-auth.guard';
import {CommentInputModel} from '../../comments/api/models/input/comment.input.model';
import {CheckUserIdGuard} from '../../../infrastructure/guards/check-userId.guard';
import {UsersQueryRepository} from '../../users/infrastructure/users.query.repository';
import {CommandBus} from '@nestjs/cqrs';
import {CreateCommentCommand} from '../../comments/application/use.cases/create.comment.use.case';
import {LikeStatusInputModel} from '../../comments/api/models/input/like.status.input.model';
import {BlogsQueryRepository} from '../../blogs/infrastructure/blogs.query.repository';
import {BannedUsersForBlogQueryRepository} from '../../users/infrastructure/banned.users.for.blog.query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private usersQueryRepository: UsersQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private bannedUsersForBlogQueryRepository: BannedUsersForBlogQueryRepository,
  ) {}

  @Get()
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPosts(@Req() req, @Query() query: DefaultPaginationInput) {
    return this.postsQueryRepository.getPosts(req.userId, query);
  }

  @Get(':id')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPost(@Req() req, @Param('id') postId: string) {
    const post = await this.postsQueryRepository.getPost(postId, req.userId);
    if (!post) throw new NotFoundException('post not found');

    const blog = await this.blogsQueryRepository.getBlogSA(post.blogId);
    if (!blog || blog.banInfo.isBanned) {
      throw new NotFoundException('blog not found or banned');
    } else {
      return post;
    }
  }

  @Get(':id/comments')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getCommentsCurrentPost(
    @Req() req,
    @Param('id') postId: string,
    @Query() query: DefaultPaginationInput,
  ) {
    const post = await this.postsQueryRepository.getPost(postId);
    if (!post) {
      throw new NotFoundException('post not found');
    } else {
      return this.commentsQueryRepository.getCommentsCurrentPost(
        req.userId,
        postId,
        query,
      );
    }
  }

  @Post(':id/comments')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCommentCurrentPost(
    @Req() req,
    @Param('id') postId: string,
    @Body() inputModel: CommentInputModel,
  ) {
    const post = await this.postsQueryRepository.getPost(postId);
    const user = await this.usersQueryRepository.getUserById(req.userId);
    if (!post || !user) throw new NotFoundException('user or post not found');

    const isUserBannedForBlog =
      await this.bannedUsersForBlogQueryRepository.getBannedUserForBlog(user.id, post.blogId);
    if (isUserBannedForBlog) {
      throw new ForbiddenException();
    } else {
      const model = {
        postId,
        content: inputModel.content,
        userId: user.id,
      };
      return this.commandBus.execute(new CreateCommentCommand(model));
    }
  }

  @Put(':id/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Req() req,
    @Param('id') postId: string,
    @Body() inputModel: LikeStatusInputModel,
  ) {
    const post = await this.postsQueryRepository.getPost(postId);
    if (!post) {
      throw new NotFoundException('post not found');
    } else {
      return this.postsService.updatePostLikes(
        postId,
        req.userId,
        inputModel.likeStatus,
      );
    }
  }
}
