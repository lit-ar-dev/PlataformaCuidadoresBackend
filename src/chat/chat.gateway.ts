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
		// here you can validate token and obtain userId
		console.log(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage('joinRoom')
	async onJoinRoom(
		@MessageBody() payload: { roomId: string },
		@ConnectedSocket() client: Socket,
	) {
		client.join(payload.roomId);
		// optional: notify others
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
		// Persist message in DB
		const message = await this.chatService.saveMessage(dto);
		// Emit to everyone in the room
		this.server.to(dto.roomId).emit('newMessage', message);
	}
}
