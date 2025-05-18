import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reserva } from './reserva.schema';
import { CreateReservaDto } from './DTO/create-reserva.dto';

@Injectable()
export class ReservaService {
  constructor(
    @InjectModel(Reserva.name) private readonly reservaModel: Model<Reserva>,
  ) {}

  //CREAR RESERVA
  async crearReserva(dto: CreateReservaDto): Promise<Reserva> {
    const ahora = new Date();
    const fechaInicio = new Date(dto.fechaHoraInicio);

    if (fechaInicio < ahora) {
      throw new BadRequestException('No se puede reservar en el pasado.');
    }

    const reservaExistente = await this.reservaModel.findOne({
      canchaId: dto.canchaId,
      fechaHoraInicio: dto.fechaHoraInicio,
    });

    if (reservaExistente) {
      throw new BadRequestException('La cancha ya está reservada en esa fecha y hora.');
    }

    const nuevaReserva = new this.reservaModel(dto);
    return nuevaReserva.save();
  }

  //OBTENER RESERVAS POR USUARIO
  async obtenerReservasPorUsuario(idUsuario: string) {
    return this.reservaModel.find({ usuarioId: idUsuario }).exec();
  }

  //OBTENER TODAS LAS RESERVAS CON JOIN A USUARIO
  async obtenerTodasLasReservas() {
    return this.reservaModel.aggregate([
      {
        $lookup: {
          from: 'usuarios',
          localField: 'usuarioId',
          foreignField: '_id', // o 'rut', según tu modelo de usuario
          as: 'usuario'
        }
      },
      { $unwind: '$usuario' },
      {
        $project: {
          _id: 1,
          fechaHoraInicio: 1,
          canchaId: 1,
          duracionHoras: 1,
          'usuario.nombreUsuario': 1
        }
      }
    ]).exec();
  }
}
