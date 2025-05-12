import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  async login(nombreUsuario: string, contraseña: string) {
    const usuario = await this.usuarioService.buscarPorNombre(nombreUsuario);
    if (!usuario || usuario.contraseña !== contraseña) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const payload = { id: usuario._id, nombreUsuario: usuario.nombreUsuario, rol: usuario.rol };
    return {
      mensaje: 'Inicio de sesión exitoso',
      token: this.jwtService.sign(payload),
    };
  }
}
