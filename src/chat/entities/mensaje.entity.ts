import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mensajes')
export class MensajeEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	salaId: string;

	@Column()
	remitenteId: string;

	@Column('text')
	texto: string;

	@Column({ type: 'timestamptz' })
	timestamp: Date;
}
