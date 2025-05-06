// src/usuario/usuario.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario, UsuarioDocument } from './usuario.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsuarioService {
  constructor(@InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>) {}

  async create(data: Partial<Usuario>): Promise<Usuario> {
    const nuevoUsuario = new this.usuarioModel(data);
    return nuevoUsuario.save();
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioModel.find();
  }
}
