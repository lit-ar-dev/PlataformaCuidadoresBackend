import { forwardRef, Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ClientsModule } from 'src/clients/clients.module';
import { CaregiversModule } from 'src/caregivers/caregivers.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Reservation]),
		forwardRef(() => AuthModule),
		ClientsModule,
		CaregiversModule,
	],
	providers: [ReservationsService],
	controllers: [ReservationsController],
	exports: [ReservationsService],
})
export class ReservationsModule {}
