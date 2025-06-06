import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuidadoresService } from './cuidadores.service';
import { CuidadoresController } from './cuidadores.controller';
import { Cuidador } from './entities/cuidador.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [TypeOrmModule.forFeature([Cuidador]), AuthModule],
	providers: [CuidadoresService],
	controllers: [CuidadoresController],
	exports: [CuidadoresService],
})
export class CuidadoresModule {}
