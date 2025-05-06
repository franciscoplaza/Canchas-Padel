// src/cancha/cancha.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cancha, CanchaDocument } from './cancha.schema';
import { Model } from 'mongoose';

@Injectable()
export class CanchaService {
  constructor(@InjectModel(Cancha.name) private canchaModel: Model<CanchaDocument>) {}

  async create(data: Partial<Cancha>): Promise<Cancha> {
    const nuevaCancha = new this.canchaModel(data);
    return nuevaCancha.save();
  }

  async findAll(): Promise<Cancha[]> {
    return this.canchaModel.find();
  }
}
