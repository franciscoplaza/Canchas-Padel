// backend/src/equipamiento/equipamiento.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Equipamiento, EquipamientoDocument } from './equipamiento.schema';
import { Model } from 'mongoose';
import { HistorialService } from '../historial/historial.service'; // <-- AÑADIR
import { TipoAccion } from '../historial/historial.schema';

@Injectable()
export class EquipamientoService {
  constructor(
    @InjectModel(Equipamiento.name) 
    private equipamientoModel: Model<EquipamientoDocument>,
    private readonly historialService: HistorialService
  ) {}

  // CORRECCIÓN: Se añade 'adminId' para saber quién realiza la acción
  async create(data: { 
    nombre: string; 
    stock: number; 
    tipo: string; 
    costo: number 
  }, adminId: string): Promise<Equipamiento> {
    // Tu lógica de validación se mantiene igual
    if (!data.nombre || data.nombre.trim() === '') {
      throw new BadRequestException('El nombre del equipamiento es requerido');
    }
    if (data.stock === undefined || data.stock < 0) {
      throw new BadRequestException('El stock debe ser un número positivo');
    }
    if (!data.tipo || data.tipo.trim() === '') {
      throw new BadRequestException('El tipo de equipamiento es requerido');
    }
    if (!data.costo || data.costo <= 0) {
      throw new BadRequestException('El costo debe ser mayor a 0');
    }

    const idEquipamiento = `equip_${data.nombre.toLowerCase().replace(/\s+/g, '_')}`;
    const existe = await this.equipamientoModel.findOne({ id_equipamiento: idEquipamiento }).exec();
    if (existe) {
      throw new ConflictException(`El equipamiento ${data.nombre} ya existe`);
    }

    const nuevoEquipamiento = new this.equipamientoModel({
      id_equipamiento: idEquipamiento,
      nombre: data.nombre,
      stock: data.stock,
      tipo: data.tipo,
      costo: data.costo
    });

    const equipamientoGuardado = await nuevoEquipamiento.save();

    // REGISTRO EN HISTORIAL
    await this.historialService.registrar(
      adminId,
      TipoAccion.CREAR_EQUIPAMIENTO,
      'Equipamiento',
      equipamientoGuardado.id,
      {
        nombre: equipamientoGuardado.nombre,
        stock: equipamientoGuardado.stock,
        costo: equipamientoGuardado.costo
      }
    );

    return equipamientoGuardado;
  }

  async findAll(): Promise<Equipamiento[]> {
    return this.equipamientoModel.find().exec();
  }

  async findOne(id: string): Promise<Equipamiento> {
    const equipamiento = await this.equipamientoModel.findById(id).exec(); // Se busca por _id
    if (!equipamiento) {
      throw new NotFoundException(`Equipamiento con ID ${id} no encontrado`);
    }
    return equipamiento;
  }

  // CORRECCIÓN: Se añade 'adminId'
  async update(id: string, updateData: { stock?: number; costo?: number }, adminId: string): Promise<Equipamiento> {
    const equipamientoAntes = await this.findOne(id);
    const equipamientoActualizado = await this.equipamientoModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    ).exec();

    if (!equipamientoActualizado) {
        throw new NotFoundException(`Equipamiento con ID ${id} no encontrado`);
    }

    // REGISTRO EN HISTORIAL
    await this.historialService.registrar(
      adminId,
      TipoAccion.MODIFICAR_EQUIPAMIENTO,
      'Equipamiento',
      equipamientoActualizado.id,
      {
        nombre: equipamientoActualizado.nombre,
        cambios: {
            stock: { de: equipamientoAntes.stock, a: equipamientoActualizado.stock },
            costo: { de: equipamientoAntes.costo, a: equipamientoActualizado.costo }
        }
      }
    );

    return equipamientoActualizado;
  }

  // CORRECCIÓN: Se añade 'adminId'
  async remove(id: string, adminId: string): Promise<{ message: string }> {
    const equipamiento = await this.findOne(id);

    const result = await this.equipamientoModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Equipamiento con ID ${id} no encontrado para eliminar`);
    }
    
    // REGISTRO EN HISTORIAL
    await this.historialService.registrar(
        adminId,
        TipoAccion.ELIMINAR_EQUIPAMIENTO,
        'Equipamiento',
        equipamiento.id_equipamiento,
        {
            nombre: equipamiento.nombre,
            descripcion: `Admin eliminó el equipamiento "${equipamiento.nombre}".`
        }
    );
    
    return { message: 'Equipamiento eliminado exitosamente' };
  }
}