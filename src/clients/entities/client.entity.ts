import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	OneToOne,
	JoinColumn,
} from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('clients')
export class Client {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	address: string;

	@OneToMany(() => Reservation, (reservation) => reservation.client)
	reservations: Reservation[];

	@OneToOne(() => User, (user) => user.client)
	@JoinColumn()
	user: User;
}
