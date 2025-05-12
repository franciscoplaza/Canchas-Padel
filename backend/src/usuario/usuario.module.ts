import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './usuario.schema';

import { Module, forwardRef } from '@nestjs/common';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { AuthService } from '../auth/auth.service'; // Asegúrate de importar AuthService
import { AuthModule } from '../auth/auth.module'; // Importa el módulo de autenticación si es necesario

@Module({
  imports: [forwardRef(() =>AuthModule), MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }])], // Asegúrate de importar el módulo de autenticación
  controllers: [UsuarioController],
  providers: [UsuarioService, AuthService], // Asegúrate de incluir AuthService aquí si no usas un módulo
  exports: [UsuarioService],
})
export class UsuarioModule {}
