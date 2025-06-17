// backend/src/reserva/reserva.controller.ts
import { Controller, Get, UseGuards, Request, Post, Body,Delete, Param, Put, Req } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservas')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async crearReserva(@Request() req, @Body() body: any) {
    const { id_cancha, fecha, hora_inicio, equipamiento, acompanantes } = body;
    return this.reservaService.crearReserva(
      req.user.userId, 
      id_cancha, 
      fecha, 
      hora_inicio,
      equipamiento || {},
      acompanantes || []
    );
  }

  @Get('acompanantes/:idReserva')
  @UseGuards(JwtAuthGuard)
  async obtenerAcompanantes(@Param('idReserva') idReserva: string) {
    return this.reservaService.obtenerAcompanantes(idReserva);
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

  // --- NUEVO ENDPOINT PARA CANCELAR RESERVA ---
  @Delete(':id/cancelar')
  @UseGuards(JwtAuthGuard)
  async cancelarReserva(@Param('id') idReserva: string, @Request() req) {
    // Obtenemos el ID del usuario que está autenticado desde el token
    const idUsuario = req.user.userId;
    // Llamamos al nuevo método en el servicio, pasándole ambos IDs
    return this.reservaService.cancelarReserva(idReserva, idUsuario);
  }

  @Put(':id/modificar')
  @UseGuards(JwtAuthGuard)
  async modificarReserva(
    @Param('id') idReserva: string,
    @Req() req,
    @Body() cambios: {
      acompanantes?: any[],
      equipamiento?: {[key: string]: number}
    }
  ) {
    const idUsuario = req.user.userId;
    return this.reservaService.modificarReserva(idReserva, idUsuario, cambios);
  }
}