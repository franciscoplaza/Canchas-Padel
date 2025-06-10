import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Reserva } from 'src/reserva/reserva.schema';
import { Usuario } from 'src/usuario/usuario.schema';

@Injectable()
export class NotificationsService {
  constructor(private readonly mailerService: MailerService) {}

  async sendReminderEmail(usuario: Usuario, reserva: Reserva) {
    await this.mailerService.sendMail({
      to: usuario.correo,
      subject: 'Recordatorio de Reserva de Cancha de Pádel',
      template: './reminder', // Nombre del archivo de la plantilla (sin .hbs)
      context: {
        nombre: usuario.nombreUsuario,
        fecha: reserva.fecha.toLocaleDateString('es-ES'),
        hora: reserva.hora,
        id_cancha: reserva.id_cancha,
      },
    });
  }
}