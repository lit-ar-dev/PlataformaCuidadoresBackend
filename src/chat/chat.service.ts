import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MensajeEntity } from './entities/mensaje.entity';
import { CreateMensajeDto } from './dto/create-mensaje.dto';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(MensajeEntity)
		private readonly mensajeRepository: Repository<MensajeEntity>,
	) {}

	async saveMensaje(
		createMensajeDto: CreateMensajeDto,
	): Promise<MensajeEntity> {
		const msg = this.mensajeRepository.create({
			salaId: createMensajeDto.salaId,
			remitenteId: createMensajeDto.remitenteId,
			texto: createMensajeDto.texto,
			timestamp: createMensajeDto.timestamp ?? new Date(),
		});
		return this.mensajeRepository.save(msg);
	}

	async getHistory(salaId: string): Promise<MensajeEntity[]> {
		return this.mensajeRepository.find({
			where: { salaId },
			order: { timestamp: 'ASC' },
		});
	}
}
