import {
	Entity,
	Column,
	OneToMany,
	Index,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Ciudad } from './ciudad.entity';

@Entity('provincias')
export class Provincia {
	@PrimaryGeneratedColumn()
	id: number;

	@Index()
	@Column({ unique: true, nullable: true })
	externalId: string;

	@Column({ unique: true })
	nombre: string;

	@OneToMany(() => Ciudad, (ciudad) => ciudad.provincia)
	ciudades?: Ciudad[];
}
