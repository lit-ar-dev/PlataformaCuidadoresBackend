import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Person } from 'src/persons/entities/person.entity';

@Entity('genders')
export class Gender {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	name: string;

	@OneToMany(() => Person, (person) => person.gender)
	persons?: Person[];
}
