// === Canchas-Padel-main/backend/src/acompanante/acompanante.service.ts ===
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Acompanante } from './acompanante.schema';

@Injectable()
export class AcompananteService {
  constructor(
    @InjectModel(Acompanante.name) private acompananteModel: Model<Acompanante>,
  ) {}

  async crearAcompanante(acompananteData: Partial<Acompanante>): Promise<Acompanante> {
    const nuevoAcompanante = new this.acompananteModel(acompananteData);
    return nuevoAcompanante.save();
  }

  async obtenerPorReserva(idReserva: string): Promise<Acompanante[]> {
    return this.acompananteModel.find({ id_reserva: idReserva }).exec();
  }
}