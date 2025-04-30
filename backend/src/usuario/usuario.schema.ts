// src/usuario/usuario.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

@Schema()
export class Usuario {
  @Prop({ required: true, unique: true })
  nombreUsuario: string;

  @Prop({ required: true })
  contraseña: string;

  @Prop({ required: true, unique: true })
  rut: string;

  @Prop({ required: true, unique: true })
  correo: string;

  @Prop({ required: true, enum: ['cliente', 'admin'], default: 'cliente' })
  rol: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
