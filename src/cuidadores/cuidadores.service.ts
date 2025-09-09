import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Cuidador } from './entities/cuidador.entity';
import { CreateCuidadorDto } from './dto/create-cuidador.dto';
import { UpdateCuidadorDto } from './dto/update-cuidador.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Tag } from './entities/tag.entity';
import { Tarifa } from './entities/tarifa.entity';
import { Servicio } from './entities/servicio.entity';
import { UtilidadesService } from 'src/utilidades/utilidades.service';

@Injectable()
export class CuidadoresService {
	constructor(
		@InjectRepository(Cuidador)
		private readonly cuidadorRepository: Repository<Cuidador>,
		@InjectRepository(Tag)
		private readonly tagRepository: Repository<Tag>,
		@InjectRepository(Servicio)
		private readonly servicioRepository: Repository<Servicio>,
		@InjectRepository(Tarifa)
		private readonly tarifaRepository: Repository<Tarifa>,
		private readonly utilidadesService: UtilidadesService,
	) {}

	async create(
		createCuidadorDto: CreateCuidadorDto,
		usuario: Usuario,
		manager?: EntityManager,
	): Promise<Cuidador> {
		const cuidadorRepository = manager
			? manager.getRepository(Cuidador)
			: this.cuidadorRepository;

		const { tarifas, tags, ...restDto } = createCuidadorDto;

		const cuidador = cuidadorRepository.create(restDto);
		cuidador.usuario = usuario;

		for (const precioXServicioDto of tarifas) {
			const { grupoId, servicios, ...precio } = precioXServicioDto;
			const grupo = await this.utilidadesService.findGrupoById(grupoId);

			let tarifa = this.tarifaRepository.create(precio);
			if (grupo) {
				tarifa.grupo = grupo;
			}
			tarifa.servicios = [];

			for (const servicioNombre of servicios) {
				let servicio = await this.servicioRepository.findOne({
					where: { nombre: servicioNombre },
				});

				if (!servicio) {
					const newServicio = this.servicioRepository.create({
						nombre: servicioNombre,
					});
					servicio = await this.servicioRepository.save(newServicio);
				}
				tarifa.servicios.push(servicio);
			}

			if (!cuidador.tarifas) {
				cuidador.tarifas = [];
			}
			tarifa = await this.tarifaRepository.save(tarifa);
			cuidador.tarifas.push(tarifa);
		}

		if (tags) {
			tags.forEach(async (tag) => {
				const tagEntity = await this.tagRepository.findOne({
					where: { id: tag },
				});
				if (tagEntity) {
					cuidador.tags.push(tagEntity);
				} else {
					const newTag = this.tagRepository.create({ id: tag });
					await this.tagRepository.save(newTag);
					cuidador.tags.push(newTag);
				}
			});
		}

		return this.cuidadorRepository.save(cuidador);
	}

	async findAll(): Promise<Cuidador[]> {
		return this.cuidadorRepository.find({ relations: ['reservas'] });
	}

	async findOne(id: string): Promise<Cuidador> {
		const cuidador = await this.cuidadorRepository.findOne({
			where: { id },
			relations: ['reservas'],
		});
		if (!cuidador) {
			throw new NotFoundException(`Cuidador con id ${id} no encontrado`);
		}
		return cuidador;
	}

	async update(
		id: string,
		updateCuidadorDto: UpdateCuidadorDto,
	): Promise<Cuidador> {
		const cuidador = await this.findOne(id);
		if (!cuidador) {
			throw new NotFoundException(`Cuidador con id ${id} no encontrado`);
		}
		Object.assign(cuidador, updateCuidadorDto);
		return this.cuidadorRepository.save(cuidador);
	}

	async remove(id: string): Promise<void> {
		const result = await this.cuidadorRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Cuidador con id ${id} no encontrado`);
		}
	}
}
