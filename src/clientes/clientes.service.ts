import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class ClientesService {
	constructor(
		@InjectRepository(Cliente)
		private readonly clienteRepository: Repository<Cliente>,
	) {}

	async create(
		createClienteDto: CreateClienteDto,
		usuario: Usuario,
		entity?: EntityManager,
	): Promise<Cliente> {
		const clienteRepository = entity
			? entity.getRepository(Cliente)
			: this.clienteRepository;
		const cliente = clienteRepository.create(createClienteDto);
		cliente.usuario = usuario;
		return clienteRepository.save(cliente);
	}

	async findAll(): Promise<Cliente[]> {
		return this.clienteRepository.find({ relations: ['reservas'] });
	}

	async findOne(id: string): Promise<Cliente> {
		const cliente = await this.clienteRepository.findOne({
			where: { id },
			relations: ['reservas'],
		});
		if (!cliente) {
			throw new NotFoundException(`Cliente con id ${id} no encontrado`);
		}
		return cliente;
	}

	async update(
		id: string,
		updateClienteDto: UpdateClienteDto,
	): Promise<Cliente> {
		const cliente = await this.findOne(id);
		if (!cliente) {
			throw new NotFoundException(`Cliente con id ${id} no encontrado`);
		}
		Object.assign(cliente, updateClienteDto);
		return this.clienteRepository.save(cliente);
	}

	async remove(id: string): Promise<void> {
		const result = await this.clienteRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Cliente con id ${id} no encontrado`);
		}
	}
}
