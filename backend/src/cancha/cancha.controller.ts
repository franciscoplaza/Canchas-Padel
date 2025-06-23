// backend/src/cancha/cancha.controller.ts
import { Controller, Get, Post, Put, Body, Delete, Param, UseGuards, NotFoundException, Req } from '@nestjs/common';
import { CanchaService } from './cancha.service';
import { Cancha } from './cancha.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('cancha')
export class CanchaController {
  constructor(private readonly canchaService: CanchaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)

  async create(
    @Body('numero') numero: number,
    @Body('precio') precio: number,
    @Req() req,
    @Body('capacidad_maxima') capacidad_maxima?: number,
  ) {
    const adminId = req.user.userId;
    return this.canchaService.create({ numero, precio, capacidad_maxima },adminId);
  }

  @Get()
  findAll() {
    return this.canchaService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req) {
    const adminId = req.user.userId;
    const result = await this.canchaService.remove(id,adminId);
    if (!result) {
      throw new NotFoundException(`Cancha con ID ${id} no encontrada`);
    }
    return { message: 'Cancha eliminada exitosamente' };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateCancha(
    @Param('id') id: string,
    @Body() updateData: { precio?: number, capacidad_maxima?: number },
    @Req() req,
  ) {
    const adminId = req.user.userId;
    return this.canchaService.updateCancha(id, updateData, adminId);
  }
}