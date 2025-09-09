import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva, EstadoReserva } from './entities/reserva.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { CuidadoresService } from '../cuidadores/cuidadores.service';
import { ClientesService } from '../clientes/clientes.service';

@Injectable()
export class ReservasService {
	constructor(
		@InjectRepository(Reserva)
		private readonly reservaRepository: Repository<Reserva>,
		private readonly cuidadoresService: CuidadoresService,
		private readonly clientesService: ClientesService,
	) {}

	async create(createReservaDto: CreateReservaDto): Promise<Reserva> {
		const { cuidadorId, clienteId, fechaInicio, fechaFin, precioTotal } =
			createReservaDto;

		if (new Date(fechaInicio) >= new Date(fechaFin)) {
			throw new BadRequestException(
				'Fecha de inicio debe ser anterior a fecha fin',
			);
		}

		const cuidador = await this.cuidadoresService.findOne(cuidadorId);
		const cliente = await this.clientesService.findOne(clienteId);

		const reserva = this.reservaRepository.create({
			cuidador,
			cliente,
			fechaInicio,
			fechaFin,
			precioTotal: precioTotal || 0,
			estado: EstadoReserva.PENDIENTE,
		});

		return this.reservaRepository.save(reserva);
	}

	async findAll(): Promise<Reserva[]> {
		return this.reservaRepository.find();
	}

	async findOne(id: string): Promise<Reserva> {
		const reserva = await this.reservaRepository.findOne({ where: { id } });
		if (!reserva) {
			throw new NotFoundException(`Reserva con id ${id} no encontrada`);
		}
		return reserva;
	}

	async update(
		id: string,
		updateReservaDto: UpdateReservaDto,
	): Promise<Reserva> {
		const reserva = await this.findOne(id);
		if (!reserva) {
			throw new NotFoundException(`Reserva con id ${id} no encontrada`);
		}
		Object.assign(reserva, updateReservaDto);
		return this.reservaRepository.save(reserva);
	}

	async remove(id: string): Promise<void> {
		const result = await this.reservaRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Reserva con id ${id} no encontrada`);
		}
	}
}
