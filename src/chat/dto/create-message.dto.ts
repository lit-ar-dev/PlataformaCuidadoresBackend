export class CreateMessageDto {
	roomId: string;
	senderId: string;
	text: string;
	timestamp?: Date;
}
