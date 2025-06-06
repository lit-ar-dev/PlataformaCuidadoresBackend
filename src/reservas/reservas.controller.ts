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
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/auth/entities/usuario.entity';
import { Roles } from 'src/auth/roles.decorator';

@Controller('reservas')
export class ReservasController {
	constructor(private readonly reservasService: ReservasService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	async create(
		@Body(new ValidationPipe({ whitelist: true }))
		createReservaDto: CreateReservaDto,
	) {
		return this.reservasService.create(createReservaDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	async findAll() {
		return this.reservasService.findAll();
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	async findOne(@Param('id') id: string) {
		return this.reservasService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	async update(
		@Param('id') id: string,
		@Body(new ValidationPipe({ whitelist: true }))
		updateReservaDto: UpdateReservaDto,
	) {
		return this.reservasService.update(id, updateReservaDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	async remove(@Param('id') id: string) {
		await this.reservasService.remove(id);
		return { message: `Reserva ${id} eliminada` };
	}
}
