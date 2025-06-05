// backend/src/equipamiento/equipamiento.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Delete, 
  Param, 
  UseGuards, 
  NotFoundException 
} from '@nestjs/common';
import { EquipamientoService } from './equipamiento.service';
import { Equipamiento } from './equipamiento.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('equipamiento')
export class EquipamientoController {
  constructor(private readonly equipamientoService: EquipamientoService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body('nombre') nombre: string,
    @Body('stock') stock: number,
    @Body('tipo') tipo: string,
    @Body('costo') costo: number
  ) {
    return this.equipamientoService.create({ nombre, stock, tipo, costo });
  }

  @Get()
  findAll() {
    return this.equipamientoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.equipamientoService.findOne(id);
  }

  @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateEquipamiento(
    @Param('id') id: string,
    @Body() updateData: { stock?: number; costo?: number }
    ) {
    return this.equipamientoService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.equipamientoService.remove(id);
  }
}