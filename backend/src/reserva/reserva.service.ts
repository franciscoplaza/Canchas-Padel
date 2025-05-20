import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reserva } from './reserva.schema';
import { Cancha } from '../cancha/cancha.schema';
import { Usuario } from '../usuario/usuario.schema';

@Injectable()
export class ReservaService {
  private readonly HORARIOS_DISPONIBLES = [
    '09:00', '10:30', '12:00', // Mañana
    '14:00', '15:30', '17:00', '18:30', '20:00' // Tarde
  ];

  constructor(
    @InjectModel(Reserva.name) private reservaModel: Model<Reserva>,
    @InjectModel(Cancha.name) private canchaModel: Model<Cancha>,
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>
  ) {}

  async crearReserva(rutUsuario: string, idCancha: string, fecha: string, hora_inicio: string) {
    // Validar cancha
    const cancha = await this.canchaModel.findOne({ id_cancha: idCancha });
    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    // Validar usuario
    const usuario = await this.usuarioModel.findOne({ rut: rutUsuario });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Validar horario
    if (!this.HORARIOS_DISPONIBLES.includes(hora_inicio)) {
      throw new BadRequestException('Horario no válido. Los horarios disponibles son: ' + 
        this.HORARIOS_DISPONIBLES.join(', '));
    }

    // Crear fecha_hora combinando fecha y hora
    const [horas, minutos] = hora_inicio.split(':').map(Number);
    const fechaHora = new Date(fecha);
    fechaHora.setHours(horas, minutos, 0, 0);

    // Verificar disponibilidad
    const existeReserva = await this.reservaModel.findOne({
      id_cancha: idCancha,
      fecha_hora: fechaHora
    });

    if (existeReserva) {
      throw new BadRequestException('La cancha ya está reservada en este horario');
    }

    // Crear reserva
    const reserva = new this.reservaModel({
      fecha_hora: fechaHora,
      id_usuario: rutUsuario,
      id_cancha: idCancha
    });

    return reserva.save();
  }

  async obtenerReservasPorUsuario(idUsuario: string) {
    return this.reservaModel.find({ id_usuario: idUsuario }).exec();
  }

  async obtenerTodasLasReservas() {
    return this.reservaModel.aggregate([
      {
        $lookup: {
          from: 'usuarios',
          localField: 'id_usuario',
          foreignField: 'rut',
          as: 'usuario'
        }
      },
      {
        $unwind: '$usuario'
      },
      {
        $project: {
          _id: 1,
          fecha_hora: 1,
          'id_cancha': 1,
          'usuario.nombreUsuario': 1
        }
      }
    ]).exec();
  }
}