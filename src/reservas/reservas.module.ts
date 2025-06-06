import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { ClientesModule } from 'src/clientes/clientes.module';
import { CuidadoresModule } from 'src/cuidadores/cuidadores.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Reserva]),
		ClientesModule,
		CuidadoresModule,
	],
	providers: [ReservasService],
	controllers: [ReservasController],
	exports: [ReservasService],
})
export class ReservasModule {}
