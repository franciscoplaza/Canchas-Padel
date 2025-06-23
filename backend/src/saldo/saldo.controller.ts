// backend/src/saldo/saldo.controller.ts
import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SaldoService } from './saldo.service';

@Controller('saldo')
export class SaldoController {
  constructor(private readonly saldoService: SaldoService) {}

  @Post('cargar')
  @UseGuards(JwtAuthGuard)
  async cargarSaldo(@Request() req, @Body('monto') monto: number) {
    return this.saldoService.cargarSaldo(req.user.userId, monto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async obtenerSaldo(@Request() req) {
    return this.saldoService.obtenerSaldo(req.user.userId);
  }

  @Get('transacciones')
  @UseGuards(JwtAuthGuard)
  async obtenerTransacciones(@Request() req) {
    return this.saldoService.obtenerTransacciones(req.user.userId);
  }
}