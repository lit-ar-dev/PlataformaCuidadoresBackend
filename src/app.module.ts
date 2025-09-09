import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CuidadoresModule } from './cuidadores/cuidadores.module';
import { ReservasModule } from './reservas/reservas.module';
import { ClientesModule } from './clientes/clientes.module';
import { PagosModule } from './pagos/pagos.module';
import { ChatModule } from './chat/chat.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PersonasModule } from './personas/personas.module';
import { UtilidadesModule } from './utilidades/utilidades.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get<string>('DB_HOST'),
				port: parseInt(
					configService.get<string>('DB_PORT') ?? '5432',
					10,
				),
				username: configService.get<string>('DB_USERNAME'),
				password: configService.get<string>('DB_PASSWORD'),
				database: configService.get<string>('DB_NAME'),
				entities: [__dirname + '/**/*.entity{.ts,.js}'],
				synchronize: process.env.NODE_ENV !== 'production',
			}),
			inject: [ConfigService],
		}),
		AuthModule,
		ClientesModule,
		CuidadoresModule,
		ReservasModule,
		PagosModule,
		ChatModule,
		UsuariosModule,
		PersonasModule,
		UtilidadesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
