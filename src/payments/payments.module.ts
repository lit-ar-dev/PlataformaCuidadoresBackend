import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [ConfigModule, AuthModule],
	providers: [PaymentsService],
	controllers: [PaymentsController],
})
export class PaymentsModule {}
