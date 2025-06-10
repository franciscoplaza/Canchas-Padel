import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reserva } from './reserva.schema';
import { Cancha } from '../cancha/cancha.schema';
import { Usuario } from '../usuario/usuario.schema';

@Injectable()
export class ReservaService {
  private readonly HORARIOS_DISPONIBLES = [
    '09:00', '10:30', '12:00',
    '14:00', '15:30', '17:00', '18:30', '20:00'
  ];

  constructor(
    @InjectModel(Reserva.name) private reservaModel: Model<Reserva>,
    @InjectModel(Cancha.name) private canchaModel: Model<Cancha>,
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>
  ) {}

  // --- FUNCIÓN DE CREAR RESERVA CORREGIDA ---
  async crearReserva(rutUsuario: string, idCancha: string, fecha: string, hora_inicio: string) {
  // Validaciones (estas ya las tenías bien)
  const cancha = await this.canchaModel.findOne({ id_cancha: idCancha });
  if (!cancha) {
    throw new NotFoundException('Cancha no encontrada');
  }
  const usuario = await this.usuarioModel.findOne({ rut: rutUsuario });
  if (!usuario) {
    throw new NotFoundException('Usuario no encontrado');
  }
  if (!this.HORARIOS_DISPONIBLES.includes(hora_inicio)) {
    throw new BadRequestException('Horario no válido.');
  }

  const fechaObj = new Date(fecha);

  // Verificamos disponibilidad con fecha y hora separadas
  const existeReserva = await this.reservaModel.findOne({
    id_cancha: idCancha,
    fecha: fechaObj,
    hora: hora_inicio
  });

  if (existeReserva) {
    throw new BadRequestException('La cancha ya está reservada en este horario');
  }

  // Creamos la reserva con los campos separados
  const reserva = new this.reservaModel({
    fecha: fechaObj,
    hora: hora_inicio,
    id_usuario: rutUsuario, // Guardamos el RUT como identificador
    id_cancha: idCancha,
    recordatorioEnviado: false // Usamos el nombre de tu schema
  });

  return reserva.save();
}

  // --- OBTENER RESERVAS DE UN USUARIO (SIN CAMBIOS, YA ESTABA BIEN) ---
  async obtenerReservasPorUsuario(idUsuario: string) { // Este idUsuario es el RUT
    return this.reservaModel.find({ id_usuario: idUsuario }).exec();
  }

  // --- FUNCIÓN PARA ADMIN CORREGIDA ---
async obtenerTodasLasReservas() {
  return this.reservaModel.aggregate([
    {
      $lookup: {
        from: 'usuarios', // Nombre de la colección en MongoDB
        localField: 'id_usuario',
        foreignField: 'rut',
        as: 'usuarioInfo'
      }
    },
    {
      $unwind: '$usuarioInfo'
    },
    {
      $project: {
        _id: 1,
        fecha: 1,                      //  <-- Corregido para usar fecha
        hora: 1,                       //  <-- Corregido para usar hora
        id_cancha: 1,
        reminderSent: '$recordatorioEnviado', // <-- Corregido para que coincida con el frontend
        usuario: {
          nombreUsuario: '$usuarioInfo.nombreUsuario',
          email: '$usuarioInfo.correo',
          rol: '$usuarioInfo.rol'
        }
      }
    }
  ]).exec();
}
  
  // --- NUEVA FUNCIÓN PARA ELIMINAR ---
  async eliminarReserva(idReserva: string) {
  const resultado = await this.reservaModel.findByIdAndDelete(idReserva);
  if (!resultado) {
    throw new NotFoundException('Reserva no encontrada');
  }
  return { message: 'Reserva eliminada con éxito' };
  }
}