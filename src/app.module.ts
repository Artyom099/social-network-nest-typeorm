import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggerBlogsController } from './features/blog/api/controllers/blogger.blogs.controller';
import { BlogsService } from './features/blog/application/blogs.service';
import { BlogsRepository } from './features/blog/infrastructure/blogs.repository';
import { PostsController } from './features/post/api/posts.controller';
import { PostsService } from './features/post/application/posts.service';
import { PostsRepository } from './features/post/infrastructure/posts.repository';
import { TestController } from './features/test/test.controller';
import { TestRepository } from './features/test/test.repository';
import { CommentsController } from './features/comment/api/comments.controller';
import { CommentsRepository } from './features/comment/infrastructure/comments.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsQueryRepository } from './features/comment/infrastructure/comments.query.repository';
import { PostsQueryRepository } from './features/post/infrastructure/posts.query.repository';
import { BlogsQueryRepository } from './features/blog/infrastructure/blogs.query.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  Request,
  RequestSchema,
} from './infrastructure/guards/rate.limit/request.schema';
import { CqrsModule } from '@nestjs/cqrs';
import { BindBlogUseCase } from './features/blog/application/sa.use.cases/bind.blog.use.case';
import { CreateBlogUseCase } from './features/blog/application/blogger.use.cases/create.blog.use.case';
import { PublicBlogsController } from './features/blog/api/controllers/public.blogs.controller';
import { SABlogsController } from './features/blog/api/controllers/sa.blogs.controller';
import { CreatePostUseCase } from './features/post/application/blogger.use.cases/create.post.use.case';
import { CreateCommentUseCase } from './features/comment/application/use.cases/create.comment.use.case';
import { BanBlogUseCase } from './features/blog/application/sa.use.cases/ban.blog.use.case';
import { UpdateBlogUseCase } from './features/blog/application/blogger.use.cases/update.blog.use.case';
import { BlogExistsConstraint } from './features/user/api/models/input/ban.user.current.blog.input.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateCommentUseCase } from './features/comment/application/use.cases/update.comment.use.case';
import { Users } from './features/user/entity/user.entity';
import { BannedUsersForBlog } from './features/user/entity/banned.user.for.blog.entity';
import { Devices } from './features/device/entity/device.entity';
import { Blogs } from './features/blog/entity/blog.entity';
import { Posts } from './features/post/entity/post.entity';
import { TypeOrmOptions } from './infrastructure/db/type.orm.options';
import { Comments } from './features/comment/entity/сomment.entity';
import { CommentLikes } from './features/comment/entity/comment.likes.entity';
import { PostLikes } from './features/post/entity/post.likes.entity';
import { UpdateCommentLikesUseCase } from './features/comment/application/use.cases/update.comment.likes.use.case';
import { DeleteCommentUseCase } from './features/comment/application/use.cases/delete.comment.use.case';
import { BanUserUseCase } from './features/user/application/sa.users.use.cases/ban.user.use.case';
import { UnbanUserUseCase } from './features/user/application/sa.users.use.cases/unban.user.use.case';
import { DeleteUserUseCase } from './features/user/application/sa.users.use.cases/delete.user.use.case';
import { ConfirmEmailUseCase } from './features/auth/application/use.cases/confirm.email.use.case';
import { RegisterUserUseCase } from './features/auth/application/use.cases/register.user.use.case';
import { RefreshTokenUseCase } from './features/auth/application/use.cases/refresh.token.use.case';
import { UpdatePasswordUseCase } from './features/auth/application/use.cases/update.password.use.case';
import { SendRecoveryCodeUseCase } from './features/auth/application/use.cases/send.recovery.code.use.case';
import { CheckCredentialsUseCase } from './features/auth/application/use.cases/check.credentials.use.case';
import { CreateUserByAdminUseCase } from './features/user/application/sa.users.use.cases/create.user.use.case';
import { ResendConfirmationUseCase } from './features/auth/application/use.cases/resend.confirmation.use.case';
import { BanUserForCurrentBlogUseCase } from './features/user/application/blogger.users.use.cases/ban.user.for.current.blog.use.case';
import { UpdateConfirmationCodeUseCase } from './features/auth/application/use.cases/update.confirmation.code.use.case';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './features/auth/api/auth.controller';
import { SaUsersController } from './features/user/api/controllers/sa.users.controller';
import { BloggerUsersController } from './features/user/api/controllers/blogger.users.controller';
import { DevicesController } from './features/device/api/devices.controller';
import { RequestService } from './infrastructure/services/request.service';
import { TokensService } from './infrastructure/services/tokens.service';
import { EmailAdapter } from './infrastructure/email/email.adapter';
import { EmailManager } from './infrastructure/email/email.manager';
import { HashService } from './infrastructure/services/hash.service';
import { UserRepository } from './features/user/infrastructure/user.repository';
import { UserQueryRepository } from './features/user/infrastructure/user.query.repository';
import { BannedUsersForBlogRepository } from './features/user/infrastructure/banned.users.for.blog.repository';
import { BannedUsersForBlogQueryRepository } from './features/user/infrastructure/banned.users.for.blog.query.repository';
import { DevicesService } from './features/device/application/devices.service';
import { DevicesRepository } from './features/device/infrastructure/devices.repository';
import { DevicesQueryRepository } from './features/device/infrastructure/devices.query.repository';
import { Question } from './features/quiz/entity/question.entity';
import { Answer } from './features/quiz/entity/answer.entity';
import { Game } from './features/quiz/entity/game.entity';
import { Player } from './features/quiz/entity/player.entity';
import { SAQuizController } from './features/quiz/api/controllers/sa.quiz.controller';
import { PlayerQuizController } from './features/quiz/api/controllers/player.quiz.controller';
import { QuizQueryRepository } from './features/quiz/infrastructure/quiz.query.repository';
import { QuizRepository } from './features/quiz/infrastructure/quiz.repository';
import { SAQuizRepository } from './features/quiz/infrastructure/sa.quiz.repository';
import { SAQuizQueryRepository } from './features/quiz/infrastructure/sa.quiz.query.repository';
import { CreateAnswerUseCase } from './features/quiz/application/player.use.cases/create.answer.use.case';
import { CreateGameUseCase } from './features/quiz/application/player.use.cases/create.game.use.case';
import { CreateQuestionUseCase } from './features/quiz/application/sa.use.cases/create.question.use.case';
import { UpdateQuestionUseCase } from './features/quiz/application/sa.use.cases/update.question.use.case';
import { DeleteQuestionUseCase } from './features/quiz/application/sa.use.cases/delete.question.use.case';
import { PublishQuestionUseCase } from './features/quiz/application/sa.use.cases/publish.question.use.case';
import { GameQuestion } from './features/quiz/entity/game.question.entity';
import { GameRepository } from './features/quiz/infrastructure/game.repository';
import { PlayerRepository } from './features/quiz/infrastructure/player.repository';
import { AppConfigModule } from './config/app-config.module';
import { AppConfig } from './config/app-config';

const entities = [
  Users,
  BannedUsersForBlog,
  Devices,
  Blogs,
  Posts,
  PostLikes,
  Comments,
  CommentLikes,

  Game,
  Player,
  Answer,
  Question,
  GameQuestion,
];

const useCases = [
  CreateGameUseCase,
  CreateAnswerUseCase,

  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  DeleteQuestionUseCase,
  PublishQuestionUseCase,

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

const repositories = [
  TestRepository,

  SAQuizRepository,
  SAQuizQueryRepository,
  QuizRepository,
  QuizQueryRepository,
  GameRepository,
  PlayerRepository,

  UserRepository,
  UserQueryRepository,

  BlogsRepository,
  BlogsQueryRepository,

  PostsRepository,
  PostsQueryRepository,

  CommentsRepository,
  CommentsQueryRepository,

  DevicesRepository,
  DevicesQueryRepository,

  BannedUsersForBlogRepository,
  BannedUsersForBlogQueryRepository,
];

const controllers = [
  SAQuizController,
  PlayerQuizController,

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
];

const services = [
  AppService,

  EmailAdapter,
  EmailManager,
  HashService,
  TokensService,
  RequestService,

  DevicesService,
  BlogsService,
  BlogExistsConstraint,
  PostsService,
];

@Module({
  imports: [
    CqrsModule,
    AppConfigModule,

    ConfigModule.forRoot({ isGlobal: true }),

    JwtModule.registerAsync({
      useFactory: (appConfig: AppConfig) => {
        const encryptionTypes = {
          DEFAULT: { secret: appConfig.settings.jwt.SECRET },
          ASYMMETRY: {
            publicKey: appConfig.settings.jwt.PUBLIC_KEY,
            privateKey: {
              key: appConfig.settings.jwt.PRIVATE_KEY,
              passphrase: appConfig.settings.jwt.PASSPHRASE,
            },
            signOptions: { algorithm: 'RS256' },
            verifyOptions: { algorithms: ['RS256'] },
          },
        };
        return {
          global: true,
          ...encryptionTypes[appConfig.settings.jwt.ENCRYPTION_TYPE],
        };
      },
      inject: [AppConfig.name],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),

    TypeOrmModule.forRootAsync({ useClass: TypeOrmOptions }),
    TypeOrmModule.forFeature([...entities]),
  ],
  controllers: [...controllers],
  providers: [...useCases, ...services, ...repositories],
})
export class AppModule {}
