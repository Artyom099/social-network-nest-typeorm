import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {BloggerBlogsController} from './features/blogs/api/controllers/blogger.blogs.controller';
import {BlogsService} from './features/blogs/application/blogs.service';
import {BlogsRepository} from './features/blogs/infrastructure/blogs.repository';
import {PostsController} from './features/posts/api/posts.controller';
import {PostsService} from './features/posts/application/posts.service';
import {PostsRepository} from './features/posts/infrastucture/posts.repository';
import {TestController} from './features/test/test.controller';
import {TestRepository} from './features/test/test.repository';
import {CommentsController} from './features/comments/api/comments.controller';
import {CommentsRepository} from './features/comments/infrastructure/comments.repository';
import {MongooseModule} from '@nestjs/mongoose';
import {CommentsQueryRepository} from './features/comments/infrastructure/comments.query.repository';
import {PostsQueryRepository} from './features/posts/infrastucture/posts.query.repository';
import {BlogsQueryRepository} from './features/blogs/infrastructure/blogs.query.repository';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {Request, RequestSchema} from './infrastructure/guards/rate.limit/request.schema';
import {CqrsModule} from '@nestjs/cqrs';
import {BindBlogUseCase} from './features/blogs/application/sa.use.cases/bind.blog.use.case';
import {CreateBlogUseCase} from './features/blogs/application/blogger.use.cases/create.blog.use.case';
import {PublicBlogsController} from './features/blogs/api/controllers/public.blogs.controller';
import {SABlogsController} from './features/blogs/api/controllers/sa.blogs.controller';
import {CreatePostUseCase} from './features/posts/application/blogger.use.cases/create.post.use.case';
import {CreateCommentUseCase} from './features/comments/application/use.cases/create.comment.use.case';
import {BanBlogUseCase} from './features/blogs/application/sa.use.cases/ban.blog.use.case';
import {UpdateBlogUseCase} from './features/blogs/application/blogger.use.cases/update.blog.use.case';
import {BlogExistsConstraint} from './features/users/api/models/input/ban.user.current.blog.input.model';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UpdateCommentUseCase} from './features/comments/application/use.cases/update.comment.use.case';
import {Users} from './features/users/entity/user.entity';
import {BannedUsersForBlog} from './features/users/entity/banned.user.for.blog.entity';
import {Devices} from './features/devices/entity/device.entity';
import {Blogs} from './features/blogs/entity/blog.entity';
import {Posts} from './features/posts/entity/post.entity';
import {TypeOrmOptions} from './infrastructure/options/type-orm.options';
import {Comments} from './features/comments/entity/сomment.entity';
import {CommentLikes} from './features/comments/entity/comment.likes.entity';
import {PostLikes} from './features/posts/entity/post.likes.entity';
import {UpdateCommentLikesUseCase} from './features/comments/application/use.cases/update.comment.likes.use.case';
import {DeleteCommentUseCase} from './features/comments/application/use.cases/delete.comment.use.case';
import {BanUserUseCase} from './features/users/application/sa.users.use.cases/ban.user.use.case';
import {UnbanUserUseCase} from './features/users/application/sa.users.use.cases/unban.user.use.case';
import {DeleteUserUseCase} from './features/users/application/sa.users.use.cases/delete.user.use.case';
import {ConfirmEmailUseCase} from './features/auth/application/use.cases/confirm.email.use.case';
import {RegisterUserUseCase} from './features/auth/application/use.cases/register.user.use.case';
import {RefreshTokenUseCase} from './features/auth/application/use.cases/refresh.token.use.case';
import {UpdatePasswordUseCase} from './features/auth/application/use.cases/update.password.use.case';
import {SendRecoveryCodeUseCase} from './features/auth/application/use.cases/send.recovery.code.use.case';
import {CheckCredentialsUseCase} from './features/auth/application/use.cases/check.credentials.use.case';
import {CreateUserByAdminUseCase} from './features/users/application/sa.users.use.cases/create.user.use.case';
import {ResendConfirmationUseCase} from './features/auth/application/use.cases/resend.confirmation.use.case';
import {
  BanUserForCurrentBlogUseCase
} from './features/users/application/blogger.users.use.cases/ban.user.for.current.blog.use.case';
import {UpdateConfirmationCodeUseCase} from './features/auth/application/use.cases/update.confirmation.code.use.case';
import {JwtModule} from '@nestjs/jwt';
import {AuthController} from './features/auth/api/auth.controller';
import {SaUsersController} from './features/users/api/controllers/sa.users.controller';
import {BloggerUsersController} from './features/users/api/controllers/blogger.users.controller';
import {DevicesController} from './features/devices/api/devices.controller';
import {RequestService} from './infrastructure/services/request.service';
import {TokensService} from './infrastructure/services/tokens.service';
import {EmailAdapter} from './infrastructure/adapters/email.adapter';
import {EmailManager} from './infrastructure/services/email.manager';
import {HashService} from './infrastructure/services/hash.service';
import {UsersRepository} from './features/users/infrastructure/users.repository';
import {UsersQueryRepository} from './features/users/infrastructure/users.query.repository';
import {BannedUsersForBlogRepository} from './features/users/infrastructure/banned.users.for.blog.repository';
import {
  BannedUsersForBlogQueryRepository
} from './features/users/infrastructure/banned.users.for.blog.query.repository';
import {DevicesService} from './features/devices/application/devices.service';
import {DevicesRepository} from './features/devices/infrastructure/devices.repository';
import {DevicesQueryRepository} from './features/devices/infrastructure/devices.query.repository';

const useCases = [
  CreateBlogUseCase,
  BindBlogUseCase,
  BanBlogUseCase,
  CreatePostUseCase,
  CreateCommentUseCase,
  UpdateBlogUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentLikesUseCase,

  BanUserUseCase,
  UnbanUserUseCase,
  DeleteUserUseCase,
  ConfirmEmailUseCase,
  RegisterUserUseCase,
  RefreshTokenUseCase,
  UpdatePasswordUseCase,
  SendRecoveryCodeUseCase,
  CheckCredentialsUseCase,
  CreateUserByAdminUseCase,
  ResendConfirmationUseCase,
  BanUserForCurrentBlogUseCase,
  UpdateConfirmationCodeUseCase,
];

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({ global: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
      inject: [ConfigService]
    }),
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
    ]),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmOptions }),
    TypeOrmModule.forFeature([
      Users,
      BannedUsersForBlog,
      Devices,
      Blogs,
      Posts,
      PostLikes,
      Comments,
      CommentLikes,
    ])
  ],
  controllers: [
    AppController,
    TestController,
    AuthController,
    DevicesController,

    SaUsersController,
    BloggerUsersController,

    PublicBlogsController,
    BloggerBlogsController,
    SABlogsController,

    PostsController,
    CommentsController,
  ],
  providers: [
    ...useCases,

    AppService,
    TestRepository,

    EmailAdapter,
    EmailManager,
    HashService,
    TokensService,
    RequestService,

    UsersRepository,
    UsersQueryRepository,

    BannedUsersForBlogRepository,
    BannedUsersForBlogQueryRepository,

    DevicesService,
    DevicesRepository,
    DevicesQueryRepository,

    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogExistsConstraint,

    PostsService,
    PostsRepository,
    PostsQueryRepository,

    CommentsRepository,
    CommentsQueryRepository,
  ],
})
export class AppModule {}
