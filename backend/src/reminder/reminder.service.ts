import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reserva } from '../reserva/reserva.schema';
import { EmailService } from '../email/email.service';
import { Usuario } from '../usuario/usuario.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReminderService implements OnModuleInit {
  constructor(
    @InjectModel(Reserva.name) private reservaModel: Model<Reserva>,
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    this.checkReservations();
  }

  @Cron(CronExpression.EVERY_MINUTE) // Ejecuta cada hora
  async checkReservations() {
    console.log('Buscando reservas para recordar...');
    const hoursBefore = this.configService.get<number>('REMINDER_HOURS_BEFORE') || 24;
    const now = new Date();
    const reminderDate = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);

    // Buscar reservas que ocurran dentro de las próximas REMINDER_HOURS_BEFORE horas
    const reservas = await this.reservaModel.find({
      fecha_hora: {
        $gte: now,
        $lte: reminderDate,
      },
      estado: 'confirmada',
      recordatorioEnviado: { $ne: true }, // Solo las que no han recibido recordatorio
    }).exec();

    console.log(`Reservas encontradas para recordar: ${reservas.length}`);

    for (const reserva of reservas) {
      try {
        const usuario = await this.usuarioModel.findOne({ rut: reserva.id_usuario }).exec();
        
        if (usuario && usuario.correo) {
          await this.emailService.sendReservationReminder(
            usuario.correo,
            {
              canchaNombre: `Cancha ${reserva.id_cancha.split('_')[1]}`,
              fecha: reserva.fecha_hora.toLocaleDateString('es-CL'),
              hora: reserva.fecha_hora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
              precio: reserva.precio,
            }
          );

          // Marcar como recordatorio enviado
          reserva.recordatorioEnviado = true;
          await reserva.save();
        }
      } catch (error) {
        console.error(`Error enviando recordatorio para reserva ${reserva._id}:`, error);
      }
    }
  }
}