import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('messages')
export class MessageEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	roomId: string;

	@Column()
	senderId: string;

	@Column('text')
	text: string;

	@Column({ type: 'timestamptz' })
	timestamp: Date;
}
