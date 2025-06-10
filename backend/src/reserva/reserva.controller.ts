import { Controller, Get, UseGuards, Request, Post, Body, Delete, Param } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservas')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async crearReserva(@Request() req, @Body() body: { id_cancha: string, fecha: string, hora_inicio: string }) {
    // req.user.userId contiene el RUT, que es lo que espera tu servicio
    return this.reservaService.crearReserva(req.user.userId, body.id_cancha, body.fecha, body.hora_inicio);
  }

  @Get('mis-reservas')
  @UseGuards(JwtAuthGuard)
  async obtenerMisReservas(@Request() req) {
    // req.user.userId contiene el RUT
    return this.reservaService.obtenerReservasPorUsuario(req.user.userId);
  }

  @Get('todas')
  @UseGuards(JwtAuthGuard)
  async obtenerTodasLasReservas() {
    return this.reservaService.obtenerTodasLasReservas();
  }

  // 👇 AÑADIMOS LA RUTA PARA ELIMINAR 👇
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async eliminarReserva(@Param('id') id: string) {
    return this.reservaService.eliminarReserva(id);
  }
}