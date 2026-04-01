import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	ManyToOne,
	PrimaryColumn,
	Index,
} from 'typeorm';
import { Person } from 'src/persons/entities/person.entity';
import { Province } from './province.entity';

@Entity('cities')
export class City {
	@PrimaryGeneratedColumn()
	id: number;

	@Index()
	@Column({ unique: true, nullable: true })
	externalId: string;

	@Column()
	name: string;

	@OneToMany(() => Person, (person) => person.city)
	persons?: Person[];

	@ManyToOne(() => Province, (province) => province.cities)
	province?: Province;
}
