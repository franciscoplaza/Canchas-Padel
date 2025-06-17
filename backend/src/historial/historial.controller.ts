import { Controller, Get, UseGuards } from '@nestjs/common';
import { HistorialService } from './historial.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('historial')
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    // Aquí podrías añadir lógica para verificar si el usuario es admin
    return this.historialService.findAll();
  }
}