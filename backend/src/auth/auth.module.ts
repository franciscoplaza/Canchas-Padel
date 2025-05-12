import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuarioModule } from '../usuario/usuario.module'; // Asegúrate de importar el módulo de usuario
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'; // Si tienes un controlador para autenticación
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy'; // Asegúrate de crear esta estrategia

@Module({
  imports: [
    forwardRef(() => UsuarioModule), // Importa el módulo de usuario para acceder a UsuarioService
    PassportModule.register({ defaultStrategy: 'jwt' }), // Configura Passport para usar JWT
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Asegúrate de definir esto en tu archivo .env
      signOptions: { expiresIn: '60s' }, // Puedes ajustar el tiempo de expiración
    }),
  ],
  providers: [AuthService, JwtStrategy], // Proveedores necesarios
  controllers: [AuthController], // Si tienes un controlador para manejar rutas de autenticación
  exports: [AuthService, PassportModule, JwtModule], // Exporta AuthService y PassportModule para usarlos en otros módulos
})
export class AuthModule {}
