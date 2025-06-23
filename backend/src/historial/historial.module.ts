import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Historial, HistorialSchema } from './historial.schema';
import { HistorialService } from './historial.service';
import { HistorialController } from './historial.controller';
import { Usuario, UsuarioSchema } from 'src/usuario/usuario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Historial.name, schema: HistorialSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
  ],
  providers: [HistorialService],
  controllers: [HistorialController],
  exports: [HistorialService], // Exportamos el servicio para que sea inyectable en otros módulos
})
export class HistorialModule {}