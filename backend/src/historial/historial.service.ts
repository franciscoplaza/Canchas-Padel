import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Schema as MongooseSchema } from 'mongoose';
import { Historial, TipoAccion } from './historial.schema';

@Injectable()
export class HistorialService {
  constructor(
    @InjectModel(Historial.name) private historialModel: Model<Historial>,
  ) {}

  /**
   * Registra una nueva acción en el historial.
   */
   async registrar(
    usuarioId: string | MongooseSchema.Types.ObjectId,
    tipoAccion: TipoAccion,
    entidadAfectada: string,
    entidadId: string | MongooseSchema.Types.ObjectId,
    detalles: Record<string, any>,
    session?: ClientSession, // Se añade '?' para hacerlo opcional.
  ): Promise<Historial> {
    const registro = new this.historialModel({
      usuario: usuarioId,
      tipoAccion,
      entidadAfectada,
      entidadId,
      detalles,
    });

    // Se guarda usando la sesión solo si esta existe.
    // Mongoose maneja el caso en que 'session' es undefined.
    return registro.save({ session });
  }

  /**
   * Busca todos los registros del historial, populando los datos del usuario.
   */
  async findAll(): Promise<Historial[]> {
    return this.historialModel
      .find()
      .populate('usuario', 'nombre correo') // Solo trae nombre y correo del usuario
      .sort({ createdAt: -1 })
      .exec();
  }
}