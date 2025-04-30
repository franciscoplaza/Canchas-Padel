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
    ConfigModule.forRoot({ isGlobal: true }), // Carga variables del .env
    MongooseModule.forRoot(process.env.MONGO_URI!), // el ! le dice a TS que no es undefined - Conexión a MongoDB
    // Aquí luego podés importar tus módulos, como ReservaModule, CanchaModule, etc.

    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Cancha.name, schema: CanchaSchema },
      { name: Reserva.name, schema: ReservaSchema },
    ]),
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

