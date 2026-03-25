import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaregiversService } from './caregivers.service';
import { CaregiversController } from './caregivers.controller';
import { Caregiver } from './entities/caregiver.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Tag } from './entities/tag.entity';
import { Service } from './entities/service.entity';
import { Rate } from './entities/rate.entity';
import { UtilitiesModule } from 'src/utilities/utilities.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Caregiver, Tag, Service, Rate]),
		forwardRef(() => AuthModule),
		UtilitiesModule,
	],
	providers: [CaregiversService],
	controllers: [CaregiversController],
	exports: [CaregiversService],
})
export class CaregiversModule {}
