import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ReservaModule } from './reserva/reserva.module';

import { Cancha, CanchaSchema } from './cancha/cancha.schema';
import { Reserva, ReservaSchema } from './reserva/reserva.schema';
import { UsuarioModule } from './usuario/usuario.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Carga variables del .env
    MongooseModule.forRoot(process.env.MONGO_URI!),
    ReservaModule,
    UsuarioModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: Cancha.name, schema: CanchaSchema },
      { name: Reserva.name, schema: ReservaSchema },
    ]),
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}



