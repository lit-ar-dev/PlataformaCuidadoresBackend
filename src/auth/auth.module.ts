import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { User } from 'src/users/entities/user.entity';
import { Role } from './entities/role.entity';
import { UsersModule } from 'src/users/users.module';
import { PersonsModule } from 'src/persons/persons.module';
import { CaregiversModule } from 'src/caregivers/caregivers.module';
import { ClientsModule } from 'src/clients/clients.module';
import { AbilityFactory } from './ability.factory';
import { Permission } from './entities/permission.entity';
import { GoogleAuthService } from './google-auth-service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Role, Permission]),
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
		UsersModule,
		PersonsModule,
		forwardRef(() => CaregiversModule),
		ClientsModule,
		ConfigModule,
	],
	providers: [AuthService, JwtStrategy, AbilityFactory, GoogleAuthService],
	controllers: [AuthController],
	exports: [AuthService, AbilityFactory],
})
export class AuthModule {}
