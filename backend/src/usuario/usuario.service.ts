import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario, UsuarioDocument } from './usuario.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async buscarPorNombre(nombreUsuario: string) {
    return this.usuarioModel.findOne({ nombreUsuario }).exec();
  }

  // Puedes agregar más funciones como registrarUsuario, eliminarUsuario, etc.
}
