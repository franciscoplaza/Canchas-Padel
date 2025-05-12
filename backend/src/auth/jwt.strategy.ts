import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usuarioService: UsuarioService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET, // Asegúrate de definir esto en tu archivo .env
    });
  }

  async validate(payload: any) {
    const usuario = await this.usuarioService.buscarPorNombre(payload.nombreUsuario);
    if (!usuario) {
      throw new UnauthorizedException();
    }
    return usuario; // Devuelve el usuario para que esté disponible en la solicitud
  }
}
