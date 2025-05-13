import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importa ConfigModule y ConfigService
import { UsuarioModule } from '../usuario/usuario.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    forwardRef(() => UsuarioModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Configuración asíncrona de JwtModule usando ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule], // Necesario para inyectar ConfigService
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Obtiene el secreto de .env
        signOptions: { expiresIn: '60s' }, // Opciones adicionales
      }),
      inject: [ConfigService], // Inyecta ConfigService en useFactory
    }),
    ConfigModule.forRoot(), // Asegura que las variables de entorno estén cargadas
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}