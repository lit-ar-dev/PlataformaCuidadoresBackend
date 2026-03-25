import {
	Controller,
	Get,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
} from '@nestjs/common';
import { CaregiversService } from './caregivers.service';
import { UpdateCaregiverDto } from './dto/update-caregiver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { FindCaregiversDto } from './dto/find-caregivers.dto';

@Controller('caregivers')
export class CaregiversController {
	constructor(private readonly caregiversService: CaregiversService) {}

	@Get()
	//@UseGuards(JwtAuthGuard, RolesGuard)
	//@Roles('admin')
	async findAll(@Query() filters: FindCaregiversDto) {
		return this.caregiversService.findAll(filters);
	}

	@Get(':id')
	//@UseGuards(JwtAuthGuard, PermissionsGuard)
	//@Permissions('read', 'caregiver')
	async findOne(@Param('id') id: string) {
		// validations are still missing
		return this.caregiversService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@Permissions('update', 'caregiver')
	async update(
		@Param('id') id: string,
		updateCaregiverDto: UpdateCaregiverDto,
	) {
		// validations are still missing
		return this.caregiversService.update(id, updateCaregiverDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async remove(@Param('id') id: string) {
		await this.caregiversService.remove(id);
		return { message: `Caregiver ${id} deleted` };
	}
}
