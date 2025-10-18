import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { PersonasModule } from 'src/personas/personas.module';
import { CuidadoresModule } from 'src/cuidadores/cuidadores.module';
import { ClientesModule } from 'src/clientes/clientes.module';
import { AbilityFactory } from './ability.factory';
import { Permiso } from './entities/permiso.entity';
import { GoogleAuthService } from './google-auth-service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Usuario, Rol, Permiso]),
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => {
				const secret = configService.get<string>('JWT_SECRET');
				const expiresEnv = configService.get<string>('JWT_EXPIRES_IN');
				const expiresIn = Number.parseInt(expiresEnv ?? '3600', 10);

				return {
					secret,
					signOptions: {
						expiresIn:
							Number.isFinite(expiresIn) && expiresIn > 0
								? expiresIn
								: 3600,
					},
				};
			},
			inject: [ConfigService],
		}),
		UsuariosModule,
		PersonasModule,
		forwardRef(() => CuidadoresModule),
		ClientesModule,
		ConfigModule,
	],
	providers: [AuthService, JwtStrategy, AbilityFactory, GoogleAuthService],
	controllers: [AuthController],
	exports: [AuthService, AbilityFactory],
})
export class AuthModule {}
