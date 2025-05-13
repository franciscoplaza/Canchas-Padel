// backend/src/reserva/reserva.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reserva } from './reserva.schema';

@Injectable()
export class ReservaService {
  constructor(
    @InjectModel(Reserva.name) private reservaModel: Model<Reserva>,
  ) {}

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