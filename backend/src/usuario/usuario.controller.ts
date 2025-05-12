import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('usuario')
export class UsuarioController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly authService: AuthService, // Inyecta AuthService aquí
  ) {}

  @Post('login')
  async login(@Body() body: { nombreUsuario: string; contraseña: string }) {
    return this.authService.login(body.nombreUsuario, body.contraseña);
  }
}
