// src/cancha/cancha.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CanchaService } from './cancha.service';
import { Cancha } from './cancha.schema';

@Controller('cancha')
export class CanchaController {
  constructor(private readonly canchaService: CanchaService) {}

  @Post()
  create(@Body() data: Partial<Cancha>) {
    return this.canchaService.create(data);
  }

  @Get()
  findAll() {
    return this.canchaService.findAll();
  }
}
