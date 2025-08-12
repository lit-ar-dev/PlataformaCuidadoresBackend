import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private readonly chatService: ChatService) {}

	handleConnection(client: Socket) {
		// aquí puedes validar token y obtener userId
		console.log(`Cliente conectado: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Cliente desconectado: ${client.id}`);
	}

	@SubscribeMessage('joinRoom')
	async onJoinRoom(
		@MessageBody() payload: { roomId: string },
		@ConnectedSocket() client: Socket,
	) {
		client.join(payload.roomId);
		// opcional: notificar al resto
		this.server
			.to(payload.roomId)
			.emit('userJoined', { userId: client.id });
	}

	@SubscribeMessage('leaveRoom')
	async onLeaveRoom(
		@MessageBody() payload: { roomId: string },
		@ConnectedSocket() client: Socket,
	) {
		client.leave(payload.roomId);
	}

	@SubscribeMessage('sendMessage')
	async onSendMessage(
		@MessageBody() dto: CreateMessageDto,
		@ConnectedSocket() client: Socket,
	) {
		// Persistir mensaje en BD
		const message = await this.chatService.saveMessage(dto);
		// Emitir a todos en la sala
		this.server.to(dto.roomId).emit('newMessage', message);
	}
}
