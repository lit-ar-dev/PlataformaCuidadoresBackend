import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MensajeEntity } from './entities/mensaje.entity';

@Module({
	imports: [TypeOrmModule.forFeature([MensajeEntity])],
	providers: [ChatGateway, ChatService],
	exports: [ChatService],
})
export class ChatModule {}
