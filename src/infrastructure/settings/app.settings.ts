import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { AppModule } from '../../app.module';
import { HttpExceptionFilter } from '../exception-filters/exception.filter';

export const appSettings = (app: INestApplication) => {
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  //todo - не получается перенести пайп в отдельный файл
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      // forbidUnknownValues: false,

      // в exceptionFactory передаем массив ошибок errors
      exceptionFactory: (errors) => {
        const errorsForResponse: any = [];

        errors.forEach((err) => {
          // достаем ключи из объектоа constraints каждого элемента массива
          const keys = Object.keys(err.constraints || {});
          // пробегаемся по ключам и добавляем каждую ошибку в нужном нам виде в массив errorsForResponse
          keys.forEach((key) => {
            if (err.constraints) {
              errorsForResponse.push({
                message: err.constraints[key],
                field: err.property,
              });
            }
          });
        });

        throw new BadRequestException(errorsForResponse);
      },
    }),
  );

  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
};
