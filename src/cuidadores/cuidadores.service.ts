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
		const tagRepository = manager
			? manager.getRepository(Tag)
			: this.tagRepository;
		const servicioRepository = manager
			? manager.getRepository(Servicio)
			: this.servicioRepository;
		const tarifaRepository = manager
			? manager.getRepository(Tarifa)
			: this.tarifaRepository;

		const { tarifas = [], tags = [], ...restDto } = createCuidadorDto;

		const cuidador = cuidadorRepository.create(restDto);
		cuidador.usuario = usuario;

		if (!cuidador.tarifas) cuidador.tarifas = [];
		if (!cuidador.tags) cuidador.tags = [];

		for (const precioXServicioDto of tarifas) {
			const { grupoId, servicios = [], ...precio } = precioXServicioDto;
			const grupo = await this.utilidadesService.findGrupoById(grupoId);

			let tarifa = tarifaRepository.create(precio);
			if (grupo) {
				tarifa.grupo = grupo;
			}

			tarifa.servicios = [];

			for (const servicioNombre of servicios) {
				let servicio = await servicioRepository.findOne({
					where: { nombre: servicioNombre },
				});

				if (!servicio) {
					const newServicio = servicioRepository.create({
						nombre: servicioNombre,
					});
					servicio = await servicioRepository.save(newServicio);
				}
				tarifa.servicios.push(servicio);
			}

			tarifa = await tarifaRepository.save(tarifa);
			cuidador.tarifas.push(tarifa);
		}

		if (tags && tags.length) {
			for (const tagNombre of tags) {
				let tagEntity = await tagRepository.findOne({
					where: { nombre: tagNombre },
				});
				if (tagEntity) {
					cuidador.tags.push(tagEntity);
				} else {
					const newTag = tagRepository.create({ nombre: tagNombre });
					tagEntity = await tagRepository.save(newTag);
					cuidador.tags.push(tagEntity);
				}
			}
		}

		return cuidadorRepository.save(cuidador);
	}

	async findAll(): Promise<Cuidador[]> {
		return this.cuidadorRepository.find({
			select: {
				descripcion: true,
				usuario: {
					activo: true,
					foto: true,
					persona: {
						nombre: true,
						apellido: true,
						ciudad: {
							nombre: true,
						},
					},
				},
				tarifas: {
					precio: true,
					grupo: {
						nombre: true,
					},
					servicios: {
						nombre: true,
					},
				},
				tags: {
					nombre: true,
				},
			},
			relations: [
				'usuario',
				'usuario.persona',
				'usuario.persona.ciudad',
				'tags',
				'tarifas',
				'tarifas.servicios',
				'tarifas.grupo',
			],
		});
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
