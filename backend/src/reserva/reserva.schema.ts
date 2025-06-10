import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Reserva extends Document {
  @Prop({ required: true })
  fecha: Date;

  @Prop({ required: true })
  hora: string;

  // Se guarda el RUT del usuario como un string
  @Prop({ type: String, required: true })
  id_usuario: string; 

  @Prop({ type: String, required: true })
  id_cancha: string;

  // Usamos 'recordatorioEnviado' como en tu versión
  @Prop({ default: false })
  recordatorioEnviado: boolean;
}

export const ReservaSchema = SchemaFactory.createForClass(Reserva);