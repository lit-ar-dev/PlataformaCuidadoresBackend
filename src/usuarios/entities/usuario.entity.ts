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
import { Cuidador } from 'src/cuidadores/entities/cuidador.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Persona } from 'src/personas/entities/persona.entity';
import { Rol } from '../../auth/entities/rol.entity';

@Entity('usuarios')
export class Usuario {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	email: string;

	@Column({ type: 'varchar', nullable: true })
	contraseña?: string | null;

	@Column({ default: true })
	activo: boolean;

	@Column({ type: 'bytea', nullable: true })
	foto?: Buffer;

	@OneToOne(() => Persona, (persona) => persona.usuario)
	@JoinColumn()
	persona: Persona;

	@OneToOne(() => Cuidador, (cuidador) => cuidador.usuario)
	cuidador: Cuidador;

	@OneToOne(() => Cliente, (cliente) => cliente.usuario)
	cliente: Cliente;

	@ManyToMany(() => Rol, (rol) => rol.usuarios)
	@JoinTable({
		name: 'usuarios_x_roles',
		joinColumn: { name: 'usuarioId', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'rolId', referencedColumnName: 'id' },
	})
	roles?: Rol[];

	@BeforeInsert()
	async hashPassword() {
		if (!this.contraseña) return;
		const salt = await bcrypt.genSalt();
		this.contraseña = await bcrypt.hash(this.contraseña, salt);
	}
}
