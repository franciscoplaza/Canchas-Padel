// backend/src/saldo/saldo.module.ts
import { Module } from '@nestjs/common';
import { SaldoService } from './saldo.service';
import { SaldoController } from './saldo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from '../usuario/usuario.schema';
import { HistorialModule } from '../historial/historial.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    HistorialModule
  ],
  providers: [SaldoService],
  controllers: [SaldoController],
})
export class SaldoModule {}