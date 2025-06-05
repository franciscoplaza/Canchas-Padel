// backend/src/equipamiento/equipamiento.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EquipamientoDocument = Equipamiento & Document;

@Schema()
export class Equipamiento {
  @Prop({ required: true, unique: true })
  id_equipamiento: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  stock: number;

  @Prop({ required: true })
  tipo: string;

  @Prop({ required: true })
  costo: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const EquipamientoSchema = SchemaFactory.createForClass(Equipamiento);