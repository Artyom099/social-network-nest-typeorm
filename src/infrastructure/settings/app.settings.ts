import {
  BadRequestException, DynamicModule,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { HttpExceptionFilter } from '../exception-filters/exception.filter';

export const appSettings = <T>(app: INestApplication, module: T) => {
  useContainer(app.select(module as DynamicModule),  { fallbackOnErrors: true });

  // не получается перенести пайп в отдельный файл
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
          // достаем ключи из объектов constraints каждого элемента массива
          const keys = Object.keys(err.constraints || {});
          // пробегаемся по ключам и добавляем каждую ошибку в нужном нам виде в массив errorsForResponse
          keys.forEach((key) => {
            if (err.constraints) {
              errorsForResponse.push({
                field: err.property,
                message: err.constraints[key],
              });
            }
          });
        });

        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());
  app.enableCors();
};
