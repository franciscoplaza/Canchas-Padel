// backend/src/reserva/reserva.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reserva } from './reserva.schema';
import { Cancha } from '../cancha/cancha.schema';
import { Usuario } from '../usuario/usuario.schema';
import { Equipamiento } from '../equipamiento/equipamiento.schema';
import { AcompananteService } from '../acompanante/acompanante.service';

@Injectable()
export class ReservaService {
  private readonly HORARIOS_DISPONIBLES = [
    '09:00', '10:30', '12:00', // Mañana
    '14:00', '15:30', '17:00', '18:30', '20:00' // Tarde
  ];

  constructor(
    @InjectModel(Reserva.name) private reservaModel: Model<Reserva>,
    @InjectModel(Cancha.name) private canchaModel: Model<Cancha>,
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    @InjectModel(Equipamiento.name) private equipamientoModel: Model<Equipamiento>,
    private readonly acompananteService: AcompananteService,
  ) {}

  async crearReserva(rutUsuario: string, idCancha: string, fecha: string, hora_inicio: string, equipamiento: {[key: string]: number} = {}, acompanantes: any[] = []) {
    // Validar cancha
    const cancha = await this.canchaModel.findOne({ id_cancha: idCancha });
    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    // Validar usuario
    const usuario = await this.usuarioModel.findOne({ rut: rutUsuario });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (acompanantes.length > cancha.capacidad_maxima - 1) {
      throw new BadRequestException(
        `La cancha tiene capacidad para ${cancha.capacidad_maxima} personas (incluyendo al titular). ` +
        `Has seleccionado ${acompanantes.length} acompañantes, lo que excede el límite.`
      );
    }

    // Validar equipamiento
    let totalEquipamiento = 0;
    const equipamientoDetalle: {
      id_equipamiento: string;
      nombre: string;
      cantidad: number;
      costo_unitario: number;
      subtotal: number;
    }[] = [];

    
    for (const [id, cantidad] of Object.entries(equipamiento)) {
      if (cantidad > 0) {
        const equip = await this.equipamientoModel.findById(id);
        if (!equip) {
          throw new NotFoundException(`Equipamiento con ID ${id} no encontrado`);
        }
        if (equip.stock < cantidad) {
          throw new BadRequestException(`Stock insuficiente para ${equip.nombre}`);
        }
        totalEquipamiento += equip.costo * cantidad;
        equipamientoDetalle.push({
          id_equipamiento: equip.id_equipamiento,
          nombre: equip.nombre,
          cantidad,
          costo_unitario: equip.costo,
          subtotal: equip.costo * cantidad
        });
      }
    }

    const totalReserva = cancha.precio + totalEquipamiento;

    // Validar saldo suficiente
    if (usuario.saldo < totalReserva) {
      throw new BadRequestException('Saldo insuficiente para realizar la reserva');
    }

    // Validar horario
    if (!this.HORARIOS_DISPONIBLES.includes(hora_inicio)) {
      throw new BadRequestException('Horario no válido. Los horarios disponibles son: ' + 
        this.HORARIOS_DISPONIBLES.join(', '));
    }

    // Crear fecha_hora combinando fecha y hora
    const [horas, minutos] = hora_inicio.split(':').map(Number);
    const fechaHora = new Date(fecha);
    fechaHora.setHours(horas, minutos, 0, 0);

    // Verificar disponibilidad
    const existeReserva = await this.reservaModel.findOne({
      id_cancha: idCancha,
      fecha_hora: fechaHora
    });

    if (existeReserva) {
      throw new BadRequestException('La cancha ya está reservada en este horario');
    }

    // Iniciar transacción
    const session = await this.reservaModel.db.startSession();
    session.startTransaction();

    try {
      // Descontar saldo
      await this.usuarioModel.findOneAndUpdate(
        { rut: rutUsuario },
        {
          $inc: { saldo: -totalReserva },
          $push: {
            transacciones: {
              monto: totalReserva,
              tipo: 'pago',
              fecha: new Date(),
              descripcion: `Pago por reserva en ${idCancha} y equipamiento`
            }
          }
        },
        { session }
      );

      // Actualizar stock de equipamiento
      for (const [id, cantidad] of Object.entries(equipamiento)) {
        if (cantidad > 0) {
          await this.equipamientoModel.findByIdAndUpdate(
            id,
            { $inc: { stock: -cantidad } },
            { session }
          );
        }
      }

      // Crear reserva
      const reserva = new this.reservaModel({
        fecha_hora: fechaHora,
        id_usuario: rutUsuario,
        id_cancha: idCancha,
        precio: cancha.precio,
        equipamiento: equipamientoDetalle,
        estado: 'confirmada',
        capacidad_cancha: cancha.capacidad_maxima,
        cantidad_acompanantes: acompanantes.length
      });

      const reservaCreada = await reserva.save({ session });

      // Crear acompañantes
      for (const acompanante of acompanantes) {
        await this.acompananteService.crearAcompanante({
          ...acompanante,
          id_reserva: reservaCreada._id.toString()
        });
      }

      await session.commitTransaction();
      return reserva;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async obtenerReservasPorUsuario(idUsuario: string) {
    return this.reservaModel.find({ id_usuario: idUsuario }).exec();
  }

  async obtenerTodasLasReservas() {
    return this.reservaModel.aggregate([
      {
        $lookup: {
          from: 'usuarios',
          localField: 'id_usuario',
          foreignField: 'rut',
          as: 'usuario'
        }
      },
      {
        $unwind: '$usuario'
      },
      {
        $project: {
          _id: 1,
          fecha_hora: 1,
          'id_cancha': 1,
          'usuario.nombreUsuario': 1
        }
      }
    ]).exec();
  }

  async obtenerAcompanantes(idReserva: string) {
    // Validar que la reserva existe
    const reserva = await this.reservaModel.findById(idReserva);
    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    // Obtener los acompañantes de esta reserva
    return this.acompananteService.obtenerPorReserva(idReserva);
  }

}