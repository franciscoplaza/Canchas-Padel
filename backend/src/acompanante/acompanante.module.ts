// === Canchas-Padel-main/backend/src/acompanante/acompanante.module.ts ===
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Acompanante, AcompananteSchema } from './acompanante.schema';
import { AcompananteService } from './acompanante.service';
import { AcompananteController } from './acompanante.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Acompanante.name, schema: AcompananteSchema }]),
  ],
  providers: [AcompananteService],
  controllers: [AcompananteController],
  exports: [AcompananteService],
})
export class AcompananteModule {}