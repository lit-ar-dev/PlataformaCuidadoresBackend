import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	ManyToOne,
	PrimaryColumn,
	Index,
} from 'typeorm';
import { Persona } from 'src/personas/entities/persona.entity';
import { Provincia } from './provincia.entity';

@Entity('ciudades')
export class Ciudad {
	@PrimaryGeneratedColumn()
	id: number;

	@Index()
	@Column({ unique: true, nullable: true })
	externalId: string;

	@Column()
	nombre: string;

	@OneToMany(() => Persona, (persona) => persona.ciudad)
	personas?: Persona[];

	@ManyToOne(() => Provincia, (provincia) => provincia.ciudades)
	provincia?: Provincia;
	ciudad: Promise<Provincia | null>;
}
