import { UtilitiesService } from './../utilities/utilities.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreatePersonDto } from './dto/create-person.dto';
import { Person } from './entities/person.entity';

@Injectable()
export class PersonsService {
	constructor(
		@InjectRepository(Person)
		private readonly personRepository: Repository<Person>,
		private readonly utilitiesService: UtilitiesService,
	) {}

	async create(
		createPersonDto: CreatePersonDto,
		manager?: EntityManager,
	): Promise<Person> {
		const personRepository = manager
			? manager.getRepository(Person)
			: this.personRepository;

		const person = personRepository.create(createPersonDto);

		const city = await this.utilitiesService.findCityById(
			createPersonDto.cityId,
			manager,
		);
		if (!city) {
			throw new NotFoundException('City not found');
		}
		person.city = city;

		if (createPersonDto.genderId) {
			const gender = await this.utilitiesService.findGenderById(
				createPersonDto.genderId,
				manager,
			);
			if (!gender) {
				throw new NotFoundException('Gender not found');
			}
			person.gender = gender;
		}

		return personRepository.save(person);
	}

	async findAll(manager?: EntityManager): Promise<Person[]> {
		const personRepository = manager
			? manager.getRepository(Person)
			: this.personRepository;
		return personRepository.find({ relations: ['city', 'gender'] });
	}

	async findOne(id: string, manager?: EntityManager): Promise<Person> {
		const personRepository = manager
			? manager.getRepository(Person)
			: this.personRepository;
		const person = await personRepository.findOne({
			where: { id },
			relations: ['city', 'gender'],
		});
		if (!person) {
			throw new NotFoundException(`Person with id ${id} not found`);
		}
		return person;
	}

	async update(
		id: string,
		updatePersonDto: Partial<CreatePersonDto>,
		manager?: EntityManager,
	): Promise<Person> {
		const person = await this.findOne(id, manager);
		if (!person) {
			throw new NotFoundException(`Person with id ${id} not found`);
		}
		Object.assign(person, updatePersonDto);
		return this.personRepository.save(person);
	}

	async remove(id: string, manager?: EntityManager): Promise<void> {
		const person = await this.findOne(id, manager);
		if (!person) {
			throw new NotFoundException(`Person with id ${id} not found`);
		}
		await this.personRepository.remove(person);
	}
}
