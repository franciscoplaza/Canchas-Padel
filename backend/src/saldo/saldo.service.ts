// backend/src/saldo/saldo.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../usuario/usuario.schema';
import { HistorialService } from '../historial/historial.service'; 
import { TipoAccion } from '../historial/historial.schema';
@Injectable()
export class SaldoService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    private readonly historialService: HistorialService,
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
    // --- REGISTRO HISTÓRICO ---
    await this.historialService.registrar(
      usuario.id,
      TipoAccion.ABONAR_SALDO,
      'Usuario', // La entidad afectada es el Usuario
      usuario.id,
      {
        montoAbonado: monto,
        saldoNuevo: usuario.saldo,
        descripcion: `Carga de saldo de ${monto} CLP al usuario con RUT ${rut}`,
      },
    );
    // --- FIN REGISTRO ---
    
    // Devolvemos solo el saldo y las transacciones como lo hacías antes
    return {
        saldo: usuario.saldo,
        transacciones: usuario.transacciones, 
    }; 
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