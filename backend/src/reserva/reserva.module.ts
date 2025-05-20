// backend/src/reserva/reserva.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservaService } from './reserva.service';
import { ReservaController } from './reserva.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { CanchaModule } from '../cancha/cancha.module';
import { Reserva, ReservaSchema } from './reserva.schema';
import { Cancha, CanchaSchema } from '../cancha/cancha.schema';
import { Usuario, UsuarioSchema } from '../usuario/usuario.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reserva.name, schema: ReservaSchema }]),
    MongooseModule.forFeature([{ name: Cancha.name, schema: CanchaSchema }]),
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    UsuarioModule,
    CanchaModule, 
  ],
  providers: [ReservaService],
  controllers: [ReservaController],
})
export class ReservaModule {}
