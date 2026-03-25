import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Caregiver } from '../../caregivers/entities/caregiver.entity';
import { Client } from 'src/clients/entities/client.entity';

export enum ReservationStatus {
	PENDING = 'pending',
	CONFIRMED = 'confirmed',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled',
}

@Entity('reservations')
export class Reservation {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Caregiver, (caregiver) => caregiver.reservations, {
		eager: true,
	})
	caregiver: Caregiver;

	@ManyToOne(() => Client, (client) => client.reservations, {
		eager: true,
	})
	client: Client;

	@Column({ type: 'timestamp' })
	startDate: Date;

	@Column({ type: 'timestamp' })
	endDate: Date;

	@Column({
		type: 'enum',
		enum: ReservationStatus,
		default: ReservationStatus.PENDING,
	})
	status: ReservationStatus;

	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
	totalPrice: number;
}
