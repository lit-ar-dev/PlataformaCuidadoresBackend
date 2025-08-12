import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(MessageEntity)
		private readonly repo: Repository<MessageEntity>,
	) {}

	async saveMessage(dto: CreateMessageDto): Promise<MessageEntity> {
		const msg = this.repo.create({
			roomId: dto.roomId,
			senderId: dto.senderId,
			text: dto.text,
			timestamp: dto.timestamp ?? new Date(),
		});
		return this.repo.save(msg);
	}

	async getHistory(roomId: string): Promise<MessageEntity[]> {
		return this.repo.find({
			where: { roomId },
			order: { timestamp: 'ASC' },
		});
	}
}
