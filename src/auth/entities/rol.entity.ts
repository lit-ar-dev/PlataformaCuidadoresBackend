import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Permiso } from './permiso.entity';

@Entity('roles')
export class Rol {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	nombre: string;

	@Column({ nullable: true })
	descripcion?: string;

	@ManyToMany(() => Usuario, (usuario) => usuario.roles)
	usuarios?: Usuario[];

	@ManyToMany(() => Permiso, (permiso) => permiso.roles)
	@JoinTable({
		name: 'roles_x_permisos',
		joinColumn: { name: 'rolId', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'permisoId', referencedColumnName: 'id' },
	})
	permisos?: Permiso[];
}
