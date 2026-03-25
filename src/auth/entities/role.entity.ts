import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	name: string;

	@Column({ nullable: true })
	description?: string;

	@ManyToMany(() => User, (user) => user.roles)
	users?: User[];

	@ManyToMany(() => Permission, (permission) => permission.roles)
	@JoinTable({
		name: 'roles_x_permissions',
		joinColumn: { name: 'roleId', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
	})
	permissions?: Permission[];
}
