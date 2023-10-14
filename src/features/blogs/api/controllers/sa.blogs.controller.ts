import {
  Body,
  Controller, Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param, Post,
  Put,
  Query, Req,
  UseGuards,
} from '@nestjs/common';
import {BlogsQueryRepository} from '../../infrastructure/blogs.query.repository';

import {BindBlogCommand} from '../../application/sa.use.cases/bind.blog.use.case';
import {BasicAuthGuard} from '../../../../infrastructure/guards/basic-auth.guard';
import {BlogsPaginationInput, DefaultPaginationInput} from '../../../../infrastructure/models/pagination.input.models';
import {BanBlogCommand} from '../../application/sa.use.cases/ban.blog.use.case';
import {CommandBus} from '@nestjs/cqrs';
import {BanBlogInputModel} from '../../../users/api/models/input/ban.blog.input.model';
import {BlogInputModel} from '../models/input/blog.input.model';
import {CreateBlogCommand} from '../../application/blogger.use.cases/create.blog.use.case';
import {UpdateBlogCommand} from '../../application/blogger.use.cases/update.blog.use.case';
import {BlogsService} from '../../application/blogs.service';
import {PostsService} from '../../../posts/application/posts.service';
import {PostInputModel} from '../../../posts/api/models/input/post.input.model';
import {CreatePostCommand} from '../../../posts/application/blogger.use.cases/create.post.use.case';
import {PostsQueryRepository} from '../../../posts/infrastructure/posts.query.repository';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class SABlogsController {
  constructor(
    private commandBus: CommandBus,
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(@Req() req, @Query() query: BlogsPaginationInput) {
    return this.blogsQueryRepository.getBlogsCurrentBlogger(req.userId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() inputModel: BlogInputModel) {
    return this.commandBus.execute(new CreateBlogCommand( inputModel));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Req() req,
    @Param('id') blogId: string,
    @Body() inputModel: BlogInputModel,
  ) {
    const blog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!blog) throw new NotFoundException('blog not found');
    return this.commandBus.execute(new UpdateBlogCommand(blogId, inputModel));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Req() req, @Param('id') blogId: string) {
    const blog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!blog) throw new NotFoundException('blog not found');
    return this.blogsService.deleteBlog(blogId);
  }


  @Get(':id/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsCurrentBlog(
    @Req() req,
    @Param('id') blogId: string,
    @Query() query: DefaultPaginationInput,
  ) {
    const blog = await this.blogsQueryRepository.getBlog(blogId);
    if (!blog) {
      throw new NotFoundException('blog not found');
    } else {
      return this.postsQueryRepository.getPostsCurrentBlogForBlogger(
        req.userId,
        blogId,
        query,
      );
    }
  }

  @Post(':id/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostCurrentBlog(
    @Req() req,
    @Param('id') blogId: string,
    @Body() inputModel: PostInputModel,
  ) {
    const blog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!blog) {
      throw new NotFoundException('blog not found');
    } else {
      return this.commandBus.execute(new CreatePostCommand(blog, inputModel));
    }
  }

  @Put(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Req() req,
    @Param('id') blogId: string,
    @Param('postId') postId: string,
    @Body() inputModel: PostInputModel,
  ) {
    const blog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!blog) throw new NotFoundException('blog not found');

    const post = await this.postsQueryRepository.getPost(postId);
    if (!post) {
      throw new NotFoundException('post not found');
    } else {
      return this.postsService.updatePost(postId, inputModel);
    }
  }

  @Delete(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Req() req,
    @Param('id') blogId: string,
    @Param('postId') postId: string,
  ) {
    const blog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!blog) throw new NotFoundException('blog not found');

    const post = await this.postsQueryRepository.getPost(postId);
    if (!post) {
      throw new NotFoundException('post not found');
    } else {
      return this.postsService.deletePost(postId);
    }
  }






  @Put(':id/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindBlogWithUser(
    @Param('id') blogId: string,
    @Param('userId') userId: string,
  ) {
    const blog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!blog || blog.blogOwnerInfo) {
      throw new NotFoundException('blog not found');
    } else {
      return this.commandBus.execute(new BindBlogCommand(blogId, userId));
    }
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogBanStatus(
    @Param('id') blogId: string,
    @Body() inputModel: BanBlogInputModel,
  ) {
    const blog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!blog) {
      throw new NotFoundException('blog not found');
    } else {
      return this.commandBus.execute(
        new BanBlogCommand(blogId, inputModel.isBanned),
      );
    }
  }
}
