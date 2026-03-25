import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CaregiversModule } from './caregivers/caregivers.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ClientsModule } from './clients/clients.module';
import { PaymentsModule } from './payments/payments.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { PersonsModule } from './persons/persons.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				url: configService.get<string>('DB_URL'),
				/*host: configService.get<string>('DB_HOST'),
				port: parseInt(
					configService.get<string>('DB_PORT') ?? '5432',
					10,
				),
				username: configService.get<string>('DB_USERNAME'),
				password: configService.get<string>('DB_PASSWORD'),
				database: configService.get<string>('DB_NAME'),*/
				entities: [__dirname + '/**/*.entity{.ts,.js}'],
				synchronize: process.env.NODE_ENV !== 'production',
				autoLoadEntities: true,
			}),
			inject: [ConfigService],
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'uploads'), // static files folder
			serveRoot: '/uploads', // public route
		}),
		AuthModule,
		ClientsModule,
		CaregiversModule,
		ReservationsModule,
		PaymentsModule,
		ChatModule,
		UsersModule,
		PersonsModule,
		UtilitiesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
