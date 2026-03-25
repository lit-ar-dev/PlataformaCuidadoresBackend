import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ClientsService {
	constructor(
		@InjectRepository(Client)
		private readonly clientRepository: Repository<Client>,
	) {}

	async create(
		createClientDto: CreateClientDto,
		user: User,
		entity?: EntityManager,
	): Promise<Client> {
		const clientRepository = entity
			? entity.getRepository(Client)
			: this.clientRepository;
		const client = clientRepository.create(createClientDto);
		client.user = user;
		return clientRepository.save(client);
	}

	async findAll(): Promise<Client[]> {
		return this.clientRepository.find({ relations: ['reservations'] });
	}

	async findOne(id: string): Promise<Client> {
		const client = await this.clientRepository.findOne({
			where: { id },
			relations: ['reservations'],
		});
		if (!client) {
			throw new NotFoundException(`Client with id ${id} not found`);
		}
		return client;
	}

	async update(
		id: string,
		updateClientDto: UpdateClientDto,
	): Promise<Client> {
		const client = await this.findOne(id);
		if (!client) {
			throw new NotFoundException(`Client with id ${id} not found`);
		}
		Object.assign(client, updateClientDto);
		return this.clientRepository.save(client);
	}

	async remove(id: string): Promise<void> {
		const result = await this.clientRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Client with id ${id} not found`);
		}
	}
}
