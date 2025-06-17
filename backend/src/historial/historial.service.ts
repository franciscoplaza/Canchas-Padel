// backend/src/historial/historial.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Historial, TipoAccion } from './historial.schema';
import { Usuario } from '../usuario/usuario.schema';

@Injectable()
export class HistorialService {
  constructor(
    @InjectModel(Historial.name) private historialModel: Model<Historial>,
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>, // Inyecta modelo Usuario
  ) {}

  /**
   * Registra una acción en el historial manejando RUTs u ObjectIds
   */
  async registrar(
    usuarioId: string | Types.ObjectId,
    tipoAccion: TipoAccion,
    entidadAfectada: string,
    entidadId: string | Types.ObjectId,
    detalles: Record<string, any>,
    session?: ClientSession,
  ): Promise<Historial> {
    // 1. Convertir a ObjectId válido
    let usuarioObjectId: Types.ObjectId;

    if (usuarioId instanceof Types.ObjectId) {
      usuarioObjectId = usuarioId;
    } else if (Types.ObjectId.isValid(usuarioId)) {
      usuarioObjectId = new Types.ObjectId(usuarioId);
    } else {
      // Buscar por RUT si no es ObjectId
      const usuario = await this.usuarioModel.findOne(
        { rut: usuarioId },
        { _id: 1 },
        { session }
      ).exec();

      if (!usuario) {
        throw new Error(`Usuario con RUT ${usuarioId} no encontrado`);
      }
      usuarioObjectId = usuario._id;
    }

    // 2. Crear registro de historial
    const registro = new this.historialModel({
      usuario: usuarioObjectId,
      tipoAccion,
      entidadAfectada,
      entidadId,
      detalles,
    });

    return registro.save({ session });
  }

  /**
   * Obtiene todo el historial con datos básicos del usuario
   */
  async findAll(): Promise<Historial[]> {
    return this.historialModel
      .find()
      .populate('usuario', 'nombreUsuario rut correo rol') // Campos que quieres mostrar
      .sort({ createdAt: -1 })
      .exec();
  }
}