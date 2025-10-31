import {
	Controller,
	Get,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
} from '@nestjs/common';
import { CuidadoresService } from './cuidadores.service';
import { UpdateCuidadorDto } from './dto/update-cuidador.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permisos } from 'src/auth/decorators/permisos.decorator';
import { PermisosGuard } from 'src/auth/guards/permisos.guard';
import { FindCuidadoresDto } from './dto/find-cuidadores.dto';

@Controller('cuidadores')
export class CuidadoresController {
	constructor(private readonly cuidadoresService: CuidadoresService) {}

	@Get()
	//@UseGuards(JwtAuthGuard, RolesGuard)
	//@Roles('admin')
	async findAll(@Query() filters: FindCuidadoresDto) {
		return this.cuidadoresService.findAll(filters);
	}

	@Get(':id')
	//@UseGuards(JwtAuthGuard, PermisosGuard)
	//@Permisos('read', 'cuidador')
	async findOne(@Param('id') id: string) {
		// faltan validaciones
		return this.cuidadoresService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, PermisosGuard)
	@Permisos('update', 'cuidador')
	async update(
		@Param('id') id: string,
		updateCuidadorDto: UpdateCuidadorDto,
	) {
		// faltan validaciones
		return this.cuidadoresService.update(id, updateCuidadorDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async remove(@Param('id') id: string) {
		await this.cuidadoresService.remove(id);
		return { message: `Cuidador ${id} eliminado` };
	}
}
