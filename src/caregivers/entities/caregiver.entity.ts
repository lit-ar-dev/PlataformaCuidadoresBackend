import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	JoinColumn,
	OneToOne,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Rate } from './rate.entity';
import { Tag } from './tag.entity';

@Entity('caregivers')
export class Caregiver {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	description: string;

	@Column('simple-array', { nullable: true })
	experience: string[];

	@Column('simple-array', { nullable: true })
	training: string[];

	@OneToMany(() => Reservation, (reservation) => reservation.caregiver)
	reservations: Reservation[];

	@OneToOne(() => User, (user) => user.caregiver)
	@JoinColumn()
	user: User;

	@OneToMany(() => Rate, (rate) => rate.caregiver)
	rates: Rate[];

	@ManyToMany(() => Tag, (tag) => tag.caregivers)
	@JoinTable({
		name: 'tags_x_caregivers',
		joinColumn: { name: 'caregiverId', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
	})
	tags: Tag[];
}
