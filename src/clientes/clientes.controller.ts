import {
	Controller,
	Get,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermisosGuard } from 'src/auth/guards/permisos.guard';
import { Permisos } from 'src/auth/decorators/permisos.decorator';

@Controller('clientes')
export class ClientesController {
	constructor(private readonly clientesService: ClientesService) {}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async findAll() {
		return this.clientesService.findAll();
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, PermisosGuard)
	@Permisos('read', 'cliente')
	async findOne(@Param('id') id: string) {
		// faltan validaciones
		return this.clientesService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, PermisosGuard)
	@Permisos('update', 'cliente')
	async update(@Param('id') id: string, updateClienteDto: UpdateClienteDto) {
		// faltan validaciones
		return this.clientesService.update(id, updateClienteDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async remove(@Param('id') id: string) {
		await this.clientesService.remove(id);
		return { message: `Cliente ${id} eliminado` };
	}
}
