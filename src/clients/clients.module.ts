import { forwardRef, Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { Client } from './entities/client.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Client]),
		forwardRef(() => AuthModule),
	],
	providers: [ClientsService],
	controllers: [ClientsController],
	exports: [ClientsService],
})
export class ClientsModule {}
