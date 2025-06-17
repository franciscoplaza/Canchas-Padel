// backend/src/equipamiento/equipamiento.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Equipamiento, EquipamientoSchema } from './equipamiento.schema';
import { EquipamientoService } from './equipamiento.service';
import { EquipamientoController } from './equipamiento.controller';
import { HistorialModule } from '../historial/historial.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Equipamiento.name, schema: EquipamientoSchema }
    ]),
    HistorialModule,
  ],
  providers: [EquipamientoService],
  controllers: [EquipamientoController],
  exports: [EquipamientoService],
})
export class EquipamientoModule {}