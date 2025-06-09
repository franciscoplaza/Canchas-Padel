// backend/src/saldo/saldo.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../usuario/usuario.schema';

@Injectable()
export class SaldoService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
  ) {}

  async cargarSaldo(rut: string, monto: number) {
    if (monto <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    const usuario = await this.usuarioModel.findOneAndUpdate(
      { rut },
      {
        $inc: { saldo: monto },
        $push: {
          transacciones: {
            monto,
            tipo: 'carga',
            fecha: new Date(),
            descripcion: 'Carga de saldo'
          }
        }
      },
      { new: true }
    ).select('saldo transacciones');

    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return usuario;
  }

  async obtenerSaldo(rut: string) {
    const usuario = await this.usuarioModel.findOne({ rut }).select('saldo');
    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado');
    }
    return { saldo: usuario.saldo };
  }

  async obtenerTransacciones(rut: string) {
    const usuario = await this.usuarioModel.findOne({ rut }).select('transacciones');
    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado');
    }
    return usuario.transacciones;
  }
}