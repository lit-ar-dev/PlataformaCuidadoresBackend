import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	OneToOne,
	JoinColumn,
} from 'typeorm';
import { Reserva } from '../../reservas/entities/reserva.entity';
import { Usuario } from 'src/auth/entities/usuario.entity';

@Entity('clientes')
export class Cliente {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	domicilio: string;

	@Column({ nullable: true })
	telefono: string;

	@OneToMany(() => Reserva, (reserva) => reserva.cliente, { cascade: true })
	reservas: Reserva[];

	@OneToOne(() => Usuario, (usuario) => usuario.cliente)
	@JoinColumn()
	usuario: Usuario;
}
