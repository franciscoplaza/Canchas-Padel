// src/reserva/reserva.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Usuario } from '../usuario/usuario.schema';
import { Cancha } from '../cancha/cancha.schema';

export type ReservaDocument = Reserva & Document;

@Schema()
export class Reserva {
  @Prop({ type: Date, required: true })
  fecha_hora: Date;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  id_usuario: Usuario;

  @Prop({ type: Types.ObjectId, ref: 'Cancha', required: true })
  id_cancha: Cancha;
}

export const ReservaSchema = SchemaFactory.createForClass(Reserva);
