import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// CORRECCIÓN 1: Se completa el enum con todas las acciones necesarias.
// Esto permite que los servicios de Cancha y Equipamiento puedan registrar sus acciones.
export enum TipoAccion {
  CREAR_USUARIO = 'CREAR_USUARIO',
  ABONAR_SALDO = 'ABONAR_SALDO',
  CREAR_RESERVA = 'CREAR_RESERVA',
  CANCELAR_RESERVA = 'CANCELAR_RESERVA',
  CREAR_CANCHA = 'CREAR_CANCHA',
  MODIFICAR_CANCHA = 'MODIFICAR_CANCHA',
  ELIMINAR_CANCHA = 'ELIMINAR_CANCHA',
  CREAR_EQUIPAMIENTO = 'CREAR_EQUIPAMIENTO',
  MODIFICAR_EQUIPAMIENTO = 'MODIFICAR_EQUIPAMIENTO',
  ELIMINAR_EQUIPAMIENTO = 'ELIMINAR_EQUIPAMIENTO',
}

@Schema({ timestamps: true })
export class Historial extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  usuario: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: Object.values(TipoAccion), required: true })
  tipoAccion: string;

  @Prop({ required: true })
  entidadAfectada: string;

  // CORRECCIÓN 2: Se cambia el tipo a String para que pueda guardar IDs
  // de diferentes colecciones (Usuarios, Canchas, Reservas, etc.) sin problemas.
  @Prop({ required: true })
  entidadId: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  detalles: Record<string, any>;

  // Se elimina la propiedad 'fecha' porque 'timestamps: true' ya crea 'createdAt' y 'updatedAt' automáticamente.
}

export const HistorialSchema = SchemaFactory.createForClass(Historial);