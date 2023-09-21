import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {CommandBus} from '@nestjs/cqrs';
import {BannedUsersPaginationInput} from '../../../../infrastructure/models/pagination.input.models';
import {UsersQueryRepository} from '../../infrastructure/users.query.repository';
import {BanUserCurrentBlogInputModel} from '../models/input/ban.user.current.blog.input.model';
import {
  BanUserForCurrentBlogCommand
} from '../../application/blogger.users.use.cases/ban.user.for.current.blog.use.case';
import {BearerAuthGuard} from '../../../../infrastructure/guards/bearer-auth.guard';
import {BlogsQueryRepository} from '../../../blogs/infrastructure/blogs.query.repository';
import {BannedUsersForBlogQueryRepository} from '../../infrastructure/banned.users.for.blog.query.repository';

@Controller('blogger/users')
@UseGuards(BearerAuthGuard)
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
    private usersQueryRepository: UsersQueryRepository,
    private blogsQueryRepository: BlogsQueryRepository,
    private bannedUsersForBlogQueryRepository: BannedUsersForBlogQueryRepository,
  ) {}

  @Get('blog/:id')
  @HttpCode(HttpStatus.OK)
  async getBannedUsers(
    @Req() req,
    @Param('id') blogId: string,
    @Query() query: BannedUsersPaginationInput,
  ) {
    const blog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!blog) throw new NotFoundException();

    if (req.userId !== blog.blogOwnerInfo.userId) {
      throw new ForbiddenException();
    } else {
      return this.bannedUsersForBlogQueryRepository.getBannedUsersForBlog(blogId, query);
    }
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUserBanStatus(
    @Req() req,
    @Param('id') userId: string,
    @Body() inputModel: BanUserCurrentBlogInputModel,
  ) {
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) throw new NotFoundException();

    try {
      const blog = await this.blogsQueryRepository.getBlogSA(inputModel.blogId);
      console.log({blog: blog});
      console.log({userId: req.userId});
      if (!blog || req.userId !== blog.blogOwnerInfo.userId) {
        throw new ForbiddenException();
      }
    } catch (e) {
      console.log({controller_1: e});
    }

    try {
      console.log('execute_1');
      return this.commandBus.execute(
        new BanUserForCurrentBlogCommand(userId, inputModel),
      );
    } catch (e) {
      console.log({controller_2: e});
    }
  }
}
