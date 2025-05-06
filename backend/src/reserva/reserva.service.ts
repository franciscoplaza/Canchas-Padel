// src/reserva/reserva.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reserva } from './reserva.schema';
import { Model } from 'mongoose';

@Injectable()
export class ReservaService {
  constructor(@InjectModel(Reserva.name) private reservaModel: Model<Reserva>) {}

  async getAllReservas(): Promise<Reserva[]> {
    return this.reservaModel.find().populate('cancha').populate('usuario').exec();
  }
}
