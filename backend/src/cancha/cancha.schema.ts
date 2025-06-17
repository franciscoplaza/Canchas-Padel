// src/cancha/cancha.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CanchaDocument = Cancha & Document;

@Schema()
export class Cancha {
  @Prop({ required: true, unique: true })
  id_cancha: string;

  @Prop({ required: true })
  precio: number;

  @Prop({ required: true, default: 4 })
  capacidad_maxima: number;

}

export const CanchaSchema = SchemaFactory.createForClass(Cancha);
