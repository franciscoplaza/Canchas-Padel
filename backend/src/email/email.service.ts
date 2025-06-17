import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: configService.get('EMAIL_SERVICE'),
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to,
      subject,
      text,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Correo enviado a ${to}`);
    } catch (error) {
      console.error('Error enviando correo:', error);
      throw error;
    }
  }

  async sendReservationReminder(to: string, reservaInfo: any): Promise<void> {
    const subject = `Recordatorio de reserva - ${reservaInfo.canchaNombre}`;
    const text = `Tienes una reserva para ${reservaInfo.canchaNombre} el ${reservaInfo.fecha} a las ${reservaInfo.hora}.`;
    
    const html = `
      <h1>Recordatorio de reserva</h1>
      <p>Hola,</p>
      <p>Tienes una reserva programada:</p>
      <ul>
        <li><strong>Cancha:</strong> ${reservaInfo.canchaNombre}</li>
        <li><strong>Fecha:</strong> ${reservaInfo.fecha}</li>
        <li><strong>Hora:</strong> ${reservaInfo.hora}</li>
        <li><strong>Precio:</strong> $${reservaInfo.precio}</li>
      </ul>
      <p>¡Te esperamos!</p>
    `;

    await this.sendMail(to, subject, text, html);
  }
}