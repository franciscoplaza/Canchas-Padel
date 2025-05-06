import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Aquí debes tener tu lógica de autenticación; por ahora aceptamos si hay `user`
    return !!request.user;
  }
}
