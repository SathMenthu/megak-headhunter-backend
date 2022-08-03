import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class HrRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const role = context.switchToHttp().getRequest().user.permission;

    return role === 'HR';
  }
}
