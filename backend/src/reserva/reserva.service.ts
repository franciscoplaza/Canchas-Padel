import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reserva } from './reserva.schema';
import { Usuario } from '../usuario/usuario.schema';
import { Cancha } from '../cancha/cancha.schema';

@Injectable()
export class ReservaService {
  constructor(
    @InjectModel(Reserva.name) private reservaModel: Model<Reserva>,
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>, // Inyecta Usuario
    @InjectModel(Cancha.name) private canchaModel: Model<Cancha> // Inyecta Cancha
  ) {}

  async getAllReservas() {
    const reservas = await this.reservaModel.find().exec();
    
    const reservasConDetalles = await Promise.all(
      reservas.map(async (reserva) => {
        const [usuario, cancha] = await Promise.all([
          this.usuarioModel.findOne({ rut: reserva.id_usuario }).exec(),
          this.canchaModel.findOne({ id_cancha: reserva.id_cancha }).exec() // Busca por id_cancha
        ]);

        return {
          ...reserva.toObject(),
          usuario,
          cancha
        };
      })
    );

    return reservasConDetalles;
  }
}