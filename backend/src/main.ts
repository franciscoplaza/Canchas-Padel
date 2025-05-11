import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para que el frontend pueda comunicarse con el backend
  app.enableCors({
    origin: 'http://localhost:5173', // Aquí especificas el puerto donde está corriendo tu frontend
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();