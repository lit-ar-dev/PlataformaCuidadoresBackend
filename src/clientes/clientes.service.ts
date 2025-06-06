import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ClientesService {
	constructor(
		@InjectRepository(Cliente)
		private readonly clienteRepository: Repository<Cliente>,
		private readonly authService: AuthService,
	) {}

	async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
		const { domicilio, telefono } = createClienteDto;
		const usuario = await this.authService.findOne(
			createClienteDto.usuarioId,
		);
		if (!usuario) {
			throw new NotFoundException(
				`Usuario con id ${createClienteDto.usuarioId} no encontrado`,
			);
		}
		const cliente = this.clienteRepository.create({
			domicilio,
			telefono,
			usuario,
		} as Cliente);
		return this.clienteRepository.save(cliente);
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
