// backend/src/reserva/reserva.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Reserva } from './reserva.schema';
import { Cancha } from '../cancha/cancha.schema';
import { Usuario } from '../usuario/usuario.schema';
import { Equipamiento } from '../equipamiento/equipamiento.schema';
import { AcompananteService } from '../acompanante/acompanante.service';
import { HistorialService } from '../historial/historial.service'; 
import { TipoAccion } from '../historial/historial.schema';

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
    private readonly historialService: HistorialService,
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

    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar la fecha actual
    
    const sieteDiasDespues = new Date(hoy);
    sieteDiasDespues.setDate(hoy.getDate() + 7);
    
    if (fechaReserva < sieteDiasDespues) {
        throw new BadRequestException('Solo puedes reservar con al menos 7 días de anticipación');
    }

    // Validar que no sea fin de semana (sábado=6, domingo=0)
    const diaSemana = fechaReserva.getDay();
    if (diaSemana === 0 || diaSemana === 6) {
        throw new BadRequestException('No se permiten reservas los fines de semana (sábado y domingo)');
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

      // Registrar en el historial
      await this.historialService.registrar(
        usuario._id.toString(),
        TipoAccion.CREAR_RESERVA,
        'Reserva',
        reservaCreada._id.toString(),
        {
          descripcion: `Reserva creada para ${fechaHora.toLocaleString()} en cancha ${idCancha}`,
          montoTotal: totalReserva,
          equipamiento: equipamientoDetalle.map(item => ({
            nombre: item.nombre,
            cantidad: item.cantidad
          })),
          cantidadAcompanantes: acompanantes.length
        },
        session
      );

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

  async modificarReserva(
    idReserva: string,
    idUsuario: string,
    cambios: {
      acompanantes?: any[],
      equipamiento?: {[key: string]: number}
    }
  ): Promise<Reserva> {
    const session = await this.reservaModel.db.startSession();
    session.startTransaction();

    try {
      // 1. Verificar que la reserva existe y pertenece al usuario
      const reserva = await this.reservaModel.findById(idReserva).session(session);
      if (!reserva) {
        throw new NotFoundException('Reserva no encontrada');
      }

      if (reserva.id_usuario !== idUsuario) {
        throw new ForbiddenException('No tienes permiso para modificar esta reserva');
      }

      // 2. Verificar que faltan más de 7 días para la reserva
      const ahora = new Date();
      const fechaReserva = new Date(reserva.fecha_hora);
      const diferenciaTiempo = fechaReserva.getTime() - ahora.getTime();
      const sieteDiasEnMs = 7 * 24 * 60 * 60 * 1000;

      if (diferenciaTiempo < sieteDiasEnMs) {
        throw new BadRequestException('No se puede modificar la reserva con menos de 7 días de antelación');
      }

      // 3. Procesar cambios en acompañantes si existen
      if (cambios.acompanantes) {
        // Eliminar acompañantes existentes
        await this.acompananteService.eliminarPorReserva(idReserva);

        // Crear nuevos acompañantes
        for (const acompanante of cambios.acompanantes) {
          await this.acompananteService.crearAcompanante({
            ...acompanante,
            id_reserva: idReserva
          });
        }

        // Actualizar contador de acompañantes
        reserva.cantidad_acompanantes = cambios.acompanantes.length;
      }

      // 4. Procesar cambios en equipamiento si existen
      if (cambios.equipamiento) {
        // Devolver stock de equipamiento anterior
        for (const item of reserva.equipamiento) {
          await this.equipamientoModel.findOneAndUpdate(
            { id_equipamiento: item.id_equipamiento },
            { $inc: { stock: item.cantidad } },
            { session }
          );
        }

        // Procesar nuevo equipamiento
        let totalEquipamiento = 0;
        const equipamientoDetalle: {
          id_equipamiento: string;
          nombre: string;
          cantidad: number;
          costo_unitario: number;
          subtotal: number;
        }[] = [];

        for (const [id, cantidad] of Object.entries(cambios.equipamiento)) {
          if (cantidad > 0) {
            const equip = await this.equipamientoModel.findById(id).session(session);
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

            // Actualizar stock
            await this.equipamientoModel.findByIdAndUpdate(
              id,
              { $inc: { stock: -cantidad } },
              { session }
            );
          }
        }

        reserva.equipamiento = equipamientoDetalle;
      }

      // Guardar cambios
      const reservaActualizada = await reserva.save({ session });
      await session.commitTransaction();

      // Registrar en historial
      await this.historialService.registrar(
        idUsuario,
        TipoAccion.MODIFICAR_RESERVA,
        'Reserva',
        idReserva,
        {
          descripcion: `Usuario modificó su reserva para ${reserva.fecha_hora.toLocaleString()}`,
          cambios: cambios
        },
        session
      );

      return reservaActualizada;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

 // --- NUEVO MÉTODO PARA CANCELAR RESERVA ---
  async cancelarReserva(idReserva: string, idUsuarioQueCancela: string) {
    const session = await this.reservaModel.db.startSession();
    session.startTransaction();

    try {
      const reserva = await this.reservaModel.findById(idReserva).session(session);
      if (!reserva) {
        throw new NotFoundException('Reserva no encontrada');
      }

      const usuarioQueCancela = await this.usuarioModel.findOne({ rut: idUsuarioQueCancela }).session(session);
      if (!usuarioQueCancela) {
          throw new NotFoundException('Usuario que cancela no encontrado');
      }
      
      // Solo el usuario que hizo la reserva o un admin pueden cancelar
      if (reserva.id_usuario !== usuarioQueCancela.rut && usuarioQueCancela.rol !== 'admin') {
          throw new ForbiddenException('No tienes permiso para cancelar esta reserva.');
      }
      
      // Solo aplicar la restricción de 7 días si es el usuario (no admin)
      if (usuarioQueCancela.rol !== 'admin') {
        const ahora = new Date();
        const fechaReserva = new Date(reserva.fecha_hora);
        const diferenciaTiempo = fechaReserva.getTime() - ahora.getTime();
        const sieteDiasEnMs = 7 * 24 * 60 * 60 * 1000;

        if (diferenciaTiempo < sieteDiasEnMs) {
          throw new BadRequestException('No se puede cancelar la reserva con menos de 7 días de antelación.');
        }
      }

      // Solo devolver el dinero si ES admin quien cancela
      if (usuarioQueCancela.rol === 'admin') {
        // Calcular monto total a devolver
        const montoEquipamiento = reserva.equipamiento.reduce((acc, item) => acc + item.subtotal, 0);
        const montoTotalDevuelto = reserva.precio + montoEquipamiento;

        // Devolver saldo al usuario que hizo la reserva
        const usuarioReserva = await this.usuarioModel.findOneAndUpdate(
          { rut: reserva.id_usuario },
          { 
            $inc: { saldo: montoTotalDevuelto },
            $push: { 
              transacciones: {
                monto: montoTotalDevuelto,
                tipo: 'devolucion',
                fecha: new Date(),
                descripcion: `Devolución por cancelación ADMIN de reserva`
              }
            }
          },
          { session, new: true }
        );
        if(!usuarioReserva) {
            throw new NotFoundException('No se encontró el usuario original de la reserva para devolver el saldo.');
        }
      }

      // Devolver stock de equipamiento (siempre se hace)
      for (const item of reserva.equipamiento) {
        await this.equipamientoModel.findOneAndUpdate(
          { id_equipamiento: item.id_equipamiento },
          { $inc: { stock: item.cantidad } },
          { session }
        );
      }

      // Eliminar la reserva
      await this.reservaModel.findByIdAndDelete(idReserva, { session });
      
      // Registrar en el historial
      await this.historialService.registrar(
        usuarioQueCancela.id,
        TipoAccion.CANCELAR_RESERVA,
        'Reserva',
        idReserva,
        {
          descripcion: `Reserva para ${reserva.fecha_hora.toLocaleString()} fue cancelada por ${usuarioQueCancela.rut} (${usuarioQueCancela.rol}).`,
          montoDevuelto: usuarioQueCancela.rol === 'admin' ? reserva.precio : 0,
          usuarioReserva: reserva.id_usuario,
          conReembolso: usuarioQueCancela.rol === 'admin'
        },
        session
      );
      
      await session.commitTransaction();
      return { 
        message: 'Reserva cancelada exitosamente.',
        conReembolso: usuarioQueCancela.rol === 'admin'
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
