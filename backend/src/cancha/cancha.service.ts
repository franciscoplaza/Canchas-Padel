// backend/src/cancha/cancha.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cancha, CanchaDocument } from './cancha.schema';
import { Model } from 'mongoose';

@Injectable()
export class CanchaService {
  constructor(@InjectModel(Cancha.name) private canchaModel: Model<CanchaDocument>) {}

  // src/cancha/cancha.service.ts
async create(data: { numero: number; precio: number }): Promise<Cancha> {
    // Validar que el número sea positivo
    if (!data.numero || data.numero <= 0) {
      throw new BadRequestException('El número de cancha debe ser mayor a 0');
    }

    // Validar precio positivo
    if (!data.precio || data.precio <= 0) {
      throw new BadRequestException('El precio debe ser mayor a 0');
    }

    const idCancha = `cancha_${data.numero}`;

    // Verificar si ya existe una cancha con este número
    const existe = await this.canchaModel.findOne({ id_cancha: idCancha }).exec();
    if (existe) {
      throw new ConflictException(`La cancha número ${data.numero} ya existe`);
    }

    // Crear nueva cancha
    const nuevaCancha = new this.canchaModel({
      id_cancha: idCancha,
      precio: data.precio
    });

    return nuevaCancha.save();
  }

  async findAll(): Promise<Cancha[]> {
    return this.canchaModel.find().exec();
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.canchaModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Cancha con ID ${id} no encontrada`);
    }
    return { message: 'Cancha eliminada exitosamente' };
  }

  async updatePrecio(id: string, precio: number): Promise<Cancha> {
    const canchaActualizada = await this.canchaModel.findByIdAndUpdate(
      id,
      { precio },
      { new: true } // Devuelve el documento actualizado
    ).exec();

    if (!canchaActualizada) {
      throw new NotFoundException(`Cancha con ID ${id} no encontrada`);
    }

    return canchaActualizada;
  }
  
}