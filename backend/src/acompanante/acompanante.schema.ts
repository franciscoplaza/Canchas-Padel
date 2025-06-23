// === Canchas-Padel-main/backend/src/acompanante/acompanante.schema.ts ===
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AcompananteDocument = Acompanante & Document;

@Schema()
export class Acompanante {
  @Prop({ required: true })
  nombres: string;

  @Prop({ required: true })
  apellidos: string;

  @Prop({ required: true })
  rut: string;

  @Prop({ required: true })
  edad: number;

  @Prop({ required: true, ref: 'Reserva' })
  id_reserva: string;
}

export const AcompananteSchema = SchemaFactory.createForClass(Acompanante);