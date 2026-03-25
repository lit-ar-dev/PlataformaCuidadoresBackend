import {
	Entity,
	Column,
	OneToMany,
	Index,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { City } from './city.entity';

@Entity('provinces')
export class Province {
	@PrimaryGeneratedColumn()
	id: number;

	@Index()
	@Column({ unique: true, nullable: true })
	externalId: string;

	@Column({ unique: true })
	name: string;

	@OneToMany(() => City, (city) => city.province)
	cities?: City[];
}
