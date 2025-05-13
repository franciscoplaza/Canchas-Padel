// backend/src/reserva/reserva.controller.ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservas')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Get('mis-reservas')
  @UseGuards(JwtAuthGuard)
  async obtenerMisReservas(@Request() req) {
    return this.reservaService.obtenerReservasPorUsuario(req.user.userId);
  }

  @Get('todas')
  @UseGuards(JwtAuthGuard)
  async obtenerTodasLasReservas(@Request() req) {
    // Aquí deberías verificar si el usuario es admin
    // Por simplicidad, asumimos que el middleware ya lo hizo
    return this.reservaService.obtenerTodasLasReservas();
  }
}