import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RoleEnum } from '../types';

@Injectable()
export class IdsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const userFromAuth = context.switchToHttp().getRequest().user;
    const idFromParams = context.switchToHttp().getRequest().params.id;
    const idFromBody = context.switchToHttp().getRequest();
    if (userFromAuth.permission === RoleEnum.STUDENT) {
      return idFromParams === userFromAuth.id;
    } else if (userFromAuth.permission === RoleEnum.HR) {
      return idFromBody.user.id === userFromAuth.id;
    }
    return true;
  }
}
