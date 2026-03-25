import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	name: string; // e.g. 'create.user', 'delete.user', 'read.person', 'update.person'

	@ManyToMany(() => Role, (role) => role.permissions)
	roles?: Role[];
}
