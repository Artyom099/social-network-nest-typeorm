import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const responseBody: any = exception.getResponse();

    if (status === HttpStatus.BAD_REQUEST) {
      const errorsMessages: any = [];

      if (typeof responseBody.message === 'string') {
        const [message, field] = responseBody.message.split('=>');
        errorsMessages.push({ message, field });
      } else {
        responseBody.message.forEach((m: never) => errorsMessages.push(m));
      }

      response.status(status).json({ errorsMessages });
    } else {
      console.log({
        exception: exception,
        // request: request,
      });

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        cause: exception.cause,
      });
    }
  }
}

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (process.env.environment !== 'production') {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: exception.toString(), stack: exception.stack });
    } else {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(`some error occurred: ${exception}`);
    }
  }
}
