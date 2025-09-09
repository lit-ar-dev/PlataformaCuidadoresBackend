import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UtilidadesService } from './utilidades.service';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Genero } from './entities/genero.entity';
import { Ciudad } from './entities/ciudad.entity';
import { Provincia } from './entities/provincia.entity';
import { CreateUtilidadDto } from './dto/create-utilidad.dto';
import { Grupo } from './entities/grupo.entity';

@Controller('utilidades')
export class UtilidadesController {
	constructor(private readonly utilidadesService: UtilidadesService) {}

	@Post('/generos')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async createGenero(@Body() createGeneroDto: CreateUtilidadDto) {
		return this.utilidadesService.createGenero(createGeneroDto);
	}

	@Post('/ciudades')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async createCiudad(@Body() createCiudadDto: CreateUtilidadDto) {
		return this.utilidadesService.createCiudad(createCiudadDto);
	}

	@Post('/provincias')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async createProvincia(@Body() createProvinciaDto: CreateUtilidadDto) {
		return this.utilidadesService.createProvincia(createProvinciaDto);
	}

	@Post('/grupos')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async createGrupo(@Body() createGrupoDto: CreateUtilidadDto) {
		return this.utilidadesService.createGrupo(createGrupoDto);
	}

	@Get('/generos')
	async findAllGeneros() {
		return this.utilidadesService.findAllGeneros();
	}

	@Get('/ciudades')
	async findAllCiudades() {
		return this.utilidadesService.findAllCiudades();
	}

	@Get('/provincias')
	async findAllProvincias() {
		return this.utilidadesService.findAllProvincias();
	}

	@Get('/grupos')
	async findAllGrupos() {
		return this.utilidadesService.findAllGrupos();
	}

	@Get('/provincias/:id/ciudades')
	async findCiudadesByProvincia(@Param('id') id: number) {
		return this.utilidadesService.findCiudadesByProvincia(id);
	}

	@Get('/generos/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async findOneGenero(@Param('id') id: number) {
		// faltan validaciones
		return this.utilidadesService.findGeneroById(id);
	}

	@Get('/ciudades/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async findOneCiudad(@Param('id') id: number) {
		// faltan validaciones
		return this.utilidadesService.findCiudadById(id);
	}

	@Get('/provincias/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async findOneProvincia(@Param('id') id: number) {
		// faltan validaciones
		return this.utilidadesService.findProvinciaById(id);
	}

	@Get('/grupos/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async findOneGrupo(@Param('id') id: number) {
		// faltan validaciones
		return this.utilidadesService.findGrupoById(id);
	}

	@Patch('/generos/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async updateGenero(
		@Param('id') id: number,
		@Body() updateGeneroDto: Partial<Genero>,
	) {
		return this.utilidadesService.updateGenero(id, updateGeneroDto);
	}

	@Patch('/ciudades/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async updateCiudad(
		@Param('id') id: number,
		@Body() updateCiudadDto: Partial<Ciudad>,
	) {
		return this.utilidadesService.updateCiudad(id, updateCiudadDto);
	}

	@Patch('/provincias/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async updateProvincia(
		@Param('id') id: number,
		@Body() updateProvinciaDto: Partial<Provincia>,
	) {
		return this.utilidadesService.updateProvincia(id, updateProvinciaDto);
	}

	@Patch('/grupos/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async updateGrupo(
		@Param('id') id: number,
		@Body() updateGrupoDto: Partial<Grupo>,
	) {
		return this.utilidadesService.updateGrupo(id, updateGrupoDto);
	}

	@Delete('/generos/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async removeGenero(@Param('id') id: number) {
		await this.utilidadesService.removeGenero(id);
		return { message: `Genero ${id} eliminado` };
	}

	@Delete('/ciudades/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async removeCiudad(@Param('id') id: number) {
		await this.utilidadesService.removeCiudad(id);
		return { message: `Ciudad ${id} eliminada` };
	}

	@Delete('/provincias/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async removeProvincia(@Param('id') id: number) {
		await this.utilidadesService.removeProvincia(id);
		return { message: `Provincia ${id} eliminada` };
	}

	@Delete('/grupos/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async removeGrupo(@Param('id') id: number) {
		await this.utilidadesService.removeGrupo(id);
		return { message: `Grupo ${id} eliminado` };
	}
}
