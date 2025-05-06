// src/reserva/reserva.controller.ts
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { Reserva } from './reserva.schema';

@Controller('reserva')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  create(@Body() data: Partial<Reserva>) {
    return this.reservaService.create(data);
  }

  @Get()
  findAll() {
    return this.reservaService.findAll();
  }

  @Get('mias')
  findByUsuario(@Query('usuarioId') usuarioId: string) {
    return this.reservaService.findByUsuario(usuarioId);
  }
}
