import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { LikeStatus } from '../src/infrastructure/utils/enums';
import { appSettings } from '../src/infrastructure/settings/app.settings';
import {
  getRefreshTokenByResponse,
  getRefreshTokenByResponseWithTokenName,
} from '../src/infrastructure/utils/handlers';

describe('CommentsController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app, AppModule);
    await app.init();
    server = app.getHttpServer();

    await request(server).delete('/testing/all-data');
  });

  it('1 – POST:/sa/user – create 1st user by admin', async () => {
    const firstUser = {
      login: 'lg-111111',
      password: 'qwerty1',
      email: 'artyomgolubev1@gmail.com',
    };

    const payload = {
      login: firstUser.login,
      password: firstUser.password,
      email: firstUser.email,
    };

    const firstCreateResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(payload)
      .expect(HttpStatus.CREATED);

    const firstCreatedUser = firstCreateResponse.body;
    expect(firstCreatedUser).toEqual({
      id: expect.any(String),
      login: firstUser.login,
      email: firstUser.email,
      createdAt: expect.any(String),
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    });

    await request(server)
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [firstCreatedUser],
      });

    expect.setState({ firstUser, firstCreateResponse, firstCreatedUser });
  });
  it('2 – POST:/sa/user – create 2nd user by admin', async () => {
    const { firstCreatedUser } = expect.getState();
    const secondUser = {
      login: 'lg-222222',
      password: 'qwerty2',
      email: 'artyomgolubev2@gmail.com',
    };

    const secondCreateResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: secondUser.login,
        password: secondUser.password,
        email: secondUser.email,
      })
      .expect(HttpStatus.CREATED);

    const secondCreatedUser = secondCreateResponse.body;
    expect(secondCreatedUser).toEqual({
      id: expect.any(String),
      login: secondUser.login,
      email: secondUser.email,
      createdAt: expect.any(String),
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    });

    await request(server)
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [secondCreatedUser, firstCreatedUser],
      });

    expect.setState({ secondUser, secondCreateResponse });
  });
  it('3 – POST:/auth/login – return 200, 1st login and refreshToken', async () => {
    const { firstUser } = expect.getState();
    const loginResponse = await request(server).post('/auth/login').send({
      loginOrEmail: firstUser.login,
      password: firstUser.password,
    });

    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.OK);
    expect(loginResponse.body).toEqual({ accessToken: expect.any(String) });
    const { accessToken } = loginResponse.body;

    const refreshToken = getRefreshTokenByResponse(loginResponse);
    const refreshTokenWithName =
      getRefreshTokenByResponseWithTokenName(loginResponse);
    expect(refreshToken).toBeDefined();
    expect(refreshToken).toEqual(expect.any(String));

    expect.setState({
      firstAccessToken: accessToken,
      firstRefreshToken: refreshToken,
      firstRefreshTokenWithName: refreshTokenWithName,
    });
  });
  it('4 – POST:/blogger/blog – return 201 & create blog', async () => {
    const { firstAccessToken } = expect.getState();

    const createBlogResponse = await request(server)
      .post('/blogger/blogs')
      .auth(firstAccessToken, { type: 'bearer' })
      .send({
        name: 'valid-blog',
        description: 'valid-description',
        websiteUrl: 'valid-websiteUrl.com',
      });

    expect(createBlogResponse).toBeDefined();
    expect(createBlogResponse.status).toEqual(HttpStatus.CREATED);
    expect.setState({ blog: createBlogResponse.body });
  });
  it('5 – POST:/blogger/blog/:id/post – return 201 & create post', async () => {
    const { firstAccessToken, blog } = expect.getState();

    const createPostResponse = await request(server)
      .post(`/blogger/blogs/${blog.id}/posts`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({
        title: 'valid-title',
        shortDescription: 'valid-shortDescription',
        content: 'valid-content',
      });

    expect(createPostResponse).toBeDefined();
    expect(createPostResponse.status).toEqual(HttpStatus.CREATED);
    expect.setState({ post: createPostResponse.body });
  });
  it('6 – POST:/post/:postId/comment – return 201 & create comment', async () => {
    const { post, firstAccessToken, firstUser } = expect.getState();

    const createCommentResponse = await request(server)
      .post(`/posts/${post.id}/comments`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({ content: 'valid-super-long-content' });

    expect(createCommentResponse).toBeDefined();
    expect(createCommentResponse.status).toEqual(HttpStatus.CREATED);
    expect(createCommentResponse.body).toEqual({
      id: expect.any(String),
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
    });

    expect.setState({ comment: createCommentResponse.body });
  });

  it('7 – PUT:/comment/:commentId/like-status – return 404 – non exist comment', async () => {
    const { firstAccessToken } = expect.getState();

    const setLike = await request(server)
      .put(`/comments/44fcc4e9-cb32-4833-8482-2db64438a47b/like-status`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Like });

    expect(setLike).toBeDefined();
    expect(setLike.status).toEqual(HttpStatus.NOT_FOUND);
  });
  it('8 – PUT:/comment/:commentId/like-status – return 400 – likeStatus: invalid', async () => {
    const { commentId, firstAccessToken } = expect.getState();

    const setLike = await request(server)
      .put(`/comments/${commentId}/like-status`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({ likeStatus: 'invalid' });

    expect(setLike).toBeDefined();
    expect(setLike.status).toEqual(HttpStatus.BAD_REQUEST);
  });
  it('9 – PUT:/comment/:commentId/like-status – return 401', async () => {
    const { commentId } = expect.getState();
    const setLike = await request(server)
      .put(`/comments/${commentId}/like-status`)
      .send({ likeStatus: LikeStatus.Like });

    expect(setLike).toBeDefined();
    expect(setLike.status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  it('10 – GET:/comment/:id – return 200 & found comment', async () => {
    const { comment, firstUser, firstCreatedUser } = expect.getState();

    const getComment = await request(server).get(`/comments/${comment.id}`);

    expect(getComment).toBeDefined();
    expect(getComment.status).toEqual(HttpStatus.OK);
    expect(getComment.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
    });
  });

  it('11 – PUT:/comment/:commentId/like-status – return 204 & set like', async () => {
    const { comment, firstAccessToken } = expect.getState();
    const setLike = await request(server)
      .put(`/comments/${comment.id}/like-status`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Like });

    expect(setLike).toBeDefined();
    expect(setLike.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('12 – GET:/comment/:id – return 200 & found comment', async () => {
    const { comment, firstUser, firstCreatedUser, firstAccessToken } =
      expect.getState();

    const getComment = await request(server)
      .get(`/comments/${comment.id}`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getComment).toBeDefined();
    expect(getComment.status).toEqual(HttpStatus.OK);
    expect(getComment.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: LikeStatus.Like,
      },
    });
  });

  it('13 – PUT:/comment/:commentId/like-status – return 204 & set dislike', async () => {
    const { comment, firstAccessToken } = expect.getState();
    const setDislike = await request(server)
      .put(`/comments/${comment.id}/like-status`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Dislike });

    expect(setDislike).toBeDefined();
    expect(setDislike.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('14 – GET:/comment/:id – return 200 & found comment', async () => {
    const { comment, firstUser, firstCreatedUser, firstAccessToken } =
      expect.getState();

    const getComment = await request(server)
      .get(`/comments/${comment.id}`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getComment).toBeDefined();
    expect(getComment.status).toEqual(HttpStatus.OK);
    expect(getComment.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 1,
        myStatus: LikeStatus.Dislike,
      },
    });
  });

  it('15 – PUT:/comment/:commentId/like-status – return 204 & delete dislike', async () => {
    const { comment, firstAccessToken } = expect.getState();

    const deleteDislike = await request(server)
      .put(`/comments/${comment.id}/like-status`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.None });

    expect(deleteDislike).toBeDefined();
    expect(deleteDislike.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('16 – GET:/comment/:id – return 200 & found comment', async () => {
    const { comment, firstUser, firstCreatedUser, firstAccessToken } =
      expect.getState();

    const getComment = await request(server)
      .get(`/comments/${comment.id}`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getComment).toBeDefined();
    expect(getComment.status).toEqual(HttpStatus.OK);
    expect(getComment.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
    });
  });

  it('17 – POST:/auth/login – return 200, 2nd login and refreshToken', async () => {
    const { secondUser } = expect.getState();

    const loginResponse = await request(server).post('/auth/login').send({
      loginOrEmail: secondUser.login,
      password: secondUser.password,
    });

    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.OK);
    expect(loginResponse.body).toEqual({ accessToken: expect.any(String) });
    const { accessToken } = loginResponse.body;

    const refreshToken = getRefreshTokenByResponse(loginResponse);
    const refreshTokenWithName =
      getRefreshTokenByResponseWithTokenName(loginResponse);
    expect(refreshToken).toBeDefined();
    expect(refreshToken).toEqual(expect.any(String));

    expect.setState({
      secondAccessToken: accessToken,
      secondRefreshToken: refreshToken,
      secondRefreshTokenWithName: refreshTokenWithName,
    });
  });

  it('18 – PUT:/comment/:commentId/like-status – return 204 & set like by 1st user', async () => {
    const { comment, firstAccessToken } = expect.getState();

    const setLikeByFirstUser = await request(server)
      .put(`/comments/${comment.id}/like-status`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Like });

    expect(setLikeByFirstUser).toBeDefined();
    expect(setLikeByFirstUser.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('19 – GET:/comment/:id – return 200 & found comment with 1 like', async () => {
    const {
      comment,
      firstUser,
      firstCreatedUser,
      firstAccessToken,
      secondAccessToken,
    } = expect.getState();

    const getCommentByFirstUser = await request(server)
      .get(`/comments/${comment.id}`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getCommentByFirstUser).toBeDefined();
    expect(getCommentByFirstUser.status).toEqual(HttpStatus.OK);
    expect(getCommentByFirstUser.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: LikeStatus.Like,
      },
    });

    const getCommentBySecondUser = await request(server)
      .get(`/comments/${comment.id}`)
      .auth(secondAccessToken, { type: 'bearer' });

    expect(getCommentBySecondUser).toBeDefined();
    expect(getCommentBySecondUser.status).toEqual(HttpStatus.OK);
    expect(getCommentBySecondUser.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
    });
  });
  it('20 – PUT:/comment/:commentId/like-status – return 204 & set like by 1st user again', async () => {
    const { comment, firstAccessToken } = expect.getState();

    const setLikeByFirstUserAgain = await request(server)
      .put(`/comments/${comment.id}/like-status`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Like });

    expect(setLikeByFirstUserAgain).toBeDefined();
    expect(setLikeByFirstUserAgain.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('21 – GET:/comment/:id – return 200 & found comment with 1 like', async () => {
    const {
      comment,
      firstUser,
      firstCreatedUser,
      firstAccessToken,
      secondAccessToken,
    } = expect.getState();
    const getCommentByFirstUser = await request(server)
      .get(`/comments/${comment.id}`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getCommentByFirstUser).toBeDefined();
    expect(getCommentByFirstUser.status).toEqual(HttpStatus.OK);
    expect(getCommentByFirstUser.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: LikeStatus.Like,
      },
    });

    const getCommentBySecondUser = await request(server)
      .get(`/comments/${comment.id}`)
      .auth(secondAccessToken, { type: 'bearer' });

    expect(getCommentBySecondUser).toBeDefined();
    expect(getCommentBySecondUser.status).toEqual(HttpStatus.OK);
    expect(getCommentBySecondUser.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
    });
  });

  it('22 – PUT:/comment/:commentId/like-status – return 204 & set like by 2nd user', async () => {
    const { comment, secondAccessToken } = expect.getState();

    const setLikeBySecondUser = await request(server)
      .put(`/comments/${comment.id}/like-status`)
      .auth(secondAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Like });

    expect(setLikeBySecondUser).toBeDefined();
    expect(setLikeBySecondUser.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('23 – GET:/comment/:id – return 200 & found comment with 2 likes', async () => {
    const {
      comment,
      firstUser,
      firstCreatedUser,
      firstAccessToken,
      secondAccessToken,
    } = expect.getState();

    const getCommentByFirstUser = await request(server)
      .get(`/comments/${comment.id}`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getCommentByFirstUser).toBeDefined();
    expect(getCommentByFirstUser.status).toEqual(HttpStatus.OK);
    expect(getCommentByFirstUser.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 2,
        dislikesCount: 0,
        myStatus: LikeStatus.Like,
      },
    });

    const getCommentBySecondUser = await request(server)
      .get(`/comments/${comment.id}`)
      .auth(secondAccessToken, { type: 'bearer' });

    expect(getCommentBySecondUser).toBeDefined();
    expect(getCommentBySecondUser.status).toEqual(HttpStatus.OK);
    expect(getCommentBySecondUser.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 2,
        dislikesCount: 0,
        myStatus: LikeStatus.Like,
      },
    });
  });

  it('24 – PUT:/comment/:commentId/like-status – return 204 & set like by 2nd user again', async () => {
    const { comment, secondAccessToken } = expect.getState();

    const setLikeBySecondUserAgain = await request(server)
      .put(`/comments/${comment.id}/like-status`)
      .auth(secondAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Like });

    expect(setLikeBySecondUserAgain).toBeDefined();
    expect(setLikeBySecondUserAgain.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('25 – GET:/comment/:id – return 200 & found comment with 2 likes', async () => {
    const {
      comment,
      firstUser,
      firstCreatedUser,
      firstAccessToken,
      secondAccessToken,
    } = expect.getState();

    const getCommentByFirstUser = await request(server)
      .get(`/comments/${comment.id}`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getCommentByFirstUser).toBeDefined();
    expect(getCommentByFirstUser.status).toEqual(HttpStatus.OK);
    expect(getCommentByFirstUser.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 2,
        dislikesCount: 0,
        myStatus: LikeStatus.Like,
      },
    });

    const getCommentBySecondUser = await request(server)
      .get(`/comments/${comment.id}`)
      .auth(secondAccessToken, { type: 'bearer' });

    expect(getCommentBySecondUser).toBeDefined();
    expect(getCommentBySecondUser.status).toEqual(HttpStatus.OK);
    expect(getCommentBySecondUser.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 2,
        dislikesCount: 0,
        myStatus: LikeStatus.Like,
      },
    });
  });

  it('26 – GET:/post/:id/comment – return 200 & sorted comment with paging & 2 likes', async () => {
    const { post, comment, firstUser, firstCreatedUser, firstAccessToken } =
      expect.getState();

    const getComment = await request(server)
      .get(`/posts/${post.id}/comments`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getComment).toBeDefined();
    expect(getComment.status).toEqual(HttpStatus.OK);
    expect(getComment.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: expect.any(Array),
    });
    expect(getComment.body.items).toEqual([
      {
        id: comment.id,
        content: 'valid-super-long-content',
        commentatorInfo: {
          userId: firstCreatedUser.id,
          userLogin: firstUser.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 2,
          dislikesCount: 0,
          myStatus: LikeStatus.Like,
        },
      },
    ]);
  });

  it('27 – PUT:/comment/:commentId/like-status – return 204, set 1 dislike & 1 none', async () => {
    const { comment, firstAccessToken, secondAccessToken } = expect.getState();

    const setLikeFirstUser = await request(server)
      .put(`/comments/${comment.id}/like-status`)
      .auth(firstAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.Dislike });

    expect(setLikeFirstUser).toBeDefined();
    expect(setLikeFirstUser.status).toEqual(HttpStatus.NO_CONTENT);

    const setLikeSecondUser = await request(server)
      .put(`/comments/${comment.id}/like-status`)
      .auth(secondAccessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatus.None });

    expect(setLikeSecondUser).toBeDefined();
    expect(setLikeSecondUser.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('28 – GET:/comment/:id – return 200 & found comment with 1 dislike', async () => {
    const {
      comment,
      firstUser,
      firstCreatedUser,
      firstAccessToken,
      secondAccessToken,
    } = expect.getState();

    const getComment = await request(server)
      .get(`/comments/${comment.id}`)
      .auth(firstAccessToken, { type: 'bearer' });

    expect(getComment).toBeDefined();
    expect(getComment.status).toEqual(HttpStatus.OK);
    expect(getComment.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 1,
        myStatus: LikeStatus.Dislike,
      },
    });

    const getCommentBySecondUser = await request(server)
      .get(`/comments/${comment.id}`)
      .auth(secondAccessToken, { type: 'bearer' });

    expect(getCommentBySecondUser).toBeDefined();
    expect(getCommentBySecondUser.status).toEqual(HttpStatus.OK);
    expect(getCommentBySecondUser.body).toEqual({
      id: comment.id,
      content: 'valid-super-long-content',
      commentatorInfo: {
        userId: firstCreatedUser.id,
        userLogin: firstUser.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 1,
        myStatus: LikeStatus.None,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
