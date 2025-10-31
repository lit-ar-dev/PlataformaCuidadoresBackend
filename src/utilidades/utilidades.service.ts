import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	OnModuleInit,
} from '@nestjs/common';
import { Genero } from './entities/genero.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Ciudad } from './entities/ciudad.entity';
import { Provincia } from './entities/provincia.entity';
import { CreateUtilidadDto } from './dto/create-utilidad.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Grupo } from './entities/grupo.entity';

@Injectable()
export class UtilidadesService {
	constructor(
		@InjectRepository(Genero)
		private readonly generoRepository: Repository<Genero>,
		@InjectRepository(Ciudad)
		private readonly ciudadRepository: Repository<Ciudad>,
		@InjectRepository(Provincia)
		private readonly provinciaRepository: Repository<Provincia>,
		@InjectRepository(Grupo)
		private readonly grupoRepository: Repository<Grupo>,
		private readonly http: HttpService,
	) {}

	/*async onModuleInit() {
		try {
			await this.refresh();
		} catch (err) {
			console.log(err);
			throw new InternalServerErrorException(
				'Error al inicializar el módulo de utilidades',
			);
		}
	}*/

	async createGenero(createUtilidadDto: CreateUtilidadDto): Promise<Genero> {
		const genero = this.generoRepository.create(createUtilidadDto);
		return this.generoRepository.save(genero);
	}

	async createCiudad(createUtilidadDto: CreateUtilidadDto): Promise<Ciudad> {
		const ciudad = this.ciudadRepository.create(createUtilidadDto);
		return this.ciudadRepository.save(ciudad);
	}

	async createProvincia(
		createUtilidadDto: CreateUtilidadDto,
	): Promise<Provincia> {
		const provincia = this.provinciaRepository.create(createUtilidadDto);
		return this.provinciaRepository.save(provincia);
	}

	async createGrupo(createUtilidadDto: CreateUtilidadDto): Promise<Grupo> {
		const grupo = this.grupoRepository.create(createUtilidadDto);
		return this.grupoRepository.save(grupo);
	}

	async findAllGeneros(manager?: EntityManager): Promise<Genero[]> {
		const generoRepository = manager
			? manager.getRepository(Genero)
			: this.generoRepository;
		return generoRepository.find();
	}

	async findAllCiudades(manager?: EntityManager): Promise<Ciudad[]> {
		const ciudadRepository = manager
			? manager.getRepository(Ciudad)
			: this.ciudadRepository;
		const ciudades = await ciudadRepository.find();
		return ciudades.sort((a, b) => a.nombre.localeCompare(b.nombre));
	}

	async findAllProvincias(manager?: EntityManager): Promise<Provincia[]> {
		const provinciaRepository = manager
			? manager.getRepository(Provincia)
			: this.provinciaRepository;
		const provincias = await provinciaRepository.find();
		return provincias.sort((a, b) => a.nombre.localeCompare(b.nombre));
	}

	async findAllGrupos(manager?: EntityManager): Promise<Grupo[]> {
		const grupoRepository = manager
			? manager.getRepository(Grupo)
			: this.grupoRepository;
		return grupoRepository.find();
	}

	async findGeneroById(
		id: number,
		manager?: EntityManager,
	): Promise<Genero | null> {
		const generoRepository = manager
			? manager.getRepository(Genero)
			: this.generoRepository;
		const genero = generoRepository.findOne({ where: { id } });
		if (!genero) {
			throw new NotFoundException(`Genero con id ${id} no encontrado`);
		}
		return genero;
	}

	async findCiudadById(
		id: number,
		manager?: EntityManager,
	): Promise<Ciudad | null> {
		const ciudadRepository = manager
			? manager.getRepository(Ciudad)
			: this.ciudadRepository;
		const ciudad = ciudadRepository.findOne({ where: { id } });
		if (!ciudad) {
			throw new NotFoundException(`Ciudad con id ${id} no encontrado`);
		}
		return ciudad;
	}

	async findCiudadesByProvincia(provinciaId: number): Promise<Ciudad[]> {
		const ciudades = await this.ciudadRepository.find({
			where: { provincia: { id: provinciaId } },
		});
		if (!ciudades) {
			throw new NotFoundException(
				`No se encontraron ciudades para la provincia con id ${provinciaId}`,
			);
		}
		return ciudades.sort((a, b) => a.nombre.localeCompare(b.nombre));
	}

	async findProvinciaById(
		id: number,
		manager?: EntityManager,
	): Promise<Provincia | null> {
		const provinciaRepository = manager
			? manager.getRepository(Provincia)
			: this.provinciaRepository;
		const provincia = await provinciaRepository.findOne({ where: { id } });
		if (!provincia) {
			throw new NotFoundException(`Provincia con id ${id} no encontrado`);
		}
		return provincia;
	}

	async findGrupoById(
		id: number,
		manager?: EntityManager,
	): Promise<Grupo | null> {
		const grupoRepository = manager
			? manager.getRepository(Grupo)
			: this.grupoRepository;
		const grupo = await grupoRepository.findOne({ where: { id } });
		if (!grupo) {
			throw new NotFoundException(`Grupo con id ${id} no encontrado`);
		}
		return grupo;
	}

	async updateGenero(
		id: number,
		updateGeneroDto: Partial<Genero>,
	): Promise<Genero> {
		const genero = await this.findGeneroById(id);
		if (!genero) {
			throw new NotFoundException(`Genero con id ${id} no encontrado`);
		}
		await this.generoRepository.update(id, updateGeneroDto);
		Object.assign(genero, updateGeneroDto);
		return genero;
	}

	async updateCiudad(
		id: number,
		updateCiudadDto: Partial<Ciudad>,
	): Promise<Ciudad> {
		const ciudad = await this.findCiudadById(id);
		if (!ciudad) {
			throw new NotFoundException(`Ciudad con id ${id} no encontrado`);
		}
		await this.ciudadRepository.update(id, updateCiudadDto);
		Object.assign(ciudad, updateCiudadDto);
		return ciudad;
	}

	async updateProvincia(
		id: number,
		updateProvinciaDto: Partial<Provincia>,
	): Promise<Provincia> {
		const provincia = await this.findProvinciaById(id);
		if (!provincia) {
			throw new NotFoundException(`Provincia con id ${id} no encontrado`);
		}
		await this.provinciaRepository.update(id, updateProvinciaDto);
		Object.assign(provincia, updateProvinciaDto);
		return provincia;
	}

	async updateGrupo(
		id: number,
		updateGrupoDto: Partial<Grupo>,
	): Promise<Grupo> {
		const grupo = await this.findGrupoById(id);
		if (!grupo) {
			throw new NotFoundException(`Grupo con id ${id} no encontrado`);
		}
		await this.grupoRepository.update(id, updateGrupoDto);
		Object.assign(grupo, updateGrupoDto);
		return grupo;
	}

	async removeGenero(id: number): Promise<void> {
		const result = await this.generoRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Genero con id ${id} no encontrado`);
		}
	}

	async removeCiudad(id: number): Promise<void> {
		const result = await this.ciudadRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Ciudad con id ${id} no encontrado`);
		}
	}

	async removeProvincia(id: number): Promise<void> {
		const result = await this.provinciaRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Provincia con id ${id} no encontrado`);
		}
	}

	async removeGrupo(id: number): Promise<void> {
		const result = await this.grupoRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Grupo con id ${id} no encontrado`);
		}
	}

	async importProvinciasAndLocalidades(): Promise<void> {
		const base = ''; // HttpModule ya tiene baseURL

		// 1) Provincias
		try {
			const provinciasResp = await firstValueFrom(
				this.http.get('/provincias.json'),
			);
			const provincias = provinciasResp.data?.provincias ?? [];

			provincias.map(async (dto) => {
				const exists = await this.provinciaRepository.findOne({
					where: { externalId: dto.id },
				});
				if (!exists) {
					const provincia = this.provinciaRepository.create({
						externalId: dto.id,
						nombre: dto.nombre,
					});
					await this.provinciaRepository.save(provincia);
				}
			});
		} catch (error) {
			console.log(error);
			throw new InternalServerErrorException(
				'Error al guardar provincias',
			);
		}

		// 2) localidades
		try {
			const localidadesResp = await firstValueFrom(
				this.http.get('/localidades.json'),
			);
			const localidades = localidadesResp.data?.localidades ?? [];

			for (const dto of localidades) {
				const exists = await this.ciudadRepository.findOne({
					where: { externalId: dto.id },
				});

				if (!exists) {
					const provincia = await this.provinciaRepository.findOne({
						where: { externalId: dto.provincia.id },
					});

					if (!provincia) continue;

					const ciudad = this.ciudadRepository.create({
						externalId: dto.id,
						nombre: dto.nombre,
					});
					ciudad.provincia = provincia;

					await this.ciudadRepository.save(ciudad);
				}
			}
		} catch (error) {
			console.log(error);
			throw new InternalServerErrorException(
				'Error al guardar localidades',
			);
		}
	}
}
