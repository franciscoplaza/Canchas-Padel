import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth') // Puedes cambiar la ruta base según tus necesidades
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { nombreUsuario: string; contraseña: string }) {
    return this.authService.login(body.nombreUsuario, body.contraseña);
  }

  // Puedes agregar más rutas relacionadas con la autenticación aquí, como registro, logout, etc.
}
