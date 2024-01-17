import { Test, TestingModule } from '@nestjs/testing';
import {HttpStatus, INestApplication} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/infrastructure/settings/app.settings';

describe('AppController (e2e)', () => {
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
  });

  it('/ (GET)', async () => {
    await request(server)
      .get('/')
      .expect(HttpStatus.OK)
      .expect('Blog API');
  });
});
