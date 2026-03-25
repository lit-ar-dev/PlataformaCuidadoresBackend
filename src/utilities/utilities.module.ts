import { Module } from '@nestjs/common';
import { UtilitiesController } from './utilities.controller';
import { UtilitiesService } from './utilities.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { Gender } from './entities/gender.entity';
import { Province } from './entities/province.entity';
import { HttpModule } from '@nestjs/axios';
import { Group } from './entities/group.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([City, Gender, Province, Group]),
		HttpModule.register({
			baseURL:
				process.env.GEOREF_BASE_URL ??
				'https://apis.datos.gob.ar/georef/api',
			timeout: 15000,
		}),
	],
	controllers: [UtilitiesController],
	providers: [UtilitiesService],
	exports: [UtilitiesService],
})
export class UtilitiesModule {}
