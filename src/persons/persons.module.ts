import { Module } from '@nestjs/common';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { Person } from './entities/person.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilitiesModule } from 'src/utilities/utilities.module';

@Module({
	imports: [TypeOrmModule.forFeature([Person]), UtilitiesModule],
	controllers: [PersonsController],
	providers: [PersonsService],
	exports: [PersonsService],
})
export class PersonsModule {}
