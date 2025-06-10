import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { NotificationsService } from '../notificaciones/notifications.service';
import { Reserva } from '../reserva/reserva.schema';
import { Usuario } from '../usuario/usuario.schema';

@Injectable()
// 👇 1. ¡LA PALABRA CLAVE "EXPORT" ES LA SOLUCIÓN PRINCIPAL! 👇
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    @InjectModel(Reserva.name) private readonly reservaModel: Model<Reserva>,
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.debug('Verificando reservas para enviar recordatorios...');

    const ahora = new Date();
    const proximaHora = new Date(ahora.getTime() + 24 * 60 * 60 * 1000); // 24 horas

    const reservas = await this.reservaModel.find({
      fecha: {
        $gte: ahora,
        $lt: proximaHora,
      },
      // Nombre de campo corregido
      recordatorioEnviado: false, 
    }).exec();

    if (reservas.length === 0) {
      this.logger.debug('No hay reservas próximas para notificar.');
      return;
    }

    this.logger.log(`Se encontraron ${reservas.length} reservas próximas.`);

    for (const reserva of reservas) {
      const usuario = await this.usuarioModel.findById(reserva.id_usuario).exec();
      if (usuario) {
        try {
          await this.notificationsService.sendReminderEmail(usuario, reserva);
          
          // 👇 2. Corrección del nombre del campo 👇
          reserva.recordatorioEnviado = true; 
          await reserva.save();

          // 👇 3. Corrección de los campos en el log 👇
          this.logger.log(`Recordatorio enviado a ${usuario.correo} para la reserva del ${new Date(reserva.fecha).toLocaleDateString()} a las ${reserva.hora}.`);
        } catch (error) {
          // 👇 4. Corrección del campo en el log de error 👇
          this.logger.error(`Error al enviar recordatorio a ${usuario.correo}`, error);
        }
      }
    }
  }
}