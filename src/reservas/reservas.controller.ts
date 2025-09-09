import {
	Controller,
	Get,
	Post,
	Patch,
	Param,
	Delete,
	UseGuards,
	Req,
	ForbiddenException,
	Body,
} from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Permisos } from 'src/auth/decorators/permisos.decorator';
import { PermisosGuard } from 'src/auth/guards/permisos.guard';
import { Request } from 'express';

@Controller('reservas')
export class ReservasController {
	constructor(private readonly reservasService: ReservasService) {}

	@Post()
	@UseGuards(JwtAuthGuard, PermisosGuard)
	@Permisos('create', 'reserva')
	async create(createReservaDto: CreateReservaDto, @Req() req: Request) {
		const usuario = req.user;
		// falta buscar el usuario.id con el clienteId, y compararlo con req.user.id
		return this.reservasService.create(createReservaDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async findAll() {
		return this.reservasService.findAll();
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, PermisosGuard)
	@Permisos('read', 'reserva')
	async findOne(@Param('id') id: string) {
		return this.reservasService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, PermisosGuard)
	@Permisos('update', 'reserva')
	async update(
		@Param('id') id: string,
		@Body() updateReservaDto: UpdateReservaDto,
		@Req() req: Request,
	) {
		const reserva = await this.reservasService.findOne(id);

		const usuario = req.user;
		const isAdmin = usuario?.['roles'].includes('admin');
		const isOwner =
			usuario &&
			[
				reserva.cliente?.usuario?.id,
				reserva.cuidador?.usuario?.id,
			].includes(usuario['id']);

		if (!isOwner && !isAdmin) {
			throw new ForbiddenException('No puedes modificar esta reserva');
		}

		return this.reservasService.update(id, updateReservaDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async remove(@Param('id') id: string) {
		await this.reservasService.remove(id);
		return { message: `Reserva ${id} eliminada` };
	}
}
