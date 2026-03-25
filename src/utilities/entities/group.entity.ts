import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Rate } from '../../caregivers/entities/rate.entity';

@Entity('groups')
export class Group {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@OneToMany(() => Rate, (rate) => rate.group)
	rates: Rate[];
}
