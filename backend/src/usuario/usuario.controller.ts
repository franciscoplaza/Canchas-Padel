import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from './usuario.service';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('login')
  async login(@Body() body: { nombreUsuario: string; contraseña: string }) {
    const { nombreUsuario, contraseña } = body;

    const usuario = await this.usuarioService.buscarPorNombre(nombreUsuario);

    if (!usuario || usuario.contraseña !== contraseña) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    return {
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario._id,
        nombreUsuario: usuario.nombreUsuario,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }
}
