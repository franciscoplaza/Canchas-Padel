// backend/src/cancha/cancha.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cancha, CanchaDocument } from './cancha.schema';
import { Model } from 'mongoose';
import { HistorialService } from '../historial/historial.service'; // <-- AÑADIR
import { TipoAccion } from '../historial/historial.schema';

@Injectable()
export class CanchaService {
  constructor(@InjectModel(Cancha.name) private canchaModel: Model<CanchaDocument>,
  private readonly historialService: HistorialService,) {}


async create(data: { numero: number; precio: number; capacidad_maxima?: number }, adminId: string): Promise<Cancha> {

    if (!data.numero || data.numero <= 0) {
      throw new BadRequestException('El número de cancha debe ser mayor a 0');
    }
      if (!data.precio || data.precio <= 0) {
      throw new BadRequestException('El precio debe ser mayor a 0');
    }

    const idCancha = `cancha_${data.numero}`;
      const existe = await this.canchaModel.findOne({ id_cancha: idCancha }).exec();
    if (existe) {
      throw new ConflictException(`La cancha número ${data.numero} ya existe`);
    }

      const nuevaCancha = new this.canchaModel({
      id_cancha: idCancha,
      precio: data.precio,
      capacidad_maxima: data.capacidad_maxima || 4
    });
    
    const canchaGuardada = await nuevaCancha.save();

    // REGISTRO EN HISTORIAL
    await this.historialService.registrar(
      adminId,
      TipoAccion.CREAR_CANCHA,
      'Cancha',
      canchaGuardada.id, // <-- CORRECCIÓN: Usamos .id para obtener el string del ID.
      {
        id_cancha: canchaGuardada.id_cancha,
        precio: canchaGuardada.precio,
        descripcion: `Admin creó la cancha número ${data.numero}.`
      }
    );

    return canchaGuardada;
  }

  async findAll(): Promise<Cancha[]> {
    return this.canchaModel.find().exec();
  }

  async remove(id: string, adminId: string): Promise<{ message: string }> {
    const cancha = await this.canchaModel.findById(id).exec();
    if (!cancha) {
      throw new NotFoundException(`Cancha con ID ${id} no encontrada`);
    }
    
    // Guardamos los datos antes de borrar para el historial
    const idCanchaEliminada = cancha.id;
    const datosCanchaEliminada = {
        id_cancha: cancha.id_cancha,
        precio: cancha.precio,
        descripcion: `Admin eliminó la cancha ${cancha.id_cancha}.`
    };

    const result = await this.canchaModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Cancha con ID ${id} no encontrada para eliminar.`);
    }

    // REGISTRO EN HISTORIAL
    await this.historialService.registrar(
      adminId,
      TipoAccion.ELIMINAR_CANCHA,
      'Cancha',
      idCanchaEliminada, // <-- CORRECCIÓN: Usamos la variable que guardamos.
      datosCanchaEliminada
    );
    
    return { message: 'Cancha eliminada exitosamente' };
  }

  async updatePrecio(id: string, precio: number, adminId: string): Promise<Cancha> {
    const canchaAntes = await this.canchaModel.findById(id).exec();
    if (!canchaAntes) {
      throw new NotFoundException(`Cancha con ID ${id} no encontrada`);
    }

    const precioAnterior = canchaAntes.precio;

    const canchaActualizada = await this.canchaModel.findByIdAndUpdate(
      id,
      { precio },
      { new: true } 
    ).exec();

    // <-- CORRECCIÓN: Se añade una validación para asegurar que la cancha se actualizó.
    if (!canchaActualizada) {
      throw new NotFoundException(`La cancha con ID ${id} no se pudo actualizar.`);
    }

    // REGISTRO EN HISTORIAL
    await this.historialService.registrar(
      adminId,
      TipoAccion.MODIFICAR_CANCHA,
      'Cancha',
      canchaActualizada.id, // <-- CORRECCIÓN: Usamos .id para obtener el string del ID.
      {
        id_cancha: canchaActualizada.id_cancha,
        precioAnterior: precioAnterior,
        precioNuevo: canchaActualizada.precio,
        descripcion: `Admin actualizó el precio de la cancha ${canchaActualizada.id_cancha}.`
      }
    );

    return canchaActualizada;
  }

  async updateCancha(
    id: string,
    updateData: { precio?: number; capacidad_maxima?: number }, adminId: string
  ): Promise<Cancha> {

    const canchaAntes = await this.canchaModel.findById(id).exec();
    if (!canchaAntes) {
      throw new NotFoundException(`Cancha con ID ${id} no encontrada`);
    }

    const precioAnterior = canchaAntes.precio;
    // 1. Busca y actualiza la cancha
    const canchaActualizada = await this.canchaModel
      .findByIdAndUpdate(
        id,
        { $set: updateData }, // Actualiza ambos campos
        { new: true } // Devuelve el documento actualizado
      )
      .exec();

    // 2. Si no se encontró la cancha, lanza un error
    if (!canchaActualizada) {
      throw new NotFoundException(`Cancha con ID ${id} no encontrada`);
    }

    // REGISTRO EN HISTORIAL
    await this.historialService.registrar(
      adminId,
      TipoAccion.MODIFICAR_CANCHA,
      'Cancha',
      canchaActualizada.id, // <-- CORRECCIÓN: Usamos .id para obtener el string del ID.
      {
        id_cancha: canchaActualizada.id_cancha,
        precioAnterior: precioAnterior,
        precioNuevo: canchaActualizada.precio,
        descripcion: `Admin actualizó el precio de la cancha ${canchaActualizada.id_cancha}.`
      }
    );

    // 3. Retorna la cancha actualizada (TypeScript ahora sabe que siempre hay un valor de retorno)
    return canchaActualizada;
  }
  
}
