// src/cancha/cancha.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cancha, CanchaSchema } from './cancha.schema';
import { CanchaService } from './cancha.service';
import { CanchaController } from './cancha.controller';
import { HistorialModule } from '../historial/historial.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cancha.name, schema: CanchaSchema }]), HistorialModule],
  providers: [CanchaService],
  controllers: [CanchaController],
  exports: [CanchaService],

})
export class CanchaModule {}
