// === Canchas-Padel-main/backend/src/acompanante/acompanante.controller.ts ===
import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { AcompananteService } from './acompanante.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Acompanante } from './acompanante.schema';

@Controller('acompanantes')
export class AcompananteController {
  constructor(private readonly acompananteService: AcompananteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async crearAcompanante(@Body() acompananteData: Partial<Acompanante>) {
    return this.acompananteService.crearAcompanante(acompananteData);
  }

  @Get('reserva/:idReserva')
  @UseGuards(JwtAuthGuard)
  async obtenerPorReserva(@Param('idReserva') idReserva: string) {
    return this.acompananteService.obtenerPorReserva(idReserva);
  }
}