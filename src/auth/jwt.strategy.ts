import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private readonly usuariosService: UsuariosService,
	) {
		const jwtSecret = configService.get<string>('JWT_SECRET');
		if (!jwtSecret) {
			throw new Error(
				'JWT_SECRET is not defined in environment variables',
			);
		}
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtSecret,
		});
	}

	async validate(payload: any) {
		const usuario = await this.usuariosService.findOneWithRolesAndPerms(
			payload.sub,
		);
		if (!usuario) {
			throw new UnauthorizedException('Token inválido');
		}

		const roles = (usuario.roles ?? []).map((rol) => ({
			nombre: rol.nombre,
			permisos: (rol.permisos ?? []).map((permiso) => ({
				nombre: permiso.nombre,
			})),
		}));

		return {
			id: usuario.id,
			nombre: usuario.persona.nombre + ' ' + usuario.persona.apellido,
			email: usuario.email,
			roles: roles,
		};
	}
}
