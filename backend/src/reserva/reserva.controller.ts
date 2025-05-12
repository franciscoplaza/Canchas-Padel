// src/reserva/reserva.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reservas')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard) // Protege esta ruta
  @Roles('admin')
  getAllReservas() {
    return this.reservaService.getAllReservas();
  }
}
