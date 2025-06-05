// backend/src/equipamiento/equipamiento.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Equipamiento, EquipamientoDocument } from './equipamiento.schema';
import { Model } from 'mongoose';

@Injectable()
export class EquipamientoService {
  constructor(
    @InjectModel(Equipamiento.name) 
    private equipamientoModel: Model<EquipamientoDocument>
  ) {}

  async create(data: { 
    nombre: string; 
    stock: number; 
    tipo: string; 
    costo: number 
  }): Promise<Equipamiento> {
    // Validaciones
    if (!data.nombre || data.nombre.trim() === '') {
      throw new BadRequestException('El nombre del equipamiento es requerido');
    }

    if (!data.stock || data.stock < 0) {
      throw new BadRequestException('El stock debe ser un número positivo');
    }

    if (!data.tipo || data.tipo.trim() === '') {
      throw new BadRequestException('El tipo de equipamiento es requerido');
    }

    if (!data.costo || data.costo <= 0) {
      throw new BadRequestException('El costo debe ser mayor a 0');
    }

    const idEquipamiento = `equip_${data.nombre.toLowerCase().replace(/\s+/g, '_')}`;

    // Verificar si ya existe
    const existe = await this.equipamientoModel.findOne({ 
      id_equipamiento: idEquipamiento 
    }).exec();
    
    if (existe) {
      throw new ConflictException(`El equipamiento ${data.nombre} ya existe`);
    }

    // Crear nuevo equipamiento
    const nuevoEquipamiento = new this.equipamientoModel({
      id_equipamiento: idEquipamiento,
      nombre: data.nombre,
      stock: data.stock,
      tipo: data.tipo,
      costo: data.costo
    });

    return nuevoEquipamiento.save();
  }

  async findAll(): Promise<Equipamiento[]> {
    return this.equipamientoModel.find().exec();
  }

  async findOne(id: string): Promise<Equipamiento> {
    const equipamiento = await this.equipamientoModel.findOne({ 
      id_equipamiento: id 
    }).exec();
    
    if (!equipamiento) {
      throw new NotFoundException(`Equipamiento con ID ${id} no encontrado`);
    }
    
    return equipamiento;
  }

  async update(id: string, updateData: { stock?: number; costo?: number }): Promise<Equipamiento> {
    const equipamientoActualizado = await this.equipamientoModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    ).exec();

    if (!equipamientoActualizado) {
        throw new NotFoundException(`Equipamiento con ID ${id} no encontrado`);
    }

    return equipamientoActualizado;
  }

  async remove(id: string): Promise<{ message: string }> {

    const result = await this.equipamientoModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Equipamiento con ID ${id} no encontrado`);
    }
    
    return { message: 'Equipamiento eliminado exitosamente' };
  }
}