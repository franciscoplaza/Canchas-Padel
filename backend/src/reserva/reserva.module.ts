import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reserva, ReservaSchema } from './reserva.schema';
import { ReservaService } from './reserva.service';
import { ReservaController } from './reserva.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { CanchaModule } from '../cancha/cancha.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reserva.name, schema: ReservaSchema }]),
    UsuarioModule,
    CanchaModule, 
  ],
  providers: [ReservaService],
  controllers: [ReservaController],
})
export class ReservaModule {}
