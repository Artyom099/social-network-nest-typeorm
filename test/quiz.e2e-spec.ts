import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/infrastructure/settings/app.settings';
import request from 'supertest';
import { getRefreshTokenByResponse } from '../src/infrastructure/utils/handlers';
import { AnswerStatus, GameStatus } from '../src/infrastructure/utils/enums';

const sleep = (seconds: number) =>
  new Promise((r) => setTimeout(r, seconds * 1000));

describe('QuizController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  // let manager: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app, AppModule);
    await app.init();
    server = app.getHttpServer();

    await request(server).delete('/testing/all-data');

    // const dataSource = await moduleFixture.resolve(DataSource);
    // manager = dataSource.manager;
    // await manager.query(`SELECT truncate_tables('postgres');`)
    // const queryRunner = dataSource.manager.connection.createQueryRunner()
    // await queryRunner.dropSchema('public', true, true);
    // await queryRunner.createSchema('public', true);
  });

  // beforeEach( async () => {
  //   await manager.query(`SELECT truncate_tables('postgres');`)
  // });

  it('1 – GET:sa/quiz/questions – 200 & empty array', async () => {
    await request(server)
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });
  it('2 – POST:sa/quiz/questions – 201 & create 1st question', async () => {
    const firstQuestionInput = {
      body: 'body-first-question',
      correctAnswers: ['ans1', 'ans2', 'ans2'],
    };

    const createResponse = await request(server)
      .post('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: firstQuestionInput.body,
        correctAnswers: firstQuestionInput.correctAnswers,
      });

    expect(createResponse).toBeDefined();
    expect(createResponse.status).toEqual(HttpStatus.CREATED);
    const firstCreatedQuestion = createResponse.body;
    expect(firstCreatedQuestion).toEqual({
      id: expect.any(String),
      body: firstQuestionInput.body,
      correctAnswers: firstQuestionInput.correctAnswers,
      published: false,
      createdAt: expect.any(String),
      updatedAt: null,
    });

    await request(server)
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [firstCreatedQuestion],
      });

    expect.setState({ Q1: firstCreatedQuestion });
  });
  it('3 – PUT:sa/quiz/questions/:id – 204 & update 1st question', async () => {
    const { Q1 } = expect.getState();
    const firstQuestionInput = {
      body: 'body-first-question-update',
      correctAnswers: ['ans1-update', 'ans2', 'ans2'],
    };

    const updateResponse = await request(server)
      .put(`/sa/quiz/questions/${Q1.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: firstQuestionInput.body,
        correctAnswers: firstQuestionInput.correctAnswers,
      });

    expect(updateResponse).toBeDefined();
    expect(updateResponse.status).toEqual(HttpStatus.NO_CONTENT);

    const getResponse = await request(server)
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' });

    expect(getResponse.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          ...Q1,
          body: firstQuestionInput.body,
          correctAnswers: firstQuestionInput.correctAnswers,
          updatedAt: expect.any(String),
        },
      ],
    });

    expect.setState({
      Q1: {
        ...Q1,
        body: firstQuestionInput.body,
        correctAnswers: firstQuestionInput.correctAnswers,
        updatedAt: expect.any(String),
      },
    });
  });
  it('4 – PUT:sa/quiz/questions/:id/publish – 204 & publish 1st question', async () => {
    const { Q1 } = expect.getState();

    const publishResponse = await request(server)
      .put(`/sa/quiz/questions/${Q1.id}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({ published: true });

    expect(publishResponse).toBeDefined();
    expect(publishResponse.status).toEqual(HttpStatus.NO_CONTENT);

    const getResponse = await request(server)
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' });

    expect(getResponse.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          ...Q1,
          published: true,
          updatedAt: expect.any(String),
        },
      ],
    });
    expect(getResponse.body.items[0].updatedAt).not.toBeNull();

    expect.setState({
      Q1: {
        ...Q1,
        published: true,
      },
    });
  });
  it('5 – DELETE:sa/quiz/questions/:id – 204 & delete 1st question', async () => {
    const { Q1 } = expect.getState();

    const publishResponse = await request(server)
      .delete(`/sa/quiz/questions/${Q1.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({ published: true });

    expect(publishResponse).toBeDefined();
    expect(publishResponse.status).toEqual(HttpStatus.NO_CONTENT);

    const getResponse = await request(server)
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' });

    expect(getResponse.body).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('6 – POST:sa/quiz/questions – 201 & create 6 questions', async () => {
    await sleep(1.1);

    const firstQuestionInput = {
      body: 'body-first-question',
      correctAnswers: ['ans1', 'ans2', 'ans3'],
    };
    const createResponse1 = await request(server)
      .post(`/sa/quiz/questions/`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: firstQuestionInput.body,
        correctAnswers: firstQuestionInput.correctAnswers,
      });
    expect(createResponse1).toBeDefined();
    expect(createResponse1.status).toEqual(HttpStatus.CREATED);
    const Q1 = createResponse1.body;

    const secondQuestionInput = {
      body: 'body-second-question',
      correctAnswers: ['ans1', 'ans2', 'ans3'],
    };
    const createResponse2 = await request(server)
      .post(`/sa/quiz/questions/`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: secondQuestionInput.body,
        correctAnswers: secondQuestionInput.correctAnswers,
      });
    expect(createResponse2).toBeDefined();
    expect(createResponse2.status).toEqual(HttpStatus.CREATED);
    const Q2 = createResponse2.body;

    const thirdQuestionInput = {
      body: 'body-third-question',
      correctAnswers: ['ans1', 'ans2', 'ans3'],
    };
    const createResponse3 = await request(server)
      .post(`/sa/quiz/questions/`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: thirdQuestionInput.body,
        correctAnswers: thirdQuestionInput.correctAnswers,
      });
    expect(createResponse3).toBeDefined();
    expect(createResponse3.status).toEqual(HttpStatus.CREATED);
    const Q3 = createResponse3.body;

    const fourthQuestionInput = {
      body: 'body-fourth-question',
      correctAnswers: ['ans1', 'ans2', 'ans3'],
    };
    const createResponse4 = await request(server)
      .post(`/sa/quiz/questions/`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: fourthQuestionInput.body,
        correctAnswers: fourthQuestionInput.correctAnswers,
      });
    expect(createResponse4).toBeDefined();
    expect(createResponse4.status).toEqual(HttpStatus.CREATED);
    const Q4 = createResponse4.body;

    const fifthQuestionInput = {
      body: 'body-fifth-question',
      correctAnswers: ['ans1', 'ans2', 'ans3'],
    };
    const createResponse5 = await request(server)
      .post(`/sa/quiz/questions/`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: fifthQuestionInput.body,
        correctAnswers: fifthQuestionInput.correctAnswers,
      });
    expect(createResponse5).toBeDefined();
    expect(createResponse5.status).toEqual(HttpStatus.CREATED);
    const Q5 = createResponse5.body;

    const sixthQuestionInput = {
      body: 'body-fifth-question',
      correctAnswers: ['ans1', 'ans2', 'ans3'],
    };
    const createResponse6 = await request(server)
      .post(`/sa/quiz/questions/`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: sixthQuestionInput.body,
        correctAnswers: sixthQuestionInput.correctAnswers,
      });
    expect(createResponse6).toBeDefined();
    expect(createResponse6.status).toEqual(HttpStatus.CREATED);
    const Q6 = createResponse6.body;

    const getResponse = await request(server)
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' });

    expect(getResponse.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 6,
      items: [Q6, Q5, Q4, Q3, Q2, Q1],
    });

    expect.setState({ Q6, Q5, Q4, Q3, Q2, Q1 });
  });
  it('7 – PUT:sa/quiz/questions/:id/publish – 204 & publish 6 questions', async () => {
    const { Q6, Q5, Q4, Q3, Q2, Q1 } = expect.getState();

    const createResponse1 = await request(server)
      .put(`/sa/quiz/questions/${Q1.id}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({ published: true });
    expect(createResponse1).toBeDefined();
    expect(createResponse1.status).toEqual(HttpStatus.NO_CONTENT);

    const createResponse2 = await request(server)
      .put(`/sa/quiz/questions/${Q2.id}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({ published: true });
    expect(createResponse2).toBeDefined();
    expect(createResponse2.status).toEqual(HttpStatus.NO_CONTENT);

    const createResponse3 = await request(server)
      .put(`/sa/quiz/questions/${Q3.id}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({ published: true });
    expect(createResponse3).toBeDefined();
    expect(createResponse3.status).toEqual(HttpStatus.NO_CONTENT);

    const createResponse4 = await request(server)
      .put(`/sa/quiz/questions/${Q4.id}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({ published: true });
    expect(createResponse4).toBeDefined();
    expect(createResponse4.status).toEqual(HttpStatus.NO_CONTENT);

    const createResponse5 = await request(server)
      .put(`/sa/quiz/questions/${Q5.id}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({ published: true });
    expect(createResponse5).toBeDefined();
    expect(createResponse5.status).toEqual(HttpStatus.NO_CONTENT);

    const createResponse6 = await request(server)
      .put(`/sa/quiz/questions/${Q6.id}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({ published: true });
    expect(createResponse6).toBeDefined();
    expect(createResponse6.status).toEqual(HttpStatus.NO_CONTENT);

    const getResponse = await request(server)
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' });

    expect(getResponse.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 6,
      items: [
        {
          ...Q6,
          published: true,
          updatedAt: expect.any(String),
        },
        {
          ...Q5,
          published: true,
          updatedAt: expect.any(String),
        },
        {
          ...Q4,
          published: true,
          updatedAt: expect.any(String),
        },
        {
          ...Q3,
          published: true,
          updatedAt: expect.any(String),
        },
        {
          ...Q2,
          published: true,
          updatedAt: expect.any(String),
        },
        {
          ...Q1,
          published: true,
          updatedAt: expect.any(String),
        },
      ],
    });
  });

  it('8 – POST:sa/user – create 1, 2, 3 user by admin & login them', async () => {
    const firstUser = {
      login: 'lg-1111',
      password: 'qwerty1',
      email: 'artyomgolubev1@gmail.com',
    };

    const firstCreateResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: firstUser.login,
        password: firstUser.password,
        email: firstUser.email,
      })
      .expect(HttpStatus.CREATED);

    const firstCreatedUser = firstCreateResponse.body;
    expect(firstCreatedUser).toEqual({
      id: expect.any(String),
      login: firstUser.login,
      email: firstUser.email,
      createdAt: expect.any(String),
    });

    const loginResponse = await request(server).post('/auth/login').send({
      loginOrEmail: firstUser.login,
      password: firstUser.password,
    });

    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.OK);
    expect(loginResponse.body).toEqual({ accessToken: expect.any(String) });
    const firstAccessToken = loginResponse.body;

    const refreshToken = getRefreshTokenByResponse(loginResponse);
    expect(refreshToken).toBeDefined();
    expect(refreshToken).toEqual(expect.any(String));

    const secondUser = {
      login: 'lg-2222',
      password: 'qwerty2',
      email: 'artyom22222@gmaill.com',
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
    });

    const loginResponse2 = await request(server).post('/auth/login').send({
      loginOrEmail: secondUser.login,
      password: secondUser.password,
    });

    expect(loginResponse2).toBeDefined();
    expect(loginResponse2.status).toBe(HttpStatus.OK);
    expect(loginResponse2.body).toEqual({ accessToken: expect.any(String) });
    const secondAccessToken = loginResponse2.body;

    const refreshToken2 = getRefreshTokenByResponse(loginResponse2);
    expect(refreshToken2).toBeDefined();
    expect(refreshToken2).toEqual(expect.any(String));

    const thirdUser = {
      login: 'lg-3333',
      password: 'qwerty3',
      email: 'artyom33333@gmaill.com',
    };
    const thirdCreateResponse = await request(server)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: thirdUser.login,
        password: thirdUser.password,
        email: thirdUser.email,
      })
      .expect(HttpStatus.CREATED);

    const thirdCreatedUser = thirdCreateResponse.body;
    expect(thirdCreatedUser).toEqual({
      id: expect.any(String),
      login: thirdUser.login,
      email: thirdUser.email,
      createdAt: expect.any(String),
    });

    const loginResponse3 = await request(server).post('/auth/login').send({
      loginOrEmail: thirdUser.login,
      password: thirdUser.password,
    });

    expect(loginResponse3).toBeDefined();
    expect(loginResponse3.status).toBe(HttpStatus.OK);
    expect(loginResponse3.body).toEqual({ accessToken: expect.any(String) });
    const thirdAccessToken = loginResponse3.body;

    const refreshToken3 = getRefreshTokenByResponse(loginResponse3);
    expect(refreshToken3).toBeDefined();
    expect(refreshToken3).toEqual(expect.any(String));

    expect.setState({
      firstCreatedUser,
      firstAccessToken,
      firstRefreshToken: refreshToken,

      secondCreatedUser,
      secondAccessToken,
      secondRefreshToken: refreshToken2,

      thirdCreatedUser,
      thirdAccessToken,
      thirdRefreshToken: refreshToken3,
    });
  });

  it('9 – GET:pair-game-quiz/pairs/my-current – 404 no active game', async () => {
    const { firstAccessToken } = expect.getState();

    const getResponse = await request(server)
      .get(`/pair-game-quiz/pairs/my-current`)
      .auth(firstAccessToken.accessToken, { type: 'bearer' });
    // .set('cookie', `refreshToken=${firstRefreshToken}`)

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toEqual(HttpStatus.NOT_FOUND);
  });

  // 1й игрок создает 1ю игру
  it('10 – POST:pair-game-quiz/pairs/connection – 200 1st player waiting 2nd player', async () => {
    const { firstAccessToken, firstCreatedUser } = expect.getState();

    const connectResponse = await request(server)
      .post(`/pair-game-quiz/pairs/connection`)
      .auth(firstAccessToken.accessToken, { type: 'bearer' });

    expect(connectResponse).toBeDefined();
    expect(connectResponse.status).toEqual(HttpStatus.OK);
    expect(connectResponse.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: firstCreatedUser.login,
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: null,
      status: GameStatus.pending,
      pairCreatedDate: expect.any(String),
      startGameDate: null,
      finishGameDate: null,
    });

    expect.setState({ gameId: connectResponse.body.id });
  });
  it('11 – GET:pair-game-quiz/pairs/:id – 200 - 1st player get game by id', async () => {
    const { firstAccessToken, firstCreatedUser, gameId } = expect.getState();

    const getResponse = await request(server)
      .get(`/pair-game-quiz/pairs/${gameId}`)
      .auth(firstAccessToken.accessToken, { type: 'bearer' });

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toEqual(HttpStatus.OK);
    expect(getResponse.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: firstCreatedUser.login,
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: null,
      status: GameStatus.pending,
      pairCreatedDate: expect.any(String),
      startGameDate: null,
      finishGameDate: null,
    });
  });
  it('12 – GET:pair-game-quiz/pairs/my-current – 200 - 1st player get his current game', async () => {
    const { firstAccessToken, firstCreatedUser } = expect.getState();

    const getResponse = await request(server)
      .get(`/pair-game-quiz/pairs/my-current`)
      .auth(firstAccessToken.accessToken, { type: 'bearer' });

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toEqual(HttpStatus.OK);
    expect(getResponse.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: firstCreatedUser.login,
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: null,
      status: GameStatus.pending,
      pairCreatedDate: expect.any(String),
      startGameDate: null,
      finishGameDate: null,
    });
  });

  // 1й игрок не может отвечать, пока не подключиться 2й
  it('13 - POST:pair-game-quiz/pairs/my-current/answers - 403 - 1st pl cannot answer before start the game', async () => {
    const { firstAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(firstAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'ans2' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.FORBIDDEN);
  });

  // 2й игрок подключается к 1й игре
  it('14 – POST:pair-game-quiz/pairs/connection – 200 connect 2nd player & start game', async () => {
    const { secondAccessToken, firstCreatedUser, secondCreatedUser } =
      expect.getState();

    const connectResponse = await request(server)
      .post(`/pair-game-quiz/pairs/connection`)
      .auth(secondAccessToken.accessToken, { type: 'bearer' });

    expect(connectResponse).toBeDefined();
    expect(connectResponse.status).toEqual(HttpStatus.OK);
    expect(connectResponse.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: firstCreatedUser.login,
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: secondCreatedUser.login,
        },
        score: 0,
      },
      questions: expect.any(Array),
      status: GameStatus.active,
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: null,
    });
  });

  // 403 - оба игрока уже имеют активную игру
  it('15 – POST:pair-game-quiz/pairs/connection – 403 1st player is already participating in active pair', async () => {
    const { firstAccessToken } = expect.getState();

    const connectResponse = await request(server)
      .post(`/pair-game-quiz/pairs/connection`)
      .auth(firstAccessToken.accessToken, { type: 'bearer' });

    expect(connectResponse).toBeDefined();
    expect(connectResponse.status).toEqual(HttpStatus.FORBIDDEN);
  });
  it('16 – POST:pair-game-quiz/pairs/connection – 403 2nd player is already participating in active pair', async () => {
    const { secondAccessToken } = expect.getState();

    const connectResponse = await request(server)
      .post(`/pair-game-quiz/pairs/connection`)
      .auth(secondAccessToken.accessToken, { type: 'bearer' });

    expect(connectResponse).toBeDefined();
    expect(connectResponse.status).toEqual(HttpStatus.FORBIDDEN);
  });

  it('17 – GET:pair-game-quiz/pairs/:id – 200 - 2nd player get game by id', async () => {
    const { secondAccessToken, firstCreatedUser, secondCreatedUser, gameId } =
      expect.getState();

    const getResponse = await request(server)
      .get(`/pair-game-quiz/pairs/${gameId}`)
      .auth(secondAccessToken.accessToken, { type: 'bearer' });

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toEqual(HttpStatus.OK);
    expect(getResponse.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: firstCreatedUser.login,
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: secondCreatedUser.login,
        },
        score: 0,
      },
      questions: expect.any(Array),
      status: GameStatus.active,
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: null,
    });
  });
  it('18 – GET:pair-game-quiz/pairs/:id – 200 - 1st player get game by id', async () => {
    const { firstAccessToken, firstCreatedUser, secondCreatedUser, gameId } =
      expect.getState();

    const getResponse = await request(server)
      .get(`/pair-game-quiz/pairs/${gameId}`)
      .auth(firstAccessToken.accessToken, { type: 'bearer' });

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toEqual(HttpStatus.OK);
    expect(getResponse.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: firstCreatedUser.login,
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: secondCreatedUser.login,
        },
        score: 0,
      },
      questions: expect.any(Array),
      status: GameStatus.active,
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: null,
    });
  });
  it('19 – GET:pair-game-quiz/pairs/:id – 403 - 3rd player cannot get game by id', async () => {
    const { thirdAccessToken, gameId } = expect.getState();

    const getResponse = await request(server)
      .get(`/pair-game-quiz/pairs/${gameId}`)
      .auth(thirdAccessToken.accessToken, { type: 'bearer' });

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toEqual(HttpStatus.FORBIDDEN);
  });

  // игроки начинают отвечать на вопросы
  it('20 - POST:pair-game-quiz/pairs/my-current/answers - 200 - 1st pl, 1st question, correct ans, score1 = 1', async () => {
    const { firstAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(firstAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'ans1' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.OK);
    expect(sendAnswer.body).toEqual({
      questionId: expect.any(String),
      answerStatus: AnswerStatus.correct,
      addedAt: expect.any(String),
    });
  });
  it('21 - POST:pair-game-quiz/pairs/my-current/answers - 200 - 1st pl, 2nd question, incorrect ans, score1 = 1', async () => {
    const { firstAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(firstAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'incorrect-ans' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.OK);
    expect(sendAnswer.body).toEqual({
      questionId: expect.any(String),
      answerStatus: AnswerStatus.incorrect,
      addedAt: expect.any(String),
    });
  });

  it('22 – GET:pair-game-quiz/pairs/:id – 200 - 1st player get game by id', async () => {
    const { firstAccessToken, firstCreatedUser, secondCreatedUser, gameId } =
      expect.getState();

    const getResponse = await request(server)
      .get(`/pair-game-quiz/pairs/${gameId}`)
      .auth(firstAccessToken.accessToken, { type: 'bearer' });

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toEqual(HttpStatus.OK);
    expect(getResponse.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [
          {
            questionId: expect.any(String),
            answerStatus: expect.any(String),
            addedAt: expect.any(String),
          },
          {
            questionId: expect.any(String),
            answerStatus: expect.any(String),
            addedAt: expect.any(String),
          },
        ],
        player: {
          id: expect.any(String),
          login: firstCreatedUser.login,
        },
        score: 1,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: secondCreatedUser.login,
        },
        score: 0,
      },
      questions: expect.any(Array),
      status: GameStatus.active,
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: null,
    });
  });
  it('23 – GET:pair-game-quiz/pairs/:id – 200 - 2nd player get game by id', async () => {
    const { secondAccessToken, firstCreatedUser, secondCreatedUser, gameId } =
      expect.getState();

    const getResponse = await request(server)
      .get(`/pair-game-quiz/pairs/${gameId}`)
      .auth(secondAccessToken.accessToken, { type: 'bearer' });

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toEqual(HttpStatus.OK);
    expect(getResponse.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [
          {
            questionId: expect.any(String),
            answerStatus: expect.any(String),
            addedAt: expect.any(String),
          },
          {
            questionId: expect.any(String),
            answerStatus: expect.any(String),
            addedAt: expect.any(String),
          },
        ],
        player: {
          id: expect.any(String),
          login: firstCreatedUser.login,
        },
        score: 1,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: secondCreatedUser.login,
        },
        score: 0,
      },
      questions: expect.any(Array),
      status: GameStatus.active,
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: null,
    });
  });

  it('24 - POST:pair-game-quiz/pairs/my-current/answers - 200 - 2nd pl, 1st question, incorrect ans, score2 = 0', async () => {
    const { secondAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(secondAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'incorrect-ans' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.OK);
    expect(sendAnswer.body).toEqual({
      questionId: expect.any(String),
      answerStatus: AnswerStatus.incorrect,
      addedAt: expect.any(String),
    });
  });
  it('25 - POST:pair-game-quiz/pairs/my-current/answers - 200 - 2nd pl, 2nd question, correct ans, score2 = 1', async () => {
    const { secondAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(secondAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'ans2' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.OK);
    expect(sendAnswer.body).toEqual({
      questionId: expect.any(String),
      answerStatus: AnswerStatus.correct,
      addedAt: expect.any(String),
    });
  });

  it('26 - POST:pair-game-quiz/pairs/my-current/answers - 200 - 1st pl, 3rd question, correct ans, score1 = 2', async () => {
    const { firstAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(firstAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'ans2' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.OK);
    expect(sendAnswer.body).toEqual({
      questionId: expect.any(String),
      answerStatus: AnswerStatus.correct,
      addedAt: expect.any(String),
    });
  });
  it('27 - POST:pair-game-quiz/pairs/my-current/answers - 200 - 1st pl, 4th question, correct ans, score1 = 3', async () => {
    const { firstAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(firstAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'ans2' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.OK);
    expect(sendAnswer.body).toEqual({
      questionId: expect.any(String),
      answerStatus: AnswerStatus.correct,
      addedAt: expect.any(String),
    });
  });
  it('28 - POST:pair-game-quiz/pairs/my-current/answers - 200 - 1st pl, 5th question, correct ans, score1 = 4', async () => {
    const { firstAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(firstAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'ans2' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.OK);
    expect(sendAnswer.body).toEqual({
      questionId: expect.any(String),
      answerStatus: AnswerStatus.correct,
      addedAt: expect.any(String),
    });
  });
  it('29 - POST:pair-game-quiz/pairs/my-current/answers - 403 - 1st pl, 6th question, correct ans, score1 = 4', async () => {
    const { firstAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(firstAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'ans2' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.FORBIDDEN);
  });

  it('30 - POST:pair-game-quiz/pairs/my-current/answers - 200 - 2nd pl, 3rd question, correct ans, score2 = 2', async () => {
    const { secondAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(secondAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'ans2' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.OK);
    expect(sendAnswer.body).toEqual({
      questionId: expect.any(String),
      answerStatus: AnswerStatus.correct,
      addedAt: expect.any(String),
    });
  });
  it('31 - POST:pair-game-quiz/pairs/my-current/answers - 200 - 2nd pl, 4th question, correct ans, score2 = 3', async () => {
    const { secondAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(secondAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'ans2' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.OK);
    expect(sendAnswer.body).toEqual({
      questionId: expect.any(String),
      answerStatus: AnswerStatus.correct,
      addedAt: expect.any(String),
    });
  });
  it('32 - POST:pair-game-quiz/pairs/my-current/answers - 200 - 2nd pl, 5th question, correct ans, score2 = 4', async () => {
    const { secondAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(secondAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'ans2' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.OK);
    expect(sendAnswer.body).toEqual({
      questionId: expect.any(String),
      answerStatus: AnswerStatus.correct,
      addedAt: expect.any(String),
    });
  });
  it('33 - POST:pair-game-quiz/pairs/my-current/answers - 403 - 2nd pl, 6th question, correct ans, score2 = 4', async () => {
    const { secondAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(secondAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'ans2' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.FORBIDDEN);
  });

  // игра уже завершилась
  it('34 - POST:pair-game-quiz/pairs/my-current/answers - 403 - 1st pl, 6th question, correct ans, score1 = 4', async () => {
    const { firstAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(firstAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'ans2' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.FORBIDDEN);
  });
  it('35 - POST:pair-game-quiz/pairs/my-current/answers - 403 - 2nd pl, 6th question, correct ans, score2 = 4', async () => {
    const { secondAccessToken } = expect.getState();

    const sendAnswer = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .auth(secondAccessToken.accessToken, { type: 'bearer' })
      .send({ answer: 'ans2' });

    expect(sendAnswer).toBeDefined();
    expect(sendAnswer.status).toEqual(HttpStatus.FORBIDDEN);
  });

  it('36 – GET:pair-game-quiz/pairs/my-current – 404 - 1st player have no current game', async () => {
    const { firstAccessToken } = expect.getState();

    const getResponse = await request(server)
      .get(`/pair-game-quiz/pairs/my-current`)
      .auth(firstAccessToken.accessToken, { type: 'bearer' });

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toEqual(HttpStatus.NOT_FOUND);
  });

  // 2й игрок создает 2ю игру
  it('37 – POST:pair-game-quiz/pairs/connection – 200 connect 2nd pl waiting 1st player', async () => {
    const { secondAccessToken, secondCreatedUser } = expect.getState();

    const connectResponse = await request(server)
      .post(`/pair-game-quiz/pairs/connection`)
      .auth(secondAccessToken.accessToken, { type: 'bearer' });

    expect(connectResponse).toBeDefined();
    expect(connectResponse.status).toEqual(HttpStatus.OK);
    expect(connectResponse.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: secondCreatedUser.login,
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: null,
      status: GameStatus.pending,
      pairCreatedDate: expect.any(String),
      startGameDate: null,
      finishGameDate: null,
    });
  });
  it('38 – GET:pair-game-quiz/pairs/my-current – 200 - 2nd pl get his current game', async () => {
    const { secondAccessToken, secondCreatedUser } = expect.getState();

    const getResponse = await request(server)
      .get(`/pair-game-quiz/pairs/my-current`)
      .auth(secondAccessToken.accessToken, { type: 'bearer' });

    expect(getResponse).toBeDefined();
    expect(getResponse.status).toEqual(HttpStatus.OK);
    expect(getResponse.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: secondCreatedUser.login,
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: null,
      status: GameStatus.pending,
      pairCreatedDate: expect.any(String),
      startGameDate: null,
      finishGameDate: null,
    });
  });
  it('39 – POST:pair-game-quiz/pairs/connection – 403 2nd player is already participating in active pair', async () => {
    const { secondAccessToken } = expect.getState();

    const connectResponse = await request(server)
      .post(`/pair-game-quiz/pairs/connection`)
      .auth(secondAccessToken.accessToken, { type: 'bearer' });

    expect(connectResponse).toBeDefined();
    expect(connectResponse.status).toEqual(HttpStatus.FORBIDDEN);
  });
});
