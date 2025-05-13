import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Debug: Imprime el usuario completo
    console.log('User en RolesGuard:', user);

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Extrae el rol sin importar mayúsculas/minúsculas o nombres alternativos
    const userRole = user.rol || user.role || user.roles?.[0];
    
    if (!userRole) {
      throw new ForbiddenException('Usuario sin rol asignado');
    }

    const hasRole = requiredRoles.some(role => userRole.toLowerCase() === role.toLowerCase());
    
    if (!hasRole) {
      throw new ForbiddenException(
        `Requiere uno de estos roles: ${requiredRoles.join(', ')}. Rol actual: ${userRole}`
      );
    }

    return true;
  }
}