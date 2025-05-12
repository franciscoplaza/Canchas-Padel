// src/reserva/reserva.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reserva, ReservaDocument } from './reserva.schema';
import { Model } from 'mongoose';

@Injectable()
export class ReservaService {
  constructor(@InjectModel(Reserva.name) private reservaModel: Model<ReservaDocument>) {}

  async create(data: Partial<Reserva>): Promise<Reserva> {
    const nuevaReserva = new this.reservaModel(data);
    return nuevaReserva.save();
  }

  async findAll(): Promise<Reserva[]> {
    return this.reservaModel.find().populate('id_usuario').populate('id_cancha');
  }

  async findByUsuario(usuarioId: string): Promise<Reserva[]> {
    console.log('Buscando reservas para usuario ID:', usuarioId);
    return this.reservaModel.find({ id_usuario: usuarioId }).populate('id_cancha');
  }
}
