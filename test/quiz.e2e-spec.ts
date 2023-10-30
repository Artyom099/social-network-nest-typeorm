import {HttpStatus, INestApplication} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {AppModule} from '../src/app.module';
import {appSettings} from '../src/infrastructure/settings/app.settings';
import request from 'supertest';

describe('QuizController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();
    server = app.getHttpServer();
    await request(server).delete('/testing/all-data');
  });

  it('1 – GET:sa/quiz/questions – 200 & empty array', async () => {
    await request(server)
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', {type: 'basic'})
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
      .auth('admin', 'qwerty', {type: 'basic'})
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
      .auth('admin', 'qwerty', {type: 'basic'})
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
    const {Q1} = expect.getState();
    const firstQuestionInput = {
      body: 'body-first-question-update',
      correctAnswers: ['ans1-update', 'ans2', 'ans2'],
    };

    const updateResponse = await request(server)
      .put(`/sa/quiz/questions/${Q1.id}`)
      .auth('admin', 'qwerty', {type: 'basic'})
      .send({
        body: firstQuestionInput.body,
        correctAnswers: firstQuestionInput.correctAnswers,
      });

    expect(updateResponse).toBeDefined();
    expect(updateResponse.status).toEqual(HttpStatus.NO_CONTENT);

    const getResponse = await request(server)
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', {type: 'basic'})

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
      }],
    })

    expect.setState({ Q1:
      {
        ...Q1,
        body: firstQuestionInput.body,
        correctAnswers: firstQuestionInput.correctAnswers,
        updatedAt: expect.any(String),
      }
    });
  });
  it('4 – PUT:sa/quiz/questions/:id/publish – 204 & publish 1st question', async () => {
    const { Q1 } = expect.getState();

    const publishResponse = await request(server)
      .put(`/sa/quiz/questions/${Q1.id}/publish`)
      .auth('admin', 'qwerty', {type: 'basic'})
      .send({ published: true });

    expect(publishResponse).toBeDefined();
    expect(publishResponse.status).toEqual(HttpStatus.NO_CONTENT);

    const getResponse = await request(server)
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', {type: 'basic'})

    expect(getResponse.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
      {
        ...Q1,
        published: true,
      }],
    })

    expect.setState({ Q1:
      {
        ...Q1,
        published: true
      }
    });
  });
  it('5 – DELETE:sa/quiz/questions/:id – 204 & publish 1st question', async () => {
    const { Q1 } = expect.getState();

    const publishResponse = await request(server)
      .delete(`/sa/quiz/questions/${Q1.id}`)
      .auth('admin', 'qwerty', {type: 'basic'})
      .send({ published: true });

    expect(publishResponse).toBeDefined();
    expect(publishResponse.status).toEqual(HttpStatus.NO_CONTENT);

    const getResponse = await request(server)
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', {type: 'basic'})

    expect(getResponse.body).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    })
  });

})