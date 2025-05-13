// src/reserva/reserva.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Usuario } from '../usuario/usuario.schema';
import { Cancha } from '../cancha/cancha.schema';

export type ReservaDocument = Reserva & Document;

// reserva.schema.ts
@Schema()
export class Reserva {
  @Prop({ type: Date, required: true })
  fecha_hora: Date;

  @Prop({ type: String, required: true }) // Cambiado a String
  id_usuario: string; // ← Ya no es una referencia

  @Prop({ type: String, required: true }) // Cambiado a String
  id_cancha: string; // ← Ya no es una referencia
}

export const ReservaSchema = SchemaFactory.createForClass(Reserva);
