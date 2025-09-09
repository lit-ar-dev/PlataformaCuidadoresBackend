import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cuidador } from './cuidador.entity';

@Entity('tags')
export class Tag {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	nombre: string;

	@OneToMany(() => Cuidador, (cuidador) => cuidador.tags)
	cuidadores: Cuidador[];
}
