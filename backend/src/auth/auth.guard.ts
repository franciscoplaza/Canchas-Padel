import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {} // Inyección correcta

  async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
  const token = this.extractToken(request);

  if (!token) {
    throw new UnauthorizedException('Token no proporcionado');
  }

  try {
    const payload = await this.jwtService.verifyAsync(token);
    // Asigna el payload completo al user
    request.user = { 
      ...payload,
      rol: payload.rol || payload.role // Normaliza el campo de rol
    };
  } catch {
    throw new UnauthorizedException('Token inválido');
  }

  return true;
}

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}