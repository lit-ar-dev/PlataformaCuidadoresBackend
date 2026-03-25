import {
	Controller,
	Get,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';

@Controller('clients')
export class ClientsController {
	constructor(private readonly clientsService: ClientsService) {}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async findAll() {
		return this.clientsService.findAll();
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@Permissions('read', 'client')
	async findOne(@Param('id') id: string) {
		// validations are still missing
		return this.clientsService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@Permissions('update', 'client')
	async update(@Param('id') id: string, updateClientDto: UpdateClientDto) {
		// validations are still missing
		return this.clientsService.update(id, updateClientDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async remove(@Param('id') id: string) {
		await this.clientsService.remove(id);
		return { message: `Client ${id} deleted` };
	}
}
