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
import { CuidadoresService } from './cuidadores.service';
import { CreateCuidadorDto } from './dto/create-cuidador.dto';
import { UpdateCuidadorDto } from './dto/update-cuidador.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../auth/entities/usuario.entity';

@Controller('cuidadores')
export class CuidadoresController {
	constructor(private readonly cuidadoresService: CuidadoresService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	async create(
		@Body(new ValidationPipe({ whitelist: true }))
		createCuidadorDto: CreateCuidadorDto,
	) {
		return this.cuidadoresService.create(createCuidadorDto);
	}

	@Get()
	async findAll() {
		return this.cuidadoresService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		return this.cuidadoresService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	async update(
		@Param('id') id: string,
		@Body(new ValidationPipe({ whitelist: true }))
		updateCuidadorDto: UpdateCuidadorDto,
	) {
		return this.cuidadoresService.update(id, updateCuidadorDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	async remove(@Param('id') id: string) {
		await this.cuidadoresService.remove(id);
		return { message: `Cuidador ${id} eliminado` };
	}
}
