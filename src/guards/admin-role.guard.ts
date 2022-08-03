import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const role = context.switchToHttp().getRequest().user.permission;

    return role === 'ADMIN';
  }
}
