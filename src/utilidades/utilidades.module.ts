import { Module } from '@nestjs/common';
import { UtilidadesController } from './utilidades.controller';
import { UtilidadesService } from './utilidades.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ciudad } from './entities/ciudad.entity';
import { Genero } from './entities/genero.entity';
import { Provincia } from './entities/provincia.entity';
import { HttpModule } from '@nestjs/axios';
import { Grupo } from './entities/grupo.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Ciudad, Genero, Provincia, Grupo]),
		HttpModule.register({
			baseURL:
				process.env.GEOREF_BASE_URL ??
				'https://apis.datos.gob.ar/georef/api',
			timeout: 15000,
		}),
	],
	controllers: [UtilidadesController],
	providers: [UtilidadesService],
	exports: [UtilidadesService],
})
export class UtilidadesModule {}
