import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private readonly usersService: UsersService,
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
		const user = await this.usersService.findOneWithRolesAndPerms(
			payload.sub,
		);
		if (!user) {
			throw new UnauthorizedException('Invalid token');
		}

		const roles = (user.roles ?? []).map((role) => ({
			name: role.name,
			permissions: (role.permissions ?? []).map((permission) => ({
				name: permission.name,
			})),
		}));

		return {
			id: user.id,
			name: user.person.name + ' ' + user.person.lastName,
			email: user.email,
			roles: roles,
		};
	}
}
