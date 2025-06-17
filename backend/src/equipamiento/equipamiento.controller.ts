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
  NotFoundException,
  Req // <-- 1. Importar Req
} from '@nestjs/common';
import { EquipamientoService } from './equipamiento.service';
import { Equipamiento } from './equipamiento.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express'; // <-- 2. Importar Request
 interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string; // y cualquier otra propiedad que tengas en el payload del token
  };
}
@Controller('equipamiento')
export class EquipamientoController {
  constructor(private readonly equipamientoService: EquipamientoService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    // Se agrupan los datos en un solo objeto 'data'
    @Body() data: { nombre: string, stock: number, tipo: string, costo: number },
    @Req() req: RequestWithUser, // Se añade para obtener el request
  ) {
    const adminId = (req.user as any).userId; // Se obtiene el ID del admin
    return this.equipamientoService.create(data, adminId); // Se pasa el adminId al servicio
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
    @Body() updateData: { stock?: number; costo?: number },
    @Req() req: RequestWithUser, // Se añade para obtener el request
  ) {
    const adminId = (req.user as any).userId; // Se obtiene el ID del admin
    return this.equipamientoService.update(id, updateData, adminId); // Se pasa el adminId
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) { // Se añade para obtener el request
    const adminId = (req.user as any).userId; // Se obtiene el ID del admin
    return this.equipamientoService.remove(id, adminId); // Se pasa el adminId
  }
}