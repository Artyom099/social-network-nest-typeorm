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
import { PostsService } from '../application/posts.service';
import { DefaultPaginationInput } from '../../../infrastructure/pagination/pagination.input.models';
import { PostsQueryRepository } from '../infrastructure/posts.query.repository';
import { CommentsQueryRepository } from '../../comment/infrastructure/comments.query.repository';
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer-auth.guard';
import { CommentInputModel } from '../../comment/api/models/input/comment.input.model';
import { CheckUserIdGuard } from '../../../infrastructure/guards/check-userId.guard';
import { UserQueryRepository } from '../../user/infrastructure/user.query.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../../comment/application/use.cases/create.comment.use.case';
import { LikeStatusInputModel } from '../../comment/api/models/input/like.status.input.model';
import { BlogsQueryRepository } from '../../blog/infrastructure/blogs.query.repository';
import { BannedUsersForBlogQueryRepository } from '../../user/infrastructure/banned.users.for.blog.query.repository';
import { CreateCommentDto } from '../../comment/api/models/dto/create.comment.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private usersQueryRepository: UserQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private bannedUsersForBlogQueryRepository: BannedUsersForBlogQueryRepository,
  ) {}

  @Get()
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPosts(@Req() req: any, @Query() query: DefaultPaginationInput) {
    return this.postsQueryRepository.getPosts(req.userId, query);
  }

  @Get(':id')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPost(@Req() req: any, @Param('id') postId: string) {
    const post = await this.postsQueryRepository.getPost(postId, req.userId);
    if (!post) throw new NotFoundException('post not found');

    const blog = await this.blogsQueryRepository.getBlogSA(post.blogId);
    if (!blog || blog.banInfo.isBanned) {
      throw new NotFoundException('blog not found or banned');
    } else {
      return post;
    }
  }

  @Get(':id/comment')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getCommentsCurrentPost(
    @Req() req: any,
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

  @Post(':id/comment')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCommentCurrentPost(
    @Req() req: any,
    @Param('id') postId: string,
    @Body() body: CommentInputModel,
  ) {
    const post = await this.postsQueryRepository.getPost(postId);
    const user = await this.usersQueryRepository.getUserById(req.userId);
    if (!post || !user) throw new NotFoundException('user or post not found');

    const isUserBannedForBlog =
      await this.bannedUsersForBlogQueryRepository.getBannedUserForBlog(
        user.id,
        post.blogId,
      );
    if (isUserBannedForBlog) {
      throw new ForbiddenException();
    } else {
      const dto: CreateCommentDto = {
        postId,
        content: body.content,
        userId: user.id,
      };
      return this.commandBus.execute(new CreateCommentCommand(dto));
    }
  }

  @Put(':id/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Req() req: any,
    @Param('id') postId: string,
    @Body() body: LikeStatusInputModel,
  ) {
    const post = await this.postsQueryRepository.getPost(postId);
    if (!post) {
      throw new NotFoundException('post not found');
    } else {
      return this.postsService.updatePostLikes(
        postId,
        req.userId,
        body.likeStatus,
      );
    }
  }
}
