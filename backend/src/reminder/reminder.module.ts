import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.sevice';
import { MongooseModule } from '@nestjs/mongoose';
import { Reserva, ReservaSchema } from '../reserva/reserva.schema';
import { Usuario, UsuarioSchema } from '../usuario/usuario.schema';
import { Cancha, CanchaSchema } from '../cancha/cancha.schema';
import { NotificationsModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([
        { name: Reserva.name, schema: ReservaSchema },
        { name: Usuario.name, schema: UsuarioSchema },
        { name: Cancha.name, schema: CanchaSchema }
    ]),
    
  ],
  providers: [ReminderService],
})
export class ReminderModule {}