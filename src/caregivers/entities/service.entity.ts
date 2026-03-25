import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Rate } from './rate.entity';

@Entity('services')
export class Service {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@ManyToMany(() => Rate, (rate) => rate.services)
	rates: Rate[];
}
