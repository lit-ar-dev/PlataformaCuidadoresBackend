import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BeforeInsert,
	OneToOne,
	JoinColumn,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Caregiver } from 'src/caregivers/entities/caregiver.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Person } from 'src/persons/entities/person.entity';
import { Role } from '../../auth/entities/role.entity';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	email: string;

	@Column({ type: 'varchar', nullable: true })
	password?: string | null;

	@Column({ default: true })
	active: boolean;

	@Column({ type: 'varchar', nullable: true })
	photoUrl?: string | null;

	@OneToOne(() => Person, (person) => person.user)
	@JoinColumn()
	person: Person;

	@OneToOne(() => Caregiver, (caregiver) => caregiver.user)
	caregiver: Caregiver;

	@OneToOne(() => Client, (client) => client.user)
	client: Client;

	@ManyToMany(() => Role, (role) => role.users)
	@JoinTable({
		name: 'users_x_roles',
		joinColumn: { name: 'userId', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
	})
	roles?: Role[];

	@BeforeInsert()
	async hashPassword() {
		if (!this.password) return;
		const salt = await bcrypt.genSalt();
		this.password = await bcrypt.hash(this.password, salt);
	}
}
