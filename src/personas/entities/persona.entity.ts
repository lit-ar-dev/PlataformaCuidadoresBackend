import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
	ManyToOne,
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Ciudad } from 'src/utilidades/entities/ciudad.entity';
import { Genero } from 'src/utilidades/entities/genero.entity';

@Entity('personas')
export class Persona {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	nombre: string;

	@Column()
	apellido: string;

	@Column({ type: 'date', nullable: true })
	fechaDeNacimiento?: Date | null;

	@Column({ type: 'varchar', nullable: true })
	telefono?: string | null;

	@OneToOne(() => Usuario, (usuario) => usuario.persona)
	usuario: Usuario;

	@ManyToOne(() => Ciudad, (ciudad) => ciudad.personas)
	ciudad: Ciudad;

	@ManyToOne(() => Genero, (genero) => genero.personas)
	genero: Genero;
}
