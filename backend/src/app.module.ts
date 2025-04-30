import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Carga variables del .env
    MongooseModule.forRoot(process.env.MONGO_URI!), // el ! le dice a TS que no es undefined - Conexión a MongoDB
    // Aquí luego podés importar tus módulos, como ReservaModule, CanchaModule, etc.
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

