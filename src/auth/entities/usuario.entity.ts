import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BeforeInsert,
	OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Cuidador } from 'src/cuidadores/entities/cuidador.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

export enum UserRole {
	ADMIN = 'admin',
	CUIDADOR = 'cuidador',
	CLIENTE = 'cliente',
}

@Entity('usuarios')
export class Usuario {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	nombre: string;

	@Column()
	apellido: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENTE })
	role: UserRole;

	@Column({ default: true })
	isActive: boolean;

	@OneToOne(() => Cuidador, (cuidador) => cuidador.usuario)
	cuidador: Cuidador;

	@OneToOne(() => Cliente, (cliente) => cliente.usuario)
	cliente: Cliente;

	@BeforeInsert()
	async hashPassword() {
		const salt = await bcrypt.genSalt();
		this.password = await bcrypt.hash(this.password, salt);
	}
}
