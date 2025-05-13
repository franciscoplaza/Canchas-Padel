import { 
  Injectable, 
  ConflictException, 
  BadRequestException, 
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../usuario/usuario.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    private jwtService: JwtService,
  ) {}

  // Validación de formato de RUT (para Chile)
  private validarRUT(rut: string): boolean {
    const pattern = /^[0-9]{7,8}-[0-9kK]{1}$/;
    return pattern.test(rut);
  }

  // Validación de contraseña segura
  private validarContraseña(contraseña: string): boolean {
    return contraseña.length >= 6;
  }

  async registrarUsuario(usuarioData: any): Promise<any> {
    const { correo, rut, contraseña, nombreUsuario} = usuarioData;

    // Validaciones
    if (!this.validarRUT(rut)) {
      throw new BadRequestException('El RUT no tiene un formato válido (ej: 12345678-9)');
    }

    if (!this.validarContraseña(contraseña)) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar si el usuario ya existe
    const existeCorreo = await this.usuarioModel.findOne({ correo });
    if (existeCorreo) {
      throw new ConflictException('El correo ya está registrado');
    }

    const existeRut = await this.usuarioModel.findOne({ rut });
    if (existeRut) {
      throw new ConflictException('El RUT ya está registrado');
    }
    const existeNombreUsuario = await this.usuarioModel.findOne({ nombreUsuario });
    if (existeNombreUsuario) {
    throw new ConflictException('El nombre de usuario ya está en uso');
    }
    // Crear nuevo usuario (rol 'cliente' por defecto)
    const nuevoUsuario = new this.usuarioModel({
      ...usuarioData,
      rol: 'cliente'
    });

    await nuevoUsuario.save();
    
    // Eliminamos la contraseña del objeto devuelto
    const { contraseña: _, ...usuarioSinContraseña } = nuevoUsuario.toObject();
    
    return usuarioSinContraseña;
  }

  async validarUsuario(correo: string, contraseña: string): Promise<any> {
    const usuario = await this.usuarioModel.findOne({ correo }).lean().exec();
    
    if (usuario && usuario.contraseña === contraseña) {
      const { contraseña, ...result } = usuario;
      return result;
    }
    return null;
  }

  async login(correo: string, contraseña: string) {
    const usuario = await this.validarUsuario(correo, contraseña);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      correo: usuario.correo, 
      sub: usuario.rut, // Usamos el RUT como identificador
      rol: usuario.rol 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        rut: usuario.rut,
        nombreUsuario: usuario.nombreUsuario,
        correo: usuario.correo,
        rol: usuario.rol
      }
    };
  }
}