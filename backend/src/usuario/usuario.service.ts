// src/usuario/usuario.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario, UsuarioDocument } from './usuario.schema';
import { Model } from 'mongoose';
import { HistorialService } from '../historial/historial.service'; 
import { TipoAccion } from '../historial/historial.schema';  

@Injectable()
export class UsuarioService {
  constructor(@InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>) {}
  private readonly historialService: HistorialService

  async create(data: Partial<Usuario>): Promise<Usuario> {
    const nuevoUsuario = new this.usuarioModel(data);
    const usuarioGuardado = await nuevoUsuario.save();
  // --- REGISTRO DE LA ACCIÓN ---
    await this.historialService.registrar(
      usuarioGuardado.id, // ID del usuario que realiza la acción (el mismo que se crea)
      TipoAccion.CREAR_USUARIO,
      'Usuario',
      usuarioGuardado.id, // ID de la entidad afectada (el propio usuario)
      {
        rut: usuarioGuardado.rut,
        nombre: usuarioGuardado.nombreUsuario,
        correo: usuarioGuardado.correo,
        descripcion: `Usuario ${usuarioGuardado.nombreUsuario} (${usuarioGuardado.rut}) se ha registrado.`,
      },
    );
    // --- FIN DEL REGISTRO ---

    return usuarioGuardado; // 3. Devolver el usuario ya guardado en la BD
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioModel.find();
  }
}
