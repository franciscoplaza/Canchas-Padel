import { Module } from '@nestjs/common';
import { ReservaController } from './reserva.controller';
import { ReservaService } from './reserva.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Reserva, ReservaSchema } from './reserva.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  imports: [AuthModule, UsuarioModule, MongooseModule.forFeature([{ name: Reserva.name, schema: ReservaSchema }])],
  controllers: [ReservaController],
  providers: [ReservaService],
  exports: [ReservaService]
})
export class ReservaModule {}
