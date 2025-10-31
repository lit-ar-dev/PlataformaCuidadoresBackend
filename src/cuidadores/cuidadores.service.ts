import { FindCuidadoresDto } from './dto/find-cuidadores.dto';
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
import { In } from 'typeorm';

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

	async findAll(filters: FindCuidadoresDto) {
		// 1) QueryBuilder para filtrar y paginar, SOLO selecciono id
		const qb = this.cuidadorRepository
			.createQueryBuilder('c')
			.leftJoin('c.usuario', 'u')
			.leftJoin('u.persona', 'p')
			.leftJoin('p.ciudad', 'ciudad')
			.leftJoin('ciudad.provincia', 'provincia')
			.leftJoin('c.tags', 'tag')
			.leftJoin('c.tarifas', 't')
			.leftJoin('t.grupo', 'g')
			.leftJoin('t.servicios', 'srv');

		if (filters.nombre) {
			const nombre = `%${filters.nombre.toLowerCase()}%`;
			qb.andWhere(
				'(LOWER(p.nombre) LIKE :nombre OR LOWER(p.apellido) LIKE :nombre)',
				{ nombre },
			);
		}
		if (filters.ciudad) {
			qb.andWhere('p.ciudad = :ciudad', { ciudad: filters.ciudad });
		}
		if (filters.provincia) {
			qb.andWhere('ciudad.provincia = :provincia', {
				provincia: filters.provincia,
			});
		}
		if (filters.tag) {
			qb.andWhere('tag.nombre = :tag', { tag: filters.tag });
		}
		if (filters.servicio) {
			qb.andWhere('srv.nombre = :servicio', {
				servicio: filters.servicio,
			});
		}
		if (filters.minEdad !== undefined) {
			const fechaLimite = subYears(new Date(), filters.minEdad);
			qb.andWhere('p.fechaNacimiento <= :fechaLimite', { fechaLimite });
		}
		if (filters.maxEdad !== undefined) {
			const fechaLimite = subYears(new Date(), filters.maxEdad);
			qb.andWhere('p.fechaNacimiento >= :fechaLimite', { fechaLimite });
		}
		if (filters.genero) {
			qb.andWhere('p.genero = :genero', { genero: filters.genero });
		}
		if (filters.minPrecio !== undefined) {
			qb.andWhere('t.precio >= :minPrecio', {
				minPrecio: filters.minPrecio,
			});
		}
		if (filters.maxPrecio !== undefined) {
			qb.andWhere('t.precio <= :maxPrecio', {
				maxPrecio: filters.maxPrecio,
			});
		}
		if (filters.grupo) {
			qb.andWhere('g.nombre = :grupo', { grupo: filters.grupo });
		}

		qb.select('c.id', 'id') // <-- SOLO obtengo ids en esta query
			.distinct(true);

		// orden/paginación para la lista de ids
		/* const limit = Math.min(filters.limit ?? 20, 100);
		const page = Math.max(filters.page ?? 1, 1);
		qb.orderBy('c.createdAt', 'DESC')
			.take(limit)
			.skip((page - 1) * limit);*/

		// obtengo rows con ids
		const rawIds = await qb.getRawMany(); // [{ id: 1 }, { id: 2 }, ...]
		const ids = rawIds.map((r) => r.id);

		if (ids.length === 0) {
			// return { data: [], meta: { total: 0, page, limit } };
			return { data: [], meta: { total: 0 } };
		}

		// 2) Traer solo las columnas/relaciones requeridas usando repository.find()
		const data = await this.cuidadorRepository.find({
			where: { id: In(ids) },
			select: {
				id: true,
				descripcion: true,
				usuario: {
					activo: true,
					fotoUrl: true,
					persona: {
						nombre: true,
						apellido: true,
						ciudad: { nombre: true, provincia: { nombre: true } },
					},
				},
				tarifas: {
					id: true,
					precio: true,
					grupo: { nombre: true },
					servicios: { id: true, nombre: true },
				},
				tags: { id: true, nombre: true },
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

		// opcional: ordenar `data` para que respete el orden original de `ids`
		const dataOrdered = ids
			.map((id) => data.find((d) => d.id === id))
			.filter(Boolean);

		// total: si querés el total global (sin paginar) hacés un count separado con los mismos filtros
		const totalQb = this.cuidadorRepository
			.createQueryBuilder('c')
			.leftJoin('c.usuario', 'u')
			.leftJoin('u.persona', 'p')
			.leftJoin('p.ciudad', 'ciudad');
		// aplicar mismos filtros que antes...
		const total = await totalQb.getCount();

		//return { data: dataOrdered, meta: { total, page, limit } };
		return { data: dataOrdered, meta: { total } };
	}

	/*async findAll(filters: FindCuidadoresDto): Promise<Cuidador[]> {
		return this.cuidadorRepository.find({
			select: {
				descripcion: true,
				usuario: {
					activo: true,
					fotoUrl: true,
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
	}*/

	async findOne(id: string): Promise<Cuidador> {
		const cuidador = await this.cuidadorRepository.findOne({
			where: { id },
			select: {
				id: true,
				descripcion: true,
				formacion: true,
				experiencia: true,
				usuario: {
					activo: true,
					fotoUrl: true,
					persona: {
						id: true,
						nombre: true,
						apellido: true,
						fechaDeNacimiento: true,
						genero: { nombre: true },
						ciudad: {
							nombre: true,
							provincia: { nombre: true },
						},
					},
				},
				tarifas: {
					id: true,
					precio: true,
					grupo: { nombre: true },
					servicios: { id: true, nombre: true },
				},
				tags: { id: true, nombre: true },
			},
			relations: [
				'usuario',
				'usuario.persona',
				'usuario.persona.genero',
				'usuario.persona.ciudad',
				'usuario.persona.ciudad.provincia',
				'tags',
				'tarifas',
				'tarifas.servicios',
				'tarifas.grupo',
			],
		});
		console.log('Cuidador encontrado:', cuidador);
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
function subYears(arg0: Date, minEdad: number) {
	throw new Error('Function not implemented.');
}
