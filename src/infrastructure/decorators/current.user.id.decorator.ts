import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// декоратор достает userId из request, если ендпоинт защищен,
// или из access токена, если ендпоинт публичный

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (request.user?.id) return request.user.id;

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') {
      const tokenPayload = new JwtService().decode(token);
      return (tokenPayload as { userId: string }).userId;
    }
  },
);
