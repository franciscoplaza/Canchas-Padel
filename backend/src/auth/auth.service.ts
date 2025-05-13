// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from '../usuario/usuario.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    private jwtService: JwtService,
  ) {}

  async validarUsuario(correo: string, contraseña: string): Promise<any> {
    const usuario = await this.usuarioModel.findOne({ correo });
    if (usuario && usuario.contraseña === contraseña) {
      // Puedes usar bcrypt si luego deseas mayor seguridad
      const { contraseña, ...result } = usuario.toObject();
      return result;
    }
    return null;
  }

  async login(correo: string, contraseña: string) {
    const usuario = await this.validarUsuario(correo, contraseña);
    if (!usuario) {
      throw new UnauthorizedException('Correo o contraseña inválidos');
    }

    const payload = { correo: usuario.correo, sub: usuario._id };
    return {
      access_token: this.jwtService.sign(payload),
      usuario,
    };
  }
}
