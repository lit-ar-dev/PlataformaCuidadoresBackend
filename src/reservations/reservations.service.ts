import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { CaregiversService } from '../caregivers/caregivers.service';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class ReservationsService {
	constructor(
		@InjectRepository(Reservation)
		private readonly reservationRepository: Repository<Reservation>,
		private readonly caregiversService: CaregiversService,
		private readonly clientsService: ClientsService,
	) {}

	async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
		const { caregiverId, clientId, startDate, endDate, totalPrice } =
			createReservationDto;

		if (new Date(startDate) >= new Date(endDate)) {
			throw new BadRequestException(
				'Start date must be before end date',
			);
		}

		const caregiver = await this.caregiversService.findOne(caregiverId);
		const client = await this.clientsService.findOne(clientId);

		const reservation = this.reservationRepository.create({
			caregiver,
			client,
			startDate,
			endDate,
			totalPrice: totalPrice || 0,
			status: ReservationStatus.PENDING,
		});

		return this.reservationRepository.save(reservation);
	}

	async findAll(): Promise<Reservation[]> {
		return this.reservationRepository.find();
	}

	async findOne(id: string): Promise<Reservation> {
		const reservation = await this.reservationRepository.findOne({ where: { id } });
		if (!reservation) {
			throw new NotFoundException(`Reservation with id ${id} not found`);
		}
		return reservation;
	}

	async update(
		id: string,
		updateReservationDto: UpdateReservationDto,
	): Promise<Reservation> {
		const reservation = await this.findOne(id);
		if (!reservation) {
			throw new NotFoundException(`Reservation with id ${id} not found`);
		}
		Object.assign(reservation, updateReservationDto);
		return this.reservationRepository.save(reservation);
	}

	async remove(id: string): Promise<void> {
		const result = await this.reservationRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Reservation with id ${id} not found`);
		}
	}
}
