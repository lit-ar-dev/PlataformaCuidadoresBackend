import { Module } from '@nestjs/common';
import { PersonasController } from './personas.controller';
import { PersonasService } from './personas.service';
import { Persona } from './entities/persona.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilidadesModule } from 'src/utilidades/utilidades.module';

@Module({
	imports: [TypeOrmModule.forFeature([Persona]), UtilidadesModule],
	controllers: [PersonasController],
	providers: [PersonasService],
	exports: [PersonasService],
})
export class PersonasModule {}
