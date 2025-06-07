// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { Usuario, UsuarioSchema } from './usuario/usuario.schema';
import { Cancha, CanchaSchema } from './cancha/cancha.schema';
import { Reserva, ReservaSchema } from './reserva/reserva.schema';
import { ReservaModule } from './reserva/reserva.module';
import { UsuarioModule } from './usuario/usuario.module';
import { CanchaModule } from './cancha/cancha.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './notificaciones/notificaciones.module';
import { ReminderModule } from './reminder/reminder.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Carga variables del .env
    MongooseModule.forRoot(process.env.MONGO_URI!), // el ! le dice a TS que no es undefined - Conexión a MongoDB
    // Aquí luego podés importar tus módulos, como ReservaModule, CanchaModule, etc.
    AuthModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    ReservaModule,    // Asegúrate de que ReservaModule está aquí
    UsuarioModule,    // Agrega UsuarioModule
    CanchaModule,     
    NotificationsModule,
    ReminderModule,
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

