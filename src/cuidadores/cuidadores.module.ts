import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuidadoresService } from './cuidadores.service';
import { CuidadoresController } from './cuidadores.controller';
import { Cuidador } from './entities/cuidador.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Tag } from './entities/tag.entity';
import { Servicio } from './entities/servicio.entity';
import { Tarifa } from './entities/tarifa.entity';
import { UtilidadesModule } from 'src/utilidades/utilidades.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Cuidador, Tag, Servicio, Tarifa]),
		forwardRef(() => AuthModule),
		UtilidadesModule,
	],
	providers: [CuidadoresService],
	controllers: [CuidadoresController],
	exports: [CuidadoresService],
})
export class CuidadoresModule {}
