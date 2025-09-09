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
import { CreateMensajeDto } from './dto/create-mensaje.dto';

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

	@SubscribeMessage('joinSala')
	async onJoinSala(
		@MessageBody() payload: { salaId: string },
		@ConnectedSocket() client: Socket,
	) {
		client.join(payload.salaId);
		// opcional: notificar al resto
		this.server
			.to(payload.salaId)
			.emit('userJoined', { userId: client.id });
	}

	@SubscribeMessage('leaveSala')
	async onLeaveSala(
		@MessageBody() payload: { salaId: string },
		@ConnectedSocket() client: Socket,
	) {
		client.leave(payload.salaId);
	}

	@SubscribeMessage('sendMensaje')
	async onSendMensaje(
		@MessageBody() dto: CreateMensajeDto,
		@ConnectedSocket() client: Socket,
	) {
		// Persistir mensaje en BD
		const message = await this.chatService.saveMensaje(dto);
		// Emitir a todos en la sala
		this.server.to(dto.salaId).emit('newMensaje', message);
	}
}
