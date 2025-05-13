// backend/src/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body('correo') correo: string,
    @Body('contraseña') contraseña: string,
  ) {
    try {
      return await this.authService.login(correo, contraseña);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }
}