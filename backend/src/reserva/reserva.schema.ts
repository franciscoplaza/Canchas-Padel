// backend/src/reserva/reserva.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReservaDocument = Reserva & Document;

@Schema()
export class Reserva {
  @Prop({ type: Date, required: true })
  fecha_hora: Date;

  @Prop({ type: String, ref: 'Usuario', required: true })
  id_usuario: string;

  @Prop({ type: String, required: true })
  id_cancha: string;

  @Prop({ required: true })
  precio: number;

  @Prop({ enum: ['pendiente', 'confirmada', 'cancelada'], default: 'pendiente' })
  estado: string;
}

export const ReservaSchema = SchemaFactory.createForClass(Reserva);