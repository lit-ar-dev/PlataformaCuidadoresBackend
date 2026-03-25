import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Caregiver } from './caregiver.entity';

@Entity('tags')
export class Tag {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@OneToMany(() => Caregiver, (caregiver) => caregiver.tags)
	caregivers: Caregiver[];
}
