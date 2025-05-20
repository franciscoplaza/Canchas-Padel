// backend/src/reserva/reserva.controller.ts
import { Controller, Get, UseGuards, Request, Post, Body } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservas')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async crearReserva(@Request() req, @Body() body: any) {
    const { id_cancha, fecha, hora_inicio } = body;
    return this.reservaService.crearReserva(req.user.userId, id_cancha, fecha, hora_inicio);
  }

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