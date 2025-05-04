import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { Usuario, UsuarioSchema } from './usuario/usuario.schema';
import { Cancha, CanchaSchema } from './cancha/cancha.schema';
import { Reserva, ReservaSchema } from './reserva/reserva.schema';

@Module({
  imports: [
    // ConfigModule para cargar el archivo .env
    ConfigModule.forRoot({
      isGlobal: true,  // Hace las variables de entorno accesibles globalmente
    }),

    // Verifica si la variable de entorno está siendo cargada
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    // Aquí colocamos el console.log fuera del array de imports
    console.log('MONGO_URI:', process.env.MONGO_URI);
  }
}
