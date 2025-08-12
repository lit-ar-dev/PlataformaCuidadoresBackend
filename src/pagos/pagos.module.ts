import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [ConfigModule, AuthModule],
	providers: [PagosService],
	controllers: [PagosController],
})
export class PagosModule {}
