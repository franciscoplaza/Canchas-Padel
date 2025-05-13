// backend/src/reserva/reserva.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Usuario } from '../usuario/usuario.schema';
import { Cancha } from '../cancha/cancha.schema';

export type ReservaDocument = Reserva & Document;

@Schema()
export class Reserva {
  @Prop({ type: Date, required: true })
  fecha_hora: Date;

  @Prop({ type: String, ref: 'Usuario', required: true })
  id_usuario: string; // Cambiado de Usuario a string

  @Prop({ type: String, ref: 'Cancha', required: true })
  id_cancha: string; // Cambiado de Cancha a string
}

export const ReservaSchema = SchemaFactory.createForClass(Reserva);