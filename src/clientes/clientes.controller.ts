import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	ValidationPipe,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../auth/entities/usuario.entity';

@Controller('clientes')
export class ClientesController {
	constructor(private readonly clientesService: ClientesService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	async create(
		@Body(new ValidationPipe({ whitelist: true }))
		createClienteDto: CreateClienteDto,
	) {
		return this.clientesService.create(createClienteDto);
	}

	@Get()
	async findAll() {
		return this.clientesService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		return this.clientesService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	async update(
		@Param('id') id: string,
		@Body(new ValidationPipe({ whitelist: true }))
		updateClienteDto: UpdateClienteDto,
	) {
		return this.clientesService.update(id, updateClienteDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	async remove(@Param('id') id: string) {
		await this.clientesService.remove(id);
		return { message: `Cliente ${id} eliminado` };
	}
}
