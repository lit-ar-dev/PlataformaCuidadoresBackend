import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Persona } from 'src/personas/entities/persona.entity';

@Entity('generos')
export class Genero {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	nombre: string;

	@OneToMany(() => Persona, (persona) => persona.genero)
	personas?: Persona[];
}
