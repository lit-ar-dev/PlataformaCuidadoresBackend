import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Rol } from './rol.entity';

@Entity('permisos')
export class Permiso {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	nombre: string; // e.g. 'create.user', 'delete.user', 'read.persona', 'update.persona'

	@ManyToMany(() => Rol, (rol) => rol.permisos)
	roles?: Rol[];
}
