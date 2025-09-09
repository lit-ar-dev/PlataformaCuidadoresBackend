import { UtilidadesService } from './../utilidades/utilidades.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { Persona } from './entities/persona.entity';

@Injectable()
export class PersonasService {
	constructor(
		@InjectRepository(Persona)
		private readonly personaRepository: Repository<Persona>,
		private readonly utilidadesService: UtilidadesService,
	) {}

	async create(
		createPersonaDto: CreatePersonaDto,
		manager?: EntityManager,
	): Promise<Persona> {
		const personaRepository = manager
			? manager.getRepository(Persona)
			: this.personaRepository;

		const persona = personaRepository.create(createPersonaDto);

		const ciudad = await this.utilidadesService.findCiudadById(
			createPersonaDto.ciudadId,
			manager,
		);
		if (!ciudad) {
			throw new NotFoundException('Ciudad no encontrada');
		}
		persona.ciudad = ciudad;

		if (createPersonaDto.generoId) {
			const genero = await this.utilidadesService.findGeneroById(
				createPersonaDto.generoId,
				manager,
			);
			if (!genero) {
				throw new NotFoundException('Género no encontrado');
			}
			persona.genero = genero;
		}

		return personaRepository.save(persona);
	}

	async findAll(manager?: EntityManager): Promise<Persona[]> {
		const personaRepository = manager
			? manager.getRepository(Persona)
			: this.personaRepository;
		return personaRepository.find({ relations: ['ciudad', 'genero'] });
	}

	async findOne(id: string, manager?: EntityManager): Promise<Persona> {
		const personaRepository = manager
			? manager.getRepository(Persona)
			: this.personaRepository;
		const persona = await personaRepository.findOne({
			where: { id },
			relations: ['ciudad', 'genero'],
		});
		if (!persona) {
			throw new NotFoundException(`Persona con id ${id} no encontrada`);
		}
		return persona;
	}

	async update(
		id: string,
		updatePersonaDto: Partial<CreatePersonaDto>,
		manager?: EntityManager,
	): Promise<Persona> {
		const persona = await this.findOne(id, manager);
		if (!persona) {
			throw new NotFoundException(`Persona con id ${id} no encontrada`);
		}
		Object.assign(persona, updatePersonaDto);
		return this.personaRepository.save(persona);
	}

	async remove(id: string, manager?: EntityManager): Promise<void> {
		const persona = await this.findOne(id, manager);
		if (!persona) {
			throw new NotFoundException(`Persona con id ${id} no encontrada`);
		}
		await this.personaRepository.remove(persona);
	}
}
