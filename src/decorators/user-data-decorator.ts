import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserData = createParamDecorator(
  (data, context: ExecutionContext) => context.switchToHttp().getRequest().user,
);
