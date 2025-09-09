import { forwardRef, Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { Cliente } from './entities/cliente.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Cliente]),
		forwardRef(() => AuthModule),
	],
	providers: [ClientesService],
	controllers: [ClientesController],
	exports: [ClientesService],
})
export class ClientesModule {}
