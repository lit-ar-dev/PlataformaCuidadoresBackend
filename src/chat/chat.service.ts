import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(MessageEntity)
		private readonly messageRepository: Repository<MessageEntity>,
	) {}

	async saveMessage(
		createMessageDto: CreateMessageDto,
	): Promise<MessageEntity> {
		const msg = this.messageRepository.create({
			roomId: createMessageDto.roomId,
			senderId: createMessageDto.senderId,
			text: createMessageDto.text,
			timestamp: createMessageDto.timestamp ?? new Date(),
		});
		return this.messageRepository.save(msg);
	}

	async getHistory(roomId: string): Promise<MessageEntity[]> {
		return this.messageRepository.find({
			where: { roomId },
			order: { timestamp: 'ASC' },
		});
	}
}
